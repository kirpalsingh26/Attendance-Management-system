import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Menu,
  X,
  User
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl shadow-xl border-b-2 border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight tracking-tight">
                Attendance Pro
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold -mt-1 tracking-wider">
                Track • Manage • Analyze
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink to="/dashboard" icon={<Home className="w-5 h-5" />} currentPath={location.pathname}>
              Dashboard
            </NavLink>
            <NavLink to="/timetable" icon={<Calendar className="w-5 h-5" />} currentPath={location.pathname}>
              Timetable
            </NavLink>
            <NavLink to="/attendance" icon={<CheckSquare className="w-5 h-5" />} currentPath={location.pathname}>
              Attendance
            </NavLink>
            <NavLink to="/analytics" icon={<BarChart3 className="w-5 h-5" />} currentPath={location.pathname}>
              Analytics
            </NavLink>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Profile - Clickable, links to Settings */}
            <Link to="/settings" className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-300 group/profile">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur-md opacity-0 group-hover/profile:opacity-60 transition-opacity"></div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full ring-2 ring-blue-500/50 dark:ring-blue-400/50 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center group-hover/profile:ring-4 group-hover/profile:ring-blue-400/50 transition-all duration-300 shadow-lg group-hover/profile:scale-110">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md"></div>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight group-hover/profile:text-blue-600 dark:group-hover/profile:text-blue-400 transition-colors tracking-tight">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group shadow-md hover:shadow-lg"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700 dark:text-slate-200 transition-transform group-hover:rotate-90" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200 transition-transform group-hover:scale-110" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t-2 border-slate-200/50 dark:border-slate-700/50 animate-slide-in backdrop-blur-xl">
            <div className="flex flex-col space-y-1">
              <MobileNavLink to="/dashboard" icon={<Home className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} currentPath={location.pathname}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink to="/timetable" icon={<Calendar className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} currentPath={location.pathname}>
                Timetable
              </MobileNavLink>
              <MobileNavLink to="/attendance" icon={<CheckSquare className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} currentPath={location.pathname}>
                Attendance
              </MobileNavLink>
              <MobileNavLink to="/analytics" icon={<BarChart3 className="w-5 h-5" />} onClick={() => setMobileMenuOpen(false)} currentPath={location.pathname}>
                Analytics
              </MobileNavLink>
              <div className="pt-4 mt-4 border-t-2 border-slate-200/50 dark:border-slate-700/50">
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-4 mb-2 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full ring-2 ring-blue-500/50 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      {user?.username}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {user?.email}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, children, currentPath }) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={`relative flex items-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/40'
          : 'text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/30 hover:shadow-md'
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-md opacity-40"></div>
      )}
      <span className={`relative transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="relative font-black text-sm tracking-tight">{children}</span>
      {isActive && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white/50 rounded-full shadow-lg"></div>
      )}
    </Link>
  );
};

const MobileNavLink = ({ to, icon, children, onClick, currentPath }) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
          : 'text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/30 hover:shadow-md'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
      )}
      <span className={isActive ? 'scale-110' : 'transition-transform hover:scale-110'}>
        {icon}
      </span>
      <span className="font-black tracking-tight">{children}</span>
    </Link>
  );
};

export default Navbar;
