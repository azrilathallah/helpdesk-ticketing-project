import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-100">
      <Sidebar />
      <main className="min-h-screen min-w-0 px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}