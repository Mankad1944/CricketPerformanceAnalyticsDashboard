import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import YearSelector from "../components/YearSelector";
import {
  LogOut, Users, Activity, LayoutDashboard, UserSquare2,
  Settings, FileBarChart, Search, Database,
  Plus, Shield, RefreshCcw, UserPlus, Power, AlertTriangle, UserCheck, Wand2, Key, UserCircle,
  Menu, X
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line, ComposedChart
} from "recharts";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import AdminChatbot from "../components/AdminChatbot";

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

// === IPL TEAM COLOR THEMES (Premium Deep Navy Optimized) ===
const TEAM_COLORS = {
  "Chennai Super Kings": { bg: "bg-amber-500/10", text: "text-amber-500", badge: "bg-amber-500/10 text-amber-500", primary: "#FDB913" },
  "Mumbai Indians": { bg: "bg-blue-500/10", text: "text-blue-500", badge: "bg-blue-500/10 text-blue-500", primary: "#004BA0" },
  "Gujarat Titans": { bg: "bg-slate-500/10", text: "text-slate-400", badge: "bg-slate-500/10 text-slate-400", primary: "#1B2133" },
  "Lucknow Super Giants": { bg: "bg-cyan-500/10", text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400", primary: "#0057E7" },
  "Sunrisers Hyderabad": { bg: "bg-orange-500/10", text: "text-orange-500", badge: "bg-orange-500/10 text-orange-500", primary: "#FF822A" },
  "Royal Challengers Bengaluru": { bg: "bg-red-500/10", text: "text-red-500", badge: "bg-red-500/10 text-red-500", primary: "#2B2A29" },
  "Kolkata Knight Riders": { bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-400", primary: "#3A225D" },
  "Delhi Capitals": { bg: "bg-blue-600/10", text: "text-blue-400", badge: "bg-blue-600/10 text-blue-400", primary: "#00008B" },
  "Punjab Kings": { bg: "bg-red-500/10", text: "text-red-400", badge: "bg-red-500/10 text-red-400", primary: "#D71920" },
  "Kings XI Punjab": { bg: "bg-red-500/10", text: "text-red-400", badge: "bg-red-500/10 text-red-400", primary: "#D71920" },
  "Rajasthan Royals": { bg: "bg-pink-500/10", text: "text-pink-400", badge: "bg-pink-500/10 text-pink-400", primary: "#EA1A85" },
  "Deccan Chargers": { bg: "bg-blue-400/10", text: "text-blue-400", badge: "bg-blue-400/10 text-blue-400", primary: "#004BA0" },
  "Kochi Tuskers Kerala": { bg: "bg-orange-600/10", text: "text-orange-500", badge: "bg-orange-600/10 text-orange-500", primary: "#E9110B" },
  "Pune Warriors": { bg: "bg-slate-500/10", text: "text-slate-400", badge: "bg-slate-500/10 text-slate-400", primary: "#2F2E2E" },
};

const THEME = {
  primary: "#3b82f6",
  secondary: "#1e293b",
  bg: "bg-blue-500",
  text: "text-blue-500",
  nav: "bg-white/10 text-white",
  btn: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20",
  btnSecondary: "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
};

/* =====================================
   MAIN ADMIN DASHBOARD
===================================== */
const AdminDashboard = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("System Stats");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [stats, setStats] = useState({
    total_users: 0, total_players: 0, total_matches: 0, total_deliveries: 0
  });
  const [adminData, setAdminData] = useState({
    system_stats: { role_distribution: [], active_users: [] },
    data_usage: { uploads_per_month: [], total_points: 0 },
    global_performance: { top_batters: [], top_bowlers: [] },
    report_stats: { downloads: [], total_reports: 0 }
  });
  const [usersList, setUsersList] = useState([]);
  const [coachesList, setCoachesList] = useState([]);
  const [analystsList, setAnalystsList] = useState([]);
  const [playersList, setPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [teamSeedLoading, setTeamSeedLoading] = useState(false);
  const [activeSyncType, setActiveSyncType] = useState(null); // 'style', 'role', or null
  const [syncProgress, setSyncProgress] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* =====================================
      FETCH SYSTEM DATA
    ===================================== */
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, usersRes, coachesRes, analystsRes, playersRes, analyticsRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/dashboard/?year=${selectedYear}`, { headers }),
          axios.get("http://127.0.0.1:8000/api/users/", { headers }),
          axios.get("http://127.0.0.1:8000/api/coaches/", { headers }),
          axios.get("http://127.0.0.1:8000/api/analysts/", { headers }),
          axios.get("http://127.0.0.1:8000/api/players/list/", { headers }),
          axios.get(`http://127.0.0.1:8000/api/admin/analytics-all/?year=${selectedYear}`, { headers })
        ]);

        setStats(statsRes.data);
        setAdminData(analyticsRes.data);

        const userData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.results || []);
        setUsersList(userData);

        const coachData = Array.isArray(coachesRes.data) ? coachesRes.data : (coachesRes.data.results || []);
        setCoachesList(coachData);

        const analystData = Array.isArray(analystsRes.data) ? analystsRes.data : (analystsRes.data.results || []);
        setAnalystsList(analystData);

        const playerData = Array.isArray(playersRes.data) ? playersRes.data : (playersRes.data.results || []);
        setPlayersList(playerData);

      } catch (err) {
        console.error("Admin Fetch Error:", err);
        if (err.response?.status === 401) {
          logout();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [token, logout, navigate, selectedYear]);

  /* =====================================
     DATA SEEDING HANDLER
  ===================================== */
  const handleDataSeed = async () => {
    if (!window.confirm("Are you sure? This will reload match data from YAML files.")) return;
    setSeedLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post("http://127.0.0.1:8000/api/admin/seed-yaml/?target=matches", {}, { headers });
      alert("Match Data Seeded Successfully!");
    } catch (err) {
      alert("Seeding Failed: " + err.message);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleTeamSeed = async () => {
    if (!window.confirm("Sync Team List? This will only update the Team table.")) return;
    setTeamSeedLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post("http://127.0.0.1:8000/api/admin/seed-yaml/?target=teams", {}, { headers });
      alert("Team List Synced Successfully!");
    } catch (err) {
      alert("Team Sync Failed: " + err.message);
    } finally {
      setTeamSeedLoading(false);
    }
  };

  const handleSyncAllStyles = async (syncType = 'style') => {
    const isRole = syncType === 'role';
    const initialMsg = isRole
      ? "This will scan Wikipedia to fill in missing ROLES for all players. Are you sure?"
      : "This will scan Wikipedia to fill in missing batting and bowling styles for all players. Are you sure?";

    if (!window.confirm(initialMsg)) return;

    setActiveSyncType(syncType);
    setSyncProgress(`Scanning ${syncType}s...`);

    const headers = { Authorization: `Bearer ${token}` };

    const syncBatch = async () => {
      try {
        const forceMsg = isRole
          ? "Do you want to FORCE RE-SYNC all player roles? (Click Cancel for only missing entries)"
          : "Do you want to FORCE RE-SYNC all batting/bowling styles? (Click Cancel for only missing styles)";

        const force = window.confirm(forceMsg);
        const res = await axios.post(`http://127.0.0.1:8000/api/players/sync-all-styles/?force=${force}&type=${syncType}`, {}, { headers });

        if (res.data.remaining > 0) {
          setSyncProgress(`Synced ${res.data.synced} players. ${res.data.remaining} remaining...`);
          const rosterRes = await axios.get("http://127.0.0.1:8000/api/players/list/", { headers });
          setPlayersList(rosterRes.data || []);
          setTimeout(syncBatch, 1000);
        } else {
          setSyncProgress(null);
          setActiveSyncType(null);
          alert(`✅ All player ${syncType}s have been synced!`);
          const rosterRes = await axios.get("http://127.0.0.1:8000/api/players/list/", { headers });
          setPlayersList(rosterRes.data || []);
        }
      } catch (err) {
        setSyncProgress(null);
        setActiveSyncType(null);
        alert(`Error syncing ${syncType}s batch.`);
      }
    };

    syncBatch();
  };

  const handleBotAction = (action, payload) => {
    switch (action) {
      case 'NAVIGATE':
        if (payload?.tab) setActiveTab(payload.tab);
        break;
      case 'SYNC_STYLES':
        handleSyncAllStyles();
        break;
      case 'SEED_MATCHES':
        handleDataSeed();
        break;
      case 'SYNC_TEAMS':
        handleTeamSeed();
        break;
      default:
        console.log("Bot action received:", action, payload);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#020617] text-slate-400 font-sans uppercase">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0f172a] sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Shield className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">ADMIN<span className="text-blue-500">CORE</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-blue-500 p-2.5 hover:bg-white/5 rounded-2xl transition-all border border-white/5 shadow-xl">
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#0f172a] z-[70] lg:hidden transform transition-all duration-500 ease-out border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Shield className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">ADMIN<span className="text-blue-500">CORE</span></h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 p-2.5 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5">
            <X size={20} />
          </button>
        </div>
        <nav className="p-6 space-y-2 overflow-y-auto h-[calc(100%-240px)] custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="System Stats" active={activeTab === "System Stats"} onClick={() => { setActiveTab("System Stats"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Activity size={20} />} label="Data Usage" active={activeTab === "Data Usage"} onClick={() => { setActiveTab("Data Usage"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileBarChart size={20} />} label="Performance" active={activeTab === "Global Performance"} onClick={() => { setActiveTab("Global Performance"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileBarChart size={20} />} label="Reports" active={activeTab === "Reports"} onClick={() => { setActiveTab("Reports"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Users" active={activeTab === "User Management"} onClick={() => { setActiveTab("User Management"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<UserSquare2 size={20} />} label="Coaches" active={activeTab === "Coach Management"} onClick={() => { setActiveTab("Coach Management"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Activity size={20} />} label="Analysts" active={activeTab === "Analyst Management"} onClick={() => { setActiveTab("Analyst Management"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<UserCheck size={20} />} label="Players" active={activeTab === "Player Management"} onClick={() => { setActiveTab("Player Management"); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Database size={20} />} label="Controls" active={activeTab === "Data Control"} onClick={() => { setActiveTab("Data Control"); setIsMobileMenuOpen(false); }} />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/5 bg-[#020617]/50 backdrop-blur-xl">
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-xl transition-all active:scale-95 group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Termination Session
          </button>
        </div>
      </div>

      {/* SIDEBAR (Desktop) */}
      <aside className="w-80 bg-[#0f172a] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen z-50 shadow-2xl">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">ADMIN<span className="text-blue-600">CORE</span></h1>
        </div>

        <nav className="flex-1 px-8 space-y-2 overflow-y-auto py-4 custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20} />} label="System Stats" active={activeTab === "System Stats"} onClick={() => setActiveTab("System Stats")} />
          <NavItem icon={<Activity size={20} />} label="Data Usage" active={activeTab === "Data Usage"} onClick={() => setActiveTab("Data Usage")} />
          <NavItem icon={<FileBarChart size={20} />} label="Global Performance" active={activeTab === "Global Performance"} onClick={() => setActiveTab("Global Performance")} />
          <NavItem icon={<FileBarChart size={20} />} label="Reports & Exports" active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")} />
          <NavItem icon={<Users size={20} />} label="User Management" active={activeTab === "User Management"} onClick={() => setActiveTab("User Management")} />
          <NavItem icon={<UserSquare2 size={20} />} label="Coach Management" active={activeTab === "Coach Management"} onClick={() => setActiveTab("Coach Management")} />
          <NavItem icon={<Activity size={20} />} label="Analyst Management" active={activeTab === "Analyst Management"} onClick={() => setActiveTab("Analyst Management")} />
          <NavItem icon={<UserCheck size={20} />} label="Player Management" active={activeTab === "Player Management"} onClick={() => setActiveTab("Player Management")} />
          <NavItem icon={<Database size={20} />} label="Data Control" active={activeTab === "Data Control"} onClick={() => setActiveTab("Data Control")} />
        </nav>

        <div className="m-8 p-6 bg-[#0b1120] border border-white/5 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black border border-white/10 shadow-lg text-lg italic">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="truncate">
              <p className="text-sm font-black text-white truncate uppercase italic tracking-tighter">{user?.username}</p>
              <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest opacity-80 mt-0.5">Root Admin</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setIsProfileModalOpen(true)} className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl ${THEME.btnSecondary}`}>
              <Settings size={14} /> Intelligence
            </button>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl group">
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Termination
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full lg:p-12 p-6 overflow-y-auto">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center items-start gap-8 lg:mb-12 mb-10 border-b lg:border-none border-white/5 pb-8 lg:pb-0">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{activeTab}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Administrative Governance · Neural Node Management</p>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full lg:w-auto">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <button onClick={handleTeamSeed} disabled={teamSeedLoading} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${THEME.btnSecondary}`}>
              <Users size={16} className={teamSeedLoading ? "animate-spin" : "text-amber-500"} /> <span className="uppercase">Sync Teams</span>
            </button>
            <button onClick={handleDataSeed} disabled={seedLoading} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 text-white rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-2xl bg-gradient-to-r ${THEME.btn} active:scale-95 disabled:opacity-50`}>
              <RefreshCcw size={16} className={seedLoading ? "animate-spin" : ""} /> <span className="uppercase">Refresh Intelligence</span>
            </button>
          </div>
        </header>

        {activeTab === "System Stats" && <SystemOverview stats={stats} adminData={adminData.system_stats} loading={loading} />}
        {activeTab === "Data Usage" && <DataUsage stats={stats} usageData={adminData.data_usage} loading={loading} />}
        {activeTab === "Global Performance" && <GlobalPerformance perfData={adminData.global_performance} loading={loading} />}
        {activeTab === "Reports" && <ReportsExports reportData={adminData.report_stats} loading={loading} />}
        {activeTab === "User Management" && <UserManagement users={usersList} loading={loading} token={token} />}
        {activeTab === "Coach Management" && <CoachManagement coaches={coachesList} loading={loading} token={token} />}
        {activeTab === "Analyst Management" && <AnalystManagement analysts={analystsList} loading={loading} token={token} />}
        {activeTab === "Player Management" && (
          <PlayerManagement
            players={playersList}
            loading={loading}
            token={token}
            activeSyncType={activeSyncType}
            syncProgress={syncProgress}
            onSyncAll={handleSyncAllStyles}
            setPlayersList={setPlayersList}
          />
        )}
        {activeTab === "Data Control" && (
          <DataControl
            onSeed={handleDataSeed}
            onTeamSync={handleTeamSeed}
            onPlayerSync={handleSyncAllStyles}
            loading={seedLoading}
            teamLoading={teamSeedLoading}
            activeSyncType={activeSyncType}
            playerSyncProgress={syncProgress}
          />
        )}
      </main>

      <AdminChatbot
        token={token}
        onAction={handleBotAction}
      />

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        token={token}
        user={user}
      />
    </div>
  );
};
/* =====================================
   A. SYSTEM OVERVIEW
 ===================================== */
const SystemOverview = ({ stats, adminData, loading }) => {
  if (loading) return <Loader />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Node Access" value={stats.total_users} icon={<Users size={20} />} trend="+4" color="blue" />
        <StatCard label="Tracked Athletes" value={stats.total_players} icon={<Users size={20} />} trend="+12" color="emerald" />
        <StatCard label="Global Matches" value={stats.total_matches} icon={<Activity size={20} />} trend="+2" color="amber" />
        <StatCard label="Intelligence Data" value={(stats.total_deliveries / 1000).toFixed(1) + 'k'} icon={<Shield size={20} />} trend="+8k" color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
          <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">User Role Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={adminData?.role_distribution || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {(adminData?.role_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
          <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Active Nodes Tracker</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminData?.active_users || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="users" fill="#10b981" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
;
/* =====================================
   DATA USAGE
 ===================================== */
const DataUsage = ({ usageData, loading }) => {
  if (loading) return <Loader />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
        <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Neural Data Progression</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageData?.uploads_per_month || []}>
              <defs>
                <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
              <Area type="monotone" dataKey="matches" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMatches)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
        <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Monthly Ingestion Matrix</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData?.uploads_per_month || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="matches" fill="#7c3aed" radius={[12, 12, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
;
/* =====================================
   GLOBAL PERFORMANCE OVERVIEW
 ===================================== */
const GlobalPerformance = ({ perfData, loading }) => {
  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
        <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Apex Offensive Personnel (Top 10)</h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perfData?.top_batters || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontStyle="italic" axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="runs" fill="#f59e0b" radius={[12, 12, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
        <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Apex Defensive Personnel (Top 10)</h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perfData?.top_bowlers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontStyle="italic" axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="wickets" fill="#ec4899" radius={[12, 12, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
;
/* =====================================
   REPORTS & EXPORTS
 ===================================== */
const ReportsExports = ({ reportData, loading }) => {
  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-black/40">
        <h3 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-[10px] pb-4 border-b border-white/5 w-fit italic">Historical Report Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={reportData?.downloads || []} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="count">
                {(reportData?.downloads || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#ffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-12 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-400 transition-all"></div>
        <div className="w-24 h-24 rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <FileBarChart size={40} />
        </div>
        <h2 className="text-7xl font-black text-white tracking-tighter mb-4 italic scale-animation">{reportData?.total_reports || 0}</h2>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Cumulative Intelligence Exports</p>
        <p className="text-[9px] text-slate-600 mt-6 max-w-xs font-bold leading-relaxed uppercase tracking-widest opacity-60">Aggregate personnel and strategic performance data extracted across all supported vector formats.</p>
      </div>
    </div>
  );
};
;

const Loader = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-44 bg-[#0f172a] rounded-[3rem] border border-white/5 shadow-2xl" />
    ))}
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${active
        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 italic"
        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
  >
    <span className={`${active ? "text-white" : "group-hover:text-blue-500"} transition-colors`}>{icon}</span>
    {label}
  </button>
);

const StatCard = ({ label, value, icon, trend, color }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  };

  return (
    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[3rem] shadow-2xl shadow-black/40 hover:border-white/10 transition-all flex items-center justify-between group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">{label}</p>
        <h4 className="text-3xl font-black text-white italic tracking-tighter">{value}</h4>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
          <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Growth Matrix</span>
        </div>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${colors[color] || colors.blue}`}>
        {icon}
      </div>
    </div>
  );
};

/* =====================================
   C. COACH MANAGEMENT
===================================== */
const CoachManagement = ({ coaches: initialCoaches, loading, token }) => {
  const [coaches, setCoaches] = useState(initialCoaches || []);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ coach_name: '', username: '', password: '', team_id: '' });
  const [editingCoachId, setEditingCoachId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch teams for the dropdown
  useEffect(() => {
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/coaches/teams/', { headers })
      .then(res => setTeams(res.data || []))
      .catch(() => { });
  }, [token]);

  // Sync if parent coaches prop changes
  useEffect(() => { setCoaches(initialCoaches || []); }, [initialCoaches]);

  const openModal = (coach = null) => {
    if (coach) {
      setForm({
        coach_name: coach.coach_name || '',
        username: coach.username || '',
        password: '', // Leave empty unless changing
        team_id: coach.team || ''
      });
      setEditingCoachId(coach.id);
    } else {
      setForm({ coach_name: '', username: '', password: '', team_id: '' });
      setEditingCoachId(null);
    }
    setError(''); setSuccess('');
    setShowModal(true);
  };

  const handleAppoint = async (e) => {
    e.preventDefault();
    if (!form.coach_name || (!editingCoachId && !form.username) || (!editingCoachId && !form.password) || !form.team_id) {
      setError('All required fields must be filled.'); return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingCoachId) {
        const res = await axios.put(`http://127.0.0.1:8000/api/coaches/update/${editingCoachId}/`, form, { headers });
        setCoaches(prev => prev.map(c => c.id === editingCoachId ? res.data.coach : c));
        setSuccess(`✅ ${res.data.message}`);
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/coaches/appoint/', form, { headers });
        setCoaches(prev => [...prev, res.data.coach]);
        setSuccess(`✅ ${res.data.message}`);
      }
      setForm({ coach_name: '', username: '', password: '', team_id: '' });
      setEditingCoachId(null);
      // Refresh teams list
      const teamsRes = await axios.get('http://127.0.0.1:8000/api/coaches/teams/', { headers });
      setTeams(teamsRes.data || []);
      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save coach.');
    } finally { setSaving(false); }
  };

  const handleRevoke = async (coach) => {
    if (!window.confirm(`Revoke coach '${coach.coach_name}'? Their account will be deactivated.`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/coaches/delete/${coach.id}/`, { headers });
      setCoaches(prev => prev.filter(c => c.id !== coach.id));
      const teamsRes = await axios.get('http://127.0.0.1:8000/api/coaches/teams/', { headers });
      setTeams(teamsRes.data || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke coach.');
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Coach Registry...</div>;

  return (
    <>
      <div className="bg-[#0f172a] border border-white/5 rounded-4xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Strategic Command (Coaches)</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{coaches.length} coach{coaches.length !== 1 ? 'es' : ''} appointed</p>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-white transition-all active:scale-95">
            <UserPlus size={14} /> Appoint New Coach
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                <th className="px-8 py-4">Coach Name</th>
                <th className="px-8 py-4 text-center">Authentication ID</th>
                <th className="px-8 py-4 text-center">Assigned Team</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coaches.map((c) => {
                const teamStyle = TEAM_COLORS[c.team_name] || { bg: "bg-amber-500", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400" };
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${teamStyle.bg} flex items-center justify-center text-[#0b1120] font-black`}>
                          {c.coach_name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold text-white group-hover:${teamStyle.text} transition-colors uppercase italic`}>{c.coach_name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Head Coach</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-block px-3 py-1 bg-[#1e293b] border border-white/5 rounded-lg text-[10px] font-black text-blue-400">
                        {c.username}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 ${teamStyle.badge} text-[10px] font-black rounded-lg uppercase`}>{c.team_name}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(c)} className={`p-2 text-slate-500 hover:${teamStyle.text} bg-transparent hover:bg-white/10 rounded-lg transition-all`} title="Edit Coach">
                          <Settings size={15} />
                        </button>
                        <button onClick={() => handleRevoke(c)} className="p-2 text-slate-500 hover:text-red-500 bg-red-500/0 hover:bg-red-500/10 rounded-lg transition-all" title="Revoke Coach">
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coaches.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-600 font-black text-xs uppercase tracking-widest">
                    No coaches appointed yet — click "Appoint New Coach" above
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPOINT COACH MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingCoachId ? "Update Coach" : "Appoint Coach"}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{editingCoachId ? "Modify assigned team or details" : "Create coach account & assign to team"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-all text-xl">✖</button>
            </div>

            <form onSubmit={handleAppoint} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <input value={form.coach_name} onChange={e => setForm({ ...form, coach_name: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all"
                  placeholder="e.g. Anil Kumble" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className={`w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 ${editingCoachId ? 'text-slate-500 cursor-not-allowed' : 'text-white'} focus:outline-none focus:border-amber-500 transition-all`}
                    placeholder="e.g. anil_k" required={!editingCoachId} disabled={!!editingCoachId} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{editingCoachId ? "New Password (Optional)" : "Password"}</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all"
                    placeholder="••••••••" required={!editingCoachId} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign to Team</label>
                <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer" required>
                  <option value="">— Select a Team —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.has_coach && t.id !== parseInt(form.team_id)}>
                      {t.name}{(t.has_coach && t.id !== parseInt(form.team_id)) ? ' (Coach Assigned)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-xl">⚠️ {error}</p>}
              {success && <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl">{success}</p>}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-[#0b1120] text-[10px] font-black uppercase tracking-widest hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-95">
                  {saving ? (editingCoachId ? 'Updating...' : 'Appointing...') : (editingCoachId ? '⚡ Update Coach' : '⚡ Appoint Coach')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


/* =====================================
   D. ANALYST MANAGEMENT
===================================== */
const AnalystManagement = ({ analysts: initialAnalysts, loading, token }) => {
  const [analysts, setAnalysts] = useState(initialAnalysts || []);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ analyst_name: '', username: '', password: '', team_id: '' });
  const [editingAnalystId, setEditingAnalystId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/coaches/teams/', { headers })
      .then(res => setTeams(res.data || []))
      .catch(() => { });
  }, [token]);

  useEffect(() => { setAnalysts(initialAnalysts || []); }, [initialAnalysts]);

  const openModal = (analyst = null) => {
    if (analyst) {
      setForm({
        analyst_name: analyst.analyst_name || '',
        username: analyst.username || '',
        password: '',
        team_id: analyst.team || ''
      });
      setEditingAnalystId(analyst.id);
    } else {
      setForm({ analyst_name: '', username: '', password: '', team_id: '' });
      setEditingAnalystId(null);
    }
    setError(''); setSuccess('');
    setShowModal(true);
  };

  const handleAppoint = async (e) => {
    e.preventDefault();
    if (!form.analyst_name || (!editingAnalystId && !form.username) || (!editingAnalystId && !form.password)) {
      setError('Name, Username, and Password are required.'); return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingAnalystId) {
        const res = await axios.put(`http://127.0.0.1:8000/api/analysts/update/${editingAnalystId}/`, form, { headers });
        setAnalysts(prev => prev.map(a => a.id === editingAnalystId ? res.data.analyst : a));
        setSuccess(`✅ ${res.data.message}`);
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/analysts/appoint/', form, { headers });
        setAnalysts(prev => [...prev, res.data.analyst]);
        setSuccess(`✅ ${res.data.message}`);
      }
      setForm({ analyst_name: '', username: '', password: '', team_id: '' });
      setEditingAnalystId(null);
      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save analyst.');
    } finally { setSaving(false); }
  };

  const handleRevoke = async (analyst) => {
    if (!window.confirm(`Revoke analyst '${analyst.analyst_name}'? Their account will be deactivated.`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/analysts/delete/${analyst.id}/`, { headers });
      setAnalysts(prev => prev.filter(a => a.id !== analyst.id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke analyst.');
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Analyst Registry...</div>;

  return (
    <>
      <div className="bg-[#0f172a] border border-white/5 rounded-4xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Strategic Intelligence (Analysts)</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{analysts.length} analyst{analysts.length !== 1 ? 's' : ''} appointed</p>
          </div>
          <button onClick={openModal} className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95">
            <UserPlus size={14} /> Appoint New Analyst
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                <th className="px-8 py-4">Analyst Name</th>
                <th className="px-8 py-4 text-center">Authentication ID</th>
                <th className="px-8 py-4 text-center">Assigned Team</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analysts.map((a) => {
                const isGeneral = !a.team || a.team_name === "General";
                const teamStyle = isGeneral
                  ? { bg: "bg-slate-700", text: "text-slate-300", badge: "bg-slate-700/20 text-slate-400 border-slate-700/30" }
                  : (TEAM_COLORS[a.team_name] || { bg: "bg-blue-500", text: "text-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" });
                return (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${teamStyle.bg} flex items-center justify-center text-[#0b1120] font-black`}>
                          {a.analyst_name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold text-white group-hover:${teamStyle.text} transition-colors uppercase italic`}>{a.analyst_name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Data Analyst</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-block px-3 py-1 bg-[#1e293b] border border-white/5 rounded-lg text-[10px] font-black text-blue-400">
                        {a.username}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 ${teamStyle.badge} text-[10px] font-black rounded-lg uppercase border`}>
                        {isGeneral ? "General Analyst" : a.team_name}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(a)} className={`p-2 text-slate-500 hover:${teamStyle.text} bg-transparent hover:bg-white/10 rounded-lg transition-all`} title="Edit Analyst">
                          <Settings size={15} />
                        </button>
                        <button onClick={() => handleRevoke(a)} className="p-2 text-slate-500 hover:text-red-500 bg-red-500/0 hover:bg-red-500/10 rounded-lg transition-all" title="Revoke Analyst">
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {analysts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-600 font-black text-xs uppercase tracking-widest">
                    No analysts appointed yet — click "Appoint New Analyst" above
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingAnalystId ? "Update Analyst" : "Appoint Analyst"}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{editingAnalystId ? "Modify assigned team or details" : "Create analyst account & assign to team"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-all text-xl">✖</button>
            </div>

            <form onSubmit={handleAppoint} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <input value={form.analyst_name} onChange={e => setForm({ ...form, analyst_name: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Mike Hesson" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className={`w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 ${editingAnalystId ? 'text-slate-500 cursor-not-allowed' : 'text-white'} focus:outline-none focus:border-blue-500 transition-all`}
                    placeholder="e.g. mike_h" required={!editingAnalystId} disabled={!!editingAnalystId} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{editingAnalystId ? "New Password (Optional)" : "Password"}</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="••••••••" required={!editingAnalystId} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign to Team</label>
                <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" required>
                  <option value="General">— General (Global Access) —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-xl">⚠️ {error}</p>}
              {success && <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl">{success}</p>}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95">
                  {saving ? (editingAnalystId ? 'Updating...' : 'Appointing...') : (editingAnalystId ? '⚡ Update Analyst' : '⚡ Appoint Analyst')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


/* =====================================
   E. USER MANAGEMENT
===================================== */
const UserManagement = ({ users: initialUsers, loading, token }) => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'analyst', is_active: true });

  const headers = { Authorization: `Bearer ${token}` };

  // Safeguard: Extract the array based on common Django structures
  const getSafeUsers = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.results)) return data.results;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  };

  useEffect(() => { setUsers(getSafeUsers(initialUsers)); }, [initialUsers]);

  const openModal = (user = null) => {
    if (user) {
      setForm({
        username: user.username || '',
        password: '', // blank on edit
        role: user.role || 'analyst',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
      setEditingUserId(user.id);
    } else {
      setForm({ username: '', password: '', role: 'analyst', is_active: true });
      setEditingUserId(null);
    }
    setError(''); setSuccess('');
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!form.username || (!editingUserId && !form.password)) {
      setError('Username and Password (for new users) are required.'); return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingUserId) {
        await axios.put(`http://127.0.0.1:8000/api/users/update/${editingUserId}/`, form, { headers });
        setSuccess(`✅ User '${form.username}' updated successfully.`);
        // Note: the backend returns success message but not the full serialized object. We will just refetch or optimistically update.
      } else {
        await axios.post('http://127.0.0.1:8000/api/users/add/', form, { headers });
        setSuccess(`✅ User '${form.username}' created successfully.`);
      }

      // Refresh registry
      const res = await axios.get("http://127.0.0.1:8000/api/users/", { headers });
      setUsers(getSafeUsers(res.data));

      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.username?.[0] || 'Failed to save user.');
    } finally { setSaving(false); }
  };

  const handleDeleteUser = async (user) => {
    if (user.is_superuser) {
      alert("Root admins cannot be deactivated from this dashboard."); return;
    }
    if (!window.confirm(`Deactivate user '${user.username}'?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/delete/${user.id}/`, { headers });
      const res = await axios.get("http://127.0.0.1:8000/api/users/", { headers });
      setUsers(getSafeUsers(res.data));
    } catch (err) {
      alert("Failed to deactivate user.");
    }
  };

  const handleResetPassword = async (user) => {
    const newPass = window.prompt(`Enter new password for '${user.username}':`);
    if (!newPass || newPass.trim() === "") return;

    try {
      await axios.post(`http://127.0.0.1:8000/api/users/reset-password/${user.id}/`, { password: newPass }, { headers });
      setSuccess(`✅ Password for '${user.username}' reset successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError("Failed to reset password.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] border border-white/5 rounded-4xl p-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Registry...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
        <h3 className="font-black text-white uppercase tracking-widest text-sm">Registry of Operatives</h3>
        <button onClick={() => openModal()} className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
          <UserPlus size={14} /> Provision New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
              <th className="px-8 py-4">User Identity</th>
              <th className="px-8 py-4 text-center">Role / Permissions</th>
              <th className="px-8 py-4 text-center">Last Activity</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length > 0 ? (
              users.map((u, i) => (
                <tr key={u.id || i} className="hover:bg-blue-500/3 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-blue-500 font-bold">
                        {(u.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">{u.username || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{u.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.is_superuser ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {u.is_superuser ? "ROOT ADMIN" : (u.role || "MEMBER").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-[11px] text-slate-400 font-medium">Joined: {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-[10px] text-slate-600">Login: {u.last_login ? new Date(u.last_login).toLocaleTimeString() : 'Never'}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${u.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      {u.is_active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleResetPassword(u)} className="p-2 text-slate-500 hover:text-amber-500" title="Reset Password"><Key size={16} /></button>
                      <button onClick={() => openModal(u)} className="p-2 text-slate-500 hover:text-blue-400" title="Edit User"><Settings size={16} /></button>
                      <button onClick={() => handleDeleteUser(u)} className="p-2 text-slate-500 hover:text-red-500" title="Deactivate User"><Power size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <p className="text-slate-600 font-medium italic">No personnel records found in database.</p>
                  <p className="text-[10px] text-slate-800 mt-2 uppercase">Endpoint: /admin/auth/user/</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingUserId ? "Update User" : "Provision User"}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{editingUserId ? "Modify permissions or password" : "Create new system operator"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-all text-xl">✖</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className={`w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 ${editingUserId ? 'text-slate-500 cursor-not-allowed' : 'text-white'} focus:outline-none focus:border-blue-500 transition-all`}
                  placeholder="e.g. data_analyst_01" required={!editingUserId} disabled={!!editingUserId} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{editingUserId ? "New Password (Optional)" : "Password"}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="••••••••" required={!editingUserId} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" required>
                    <option value="analyst">Analyst</option>
                    <option value="coach">Coach</option>
                    <option value="player">Player</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Account Status</label>
                  <select value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer" required>
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-xl">⚠️ {error}</p>}
              {success && <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl">{success}</p>}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-95">
                  {saving ? (editingUserId ? 'Updating...' : 'Provisioning...') : (editingUserId ? '⚡ Update User' : '⚡ Provision User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================
   E. PLAYER MANAGEMENT
===================================== */
const PlayerManagement = ({ players: initialPlayers, loading, token, activeSyncType, syncProgress, onSyncAll, setPlayersList }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingStyle, setFetchingStyle] = useState(false);
  const [autoAssigningTeams, setAutoAssigningTeams] = useState(false);
  const [cleaningSubs, setCleaningSubs] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', team_id: '', batting_style: '', bowling_style: '', role: '', height_cm: '', weight_kg: '', fitness_score: '', age: '', email: '', phone: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const refreshRegistry = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/players/list/", { headers });
      setPlayers(res.data || []);
      setPlayersList(res.data || []);
      setSuccess("✅ Registry Refreshed");
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError("Failed to refresh registry.");
    }
  };

  const findPlayers = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => { setPlayers(initialPlayers || []); }, [initialPlayers]);

  useEffect(() => {
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/coaches/teams/', { headers })
      .then(res => setTeams(res.data || []))
      .catch(() => { });
  }, [token]);

  const openModal = (player = null) => {
    if (player) {
      setForm({
        name: player.name || '',
        team_id: player.team || '',
        batting_style: player.batting_style || '',
        bowling_style: player.bowling_style || '',
        role: player.role || '',
        height_cm: player.height_cm || '',
        weight_kg: player.weight_kg || '',
        fitness_score: player.fitness_score || '',
        age: player.age || '',
        email: player.email || '',
        phone: player.phone || ''
      });
      setEditingPlayerId(player.id);
    } else {
      setForm({ name: '', team_id: '', batting_style: '', bowling_style: '', height_cm: '', weight_kg: '', fitness_score: '', age: '', email: '', phone: '' });
      setEditingPlayerId(null);
    }
    setError(''); setSuccess('');
    setShowModal(true);
  };

  const handleFetchStyles = async () => {
    if (!form.name) {
      setError("Please enter a Player Name first to fetch styles.");
      return;
    }
    setFetchingStyle(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/players/fetch-external-styles/?name=${encodeURIComponent(form.name)}`, { headers });
      setForm(prev => ({
        ...prev,
        batting_style: res.data.batting_style || prev.batting_style,
        bowling_style: res.data.bowling_style || prev.bowling_style,
        role: res.data.role || prev.role
      }));
      setSuccess(`✅ Fetched styles for ${form.name}`);
    } catch (err) {
      setError("Could not auto-fetch styles. Please enter manually.");
    } finally {
      setFetchingStyle(false);
    }
  };

  const syncSpecificPlayer = async (player) => {
    setFetchingStyle(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/players/fetch-external-styles/?name=${encodeURIComponent(player.name)}`, { headers });

      const payload = {
        ...player,
        batting_style: res.data.batting_style || player.batting_style,
        bowling_style: res.data.bowling_style || player.bowling_style,
        role: res.data.role || player.role,
        team: player.team
      };

      await axios.put(`http://127.0.0.1:8000/api/players/edit/${player.id}/`, payload, { headers });
      setSuccess(`✅ Synced ${player.name}`);
      refreshRegistry();
    } catch (err) {
      setError(`Failed to sync ${player.name}`);
    } finally {
      setFetchingStyle(false);
    }
  };

  // handleSyncAllStyles moved to parent AdminDashboard

  const handleAutoAssignTeams = async () => {
    if (!window.confirm("Auto-assign teams to all unassigned players based on match history? This will scan all global match data.")) return;

    setAutoAssigningTeams(true);
    setSuccess('');
    setError('');

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/players/auto-assign-teams/", {}, { headers });
      setSuccess(`✅ ${res.data.message}`);
      refreshRegistry();
    } catch (err) {
      setError("Failed to auto-assign teams: " + (err.response?.data?.message || err.message));
    } finally {
      setAutoAssigningTeams(false);
    }
  };

  const handleCleanupSubs = async () => {
    if (!window.confirm("Remove all player records containing '(sub)' in their name? This action is permanent.")) return;

    setCleaningSubs(true);
    setSuccess('');
    setError('');

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/players/cleanup-subs/", {}, { headers });
      setSuccess(`✅ ${res.data.message}`);
      refreshRegistry();
    } catch (err) {
      setError("Failed to cleanup substitutes: " + (err.response?.data?.message || err.message));
    } finally {
      setCleaningSubs(false);
    }
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError('Player Name is required.'); return;
    }
    setSaving(true); setError(''); setSuccess('');

    // Map form state to the exact schema PlayerSerializer expects
    const payload = {
      ...form,
      team: form.team_id === '' ? null : form.team_id
    };

    try {
      if (editingPlayerId) {
        await axios.put(`http://127.0.0.1:8000/api/players/edit/${editingPlayerId}/`, payload, { headers });
        setSuccess(`✅ Player '${form.name}' updated successfully.`);
      } else {
        await axios.post('http://127.0.0.1:8000/api/players/add/', payload, { headers });
        setSuccess(`✅ Player '${form.name}' created successfully.`);
      }

      const res = await axios.get("http://127.0.0.1:8000/api/players/list/", { headers });
      setPlayers(res.data || []);
      setTimeout(() => { setShowModal(false); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to save player.');
    } finally { setSaving(false); }
  };

  const handleDeletePlayer = async (player) => {
    if (!window.confirm(`Delete player '${player.name}'? This action is permanent.`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/players/delete/${player.id}/`, { headers });
      const res = await axios.get("http://127.0.0.1:8000/api/players/list/", { headers });
      setPlayers(res.data || []);
    } catch (err) {
      alert("Failed to delete player.");
    }
  };

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="bg-[#0f172a] border border-white/5 rounded-4xl p-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Roster...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-4xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/2">
        <div>
          <h3 className="font-black text-white uppercase tracking-widest text-sm">Active Roster Base</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{players.length} players tracked</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Players..."
              onKeyUp={findPlayers}
              className="w-full bg-[#0b1120] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <button onClick={() => onSyncAll('style')} disabled={!!activeSyncType} className="flex whitespace-nowrap items-center gap-2 text-xs font-black text-indigo-400 bg-indigo-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50">
            <Wand2 size={14} className={activeSyncType === 'style' ? "animate-spin" : ""} /> {activeSyncType === 'style' ? syncProgress || 'Syncing...' : 'Auto-Fetch All styles'}
          </button>
          <button onClick={() => onSyncAll('role')} disabled={!!activeSyncType} className="flex whitespace-nowrap items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
            <UserCircle size={14} className={activeSyncType === 'role' ? "animate-spin" : ""} /> {activeSyncType === 'role' ? syncProgress || 'Syncing...' : 'Auto-Sync Roles'}
          </button>
          <button onClick={handleAutoAssignTeams} disabled={autoAssigningTeams} className="flex whitespace-nowrap items-center gap-2 text-xs font-black text-blue-400 bg-blue-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50">
            <Shield size={14} className={autoAssigningTeams ? "animate-spin" : ""} /> {autoAssigningTeams ? "Assigning..." : "Auto-Assign Teams"}
          </button>
          <button onClick={handleCleanupSubs} disabled={cleaningSubs} className="flex whitespace-nowrap items-center gap-2 text-xs font-black text-red-400 bg-red-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
            <Activity size={14} className={cleaningSubs ? "animate-spin" : ""} /> {cleaningSubs ? "Cleaning..." : "Clean Subs"}
          </button>
          <button onClick={refreshRegistry} className="flex whitespace-nowrap items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
            <Activity size={14} /> Refresh List
          </button>
          <button onClick={async () => {
            if (!window.confirm("Sync all full names between Users and Players?")) return;
            try {
              const res = await axios.post("http://127.0.0.1:8000/api/players/sync-full-names/", {}, { headers });
              alert(res.data.message);
              refreshRegistry();
            } catch (err) { alert("Sync failed."); }
          }} className="flex whitespace-nowrap items-center gap-2 text-xs font-black text-amber-400 bg-amber-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
            <RefreshCcw size={14} /> Sync Names
          </button>
          <button onClick={() => openModal()} className="flex whitespace-nowrap items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 flex-shrink-0 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
            <UserPlus size={14} /> Add Player
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0f172a] z-10 border-b border-white/5">
              <tr className="bg-white/5 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                <th className="px-8 py-4">Full Name</th>
                <th className="px-8 py-4 text-center">Assigned Team</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Batting Style</th>
                <th className="px-8 py-4">Bowling Style</th>
                <th className="px-8 py-4">Physical Stats</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-emerald-500/3 transition-colors group">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-white mb-0.5">{p.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-500 font-medium tracking-widest">{p.full_name || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {p.team_name ? (
                        <span className={`px-3 py-1 ${TEAM_COLORS[p.team_name]?.badge || 'bg-amber-500/10 text-amber-400'} text-[10px] font-black rounded-lg uppercase whitespace-nowrap`}>
                          {p.team_name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg uppercase">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {p.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {p.batting_style || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {p.bowling_style || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      {p.height_cm || p.weight_kg || p.fitness_score || p.age || p.email || p.phone ? (
                        <div className="flex flex-col gap-1">
                          {p.age && <span className="text-[10px] text-emerald-500 font-medium tracking-tight bg-emerald-500/10 px-1.5 py-0.5 rounded-md">AGE: {p.age}</span>}
                          {p.email && <span className="text-[10px] text-blue-400 font-medium tracking-tight bg-blue-500/10 px-1.5 py-0.5 rounded-md truncate max-w-[120px]" title={p.email}>{p.email}</span>}
                          {p.phone && <span className="text-[10px] text-purple-400 font-medium tracking-tight bg-purple-500/10 px-1.5 py-0.5 rounded-md">{p.phone}</span>}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.height_cm && <span className="text-[10px] text-slate-400 font-medium tracking-tight">HT: {p.height_cm}cm</span>}
                            {p.weight_kg && <span className="text-[10px] text-slate-400 font-medium tracking-tight">WT: {p.weight_kg}kg</span>}
                            {p.fitness_score && <span className="text-[10px] text-slate-400 font-medium tracking-tight">FIT: {p.fitness_score}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Unrecorded</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(p)} className="p-2 flex items-center justify-center bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-all" title="Edit Player">
                          <Settings size={14} />
                        </button>
                        <button onClick={() => handleDeletePlayer(p)} className="p-2 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all" title="Delete Player">
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No players found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLAYER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingPlayerId ? "Update Player" : "Add Player"}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{editingPlayerId ? "Modify roster details" : "Register new player"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-all text-xl">✖</button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                    placeholder="e.g. Virat Kohli" />
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 mb-2">Short Name (ID)</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. V Kohli" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assigned Team</label>
                  <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                    <option value="">— Unassigned —</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Batting Style</label>
                  <input value={form.batting_style} onChange={e => setForm({ ...form, batting_style: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                    placeholder="e.g. Right-hand bat" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Bowling Style</label>
                  <input value={form.bowling_style} onChange={e => setForm({ ...form, bowling_style: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                    placeholder="e.g. Right-arm medium" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Player Role</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                  placeholder="e.g. All-rounder" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Age</label>
                  <input type="number" min="15" max="50" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold"
                    placeholder="e.g. 24" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                    placeholder="player@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                    placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Height (cm)</label>
                  <input type="number" min="100" max="250" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. 180" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. 75.5" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fitness Score</label>
                  <input type="number" step="0.1" value={form.fitness_score} onChange={e => setForm({ ...form, fitness_score: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    placeholder="e.g. 18.5" />
                </div>
              </div>

              <button type="button" onClick={handleFetchStyles} disabled={fetchingStyle || !form.name}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                <Wand2 size={14} className={fetchingStyle ? "animate-spin" : ""} /> {fetchingStyle ? 'Scanning Wikipedia...' : 'Auto-Fetch Styles via Wikipedia'}
              </button>

              {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-xl">⚠️ {error}</p>}
              {success && <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl">{success}</p>}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 active:scale-95">
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================
   F. DATA CONTROL (SEEDING)
 ===================================== */
const DataControl = ({ onSeed, onTeamSync, onPlayerSync, loading, teamLoading, activeSyncType, playerSyncProgress }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
    <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group">
      <div>
        <div className="bg-orange-500/10 text-orange-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 border border-orange-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Database size={32} />
        </div>
        <h3 className="text-3xl font-black text-white mb-3 italic tracking-tighter uppercase">Match Seeder</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed italic opacity-80">Synchronize match intelligence. Updates global deliveries, player matrices, and archival data.</p>
      </div>
      <div className="space-y-4">
        <button onClick={onSeed} disabled={loading} className="w-full py-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50">
          <RefreshCcw className={loading ? "animate-spin" : ""} size={20} /> RUN MATCH SEED
        </button>

        <button onClick={() => onPlayerSync('style')} disabled={!!activeSyncType} className="w-full py-4 bg-white/5 hover:bg-white/10 text-indigo-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] border border-white/5">
          <Wand2 size={16} className={activeSyncType === 'style' ? "animate-spin" : ""} /> {activeSyncType === 'style' ? playerSyncProgress || 'SYNCING...' : 'AUTO-FETCH PLAYER STYLES'}
        </button>
        <button onClick={() => onPlayerSync('role')} disabled={!!activeSyncType} className="w-full py-4 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-[9px] uppercase tracking-[0.2em] border border-white/5">
          <UserPlus size={16} className={activeSyncType === 'role' ? "animate-spin" : ""} /> {activeSyncType === 'role' ? playerSyncProgress || 'SYNCING...' : 'AUTO-SYNC PLAYER ROLES'}
        </button>
      </div>
    </div>

    <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group">
      <div>
        <div className="bg-amber-500/10 text-amber-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 border border-amber-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <Users size={32} />
        </div>
        <h3 className="text-3xl font-black text-white mb-3 italic tracking-tighter uppercase">Team Registry</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed italic opacity-80">Synchronize official franchise indices from YAML configuration keys. Ensures team identity consistency.</p>
      </div>
      <button onClick={onTeamSync} disabled={teamLoading} className="w-full py-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-[#0b1120] font-black rounded-[2rem] transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-amber-500/30 active:scale-95 disabled:opacity-50">
        <Users className={teamLoading ? "animate-spin" : ""} size={20} /> SYNC TEAM REGISTRY
      </button>
    </div>

    <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group">
      <div>
        <div className="bg-red-500/10 text-red-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 border border-red-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-3xl font-black text-white mb-3 italic tracking-tighter uppercase">Danger Zone</h3>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 leading-relaxed italic opacity-80">Purge seasonal caches, clear operational logs, or reset environment global state cards. IRREVERSIBLE.</p>
      </div>
      <button className="w-full py-6 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-[2rem] transition-all text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-red-500/10">
        EXECUTE GLOBAL RESET
      </button>
    </div>
  </div>
);

export default AdminDashboard;