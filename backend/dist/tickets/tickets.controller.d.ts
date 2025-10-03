import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    createTicket(createTicketDto: any, file?: any): Promise<import("./tickets.service").Ticket>;
    getAllTickets(page?: number, limit?: number, status?: string, priority?: string, search?: string): Promise<{
        tickets: import("./tickets.service").Ticket[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getTicketById(id: string): Promise<import("./tickets.service").Ticket | null>;
    updateTicket(id: string, updateTicketDto: any): Promise<import("./tickets.service").Ticket | null>;
    updateTicketStatus(id: string, body: {
        status: string;
    }): Promise<import("./tickets.service").Ticket | null>;
    respondToTicket(id: string, body: {
        response: string;
        status: string;
    }): Promise<import("./tickets.service").Ticket | null>;
    deleteTicket(id: string): Promise<void>;
    getTicketStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
    }>;
    getUserTickets(userId: string): Promise<import("./tickets.service").Ticket[]>;
}
