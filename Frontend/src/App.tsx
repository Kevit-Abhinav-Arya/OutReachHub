import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import { selectIsLoading } from './features/auth/slices/authSlice';
import { ToastContainer } from 'react-toastify';


import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { AdminRedirectRoute } from './components/AdminRedirectRoute';

import Navbar from './common/components/Navbar';
import Footer from './common/components/Footer';

import Dashboard from './features/user-portal/dashboard/pages/Dashboard';
import Contacts from './features/user-portal/contacts/pages/Contacts';
import Campaigns from './features/user-portal/campaigns/pages/Campaigns';
import MessageTemplates from './features/user-portal/message-templates/pages/MessageTemplates';
import Login from './features/auth/pages/Login';
import WorkspaceSelection from './features/auth/pages/WorkspaceSelection';

import AdminDashboard from './features/admin-portal/dashboard/pages/AdminDashboard';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/select-workspace';

  return (
    <div className="App">
      {!isAuthRoute && <Navbar />}
      {children}
      {!isAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  const isLoading = useAppSelector(selectIsLoading);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer/>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/select-workspace" 
            element={
              <ProtectedRoute requireAuth={false}>
                <WorkspaceSelection />
              </ProtectedRoute>
            } 
          />
          {/* Admin portal */}
            <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute requiredRole="admin">
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />

          {/* User Portal Routes*/}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute requiredRole="viewer" adminAllowed={false}>
                  <Dashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/contacts" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute requiredRole="viewer" adminAllowed={false}>
                  <Contacts />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/campaigns" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute requiredRole="viewer" adminAllowed={false}>
                  <Campaigns />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/message-templates" 
            element={
              <ProtectedRoute>
                <RoleBasedRoute requiredRole="viewer" adminAllowed={false}>
                  <MessageTemplates />
                </RoleBasedRoute>
              </ProtectedRoute>
            } 
          />
          
    
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <AdminRedirectRoute />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
