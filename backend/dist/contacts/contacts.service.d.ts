export interface Contact {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    transactionHash?: string;
    usdtAmount?: string;
    inrAmount?: string;
    imageUrl?: string;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    adminNotes?: string;
    responseEmail?: string;
    responseMessage?: string;
    responseSentAt?: Date;
}
export declare class ContactsService {
    private readonly collectionName;
    createContact(createContactDto: any, file?: any): Promise<Contact>;
    getAllContacts(page?: number, limit?: number, status?: string, search?: string): Promise<{
        contacts: Contact[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getContactById(id: string): Promise<Contact | null>;
    updateContact(id: string, updateContactDto: any): Promise<Contact | null>;
    updateContactStatus(id: string, status: string): Promise<Contact | null>;
    deleteContact(id: string): Promise<void>;
    getContactStats(): Promise<{
        total: number;
        new: number;
        inProgress: number;
        resolved: number;
        closed: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
    }>;
    private determinePriority;
}
