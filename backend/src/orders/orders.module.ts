import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UsersModule } from '../users/users.module';
import { RatesModule } from '../rates/rates.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, RatesModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
