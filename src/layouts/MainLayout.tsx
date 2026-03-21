import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="min-h-[calc(100vh-144px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
