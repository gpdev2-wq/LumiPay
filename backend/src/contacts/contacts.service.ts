import { Injectable } from '@nestjs/common';
import { db } from '../firebase.config';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';

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

@Injectable()
export class ContactsService {
  private readonly collectionName = 'contacts';

  async createContact(createContactDto: any, file?: any): Promise<Contact> {
    if (!db) throw new Error('Database not initialized');
    
    const contactData = {
      name: createContactDto.name,
      email: createContactDto.email,
      phone: createContactDto.phone || '',
      subject: createContactDto.subject,
      message: createContactDto.message,
      transactionHash: createContactDto.transactionHash || '',
      usdtAmount: createContactDto.usdtAmount || '',
      inrAmount: createContactDto.inrAmount || '',
      imageUrl: file ? `/uploads/contacts/${file.filename}` : '',
      status: 'new' as const,
      priority: this.determinePriority(createContactDto.subject),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, this.collectionName), contactData);
    
    return {
      id: docRef.id,
      ...contactData
    };
  }

  async getAllContacts(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Promise<{ contacts: Contact[]; total: number; totalPages: number; currentPage: number }> {
    if (!db) throw new Error('Database not initialized');

    let q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));

    // Apply status filter
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status));
    }

    const allDocs = await getDocs(q);
    let contacts = allDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
      responseSentAt: doc.data().responseSentAt?.toDate()
    })) as Contact[];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.subject.toLowerCase().includes(searchLower) ||
        contact.message.toLowerCase().includes(searchLower)
      );
    }

    const total = contacts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContacts = contacts.slice(startIndex, endIndex);

    return {
      contacts: paginatedContacts,
      total,
      totalPages,
      currentPage: page
    };
  }

  async getContactById(id: string): Promise<Contact | null> {
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
    } as Contact;
  }

  async updateContact(id: string, updateContactDto: any): Promise<Contact | null> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    const updateData = {
      ...updateContactDto,
      updatedAt: new Date()
    };

    await updateDoc(docRef, updateData);
    return await this.getContactById(id);
  }

  async updateContactStatus(id: string, status: string): Promise<Contact | null> {
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
    return await this.getContactById(id);
  }

  async deleteContact(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getContactStats(): Promise<{
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    closed: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  }> {
    if (!db) throw new Error('Database not initialized');
    
    const allDocs = await getDocs(collection(db, this.collectionName));
    const contacts = allDocs.docs.map(doc => doc.data()) as Contact[];

    return {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      inProgress: contacts.filter(c => c.status === 'in_progress').length,
      resolved: contacts.filter(c => c.status === 'resolved').length,
      closed: contacts.filter(c => c.status === 'closed').length,
      highPriority: contacts.filter(c => c.priority === 'high').length,
      mediumPriority: contacts.filter(c => c.priority === 'medium').length,
      lowPriority: contacts.filter(c => c.priority === 'low').length
    };
  }

  private determinePriority(subject: string): 'low' | 'medium' | 'high' {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('urgent') || 
        subjectLower.includes('transaction') || 
        subjectLower.includes('issue') ||
        subjectLower.includes('problem')) {
      return 'high';
    }
    
    if (subjectLower.includes('support') || 
        subjectLower.includes('help') ||
        subjectLower.includes('question')) {
      return 'medium';
    }
    
    return 'low';
  }
}
