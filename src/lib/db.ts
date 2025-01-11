import { openDB } from 'idb';

const DB_NAME = 'certificate-verification-system';
const DB_VERSION = 1;

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Certificates store
      if (!db.objectStoreNames.contains('certificates')) {
        const certificatesStore = db.createObjectStore('certificates', { keyPath: 'id' });
        certificatesStore.createIndex('issuerId', 'issuerId');
        certificatesStore.createIndex('candidateId', 'candidateId');
        certificatesStore.createIndex('status', 'status');
      }

      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('role', 'role');
        usersStore.createIndex('email', 'email', { unique: true });
      }

      // Access requests store
      if (!db.objectStoreNames.contains('accessRequests')) {
        const requestsStore = db.createObjectStore('accessRequests', { keyPath: 'id' });
        requestsStore.createIndex('certificateId', 'certificateId');
        requestsStore.createIndex('requesterId', 'requesterId');
        requestsStore.createIndex('status', 'status');
      }
    },
  });

  return db;
};