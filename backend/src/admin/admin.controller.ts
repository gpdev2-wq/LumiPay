import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('admin')
export class AdminController {
  @Get('export/orders.csv')
  @Header('Content-Type', 'text/csv')
  exportOrders(@Res() res: Response) {
    const header = 'id,type,amount_usdt,status,created_at\n';
    const sample = '1,sell,1000,ready_to_match,' + new Date().toISOString() + '\n';
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(header + sample);
  }

  @Get('export/users.csv')
  @Header('Content-Type', 'text/csv')
  exportUsers(@Res() res: Response) {
    const header = 'id,contact,created_at\n';
    const sample = '1,+91XXXXXX, ' + new Date().toISOString() + '\n';
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(header + sample);
  }
}


