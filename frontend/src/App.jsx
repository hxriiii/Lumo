import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SubjectSelection } from './pages/SubjectSelection';
import { SubjectDetail } from './pages/SubjectDetail';
import { ExamPage } from './pages/ExamPage';
import { ResultPage } from './pages/ResultPage';
import { MentorDashboard } from './pages/MentorDashboard';
import { AdminRAG } from './pages/AdminRAG';
import { Shield } from 'lucide-react';

// --- Student Route Guard (Only Students can access student learning pages) ---
const StudentRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin -> Redirect to /admin portal
  if (user.is_staff || profile?.is_admin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Mentor -> Redirect to /mentor portal
  if (profile?.is_mentor) {
    return <Navigate to="/mentor" replace />;
  }

  return children;
};

// --- Admin Route Guard (ONLY Admins can access RAG Admin Portal) ---
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating...
      </div>
    );
  }
  // Random unauthenticated person -> Redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Non-Admin -> Redirect to appropriate portal
  if (!user.is_staff && !profile?.is_admin) {
    if (profile?.is_mentor) {
      return <Navigate to="/mentor" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// --- Mentor Route Guard (ONLY Mentors and Admins can access Mentor Referral Portal) ---
const MentorRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!profile?.is_mentor && !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// --- Role Based Root Redirect ---
const RoleBasedRedirect = () => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.is_staff || profile?.is_admin) {
    return <Navigate to="/admin" replace />;
  }
  if (profile?.is_mentor) {
    return <Navigate to="/mentor" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Specific Routes */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <Dashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/subjects/select"
            element={
              <StudentRoute>
                <SubjectSelection />
              </StudentRoute>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <StudentRoute>
                <SubjectDetail />
              </StudentRoute>
            }
          />
          <Route
            path="/exam"
            element={
              <StudentRoute>
                <ExamPage />
              </StudentRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <StudentRoute>
                <ResultPage />
              </StudentRoute>
            }
          />

          {/* Mentor Specific Route */}
          <Route
            path="/mentor"
            element={
              <MentorRoute>
                <MentorDashboard />
              </MentorRoute>
            }
          />

          {/* Admin Specific Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminRAG />
              </AdminRoute>
            }
          />

          {/* Root & Catch-all Redirects based on User Role */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
