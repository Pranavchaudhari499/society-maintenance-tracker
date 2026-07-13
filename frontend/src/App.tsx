import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResidentDashboard from "./pages/ResidentDashboard";
import RaiseComplaint from "./pages/RaiseComplaint";
import NoticeBoard from "./pages/NoticeBoard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminNotices from "./pages/AdminNotices";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/resident" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><ResidentDashboard /></ProtectedRoute>} />
          <Route path="/resident/raise" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><RaiseComplaint /></ProtectedRoute>} />
          <Route path="/resident/notices" element={<ProtectedRoute allowedRoles={["RESIDENT"]}><NoticeBoard /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminNotices /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminSettings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;