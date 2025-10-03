import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('screenshot'))
  async createTicket(@Body() createTicketDto: any, @UploadedFile() file?: any) {
    return await this.ticketsService.createTicket(createTicketDto, file);
  }

  @Get()
  async getAllTickets(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string
  ) {
    return await this.ticketsService.getAllTickets(page, limit, status, priority, search);
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return await this.ticketsService.getTicketById(id);
  }

  @Put(':id')
  async updateTicket(@Param('id') id: string, @Body() updateTicketDto: any) {
    return await this.ticketsService.updateTicket(id, updateTicketDto);
  }

  @Put(':id/status')
  async updateTicketStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return await this.ticketsService.updateTicketStatus(id, body.status);
  }

  @Put(':id/respond')
  async respondToTicket(@Param('id') id: string, @Body() body: { response: string, status: string }) {
    return await this.ticketsService.respondToTicket(id, body.response, body.status);
  }

  @Delete(':id')
  async deleteTicket(@Param('id') id: string) {
    return await this.ticketsService.deleteTicket(id);
  }

  @Get('stats/summary')
  async getTicketStats() {
    return await this.ticketsService.getTicketStats();
  }

  @Get('user/:userId')
  async getUserTickets(@Param('userId') userId: string) {
    return await this.ticketsService.getUserTickets(userId);
  }
}
