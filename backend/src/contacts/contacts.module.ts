import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/contacts',
    }),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}