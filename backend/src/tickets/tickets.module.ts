import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/tickets',
    }),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
