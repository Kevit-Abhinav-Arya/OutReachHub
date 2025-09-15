import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAppSelector } from './hooks/redux';
import { selectIsLoading } from './features/auth/slices/authSlice';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRedirectRoute } from './components/AdminRedirectRoute';

import Navbar from './common/components/Navbar';
import Footer from './common/components/Footer';


import Login from './features/auth/pages/Login';
import WorkspaceSelection from './features/auth/pages/WorkspaceSelection';

import './App.scss';

// Layout component to conditionally render navbar and footer
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
      <Layout>
        <Routes>
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
