import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import { PrivacyPage, TermsPage } from './pages/public/LegalPages';

// Authenticated Application Pages
import OverviewPage from './pages/app/OverviewPage';
import InteractiveMapPage from './pages/app/InteractiveMapPage';
import CityDeepDivePage from './pages/app/CityDeepDivePage';
import StateComparisonPage from './pages/app/StateComparisonPage';
import TrendsAnalysisPage from './pages/app/TrendsAnalysisPage';
import HealthRiskImpactPage from './pages/app/HealthRiskImpactPage';
import PredictiveInsightsPage from './pages/app/PredictiveInsightsPage';
import PolicySimulatorPage from './pages/app/PolicySimulatorPage';
import AiRiskPredictorPage from './pages/app/AiRiskPredictorPage';
import ModelPerformancePage from './pages/app/ModelPerformancePage';
import ExplainabilityPage from './pages/app/ExplainabilityPage';
import EarlyWarningGridPage from './pages/app/EarlyWarningGridPage';
import LiveEarlyWarningCommandPage from './pages/app/LiveEarlyWarningCommandPage';
import DataQualityAuditPage from './pages/app/DataQualityAuditPage';
import NcapPolicyTrackerPage from './pages/app/NcapPolicyTrackerPage';
import ExecutiveBriefingPage from './pages/app/ExecutiveBriefingPage';
import UserProfilePage from './pages/app/UserProfilePage';
import SettingsPage from './pages/app/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FilterProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Redirect legacy aliases and direct URLs */}
            <Route path="/dashboard" element={<Navigate to="/app/overview" replace />} />
            <Route path="/overview" element={<Navigate to="/app/overview" replace />} />
            <Route path="/map" element={<Navigate to="/app/map" replace />} />
            <Route path="/gis-map" element={<Navigate to="/app/map" replace />} />
            <Route path="/predictor" element={<Navigate to="/app/ai-predictor" replace />} />
            <Route path="/early-warning" element={<Navigate to="/app/live-early-warning" replace />} />
            <Route path="/live-early-warning" element={<Navigate to="/app/live-early-warning" replace />} />
            <Route path="/alerts" element={<Navigate to="/app/live-early-warning" replace />} />
            <Route path="/live-alerts" element={<Navigate to="/app/live-early-warning" replace />} />
            <Route path="/warning" element={<Navigate to="/app/live-early-warning" replace />} />

            {/* Authenticated Dashboard Shell */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="map" element={<InteractiveMapPage />} />
              <Route path="city-deepdive" element={<CityDeepDivePage />} />
              <Route path="state-comparison" element={<StateComparisonPage />} />
              <Route path="trends" element={<TrendsAnalysisPage />} />
              <Route path="health-impact" element={<HealthRiskImpactPage />} />
              <Route path="predictive-insights" element={<PredictiveInsightsPage />} />
              <Route path="policy-simulator" element={<PolicySimulatorPage />} />
              <Route path="ai-predictor" element={<AiRiskPredictorPage />} />
              <Route path="model-performance" element={<ModelPerformancePage />} />
              <Route path="explainability" element={<ExplainabilityPage />} />
              <Route path="early-warning" element={<EarlyWarningGridPage />} />
              <Route path="live-early-warning" element={<LiveEarlyWarningCommandPage />} />
              <Route path="data-quality" element={<DataQualityAuditPage />} />
              <Route path="ncap-tracker" element={<NcapPolicyTrackerPage />} />
              <Route path="executive-briefing" element={<ExecutiveBriefingPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FilterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
