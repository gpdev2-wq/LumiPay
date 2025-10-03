import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
        environment: string;
        port: string | number;
        version: string;
    };
}
