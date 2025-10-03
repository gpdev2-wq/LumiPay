import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    createContact(createContactDto: any, file?: any): Promise<import("./contacts.service").Contact>;
    getAllContacts(page?: number, limit?: number, status?: string, search?: string): Promise<{
        contacts: import("./contacts.service").Contact[];
        total: number;
        totalPages: number;
        currentPage: number;
    }>;
    getContactById(id: string): Promise<import("./contacts.service").Contact | null>;
    updateContact(id: string, updateContactDto: any): Promise<import("./contacts.service").Contact | null>;
    updateContactStatus(id: string, body: {
        status: string;
    }): Promise<import("./contacts.service").Contact | null>;
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
}
