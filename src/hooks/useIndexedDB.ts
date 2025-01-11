import { useEffect, useState } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CertificateDB extends DBSchema {
  certificates: {
    key: string;
    value: {
      id: string;
      title: string;
      issuerId: string;
      candidateId: string;
      issueDate: string;
      expiryDate?: string;
      status: 'active' | 'revoked' | 'expired';
      metadata: Record<string, any>;
    };
    indexes: { 'by-issuer': string; 'by-candidate': string; 'by-status': string };
  };
  users: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      role: 'issuer' | 'candidate' | 'organization';
    };
    indexes: { 'by-email': string; 'by-role': string };
  };
  accessRequests: {
    key: string;
    value: {
      id: string;
      certificateId: string;
      requesterId: string;
      status: 'pending' | 'approved' | 'denied';
      requestDate: string;
    };
    indexes: { 'by-certificate': string; 'by-requester': string; 'by-status': string };
  };
}

export function useIndexedDB() {
  const [db, setDb] = useState<IDBPDatabase<CertificateDB> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<CertificateDB>('certificate-verification-system', 1, {
          upgrade(db) {
            // Certificates store
            if (!db.objectStoreNames.contains('certificates')) {
              const certificatesStore = db.createObjectStore('certificates', { keyPath: 'id' });
              certificatesStore.createIndex('by-issuer', 'issuerId');
              certificatesStore.createIndex('by-candidate', 'candidateId');
              certificatesStore.createIndex('by-status', 'status');
            }

            // Users store
            if (!db.objectStoreNames.contains('users')) {
              const usersStore = db.createObjectStore('users', { keyPath: 'id' });
              usersStore.createIndex('by-email', 'email', { unique: true });
              usersStore.createIndex('by-role', 'role');
            }

            // Access requests store
            if (!db.objectStoreNames.contains('accessRequests')) {
              const requestsStore = db.createObjectStore('accessRequests', { keyPath: 'id' });
              requestsStore.createIndex('by-certificate', 'certificateId');
              requestsStore.createIndex('by-requester', 'requesterId');
              requestsStore.createIndex('by-status', 'status');
            }
          },
        });
        setDb(database);
      } catch (err) {
        setError(err as Error);
      }
    };

    initDB();

    return () => {
      db?.close();
    };
  }, []);

  const getCertificatesByIssuer = async (issuerId: string) => {
    if (!db) throw new Error('Database not initialized');
    return await db.getAllFromIndex('certificates', 'by-issuer', issuerId);
  };

  const getCertificatesByCandidate = async (candidateId: string) => {
    if (!db) throw new Error('Database not initialized');
    return await db.getAllFromIndex('certificates', 'by-candidate', candidateId);
  };

  const getAccessRequestsByStatus = async (status: string) => {
    if (!db) throw new Error('Database not initialized');
    return await db.getAllFromIndex('accessRequests', 'by-status', status);
  };

  const addCertificate = async (certificate: CertificateDB['certificates']['value']) => {
    if (!db) throw new Error('Database not initialized');
    return await db.add('certificates', certificate);
  };

  const updateCertificate = async (certificate: CertificateDB['certificates']['value']) => {
    if (!db) throw new Error('Database not initialized');
    return await db.put('certificates', certificate);
  };

  const addAccessRequest = async (request: CertificateDB['accessRequests']['value']) => {
    if (!db) throw new Error('Database not initialized');
    return await db.add('accessRequests', request);
  };

  const updateAccessRequest = async (request: CertificateDB['accessRequests']['value']) => {
    if (!db) throw new Error('Database not initialized');
    return await db.put('accessRequests', request);
  };

  return {
    db,
    error,
    getCertificatesByIssuer,
    getCertificatesByCandidate,
    getAccessRequestsByStatus,
    addCertificate,
    updateCertificate,
    addAccessRequest,
    updateAccessRequest,
  };
}