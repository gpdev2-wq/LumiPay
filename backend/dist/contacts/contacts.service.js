"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_config_1 = require("../firebase.config");
const firestore_1 = require("firebase/firestore");
let ContactsService = class ContactsService {
    collectionName = 'contacts';
    async createContact(createContactDto, file) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
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
            status: 'new',
            priority: this.determinePriority(createContactDto.subject),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), contactData);
        return {
            id: docRef.id,
            ...contactData
        };
    }
    async getAllContacts(page = 1, limit = 10, status, search) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        let q = (0, firestore_1.query)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName), (0, firestore_1.orderBy)('createdAt', 'desc'));
        if (status && status !== 'all') {
            q = (0, firestore_1.query)(q, (0, firestore_1.where)('status', '==', status));
        }
        const allDocs = await (0, firestore_1.getDocs)(q);
        let contacts = allDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            resolvedAt: doc.data().resolvedAt?.toDate(),
            responseSentAt: doc.data().responseSentAt?.toDate()
        }));
        if (search) {
            const searchLower = search.toLowerCase();
            contacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchLower) ||
                contact.email.toLowerCase().includes(searchLower) ||
                contact.subject.toLowerCase().includes(searchLower) ||
                contact.message.toLowerCase().includes(searchLower));
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
    async getContactById(id) {
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
    async updateContact(id, updateContactDto) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        const updateData = {
            ...updateContactDto,
            updatedAt: new Date()
        };
        await (0, firestore_1.updateDoc)(docRef, updateData);
        return await this.getContactById(id);
    }
    async updateContactStatus(id, status) {
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
        return await this.getContactById(id);
    }
    async deleteContact(id) {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const docRef = (0, firestore_1.doc)(firebase_config_1.db, this.collectionName, id);
        await (0, firestore_1.deleteDoc)(docRef);
    }
    async getContactStats() {
        if (!firebase_config_1.db)
            throw new Error('Database not initialized');
        const allDocs = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_config_1.db, this.collectionName));
        const contacts = allDocs.docs.map(doc => doc.data());
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
    determinePriority(subject) {
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
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)()
], ContactsService);
//# sourceMappingURL=contacts.service.js.map