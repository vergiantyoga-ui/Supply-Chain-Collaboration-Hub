import { Routes, Route, Navigate } from "react-router-dom";
import LanguageSwitcher from "./components/ui/LanguageSwitcher.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RegisterSuccessPage from "./pages/RegisterSuccessPage.jsx";
import InternalReviewPage from "./pages/InternalReviewPage.jsx";
import SupplierHomePage from "./pages/SupplierHomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function HomeRedirect() {
  const { isAuthenticated, isInternalStaff } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isInternalStaff ? "/internal" : "/supplier/home"} replace />;
}

export default function App() {
  return (
    <>
      <LanguageSwitcher />
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
          path="/supplier/home"
          element={
            <ProtectedRoute role="supplier">
              <SupplierHomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
