import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';

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

@Injectable()
export class TicketsService {
  private readonly collectionName = 'tickets';

  async createTicket(createTicketDto: any, file?: any): Promise<Ticket> {
    if (!db) throw new Error('Database not initialized');
    
    // Generate unique ticket ID
    const ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const ticketData = {
      ticketId,
      userId: createTicketDto.userId,
      userEmail: createTicketDto.userEmail,
      userName: createTicketDto.userName,
      subject: createTicketDto.subject,
      problem: createTicketDto.problem,
      priority: createTicketDto.priority || 'medium',
      status: 'open' as const,
      transactionId: createTicketDto.transactionId || '',
      screenshotUrl: file ? `/uploads/tickets/${file.originalname}` : '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, this.collectionName), ticketData);
    
    return {
      id: docRef.id,
      ...ticketData
    };
  }

  async getAllTickets(
    page: number = 1,
    limit: number = 10,
    status?: string,
    priority?: string,
    search?: string
  ): Promise<{ tickets: Ticket[]; total: number; totalPages: number; currentPage: number }> {
    if (!db) throw new Error('Database not initialized');

    let q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));

    // Apply status filter
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status));
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      q = query(q, where('priority', '==', priority));
    }

    const allDocs = await getDocs(q);
    let tickets = allDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
      responseSentAt: doc.data().responseSentAt?.toDate()
    })) as Ticket[];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.ticketId.toLowerCase().includes(searchLower) ||
        ticket.userName.toLowerCase().includes(searchLower) ||
        ticket.userEmail.toLowerCase().includes(searchLower) ||
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.problem.toLowerCase().includes(searchLower)
      );
    }

    const total = tickets.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      resolvedAt: data.resolvedAt?.toDate(),
      responseSentAt: data.responseSentAt?.toDate()
    } as Ticket;
  }

  async updateTicket(id: string, updateTicketDto: any): Promise<Ticket | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const updateData = {
      ...updateTicketDto,
      updatedAt: new Date()
    };

    await updateDoc(docRef, updateData);
    return await this.getTicketById(id);
  }

  async updateTicketStatus(id: string, status: string): Promise<Ticket | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    await updateDoc(docRef, updateData);
    return await this.getTicketById(id);
  }

  async respondToTicket(id: string, response: string, status: string): Promise<Ticket | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const updateData: any = {
      adminResponse: response,
      status,
      updatedAt: new Date(),
      responseSentAt: new Date()
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    await updateDoc(docRef, updateData);
    return await this.getTicketById(id);
  }

  async deleteTicket(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      const q = query(
        collection(db, this.collectionName), 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        resolvedAt: doc.data().resolvedAt?.toDate(),
        responseSentAt: doc.data().responseSentAt?.toDate()
      })) as Ticket[];
      
      // Sort by createdAt in descending order (most recent first)
      return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  }

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  }> {
    if (!db) throw new Error('Database not initialized');
    
    const allDocs = await getDocs(collection(db, this.collectionName));
    const tickets = allDocs.docs.map(doc => doc.data()) as Ticket[];

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      highPriority: tickets.filter(t => t.priority === 'high').length,
      mediumPriority: tickets.filter(t => t.priority === 'medium').length,
      lowPriority: tickets.filter(t => t.priority === 'low').length
    };
  }
}
