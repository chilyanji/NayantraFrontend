import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  Bell,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
  Users,
  Video,
  X,
  Radio,
} from "lucide-react";
import { AuthProvider, LiveProvider, useAuth, useLive } from "./state";
import { userName } from "./lib/domain";
import { Avatar, Badge, Button, Empty, Loading } from "./components/ui";
import { AuthPage } from "./pages/Auth";
import { Cameras, Overview } from "./pages/Overview";
import { Entries, Subjects } from "./pages/Entries";
import { MyProfile, UsersPage } from "./pages/Users";
import { ActivityPage } from "./pages/Activity";
import { Settings } from "./pages/Settings";
function Protected() {
  const { session, ready } = useAuth();
  if (!ready) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  if (!["admin", "member"].includes(session.user.role))
    return <UnsupportedRole />;
  return (
    <LiveProvider>
      <Layout />
    </LiveProvider>
  );
}
function UnsupportedRole() {
  const { logout, session } = useAuth();
  return (
    <div className="access-denied">
      <Empty
        title="This role is not supported by the supplied frontend contract"
        detail={`Your account role is ${session?.user.role}. Ask your administrator to verify access.`}
      />
      <Button onClick={logout}>Sign out</Button>
    </div>
  );
}
function AdminOnly() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/overview" replace />;
}
function PublicOnly() {
  const { session, ready } = useAuth();
  if (!ready) return <Loading />;
  return session ? <Navigate to="/overview" replace /> : <Outlet />;
}
function Layout() {
  const { session, isAdmin, logout } = useAuth();
  const { health, socketState, events } = useLive();
  const [open, setOpen] = useState(false),
    [time, setTime] = useState(new Date());
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const nav = [
    { label: "Overview", path: "/overview", icon: LayoutDashboard },
    { label: "Camera console", path: "/cameras", icon: Video },
    ...(isAdmin
      ? [
          { label: "Entry log", path: "/entries", icon: BookOpen },
          { label: "People directory", path: "/subjects", icon: UserRound },
        ]
      : []),
    { label: "Activity", path: "/activity", icon: Activity },
  ];
  const admin = [
    ...(isAdmin
      ? [{ label: "Accounts & access", path: "/users", icon: Users }]
      : []),
    { label: "My profile", path: "/profile", icon: UserRound },
    { label: "Settings", path: "/settings", icon: SettingsIcon },
  ];
  const title =
    [...nav, ...admin].find((n) => location.pathname === n.path)?.label ||
    "Workspace";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/overview" className="brand">
          <span className="brand-mark">
            <ShieldCheck size={25} />
          </span>
          <div>
            <b>SENTINEL</b>
            <small>SURVEILLANCE CONSOLE</small>
          </div>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="workspace-card">
          <span className="workspace-avatar">S</span>
          <span>
            <strong>Sentinel workspace</strong>
            <small>{isAdmin ? "Administrator access" : "Member access"}</small>
          </span>
          <ChevronRight size={15} />
        </div>
        <nav aria-label="Main navigation">
          <span className="nav-section">MONITORING</span>
          {nav.map((n) => (
            <NavLink key={n.path} to={n.path} aria-label={n.label}>
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.path === "/activity" && events.length > 0 && (
                <span className="nav-count">{events.length}</span>
              )}
            </NavLink>
          ))}
          <span className="nav-section">WORKSPACE</span>
          {admin.map((n) => (
            <NavLink key={n.path} to={n.path} aria-label={n.label}>
              <n.icon size={19} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span
              className={`status-light ${health.data?.status === "running" ? "online" : ""}`}
            />
            <div>
              <strong>
                {health.error
                  ? "Service unavailable"
                  : health.data?.status === "running"
                    ? "AI service online"
                    : "AI service stopped"}
              </strong>
              <small>{socketState}</small>
            </div>
          </div>
          <div className="sidebar-user">
            <Avatar name={userName(session!.user)} />
            <div>
              <strong>{userName(session!.user)}</strong>
              <small>{isAdmin ? "Administrator" : "Member"}</small>
            </div>
            <button aria-label="Sign out" title="Sign out" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <time>
              {time.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <span>{time.toLocaleTimeString()} local</span>
            </time>
            <span className="topbar-divider" />
            <Link
              className="notification-button"
              to="/activity"
              aria-label="View notifications"
            >
              <Bell size={19} />
              {events.some((e) => e.type === "alert") && <i />}
            </Link>
            <Link
              className="profile-link"
              to="/profile"
              aria-label="Your profile"
            >
              <Avatar name={userName(session!.user)} />
            </Link>
          </div>
        </header>
        <main id="main" className="page-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>Sentinel · Connected awareness</span>
          <span>
            <Radio size={12} />
            {socketState}
          </span>
        </footer>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage register />} />
          </Route>
          <Route element={<Protected />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route element={<AdminOnly />}>
              <Route path="/entries" element={<Entries />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
