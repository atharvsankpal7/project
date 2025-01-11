import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/ErrorBoundary';
import IssuerDashboard from './pages/issuer/Dashboard';
import IssueCertificate from './pages/issuer/IssueCertificate';
import Templates from './pages/issuer/Templates';
import Analytics from './pages/issuer/Analytics';
import CandidateDashboard from './pages/candidate/Dashboard';
import OrganizationDashboard from './pages/organization/Dashboard';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { initDB } from './lib/db';

function App() {
  useEffect(() => {
    // Initialize the database when the app starts
    initDB().catch(console.error);
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route
                path="/issuer"
                element={
                  <ProtectedRoute role="issuer">
                    <IssuerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issuer/issue"
                element={
                  <ProtectedRoute role="issuer">
                    <IssueCertificate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issuer/templates"
                element={
                  <ProtectedRoute role="issuer">
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issuer/analytics"
                element={
                  <ProtectedRoute role="issuer">
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/*"
                element={
                  <ProtectedRoute role="candidate">
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organization/*"
                element={
                  <ProtectedRoute role="organization">
                    <OrganizationDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}
export default App;