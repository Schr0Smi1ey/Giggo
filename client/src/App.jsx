import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { PageLoader } from './components/Loaders.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Eager (small, always-needed) pages.
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

// Lazy-loaded pages (code splitting).
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const FindTalent = lazy(() => import('./pages/FindTalent.jsx'));
const PublicProfile = lazy(() => import('./pages/PublicProfile.jsx'));
const FindJobs = lazy(() => import('./pages/FindJobs.jsx'));
const JobDetail = lazy(() => import('./pages/JobDetail.jsx'));
const SubmitProposal = lazy(() => import('./pages/SubmitProposal.jsx'));
const MyProposals = lazy(() => import('./pages/MyProposals.jsx'));
const ProposalsReceived = lazy(() => import('./pages/ProposalsReceived.jsx'));
const ProposalDetail = lazy(() => import('./pages/ProposalDetail.jsx'));
const OfferForm = lazy(() => import('./pages/OfferForm.jsx'));
const MyOffers = lazy(() => import('./pages/MyOffers.jsx'));
const OfferDetail = lazy(() => import('./pages/OfferDetail.jsx'));
const MyContracts = lazy(() => import('./pages/MyContracts.jsx'));
const ContractDetail = lazy(() => import('./pages/ContractDetail.jsx'));
const PostJob = lazy(() => import('./pages/PostJob.jsx'));
const MyJobs = lazy(() => import('./pages/MyJobs.jsx'));
const SavedJobs = lazy(() => import('./pages/SavedJobs.jsx'));
const CvAnalysis = lazy(() => import('./pages/CvAnalysis.jsx'));
const Verification = lazy(() => import('./pages/Verification.jsx'));
const VerificationQueue = lazy(() => import('./pages/admin/VerificationQueue.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'));
const Placeholder = lazy(() => import('./pages/Placeholder.jsx'));
const ClientProfile = lazy(() => import('./pages/ClientProfile.jsx'));

function ProfileDestination() {
  const { hasRole } = useAuth();
  const isClientOnly = hasRole('client') && !hasRole('freelancer');
  return isClientOnly ? <ClientProfile /> : <Profile />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/find-talent" element={<FindTalent />} />
            <Route path="/freelancers/:userId" element={<PublicProfile />} />
            <Route path="/find-jobs" element={<FindJobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/propose" element={<ProtectedRoute roles={['freelancer']}><SubmitProposal /></ProtectedRoute>} />
            <Route path="/services" element={<Placeholder title="Services" phase="Phase 10" />} />
            <Route path="/how-it-works" element={<Placeholder title="How It Works" />} />
            <Route path="/about" element={<Placeholder title="About" />} />
            <Route path="/pricing" element={<Placeholder title="Pricing" />} />
            <Route path="/contact" element={<Placeholder title="Contact" />} />
            <Route path="/help" element={<Placeholder title="Help Center" />} />
            <Route path="/terms" element={<Placeholder title="Terms of Service" />} />
            <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
          </Route>

          {/* Auth (no chrome) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Authenticated dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileDestination />} />
            <Route path="jobs" element={<ProtectedRoute roles={['client']}><MyJobs /></ProtectedRoute>} />
            <Route path="jobs/new" element={<ProtectedRoute roles={['client']}><PostJob /></ProtectedRoute>} />
            <Route path="jobs/:id/edit" element={<ProtectedRoute roles={['client']}><PostJob /></ProtectedRoute>} />
            <Route path="proposals" element={<ProtectedRoute roles={['freelancer']}><MyProposals /></ProtectedRoute>} />
            <Route path="proposals/received" element={<ProtectedRoute roles={['client']}><ProposalsReceived /></ProtectedRoute>} />
            <Route path="proposals/:proposalId/offer/new" element={<ProtectedRoute roles={['client']}><OfferForm /></ProtectedRoute>} />
            <Route path="proposals/:id/edit" element={<ProtectedRoute roles={['freelancer']}><SubmitProposal mode="edit" /></ProtectedRoute>} />
            <Route path="proposals/:id" element={<ProposalDetail />} />
            <Route path="offers" element={<ProtectedRoute roles={['client', 'freelancer']}><MyOffers /></ProtectedRoute>} />
            <Route path="offers/:id" element={<ProtectedRoute roles={['client', 'freelancer']}><OfferDetail /></ProtectedRoute>} />
            <Route path="offers/:id/edit" element={<ProtectedRoute roles={['client']}><OfferForm mode="edit" /></ProtectedRoute>} />
            <Route path="contracts" element={<ProtectedRoute roles={['client', 'freelancer']}><MyContracts /></ProtectedRoute>} />
            <Route path="contracts/:id" element={<ProtectedRoute roles={['client', 'freelancer']}><ContractDetail /></ProtectedRoute>} />
            <Route path="saved-jobs" element={<ProtectedRoute roles={['freelancer']}><SavedJobs /></ProtectedRoute>} />
            <Route path="cv-analysis" element={<ProtectedRoute roles={['freelancer']}><CvAnalysis /></ProtectedRoute>} />
            <Route path="verification" element={<ProtectedRoute roles={['freelancer']}><Verification /></ProtectedRoute>} />
            <Route
              path="admin/verification"
              element={
                <ProtectedRoute roles={['admin']}>
                  <VerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
