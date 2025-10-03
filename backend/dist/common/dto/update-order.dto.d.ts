export declare class UpdateOrderDto {
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    txHash?: string;
    payoutMethod?: string;
    upiId?: string;
    imps?: {
        accountNumber: string;
        ifsc: string;
        accountHolder: string;
    };
}
