import { IsOptional, IsString, IsEnum, IsObject } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  payoutMethod?: string;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsObject()
  imps?: {
    accountNumber: string;
    ifsc: string;
    accountHolder: string;
  };
}
