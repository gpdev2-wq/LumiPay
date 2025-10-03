export declare class CreateOrderDto {
    userId: string;
    usdtAmount: number;
    inrAmount: number;
    rate: number;
    depositAddress: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    txHash?: string;
}
