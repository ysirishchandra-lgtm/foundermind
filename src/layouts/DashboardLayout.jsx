import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BrainCircuit,
  CheckSquare,
  Calendar,
  FileText,
  Settings as SettingsIcon,
  Brain,
  LogOut,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.name || 'Founder';
  const displayCompany = user?.company || user?.email || '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { to: '/dashboard',            label: 'Overview',     icon: <LayoutDashboard size={20} />, end: true },
    { to: '/dashboard/chat',       label: 'AI Chat',      icon: <MessageSquare size={20} /> },
    { to: '/dashboard/memory',     label: 'Memory',       icon: <BrainCircuit size={20} /> },
    { to: '/dashboard/tasks',      label: 'Tasks',        icon: <CheckSquare size={20} /> },
    { to: '/dashboard/meetings',   label: 'Meetings',     icon: <Calendar size={20} /> },
    { to: '/dashboard/documents',  label: 'Documents',    icon: <FileText size={20} /> },
    { to: '/dashboard/analytics',  label: 'AI Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="dashboard-container">
      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Brain size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>FounderMind</span>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(v => !v)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop — tap to close sidebar on mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" onClick={() => { navigate('/'); closeSidebar(); }} style={{ cursor: 'pointer' }}>
          <Brain className="logo-icon" size={24} style={{ color: 'var(--accent-cyan)' }} />
          <span className="sidebar-logo-text">FounderMind</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-divider" />

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{displayCompany}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
