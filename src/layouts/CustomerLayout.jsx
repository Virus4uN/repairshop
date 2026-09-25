import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench, Plus, MessageSquare, User, LogOut, Menu, X, Bell, Receipt } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
  { icon: Wrench, label: 'My Repairs', path: '/customer/my-repairs' },
  { icon: Receipt, label: 'Invoices & Pay', path: '/customer/invoices' },
  { icon: Plus, label: 'Book Repair', path: '/customer/book-repair' },
  { icon: MessageSquare, label: 'Feedback', path: '/customer/feedback' },
  { icon: User, label: 'Profile', path: '/customer/profile' },
];

export default function CustomerLayout() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600"><Wrench className="w-5 h-5 text-white" /></div>
              <div>
                <h2 className="font-bold text-sm text-gray-900">Smart Hub</h2>
                <p className="text-[10px] text-blue-600 uppercase tracking-wider -mt-0.5">Repair</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <item.icon className="w-5 h-5" />{item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{profile?.full_name?.[0] || 'C'}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p><p className="text-xs text-gray-500">Customer</p></div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100"><Menu className="w-5 h-5 text-gray-600" /></button>
          <div className="hidden lg:block"><h2 className="font-semibold text-gray-900">Customer Portal</h2></div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-gray-100 relative"><Bell className="w-5 h-5 text-gray-500" /></button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
