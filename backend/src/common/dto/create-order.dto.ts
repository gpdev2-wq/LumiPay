import { IsNumber, IsString, IsNotEmpty, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  @Transform(({ value }) => parseFloat(value))
  usdtAmount: number;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  inrAmount: number;

  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  rate: number;

  @IsString()
  @IsNotEmpty()
  depositAddress: string;

  @IsOptional()
  @IsString()
  txHash?: string;
}
