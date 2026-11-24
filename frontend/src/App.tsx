import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import SetPassword from './pages/SetPassword';
import Login from './pages/Login';
import AgencyDashboard from './pages/AgencyDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/agency/dashboard"
        element={
          <ProtectedRoute>
            <AgencyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-seeker/dashboard"
        element={
          <ProtectedRoute>
            <JobSeekerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}

export default App;


