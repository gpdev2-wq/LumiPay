"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyA7fU0o-OA2Oy9tPrWNcYa1qsa4i7YwANk",
    authDomain: "dttoinr.firebaseapp.com",
    projectId: "dttoinr",
    storageBucket: "dttoinr.firebasestorage.app",
    messagingSenderId: "797035412107",
    appId: "1:797035412107:web:ae3177f51b163ca41f328e",
    measurementId: "G-601RENMBL2"
};
let app;
let db;
try {
    app = !(0, app_1.getApps)().length ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApp)();
    exports.db = db = (0, firestore_1.getFirestore)(app);
    console.log('Firebase initialized successfully');
}
catch (error) {
    console.error('Firebase initialization error:', error);
    exports.db = db = null;
}
exports.auth = null;
//# sourceMappingURL=firebase.config.js.map