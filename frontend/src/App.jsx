import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RegisterSuccessPage from "./pages/RegisterSuccessPage.jsx";
import InternalReviewPage from "./pages/InternalReviewPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import SupplierLayout from "./components/supplier/SupplierLayout.jsx";
import ProfilePage from "./pages/supplier/ProfilePage.jsx";
import RfxPage from "./pages/supplier/RfxPage.jsx";
import QuotationsPage from "./pages/supplier/QuotationsPage.jsx";

function HomeRedirect() {
  const { isAuthenticated, isInternalStaff } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isInternalStaff ? "/internal" : "/supplier/profile"} replace />;
}

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />

        <Route
          path="/internal"
          element={
            <ProtectedRoute role="internal_staff">
              <InternalReviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier"
          element={
            <ProtectedRoute role="supplier">
              <SupplierLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="rfx" element={<RfxPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}
