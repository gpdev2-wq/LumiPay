import { OrdersService } from './orders.service';
import type { Order } from './orders.service';
import { CreateOrderDto } from '../common/dto/create-order.dto';
import { UpdateOrderDto } from '../common/dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(orderData: CreateOrderDto): Promise<Order>;
    getAllOrders(userId?: string): Promise<Order[]>;
    checkTransactionHash(txHash: string): Promise<{
        used: boolean;
        orderId?: string;
    }>;
    checkAmountUsage(amount: string, userId: string): Promise<{
        used: boolean;
        orderId?: string;
    }>;
    claimTransactionHash(body: {
        txHash: string;
        orderId: string;
    }): Promise<{
        success: boolean;
        alreadyUsed?: boolean;
        existingOrderId?: string;
    }>;
    getOrderById(id: string): Promise<Order | undefined>;
    updateOrderStatus(id: string, body: {
        status: Order['status'];
        txHash?: string;
    }): Promise<Order | undefined>;
    updateOrder(id: string, updates: UpdateOrderDto): Promise<Order | undefined>;
    detectPayment(body: {
        txHash?: string;
        userId: string;
        orderId?: string;
        expectedAmount?: number;
        depositAddress?: string;
    }): Promise<{
        success: boolean;
        order?: Order;
        message: string;
        paymentDetected?: boolean;
        txHash?: string;
    }>;
}
