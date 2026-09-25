import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Wrench, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    const routes = { customer: '/customer/dashboard', admin: '/admin/dashboard', technician: '/technician/dashboard' };
    return routes[profile.role] || '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Track Repair', path: '/track' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-blue-600' : 'bg-white/20 backdrop-blur'}`}>
              <Wrench className={`w-6 h-6 transition-colors ${scrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <div>
              <h1 className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Smart Hub
              </h1>
              <p className={`text-[10px] -mt-1 font-medium uppercase tracking-widest transition-colors ${scrolled ? 'text-blue-600' : 'text-blue-200'}`}>
                Repair
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? scrolled ? 'bg-blue-50 text-blue-600' : 'bg-white/20 text-white'
                    : scrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    scrolled ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-[slideDown_0.2s_ease-out]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                    </div>
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/customer/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    scrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/book-repair"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Book a Repair
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-xl">
            {isOpen ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl animate-[slideDown_0.3s_ease-out]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/book-repair" className="block mx-4 my-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold text-center">
                  Book a Repair
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
