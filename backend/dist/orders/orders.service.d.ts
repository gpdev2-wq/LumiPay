import { UsersService } from '../users/users.service';
import { RatesService } from '../rates/rates.service';
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
export declare class OrdersService {
    private usersService;
    private ratesService;
    private readonly collectionName;
    constructor(usersService: UsersService, ratesService: RatesService);
    private makeHttpRequest;
    createOrder(orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>): Promise<Order>;
    findAll(): Promise<Order[]>;
    findByUserId(userId: string): Promise<Order[]>;
    findById(id: string): Promise<Order | undefined>;
    checkTransactionHash(txHash: string): Promise<{
        used: boolean;
        orderId?: string;
    }>;
    claimTransactionHash(txHash: string, orderId: string): Promise<{
        success: boolean;
        alreadyUsed?: boolean;
        existingOrderId?: string;
    }>;
    checkAmountUsage(amount: number, userId: string): Promise<{
        used: boolean;
        orderId?: string;
    }>;
    updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
    updateOrderStatus(id: string, status: Order['status'], txHash?: string): Promise<Order | undefined>;
    detectAndCreateOrderForPayment(txHash: string, userId: string): Promise<{
        success: boolean;
        order?: Order;
        message: string;
    }>;
    private updateUserStats;
    detectPaymentAdvanced(data: {
        userId: string;
        orderId?: string;
        expectedAmount: number;
        depositAddress: string;
    }): Promise<{
        success: boolean;
        paymentDetected: boolean;
        message: string;
        txHash?: string;
    }>;
}
