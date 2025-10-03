export interface Ticket {
    id?: string;
    ticketId: string;
    userId: string;
    userEmail: string;
    userName: string;
    subject: string;
    problem: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    transactionId?: string;
    screenshotUrl?: string;
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    responseSentAt?: Date;
}
export declare class TicketsService {
    private readonly collectionName;
    createTicket(createTicketDto: any, file?: any): Promise<Ticket>;
    getAllTickets(page?: number, limit?: number, status?: string, priority?: string, search?: string): Promise<{
        tickets: Ticket[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getTicketById(id: string): Promise<Ticket | null>;
    updateTicket(id: string, updateTicketDto: any): Promise<Ticket | null>;
    updateTicketStatus(id: string, status: string): Promise<Ticket | null>;
    respondToTicket(id: string, response: string, status: string): Promise<Ticket | null>;
    deleteTicket(id: string): Promise<void>;
    getUserTickets(userId: string): Promise<Ticket[]>;
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
}
