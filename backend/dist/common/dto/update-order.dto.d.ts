export declare class UpdateOrderDto {
    status?: string;
    txHash?: string;
    payoutMethod?: string;
    upiId?: string;
    imps?: {
        accountNumber: string;
        ifsc: string;
        accountHolder: string;
    };
}
