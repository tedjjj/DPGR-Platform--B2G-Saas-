
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import LoginPage from './LoginPage/login-page.jsx';
import ForgotPassword from './LoginPage/forgot-password.jsx';
import ChercheurPage from './Chercheur/chercheur_dash.jsx';
import AssistantPage from './assistant/acceuil.jsx';
import SuperAdmin from './SuperAdmin/SAacceuil.jsx';
import AdminDash from './Admin DPGR/AdminDash.jsx';
import { getRole, isAuthenticated } from './auth';

// Function: defaultRouteForRole.
function defaultRouteForRole(role) {
  if (role === 'CHERCHEUR') return '/chercheur';
  if (role === 'ASSISTANT_DPGR') return '/assistant';
  if (role === 'SUPER_ADMIN') return '/super-admin';
  if (role === 'ADMIN_DPGR') return '/admin';
  return '/login';
}

// Function: ProtectedRoute.
function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={defaultRouteForRole(role)} replace />;
  }

  return children;
}

// Function: App.
function App() {
// Render the component JSX.
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/chercheur"
          element={
            <ProtectedRoute allowedRoles={['CHERCHEUR']}>
              <ChercheurPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute allowedRoles={['ASSISTANT_DPGR']}>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN_DPGR']}>
              <AdminDash />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
