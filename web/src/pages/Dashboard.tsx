import { useAuth } from '@/context/AuthContext';
import { WorkerDashboard } from './WorkerDashboard';
import { EmployerDashboard } from './EmployerDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardPage = (): JSX.Element => {
  const { user } = useAuth();
  if (!user) return <div className="px-5 py-10">Loading…</div>;
  if (user.role === 'WORKER') return <WorkerDashboard />;
  if (user.role === 'EMPLOYER') return <EmployerDashboard />;
  return <AdminDashboard />;
};

export default DashboardPage;
