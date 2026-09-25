import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Wrench, UserCog, Settings as SettingsIcon, Package, FileText, MessageSquare, BarChart3, Bell, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Wrench, label: 'Repairs', path: '/admin/repairs' },
  { icon: UserCog, label: 'Technicians', path: '/admin/technicians' },
  { icon: SettingsIcon, label: 'Services', path: '/admin/services' },
  { icon: Package, label: 'Spare Parts', path: '/admin/spare-parts' },
  { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
  { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-600"><Wrench className="w-5 h-5 text-white" /></div>
              <div>
                <h2 className="text-white font-bold text-sm">Smart Hub</h2>
                <p className="text-[10px] text-blue-400 uppercase tracking-wider -mt-0.5">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden lg:block">
            <h2 className="font-semibold text-gray-900">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
