import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import CompetencyPortal from './pages/CompetencyPortal';
import ModuleViewer from './pages/ModuleViewer'; // <--- NEW IMPORT

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-reso-pale text-reso-royal font-semibold animate-pulse">Initializing Secure Connection...</div>;
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/portal" element={
            <ProtectedRoute>
              <CompetencyPortal />
            </ProtectedRoute>
          } />

          {/* NEW ROUTE FOR VIEWING MODULES */}
          <Route path="/module/:moduleId" element={
            <ProtectedRoute>
              <ModuleViewer />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;