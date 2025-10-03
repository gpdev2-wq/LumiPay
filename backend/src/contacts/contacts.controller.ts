import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createContact(@Body() createContactDto: any, @UploadedFile() file?: any) {
    return await this.contactsService.createContact(createContactDto, file);
  }

  @Get()
  async getAllContacts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return await this.contactsService.getAllContacts(page, limit, status, search);
  }

  @Get(':id')
  async getContactById(@Param('id') id: string) {
    return await this.contactsService.getContactById(id);
  }

  @Put(':id')
  async updateContact(@Param('id') id: string, @Body() updateContactDto: any) {
    return await this.contactsService.updateContact(id, updateContactDto);
  }

  @Put(':id/status')
  async updateContactStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return await this.contactsService.updateContactStatus(id, body.status);
  }

  @Delete(':id')
  async deleteContact(@Param('id') id: string) {
    return await this.contactsService.deleteContact(id);
  }

  @Get('stats/summary')
  async getContactStats() {
    return await this.contactsService.getContactStats();
  }
}
