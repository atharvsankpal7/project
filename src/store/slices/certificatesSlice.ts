import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Certificate {
  id: string;
  title: string;
  issuerId: string;
  candidateId: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'revoked' | 'expired';
  metadata: Record<string, any>;
}

interface CertificatesState {
  items: Certificate[];
  loading: boolean;
  error: string | null;
}

const initialState: CertificatesState = {
  items: [],
  loading: false,
  error: null,
};

const certificatesSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {
    setCertificates: (state, action: PayloadAction<Certificate[]>) => {
      state.items = action.payload;
    },
    addCertificate: (state, action: PayloadAction<Certificate>) => {
      state.items.push(action.payload);
    },
    updateCertificate: (state, action: PayloadAction<Certificate>) => {
      const index = state.items.findIndex(cert => cert.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCertificates,
  addCertificate,
  updateCertificate,
  setLoading,
  setError,
} = certificatesSlice.actions;

export default certificatesSlice.reducer;