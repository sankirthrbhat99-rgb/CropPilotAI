import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FarmsPage from './pages/FarmsPage';
import FarmDetailPage from './pages/FarmDetailPage';
import FieldDetailPage from './pages/FieldDetailPage';
import CropsPage from './pages/CropsPage';
import CropDetailPage from './pages/CropDetailPage';
import AdvisorPage from './pages/AdvisorPage';
import AdvisoriesPage from './pages/AdvisoriesPage';
import AdvisoryDetailPage from './pages/AdvisoryDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard & Operations */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Farm Routes */}
        <Route
          path="/farms"
          element={
            <ProtectedRoute>
              <FarmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms/:id"
          element={
            <ProtectedRoute>
              <FarmDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Field Routes */}
        <Route
          path="/fields/:id"
          element={
            <ProtectedRoute>
              <FieldDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Crop Routes */}
        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <CropsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops/:id"
          element={
            <ProtectedRoute>
              <CropDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Protected AI Advisor Routes */}
        <Route
          path="/advisor"
          element={
            <ProtectedRoute>
              <AdvisorPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Advisories History Routes */}
        <Route
          path="/advisories"
          element={
            <ProtectedRoute>
              <AdvisoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advisories/:id"
          element={
            <ProtectedRoute>
              <AdvisoryDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
