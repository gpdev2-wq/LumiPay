import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatesModule } from './rates/rates.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { ContactsModule } from './contacts/contacts.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, RatesModule, AdminModule, OrdersModule, UsersModule, SettingsModule, ContactsModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
