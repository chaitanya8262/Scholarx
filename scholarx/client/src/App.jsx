// ========================================
// Root App - routing + providers
// ========================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SubmitPaper from './pages/SubmitPaper';
import MyPapers from './pages/MyPapers';
import PaperDetail from './pages/PaperDetail';
import ReviewPanel from './pages/ReviewPanel';
import EditorPanel from './pages/EditorPanel';
import SearchPapers from './pages/SearchPapers';
import Profile from './pages/Profile';
import Layout from './components/Layout';

// Protected route wrapper - redirects unauthenticated users to login
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // Role check (optional)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:!bg-gray-800 dark:!text-gray-100',
              duration: 3000
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes wrapped in Layout */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchPapers />} />
              <Route path="/paper/:id" element={<PaperDetail />} />

              {/* Researcher-only */}
              <Route path="/submit" element={
                <ProtectedRoute roles={['researcher']}>
                  <SubmitPaper />
                </ProtectedRoute>
              } />
              <Route path="/my-papers" element={
                <ProtectedRoute roles={['researcher']}>
                  <MyPapers />
                </ProtectedRoute>
              } />

              {/* Reviewer-only */}
              <Route path="/reviews" element={
                <ProtectedRoute roles={['reviewer']}>
                  <ReviewPanel />
                </ProtectedRoute>
              } />

              {/* Editor-only */}
              <Route path="/editor" element={
                <ProtectedRoute roles={['editor']}>
                  <EditorPanel />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
