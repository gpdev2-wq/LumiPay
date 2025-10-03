"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const rates_service_1 = require("../rates/rates.service");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
const https = __importStar(require("https"));
let OrdersService = class OrdersService {
    usersService;
    ratesService;
    collectionName = 'orders';
    constructor(usersService, ratesService) {
        this.usersService = usersService;
        this.ratesService = ratesService;
    }
    async makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
    async createOrder(orderData) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const orderDataToSave = {
            ...orderData,
            orderId: `ORD-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), orderDataToSave);
        const order = {
            id: docRef.id,
            ...orderDataToSave
        };
        await this.updateUserStats(order.userId);
        return order;
    }
    async findAll() {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const querySnapshot = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }
    async findByUserId(userId) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('userId', '==', userId));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const orders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    }
    async findById(id) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
            const docSnap = await (0, firestore_1.getDoc)(docRef);
            if (!docSnap.exists()) {
                return undefined;
            }
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        catch (error) {
            console.error('Error fetching order by ID:', error);
            return undefined;
        }
    }
    async checkTransactionHash(txHash) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const ordersQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('txHash', '==', txHash));
            const ordersSnapshot = await (0, firestore_1.getDocs)(ordersQuery);
            if (ordersSnapshot.docs.length > 0) {
                const existingOrder = {
                    id: ordersSnapshot.docs[0].id,
                    ...ordersSnapshot.docs[0].data()
                };
                return {
                    used: true,
                    orderId: existingOrder.orderId,
                };
            }
            const usedHashesQuery = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, 'used_tx_hashes'), (0, firestore_1.where)('txHash', '==', txHash));
            const usedHashesSnapshot = await (0, firestore_1.getDocs)(usedHashesQuery);
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
        }
        catch (error) {
            console.error('Error checking transaction hash:', error);
            return {
                used: false,
            };
        }
    }
    async claimTransactionHash(txHash, orderId) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const existingCheck = await this.checkTransactionHash(txHash);
            if (existingCheck.used) {
                return {
                    success: false,
                    alreadyUsed: true,
                    existingOrderId: existingCheck.orderId
                };
            }
            try {
                await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, 'used_tx_hashes'), {
                    txHash: txHash,
                    orderId: orderId,
                    claimedAt: new Date().toISOString(),
                    status: 'claimed'
                });
            }
            catch (addError) {
                const doubleCheck = await this.checkTransactionHash(txHash);
                if (doubleCheck.used) {
                    return {
                        success: false,
                        alreadyUsed: true,
                        existingOrderId: doubleCheck.orderId
                    };
                }
            }
            const orderRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, orderId);
            await (0, firestore_1.updateDoc)(orderRef, {
                txHash: txHash,
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            console.log(`✅ Transaction hash ${txHash} claimed by order ${orderId}`);
            return {
                success: true,
                alreadyUsed: false
            };
        }
        catch (error) {
            console.error('Error claiming transaction hash:', error);
            return {
                success: false,
                alreadyUsed: false
            };
        }
    }
    async checkAmountUsage(amount, userId) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.where)('usdtAmount', '==', amount), (0, firestore_1.where)('createdAt', '>=', twentyFourHoursAgo), (0, firestore_1.where)('status', 'in', ['completed', 'processing']));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            if (querySnapshot.docs.length > 0) {
                const existingOrder = {
                    id: querySnapshot.docs[0].id,
                    ...querySnapshot.docs[0].data()
                };
                return {
                    used: true,
                    orderId: existingOrder.orderId,
                };
            }
            return {
                used: false,
            };
        }
        catch (error) {
            console.error('Error checking amount usage:', error);
            return {
                used: false,
            };
        }
    }
    async updateOrder(id, updates) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const orderRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
            await (0, firestore_1.updateDoc)(orderRef, updates);
            const updatedOrderDoc = await (0, firestore_1.getDoc)(orderRef);
            if (!updatedOrderDoc.exists()) {
                return undefined;
            }
            return {
                id: updatedOrderDoc.id,
                ...updatedOrderDoc.data()
            };
        }
        catch (error) {
            console.error('Error updating order:', error);
            return undefined;
        }
    }
    async updateOrderStatus(id, status, txHash) {
        const order = await this.findById(id);
        if (!order)
            return undefined;
        const updates = { status };
        if (status === 'completed') {
            updates.completedAt = new Date().toISOString();
        }
        if (txHash) {
            updates.txHash = txHash;
        }
        const updatedOrder = await this.updateOrder(id, updates);
        if (updatedOrder) {
            await this.updateUserStats(updatedOrder.userId);
            if (status === 'completed') {
                const rates = await this.ratesService.getRates();
                await this.usersService.addReferralCommission(updatedOrder.userId, updatedOrder.usdtAmount, rates.sellRateInrPerUsdt);
            }
        }
        return updatedOrder;
    }
    async detectAndCreateOrderForPayment(txHash, userId) {
        try {
            if (!firebase_config_1.db)
                throw new Error('Database not initialized');
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('txHash', '==', txHash));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const existingOrder = querySnapshot.docs.length > 0 ? {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
            } : undefined;
            if (existingOrder) {
                return {
                    success: false,
                    message: 'Transaction hash already used in another order',
                };
            }
            const depositAddress = 'TVz5oQurcJUoPohtdCGH89PhqKvFgiYzRq';
            const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
            const data = await this.makeHttpRequest(`https://api.trongrid.io/v1/accounts/${depositAddress}/transactions/trc20?contract_address=${usdtContract}&limit=20`);
            const transactions = data.data || [];
            const transaction = transactions.find((tx) => tx.transaction_id === txHash);
            if (!transaction) {
                return {
                    success: false,
                    message: 'Transaction not found in recent transactions',
                };
            }
            const usdtAmount = Number(transaction.value) / Math.pow(10, 6);
            if (usdtAmount <= 0) {
                return {
                    success: false,
                    message: 'Invalid transaction amount',
                };
            }
            const order = await this.createOrder({
                userId,
                usdtAmount,
                inrAmount: usdtAmount * 95,
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
        }
        catch (error) {
            console.error('Error detecting payment:', error);
            return {
                success: false,
                message: 'Error detecting payment: ' + error.message,
            };
        }
    }
    async updateUserStats(userId) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('userId', '==', userId));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const userOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const totalOrders = userOrders.length;
            const totalVolume = userOrders.reduce((sum, order) => sum + order.usdtAmount, 0);
            await this.usersService.updateUserStats(userId, totalOrders, totalVolume);
        }
        catch (error) {
            console.error('Error updating user stats:', error);
        }
    }
    async detectPaymentAdvanced(data) {
        try {
            console.log('🔍 Advanced payment detection for:', data);
            const orders = await this.findAll();
            let targetOrder = null;
            if (data.orderId) {
                targetOrder = orders.find(order => order.id === data.orderId);
            }
            else {
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
            try {
                const tronGridUrl = `https://api.trongrid.io/v1/accounts/${data.depositAddress}/transactions/trc20?contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&limit=100&order_by=block_timestamp,desc`;
                console.log('🌐 Checking TronGrid API:', tronGridUrl);
                let transactions = [];
                let apiUsed = 'TronGrid';
                try {
                    const response = await this.makeHttpRequest(tronGridUrl);
                    transactions = response.data || [];
                    console.log(`📊 Found ${transactions.length} transactions from TronGrid`);
                }
                catch (tronGridError) {
                    console.warn('TronGrid failed, trying TronScan:', tronGridError.message);
                    const tronScanUrl = `https://apilist.tronscanapi.com/api/transfer/trc20?sort=-timestamp&count=true&limit=100&start=0&toAddress=${data.depositAddress}&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
                    const scanResponse = await this.makeHttpRequest(tronScanUrl);
                    transactions = scanResponse.data || [];
                    apiUsed = 'TronScan';
                    console.log(`📊 Found ${transactions.length} transactions from TronScan`);
                }
                const now = Date.now();
                const recentTransactions = transactions.filter((tx) => {
                    const txTime = tx.block_timestamp;
                    const timeDiff = now - txTime;
                    return timeDiff < (15 * 60 * 1000);
                });
                console.log(`⏰ Recent transactions (last 15 min): ${recentTransactions.length}`);
                const expectedAmount = data.expectedAmount;
                const matchingTransaction = recentTransactions.find((tx) => {
                    const txAmount = Number(tx.value) / Math.pow(10, 6);
                    const isAmountMatch = Math.abs(txAmount - expectedAmount) < 0.0001;
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
                    await this.updateOrderStatus(targetOrder.id, 'completed', txHash);
                    return {
                        success: true,
                        paymentDetected: true,
                        message: `Payment detected successfully (${txAmount} USDT via ${apiUsed})`,
                        txHash: txHash
                    };
                }
                console.log(`⏳ No matching transaction found. Expected: ${expectedAmount} USDT`);
                return {
                    success: true,
                    paymentDetected: false,
                    message: 'No payment detected yet'
                };
            }
            catch (blockchainError) {
                console.error('❌ Blockchain API error:', blockchainError);
                try {
                    const tronScanUrl = `https://apilist.tronscanapi.com/api/transfer/trc20?sort=-timestamp&count=true&limit=50&start=0&toAddress=${data.depositAddress}&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`;
                    console.log('🌐 Trying TronScan API as fallback:', tronScanUrl);
                    const fallbackResponse = await this.makeHttpRequest(tronScanUrl);
                    const fallbackTransactions = fallbackResponse.data || [];
                    console.log(`📊 Fallback found ${fallbackTransactions.length} transactions`);
                    const now = Date.now();
                    const recentFallback = fallbackTransactions.filter((tx) => {
                        const txTime = tx.timestamp * 1000;
                        const timeDiff = now - txTime;
                        return timeDiff < (15 * 60 * 1000);
                    });
                    const matchingFallback = recentFallback.find((tx) => {
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
                }
                catch (fallbackError) {
                    console.error('❌ Fallback API also failed:', fallbackError);
                }
                return {
                    success: false,
                    paymentDetected: false,
                    message: 'Blockchain APIs temporarily unavailable'
                };
            }
        }
        catch (error) {
            console.error('❌ Error in advanced payment detection:', error);
            return {
                success: false,
                paymentDetected: false,
                message: 'Error detecting payment'
            };
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        rates_service_1.RatesService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map