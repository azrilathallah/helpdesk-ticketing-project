import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-100">
      <Sidebar />
      <main className="min-h-screen min-w-0 px-4 pt-20 pb-4 sm:px-6 lg:ml-64 lg:px-6 lg:py-6">
        <Outlet />
      </main>
    </div>
  );
}