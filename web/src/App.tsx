import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { RequireAuth } from '@/components/RouteGuards';
import LandingPage from '@/pages/Landing';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import WorkersPage from '@/pages/Workers';
import WorkerDetailPage from '@/pages/WorkerDetail';
import JobsPage from '@/pages/Jobs';
import JobDetailPage from '@/pages/JobDetail';
import PostJobPage from '@/pages/PostJob';
import DashboardPage from '@/pages/Dashboard';
import NotFoundPage from '@/pages/NotFound';

const App = (): JSX.Element => {
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:id" element={<WorkerDetailPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route
            path="/jobs/new"
            element={
              <RequireAuth roles={['EMPLOYER']}>
                <PostJobPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
