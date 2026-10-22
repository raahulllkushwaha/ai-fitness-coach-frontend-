import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Bot, ChevronRight, Dumbbell, LayoutDashboard, Menu, Plug, UserRound, X, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '../features/auth/authStore.js';

const navItems = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Workouts', to: '/workouts', icon: Dumbbell },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'AI Coach', to: '/coach', icon: Bot, special: true },
];
const accountItems = [
  { label: 'Integrations', to: '/integrations', icon: Plug },
  { label: 'Fitness profile', to: '/profile', icon: UserRound },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = [...navItems, ...accountItems].find((item) => item.to === location.pathname)?.label || 'Overview';
  const displayName = user?.firstName || user?.username || user?.email?.split('@')[0] || 'Athlete';
  const initials = displayName.split(/[ ._-]/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'A';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const NavGroup = ({ items, title }) => (
    <div className="nav-group">
      <p className="nav-caption">{title}</p>
      {items.map(({ label, to, icon: Icon, special }) => (
        <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${special ? 'nav-link-special' : ''}`}>
          <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{special && <span className="nav-new-dot" />}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row"><div className="brand-mark"><Activity size={22} strokeWidth={2.5} /></div><div className="brand-copy"><strong>form<span>+</span></strong><small>AI FITNESS COACH</small></div><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
        <div className="sidebar-status"><span className="status-dot" /> PERSONAL TRAINING SPACE</div>
        <NavGroup title="WORKSPACE" items={navItems} />
        <NavGroup title="YOUR SPACE" items={accountItems} />
        <div className="sidebar-bottom">
          <div className="sidebar-coach-card"><div className="coach-card-icon"><Sparkles size={17} /></div><strong>Your next level starts here.</strong><p>Small steps. Consistent progress.</p><button onClick={() => navigate('/coach')}>Open AI Coach <ChevronRight size={14} /></button></div>
          <div className="sidebar-user"><div className="avatar">{initials}</div><div className="sidebar-user-copy"><strong>{displayName}</strong><small>{user?.role || 'ATHLETE'}</small></div><button className="icon-button logout-button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{pageName}</strong></div></div><div className="topbar-right"><span className="api-status"><span className="status-dot" /> PRIVATE WORKSPACE</span><div className="topbar-date">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</div><div className="avatar avatar-small">{initials}</div></div></header>
        <div className="page-content"><Outlet /></div>
        <footer className="app-footer"><span>FORM+ / AI FITNESS COACH</span><span>Built for consistency, not perfection.</span></footer>
      </main>
    </div>
  );
}
