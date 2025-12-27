import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Online from './pages/Online';
import Offline from './pages/Offline';
import Login from './pages/Login';
import Register from './pages/Register';
import TreeHollow from './pages/TreeHollow';
import Healing from './pages/Healing';
import ModuleOne from './pages/ModuleOne';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/online" 
              element={
                <ProtectedRoute>
                  <Online />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/memorial" 
              element={
                <ProtectedRoute>
                  <ModuleOne />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/offline" 
              element={
                <ProtectedRoute>
                  <Offline />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/tree-hollow" 
              element={
                <ProtectedRoute>
                  <TreeHollow />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/healing" 
              element={
                <ProtectedRoute>
                  <Healing />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<div className="p-8 text-center text-slate-500">关于页面建设中...</div>} />
          </Routes>
        </Layout>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
