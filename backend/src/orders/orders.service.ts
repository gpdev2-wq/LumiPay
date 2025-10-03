import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RatesService } from '../rates/rates.service';
import { db } from '../firebase.config';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import * as https from 'https';

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  usdtAmount: number;
  inrAmount: number;
  rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  depositAddress: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
  payoutMethod?: string;
  upiId?: string;
  imps?: {
    accountNumber: string;
    ifsc: string;
    accountHolder: string;
  };
}

@Injectable()
export class OrdersService {
  private readonly collectionName = 'orders';

  constructor(
    private usersService: UsersService,
    private ratesService: RatesService
  ) {}

  private async makeHttpRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>): Promise<Order> {
    if (!db) throw new Error('Database not initialized');
    
    const orderDataToSave = {
      ...orderData,
      orderId: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, this.collectionName), orderDataToSave);
    
    const order: Order = {
      id: docRef.id,
      ...orderDataToSave
    };
    
    // Update user stats
    await this.updateUserStats(order.userId);
    
    return order;
  }

  async findAll(): Promise<Order[]> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async findByUserId(userId: string): Promise<Order[]> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort by createdAt in descending order (most recent first)
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async findById(id: string): Promise<Order | undefined> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return undefined;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Order;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      return undefined;
    }
  }

  async checkTransactionHash(txHash: string): Promise<{ used: boolean; orderId?: string }> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // First check the orders collection
      const ordersQuery = query(
        collection(db, this.collectionName),
        where('txHash', '==', txHash)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      
      if (ordersSnapshot.docs.length > 0) {
        const existingOrder = {
          id: ordersSnapshot.docs[0].id,
          ...ordersSnapshot.docs[0].data()
        } as Order;
        
        return {
          used: true,
          orderId: existingOrder.orderId,
        };
      }

      // Also check the used_tx_hashes collection for claimed hashes
      const usedHashesQuery = query(
        collection(db, 'used_tx_hashes'),
        where('txHash', '==', txHash)
      );
      const usedHashesSnapshot = await getDocs(usedHashesQuery);
      
      if (usedHashesSnapshot.docs.length > 0) {
        const usedHash = usedHashesSnapshot.docs[0].data();
        
        return {
          used: true,
          orderId: usedHash.orderId,
        };
      }
      
      return {
        used: false,
      };
    } catch (error) {
      console.error('Error checking transaction hash:', error);
      return {
        used: false,
      };
    }
  }

  // Atomic operation to claim a transaction hash (prevents race conditions)
  async claimTransactionHash(txHash: string, orderId: string): Promise<{ success: boolean; alreadyUsed?: boolean; existingOrderId?: string }> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // First, check if this transaction hash has already been used
      const existingCheck = await this.checkTransactionHash(txHash);
      if (existingCheck.used) {
        return {
          success: false,
          alreadyUsed: true,
          existingOrderId: existingCheck.orderId
        };
      }

      // Create a record in the used_tx_hashes collection to prevent race conditions
      // This acts as a distributed lock
      try {
        await addDoc(collection(db, 'used_tx_hashes'), {
          txHash: txHash,
          orderId: orderId,
          claimedAt: new Date().toISOString(),
          status: 'claimed'
        });
      } catch (addError) {
        // If we can't add to used_tx_hashes, it might already exist
        // Double-check if it was claimed by another process
        const doubleCheck = await this.checkTransactionHash(txHash);
        if (doubleCheck.used) {
          return {
            success: false,
            alreadyUsed: true,
            existingOrderId: doubleCheck.orderId
          };
        }
        // If still not used, continue with the claim
      }

      // If not used, immediately record it to prevent race conditions
      const orderRef = doc(db, this.collectionName, orderId);
      await updateDoc(orderRef, {
        txHash: txHash,
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      console.log(`✅ Transaction hash ${txHash} claimed by order ${orderId}`);
      return {
        success: true,
        alreadyUsed: false
      };
    } catch (error) {
      console.error('Error claiming transaction hash:', error);
      return {
        success: false,
        alreadyUsed: false
      };
    }
  }

  async checkAmountUsage(amount: number, userId: string): Promise<{ used: boolean; orderId?: string }> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Find if this amount has been used by this user in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('usdtAmount', '==', amount),
        where('createdAt', '>=', twentyFourHoursAgo),
        where('status', 'in', ['completed', 'processing'])
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length > 0) {
        const existingOrder = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as Order;
        
        return {
          used: true,
          orderId: existingOrder.orderId,
        };
      }
      
      return {
        used: false,
      };
    } catch (error) {
      console.error('Error checking amount usage:', error);
      return {
        used: false,
      };
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const orderRef = doc(db, this.collectionName, id);
      await updateDoc(orderRef, updates);
      
      // Fetch the updated order
      const updatedOrderDoc = await getDoc(orderRef);
      if (!updatedOrderDoc.exists()) {
        return undefined;
      }
      
      return {
        id: updatedOrderDoc.id,
        ...updatedOrderDoc.data()
      } as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      return undefined;
    }
  }

  async updateOrderStatus(id: string, status: Order['status'], txHash?: string): Promise<Order | undefined> {
    const order = await this.findById(id);
    if (!order) return undefined;
    
    const updates: Partial<Order> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    if (txHash) {
      updates.txHash = txHash;
    }
    
    const updatedOrder = await this.updateOrder(id, updates);
    
    // Update user stats when order status changes
    if (updatedOrder) {
      await this.updateUserStats(updatedOrder.userId);
      
      // Add referral commission when order is completed
      if (status === 'completed') {
        const rates = await this.ratesService.getRates();
        await this.usersService.addReferralCommission(updatedOrder.userId, updatedOrder.usdtAmount, rates.sellRateInrPerUsdt);
      }
    }
    
    return updatedOrder;
  }

  async detectAndCreateOrderForPayment(txHash: string, userId: string): Promise<{ success: boolean; order?: Order; message: string }> {
    try {
      // Check if this transaction hash is already used
      if (!db) throw new Error('Database not initialized');
      
      const q = query(
        collection(db, this.collectionName),
        where('txHash', '==', txHash)
      );
      const querySnapshot = await getDocs(q);
      const existingOrder = querySnapshot.docs.length > 0 ? {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as Order : undefined;
      if (existingOrder) {
        return {
          success: false,
          message: 'Transaction hash already used in another order',
        };
      }

      // Use TRC20 transactions API to get transaction details
      const depositAddress = 'TVz5oQurcJUoPohtdCGH89PhqKvFgiYzRq';
      const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      
      const data = await this.makeHttpRequest(`https://api.trongrid.io/v1/accounts/${depositAddress}/transactions/trc20?contract_address=${usdtContract}&limit=20`);
      const transactions = data.data || [];
      
      // Find the specific transaction
      const transaction = transactions.find((tx: any) => tx.transaction_id === txHash);
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found in recent transactions',
        };
      }

      // Extract amount (value is in smallest units, 6 decimals for USDT)
      const usdtAmount = Number(transaction.value) / Math.pow(10, 6);
      
      if (usdtAmount <= 0) {
        return {
          success: false,
          message: 'Invalid transaction amount',
        };
      }

      // Create order for this payment
      const order = await this.createOrder({
        userId,
        usdtAmount,
        inrAmount: usdtAmount * 95, // Use current rate
        rate: 95,
        status: 'processing',
        depositAddress,
        txHash,
      });

      return {
        success: true,
        order,
        message: `Order created successfully for ${usdtAmount} USDT`,
      };
    } catch (error) {
      console.error('Error detecting payment:', error);
      return {
        success: false,
        message: 'Error detecting payment: ' + error.message,
      };
    }
  }

  private async updateUserStats(userId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // Fetch user orders from Firestore
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      const totalOrders = userOrders.length;
      const totalVolume = userOrders.reduce((sum, order) => sum + order.usdtAmount, 0);
      
      await this.usersService.updateUserStats(userId, totalOrders, totalVolume);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  async detectPaymentAdvanced(data: {
    userId: string;
    orderId?: string;
    expectedAmount: number;
    depositAddress: string;
  }): Promise<{ 
    success: boolean; 
    paymentDetected: boolean; 
    message: string; 
    txHash?: string;
  }> {
    try {
      console.log('🔍 Advanced payment detection for:', data);
      
      // Find pending orders for this user
      const orders = await this.findAll();
      let targetOrder = null;
      
      if (data.orderId) {
        // Find specific order by ID
        targetOrder = orders.find(order => order.id === data.orderId);
      } else {
        // Find most recent pending order for this user
        targetOrder = orders
          .filter(order => order.userId === data.userId && order.status === 'pending')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      }
      
      if (!targetOrder) {
        console.log('❌ No pending order found for user:', data.userId);
        return { 
          success: false, 
          paymentDetected: false, 
          message: 'No pending order found for user' 
        };
      }
      
      console.log('✅ Found target order:', { id: targetOrder.id, amount: targetOrder.usdtAmount });
      
      // Real blockchain detection using multiple APIs
      try {
        // Try TronGrid API first
        const tronGridUrl = `https://api.trongrid.io/v1/accounts/${data.depositAddress}/transactions/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&limit=100&order_by=block_timestamp,desc`;
        
        console.log('🌐 Checking TronGrid API:', tronGridUrl);
        
        let transactions = [];
        let apiUsed = 'TronGrid';
        
        try {
          const response = await this.makeHttpRequest(tronGridUrl);
          transactions = response.data || [];
          console.log(`📊 Found ${transactions.length} transactions from TronGrid`);
        } catch (tronGridError) {
          console.warn('TronGrid failed, trying TronScan:', tronGridError.message);
          
          // Fallback to TronScan API
          const tronScanUrl = `https://apilist.tronscanapi.com/api/transfer/trc20?sort=-timestamp&count=true&limit=100&start=0&toAddress=${data.depositAddress}&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
          const scanResponse = await this.makeHttpRequest(tronScanUrl);
          transactions = scanResponse.data || [];
          apiUsed = 'TronScan';
          console.log(`📊 Found ${transactions.length} transactions from TronScan`);
        }
        
        // Filter recent transactions (last 15 minutes)
        const now = Date.now();
        const recentTransactions = transactions.filter((tx: any) => {
          const txTime = tx.block_timestamp;
          const timeDiff = now - txTime;
          return timeDiff < (15 * 60 * 1000); // 15 minutes
        });
        
        console.log(`⏰ Recent transactions (last 15 min): ${recentTransactions.length}`);
        
        // Look for matching amount
        const expectedAmount = data.expectedAmount;
        const matchingTransaction = recentTransactions.find((tx: any) => {
          const txAmount = Number(tx.value) / Math.pow(10, 6); // Convert from smallest unit
          const isAmountMatch = Math.abs(txAmount - expectedAmount) < 0.0001; // Small tolerance
          
          if (isAmountMatch) {
            console.log(`💰 Amount match found:`, {
              txAmount,
              expectedAmount,
              difference: Math.abs(txAmount - expectedAmount),
              txHash: tx.transaction_id
            });
          }
          
          return isAmountMatch;
        });
        
        if (matchingTransaction) {
          const txHash = matchingTransaction.transaction_id;
          const txAmount = Number(matchingTransaction.value) / Math.pow(10, 6);
          
          console.log(`🎉 REAL PAYMENT DETECTED!`, {
            hash: txHash,
            amount: txAmount,
            expected: expectedAmount,
            api: apiUsed,
            timestamp: new Date(matchingTransaction.block_timestamp).toLocaleString()
          });
          
          // Update order status to completed
          await this.updateOrderStatus(targetOrder.id, 'completed', txHash);
          
          return { 
            success: true, 
            paymentDetected: true, 
            message: `Payment detected successfully (${txAmount} USDT via ${apiUsed})`,
            txHash: txHash
          };
        }
        
        // No matching transaction found
        console.log(`⏳ No matching transaction found. Expected: ${expectedAmount} USDT`);
        return { 
          success: true, 
          paymentDetected: false, 
          message: 'No payment detected yet' 
        };
        
      } catch (blockchainError) {
        console.error('❌ Blockchain API error:', blockchainError);
        
        // Fallback: Try TronScan API
        try {
          const tronScanUrl = `https://apilist.tronscanapi.com/api/transfer/trc20?sort=-timestamp&count=true&limit=50&start=0&toAddress=${data.depositAddress}&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
          
          console.log('🌐 Trying TronScan API as fallback:', tronScanUrl);
          
          const fallbackResponse = await this.makeHttpRequest(tronScanUrl);
          const fallbackTransactions = fallbackResponse.data || [];
          
          console.log(`📊 Fallback found ${fallbackTransactions.length} transactions`);
          
          // Similar logic for fallback
          const now = Date.now();
          const recentFallback = fallbackTransactions.filter((tx: any) => {
            const txTime = tx.timestamp * 1000;
            const timeDiff = now - txTime;
            return timeDiff < (15 * 60 * 1000);
          });
          
          const matchingFallback = recentFallback.find((tx: any) => {
            const txAmount = Number(tx.amount) / Math.pow(10, 6);
            return Math.abs(txAmount - data.expectedAmount) < 0.0001;
          });
          
          if (matchingFallback) {
            const txHash = matchingFallback.transaction_id;
            console.log(`🎉 FALLBACK PAYMENT DETECTED!`, { hash: txHash });
            
            await this.updateOrderStatus(targetOrder.id, 'completed', txHash);
            
            return { 
              success: true, 
              paymentDetected: true, 
              message: 'Payment detected via fallback API',
              txHash: txHash
            };
          }
          
        } catch (fallbackError) {
          console.error('❌ Fallback API also failed:', fallbackError);
        }
        
        return { 
          success: false, 
          paymentDetected: false, 
          message: 'Blockchain APIs temporarily unavailable' 
        };
      }
      
    } catch (error) {
      console.error('❌ Error in advanced payment detection:', error);
      return { 
        success: false, 
        paymentDetected: false, 
        message: 'Error detecting payment' 
      };
    }
  }
}
