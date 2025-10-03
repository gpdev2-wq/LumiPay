"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
let TicketsService = class TicketsService {
    collectionName = 'tickets';
    async createTicket(createTicketDto, file) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const ticketId = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
        const ticketData = {
            ticketId,
            userId: createTicketDto.userId,
            userEmail: createTicketDto.userEmail,
            userName: createTicketDto.userName,
            subject: createTicketDto.subject,
            problem: createTicketDto.problem,
            priority: createTicketDto.priority || 'medium',
            status: 'open',
            transactionId: createTicketDto.transactionId || '',
            screenshotUrl: file ? `/uploads/tickets/${file.originalname}` : '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), ticketData);
        return {
            id: docRef.id,
            ...ticketData
        };
    }
    async getAllTickets(page = 1, limit = 10, status, priority, search) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        let q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.orderBy)('createdAt', 'desc'));
        if (status && status !== 'all') {
            q = (0, firestore_1.query)(q, (0, firestore_1.where)('status', '==', status));
        }
        if (priority && priority !== 'all') {
            q = (0, firestore_1.query)(q, (0, firestore_1.where)('priority', '==', priority));
        }
        const allDocs = await (0, firestore_1.getDocs)(q);
        let tickets = allDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            resolvedAt: doc.data().resolvedAt?.toDate(),
            responseSentAt: doc.data().responseSentAt?.toDate()
        }));
        if (search) {
            const searchLower = search.toLowerCase();
            tickets = tickets.filter(ticket => ticket.ticketId.toLowerCase().includes(searchLower) ||
                ticket.userName.toLowerCase().includes(searchLower) ||
                ticket.userEmail.toLowerCase().includes(searchLower) ||
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.problem.toLowerCase().includes(searchLower));
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
    async getTicketById(id) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        const docSnap = await (0, firestore_1.getDoc)(docRef);
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
        };
    }
    async updateTicket(id, updateTicketDto) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        const updateData = {
            ...updateTicketDto,
            updatedAt: new Date()
        };
        await (0, firestore_1.updateDoc)(docRef, updateData);
        return await this.getTicketById(id);
    }
    async updateTicketStatus(id, status) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        const updateData = {
            status,
            updatedAt: new Date()
        };
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedAt = new Date();
        }
        await (0, firestore_1.updateDoc)(docRef, updateData);
        return await this.getTicketById(id);
    }
    async respondToTicket(id, response, status) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        const updateData = {
            adminResponse: response,
            status,
            updatedAt: new Date(),
            responseSentAt: new Date()
        };
        if (status === 'resolved' || status === 'closed') {
            updateData.resolvedAt = new Date();
        }
        await (0, firestore_1.updateDoc)(docRef, updateData);
        return await this.getTicketById(id);
    }
    async deleteTicket(id) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        await (0, firestore_1.deleteDoc)(docRef);
    }
    async getUserTickets(userId) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        try {
            const q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.where)('userId', '==', userId));
            const querySnapshot = await (0, firestore_1.getDocs)(q);
            const tickets = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
                resolvedAt: doc.data().resolvedAt?.toDate(),
                responseSentAt: doc.data().responseSentAt?.toDate()
            }));
            return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error fetching user tickets:', error);
            throw error;
        }
    }
    async getTicketStats() {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const allDocs = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName));
        const tickets = allDocs.docs.map(doc => doc.data());
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
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)()
], TicketsService);
//# sourceMappingURL=tickets.service.js.map