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
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || 'Founder';
  const displayCompany = user?.company || user?.email || '';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Brain className="logo-icon" size={24} />
          <span className="sidebar-logo-text">FounderMind</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/dashboard/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>AI Chat</span>
          </NavLink>
          <NavLink to="/dashboard/memory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            <span>Memory</span>
          </NavLink>
          <NavLink to="/dashboard/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <span>Tasks</span>
          </NavLink>
          <NavLink to="/dashboard/meetings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Meetings</span>
          </NavLink>
          <NavLink to="/dashboard/documents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Documents</span>
          </NavLink>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>AI Analytics</span>
          </NavLink>
          
          <div className="nav-divider"></div>

          <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
