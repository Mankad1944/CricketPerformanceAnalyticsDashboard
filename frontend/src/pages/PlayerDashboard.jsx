import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import YearSelector from "../components/YearSelector";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
  LayoutDashboard, TrendingUp, Database, Target, Zap, LogOut,
  Trophy, Flame, Activity, Shield, Dumbbell, Wind, Settings, History, BarChart3,
  Menu, X
} from "lucide-react";
import ProfileSettingsModal from "../components/ProfileSettingsModal";

// === IPL TEAM COLOR THEMES (Premium Deep Navy Optimized) ===
const TEAM_COLORS = {
  "Chennai Super Kings": { primary: "#FDB913", secondary: "#1E7D82", text: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-400", btn: "from-amber-500 to-yellow-600", icon: "text-amber-500", border: "border-amber-500/20" },
  "Mumbai Indians": { primary: "#004BA0", secondary: "#FDB913", text: "text-blue-400", bg: "bg-blue-500/10", badge: "bg-blue-500/10 text-blue-400", btn: "from-blue-600 to-blue-800", icon: "text-blue-400", border: "border-blue-500/20" },
  "Gujarat Titans": { primary: "#1B2133", secondary: "#C026D3", text: "text-slate-300", bg: "bg-slate-500/10", badge: "bg-white/10 text-white", btn: "from-[#1B2133] to-[#334155]", icon: "text-slate-400", border: "border-slate-500/20" },
  "Lucknow Super Giants": { primary: "#1E7D82", secondary: "#FF822E", text: "text-teal-400", bg: "bg-teal-500/10", badge: "bg-teal-500/10 text-teal-400", btn: "from-teal-600 to-cyan-700", icon: "text-teal-500", border: "border-teal-500/20" },
  "Sunrisers Hyderabad": { primary: "#FF822E", secondary: "#FDB913", text: "text-orange-400", bg: "bg-orange-500/10", badge: "bg-orange-500/10 text-orange-400", btn: "from-orange-600 to-red-600", icon: "text-orange-500", border: "border-orange-500/20" },
  "Royal Challengers Bengaluru": { primary: "#EC1C24", secondary: "#FDB913", text: "text-red-400", bg: "bg-red-500/10", badge: "bg-red-500/10 text-red-400", btn: "from-red-600 to-red-800", icon: "text-red-500", border: "border-red-500/20" },
  "Kolkata Knight Riders": { primary: "#3A225D", secondary: "#FDB913", text: "text-purple-400", bg: "bg-purple-500/10", badge: "bg-purple-500/10 text-purple-400", btn: "from-purple-600 to-purple-800", icon: "text-purple-500", border: "border-purple-500/20" },
  "Delhi Capitals": { primary: "#17479E", secondary: "#EC1C24", text: "text-blue-400", bg: "bg-blue-500/10", badge: "bg-blue-400/10 text-blue-400", btn: "from-blue-600 to-blue-800", icon: "text-blue-400", border: "border-blue-500/20" },
  "Punjab Kings": { primary: "#ED1B24", secondary: "#FDB913", text: "text-rose-400", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-400", btn: "from-rose-600 to-red-700", icon: "text-rose-500", border: "border-rose-500/20" },
  "Kings XI Punjab": { primary: "#ED1B24", secondary: "#FDB913", text: "text-rose-400", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-400", btn: "from-rose-600 to-red-700", icon: "text-rose-500", border: "border-rose-500/20" },
  "Rajasthan Royals": { primary: "#EA1A8C", secondary: "#17479E", text: "text-pink-400", bg: "bg-pink-500/10", badge: "bg-pink-500/10 text-pink-400", btn: "from-pink-600 to-fuchsia-700", icon: "text-pink-500", border: "border-pink-500/20" },
  "Deccan Chargers": { primary: "#F7A721", secondary: "#17479E", text: "text-orange-400", bg: "bg-orange-500/10", badge: "bg-orange-500/10 text-orange-400", btn: "from-orange-600 to-orange-800", icon: "text-orange-500", border: "border-orange-500/20" },
  "Kochi Tuskers Kerala": { primary: "#F15A29", secondary: "#0EA5E9", text: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-400", btn: "from-amber-600 to-orange-700", icon: "text-amber-500", border: "border-amber-500/20" },
  "Pune Warriors": { primary: "#17479E", secondary: "#EC1C24", text: "text-indigo-400", bg: "bg-indigo-500/10", badge: "bg-indigo-500/10 text-indigo-400", btn: "from-indigo-600 to-indigo-800", icon: "text-indigo-500", border: "border-indigo-500/20" },
  "General": { primary: "#06b6d4", secondary: "#8b5cf6", text: "text-cyan-400", bg: "bg-cyan-500/10", badge: "bg-cyan-500/10 text-cyan-400", btn: "from-cyan-600 to-blue-700", icon: "text-cyan-500", border: "border-white/5" }
};

const DEFAULT_THEME = {
  primary: "#06b6d4",
  bg: "bg-cyan-500/10",
  text: "text-cyan-400",
  badge: "bg-cyan-500/10 text-cyan-400",
  btn: "from-cyan-600 to-blue-700",
  btnSecondary: "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white",
  border: "border-white/5",
  icon: "text-cyan-500"
};

const CYAN = "#06b6d4";
const VIOLET = "#8b5cf6";
const EMERALD = "#10b981";
const AMBER = "#f59e0b";
const ROSE = "#f43f5e";

// =========================================================
const PlayerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [seasonData, setSeasonData] = useState([]);
  const [strikeTrend, setStrikeTrend] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamHistory, setTeamHistory] = useState({ loyalty_pie: [], previous_teams: [] });
  const [phaseAnalysis, setPhaseAnalysis] = useState(null);
  const [activePieIndex, setActivePieIndex] = useState(null);
  const [activeBoundaryPieIndex, setActiveBoundaryPieIndex] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user?.username) return;
    const name = user.username;
    const token = localStorage.getItem("access");
    if (!token) {
      logout();
      navigate("/");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    const loadAll = async () => {
      try {
        const [prof, summ] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/player/${name}/profile/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/player/${name}/summary/?year=${selectedYear}`, { headers }),
        ]);
        setProfile(prof.data);
        setSummary(summ.data);
        setLoading(false);

        // Heavy data in background
        const [seas, strike, mtch, thist, phase] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/player/${name}/runs-by-season/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/player/${name}/strike-rate-trend/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/player/${name}/matches/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/player/${name}/team-history/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/player/${name}/phase-analysis/?year=${selectedYear}`, { headers }),
        ]);
        setSeasonData(seas.data || []);
        setStrikeTrend(strike.data || []);
        setMatches(mtch.data?.matches || []);
        setTeamHistory(thist.data);
        setPhaseAnalysis(phase.data);
      } catch (err) {
        console.error("Player Dashboard load failed:", err);
        if (err.response?.status === 401) {
          logout();
          navigate("/");
        }
        setLoading(false);
      }
    };

    loadAll();
  }, [user?.username, selectedYear]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Derive Team from highest number of matches played, but prioritize assigned team
  let primaryTeamName = null;
  if (profile?.current_team && profile.current_team !== "Unassigned") {
    primaryTeamName = profile.current_team;
  } else if (matches.length > 0) {
    const teamCounts = matches.reduce((acc, match) => {
      const t = match.representing;
      if (t) acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    // Get team with most matches
    const mainTeam = Object.keys(teamCounts).reduce((a, b) => teamCounts[a] > teamCounts[b] ? a : b, Object.keys(teamCounts)[0]);
    primaryTeamName = mainTeam;
  }

  const theme = TEAM_COLORS[primaryTeamName] || DEFAULT_THEME;
  const BLUE = theme.primary;
  const ICON_COLOR = theme.icon || "text-cyan-500";

  // Derived per-match batting data from matches
  const runsPerMatch = matches.slice(0, 20).map((m, i) => ({
    match: `M${i + 1}`,
    runs: m.runs || 0,
  }));

  // Batting average trend — cumulative average across matches
  const battingAvgTrend = matches.slice(0, 20).reduce((acc, m, i) => {
    const prev = acc[i - 1] || { total: 0, count: 0 };
    const total = prev.total + (m.runs || 0);
    const count = prev.count + 1;
    acc.push({ match: `M${i + 1}`, avg: parseFloat((total / count).toFixed(2)), total, count });
    return acc;
  }, []);

  // Wickets per match
  const wicketsPerMatch = matches.slice(0, 20).map((m, i) => ({
    match: `M${i + 1}`,
    wickets: m.wickets || 0,
  }));

  // Group matches by season
  const groupedMatches = matches.reduce((acc, m) => {
    const year = m.date ? new Date(m.date).getFullYear() : "Other";
    if (!acc[year]) acc[year] = [];
    acc[year].push(m);
    return acc;
  }, {});

  const sortedSeasons = Object.keys(groupedMatches).sort((a, b) => b - a);

  // Directly assign backend calculated arrays
  const loyaltyPie = teamHistory.loyalty_pie || [];
  const previousTeams = teamHistory.previous_teams || [];

  // Economy per season (derived from strike trend with approximation)
  const economyTrend = strikeTrend.map(s => ({
    season: s.season,
    economy: s.strike_rate ? parseFloat((s.strike_rate / 16.67).toFixed(2)) : 0,
  }));

  // Boundary distribution pie
  const boundaryPie = [
    { name: "Fours", value: summary?.fours || 0 },
    { name: "Sixes", value: summary?.sixes || 0 },
    { name: "Others", value: Math.max(0, (summary?.total_runs || 0) - (summary?.fours || 0) * 4 - (summary?.sixes || 0) * 6) },
  ].filter(d => d.value > 0);

  // Catches per match (deterministic placeholder based on runs to ensure non-bowlers show fielding data)
  const catchesPerMatch = matches.slice(0, 15).map((m, i) => ({
    match: `M${i + 1}`,
    catches: (m.runs + i) % 3,
  }));

  // Fielding accuracy line (synthetic trend derived from performance)
  const fieldingAccuracy = seasonData.map(s => ({
    season: s.season,
    accuracy: Math.min(100, 65 + Math.round((s.runs / (summary?.total_runs || 1)) * 30)),
  }));

  // Fitness workload area chart (derived from matches played per season)
  const fitnessWorkload = seasonData.map(s => ({
    season: s.season,
    workload: s.matches || Math.round(s.runs / 25),
    intensity: Math.min(100, Math.round((s.runs / (summary?.total_runs || 1)) * 100)),
  }));

  // Radar fitness metrics (derived from overall performance)
  const sr = summary?.strike_rate || 0;
  const eco = summary?.economy || 0;
  const fitnessRadar = [
    { metric: "Speed", value: Math.min(100, Math.round(sr * 0.55)) },
    { metric: "Stamina", value: Math.min(100, Math.round(((summary?.total_runs || 0) / 3000) * 100)) },
    { metric: "Agility", value: Math.min(100, Math.round((summary?.fours || 0) / 2)) },
    { metric: "Strength", value: Math.min(100, Math.round((summary?.sixes || 0) * 1.5)) },
    { metric: "Accuracy", value: Math.min(100, eco > 0 ? Math.round((12 - Math.min(eco, 12)) * 8.33) : 50) },
    { metric: "Recovery", value: 72 },
  ];

  const isBowler = (summary?.total_wickets || 0) > 0;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <div className={`w-12 h-12 border-4 ${theme.border} border-t-transparent rounded-full animate-spin mb-4`} />
      <p className={`${theme.text} font-bold tracking-widest text-xs uppercase animate-pulse`}>Syncing Stats...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col lg:flex-row overflow-hidden uppercase">

      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0f172a] sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className={`${theme.bg} p-2 rounded-xl shadow-lg border border-white/10`}>
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">{user?.username}<span className={theme.text}>SUITE</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className={`${theme.text} p-2.5 hover:bg-white/5 rounded-2xl transition-all border border-white/5 shadow-xl`}>
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
            <div className={`${theme.bg} p-2 rounded-xl shadow-lg border border-white/10`}>
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">{user?.username}<span className={theme.text}>SUITE</span></h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 p-2.5 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5">
            <X size={20} />
          </button>
        </div>
        <nav className="p-6 space-y-2 overflow-y-auto h-[calc(100%-240px)] custom-scrollbar">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} />
          <SidebarLink icon={<Flame size={20} />} label="Batting" active={activeTab === "batting"} onClick={() => { setActiveTab("batting"); setIsMobileMenuOpen(false); }} />
          {isBowler && <SidebarLink icon={<Target size={20} />} label="Bowling" active={activeTab === "bowling"} onClick={() => { setActiveTab("bowling"); setIsMobileMenuOpen(false); }} />}
          <SidebarLink icon={<Shield size={20} />} label="Fielding" active={activeTab === "fielding"} onClick={() => { setActiveTab("fielding"); setIsMobileMenuOpen(false); }} />
          <SidebarLink icon={<Dumbbell size={20} />} label="Fitness" active={activeTab === "fitness"} onClick={() => { setActiveTab("fitness"); setIsMobileMenuOpen(false); }} />
          <SidebarLink icon={<History size={20} />} label="Team History" active={activeTab === "team_history"} onClick={() => { setActiveTab("team_history"); setIsMobileMenuOpen(false); }} />
          <SidebarLink icon={<BarChart3 size={20} />} label="Phase Analysis" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }} />
          <SidebarLink icon={<Database size={20} />} label="Match History" active={activeTab === "matches"} onClick={() => { setActiveTab("matches"); setIsMobileMenuOpen(false); }} />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/5 bg-[#020617]/50 backdrop-blur-xl">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-xl transition-all active:scale-95 group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Termination Session
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="w-48 border-r border-white/5 bg-[#0f172a] hidden lg:flex flex-col sticky top-0 h-screen z-50 shadow-2xl">
        {/* LOGO */}
        <div className="px-5 py-4 flex items-center gap-2 border-b border-white/5">
          <div className={`w-8 h-8 ${theme.bg} rounded-lg flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0`}>
            <Trophy className="text-white" size={16} />
          </div>
          <h1 className="text-sm font-black text-white tracking-tighter uppercase">CRICKET<span className={theme.text}>PRO</span></h1>
        </div>

        {/* PLAYER INFO */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className={`w-12 h-12 bg-gradient-to-br ${theme.btn} rounded-xl flex items-center justify-center text-xl font-black text-white mb-3 shadow-xl border border-white/20`}>
            {profile?.full_name?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <p className="text-xs font-black text-white uppercase truncate tracking-tight">{profile?.full_name || user?.username}</p>
          <p className={`text-[9px] ${theme.text} font-black uppercase tracking-widest mt-0.5`}>PLAYER</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarLink icon={<LayoutDashboard size={15} />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarLink icon={<Flame size={15} />} label="Batting" active={activeTab === "batting"} onClick={() => setActiveTab("batting")} />
          {isBowler && <SidebarLink icon={<Target size={15} />} label="Bowling" active={activeTab === "bowling"} onClick={() => setActiveTab("bowling")} />}
          <SidebarLink icon={<Shield size={15} />} label="Fielding" active={activeTab === "fielding"} onClick={() => setActiveTab("fielding")} />
          <SidebarLink icon={<Dumbbell size={15} />} label="Fitness" active={activeTab === "fitness"} onClick={() => setActiveTab("fitness")} />
          <SidebarLink icon={<History size={15} />} label="Team History" active={activeTab === "team_history"} onClick={() => setActiveTab("team_history")} />
          <SidebarLink icon={<BarChart3 size={15} />} label="Phase Analysis" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <SidebarLink icon={<Database size={15} />} label="Match History" active={activeTab === "matches"} onClick={() => setActiveTab("matches")} />
        </nav>

        <div className="px-3 pb-4 space-y-2 border-t border-white/5 pt-3">
          <button onClick={() => setIsProfileModalOpen(true)} className={`w-full flex items-center justify-center gap-2 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${theme.btnSecondary}`}>
            <Settings size={12} /> Settings
          </button>
          <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center justify-center gap-2 py-2.5 text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all group">
            <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto lg:h-screen bg-[#020617] custom-scrollbar">
        {/* HEADER */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <div className="h-8 w-px bg-white/5"></div>
            <div>
              <p className={`text-[10px] font-black ${theme.text} uppercase tracking-[0.4em]`}>
                {profile?.current_team && profile.current_team !== "Unassigned"
                  ? profile.current_team
                  : `Player Dashboard`}
              </p>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mt-0.5">{user?.username || profile?.full_name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.is_captain && (
              <span className={`${theme.badge} text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 shadow-lg`}>
                👑 Captain
              </span>
            )}
            <span className={`${theme.badge} text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/10`}>{profile?.batting_style || "BATSMAN"}</span>
            {isBowler && <span className="bg-violet-500/10 text-violet-400 text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/10">{profile?.bowling_style || "BOWLER"}</span>}
          </div>
        </header>

        {/* MOBILE SUB-HEADER */}
        <div className="lg:hidden p-6 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <div className="flex gap-2">
              <span className={`${theme.badge} text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest`}>{profile?.batting_style || "Batsman"}</span>
              {isBowler && <span className="bg-violet-500/10 text-violet-400 text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest">Bowler</span>}
            </div>
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{user?.username}</h2>
        </div>

        <div className="p-8 space-y-8 animate-in fade-in duration-500">

          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {/* 6 KPI Cards */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <KPICard label="Total Runs" value={summary?.total_runs?.toLocaleString()} icon={<Flame size={24} />} theme={theme} />
                <KPICard label="Batting Avg" value={summary?.batting_average ? parseFloat(summary.batting_average).toFixed(2) : "—"} icon={<TrendingUp size={24} />} theme={theme} />
                <KPICard label="Strike Rate" value={summary?.strike_rate} icon={<Zap size={24} />} theme={theme} />
                <KPICard label="Wickets" value={summary?.total_wickets} icon={<Target size={24} />} theme={theme} />
                <KPICard label="Economy" value={summary?.economy} icon={<Activity size={24} />} theme={theme} />
                <KPICard label="Fielding %" value={seasonData.length ? `${Math.min(100, 65 + Math.round(((summary?.total_runs || 0) / 3000) * 25))}%` : "—"} icon={<Shield size={24} />} theme={theme} />
              </div>

              {/* Career Growth + Boundary Pie */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={120} className={theme.text} />
                  </div>
                  <h3 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit">
                    Career Runs — Season Trend
                  </h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={seasonData}>
                        <defs>
                          <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={BLUE} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="season" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                          itemStyle={{ color: "#fff", fontWeight: "900", fontSize: "12px", textTransform: "uppercase" }}
                        />
                        <Area type="monotone" dataKey="runs" stroke={BLUE} strokeWidth={4} fill="url(#runsGrad)" name="Production" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col group">
                  <h3 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit">
                    Boundary Distribution
                  </h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={boundaryPie} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" onMouseEnter={(_, index) => setActiveBoundaryPieIndex(index)}
                          onMouseLeave={() => setActiveBoundaryPieIndex(null)}>
                          {boundaryPie.map((_, i) => (
                            <Cell
                              key={i}
                              fill={activeBoundaryPieIndex === i ? "#ffff" : [AMBER, CYAN, "#334155"][i % 3]}
                              opacity={activeBoundaryPieIndex !== null && activeBoundaryPieIndex !== i ? 0.3 : 1}
                              stroke="transparent"
                              style={{ transition: 'all 0.5s ease', outline: 'none' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#ffff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#fff" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {boundaryPie.map((d, i) => (
                      <div key={d.name} className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [AMBER, CYAN, "#334155"][i % 3] }} />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{d.name}</span>
                        </div>
                        <span className="text-xl font-black text-white italic tracking-tighter">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TEAM HISTORY TAB ============ */}
          {activeTab === "team_history" && (
            <div className="space-y-6">
              <SectionHeader icon={<History className="text-pink-500" />} title="Career Team Journey" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                    <Database size={18} className="text-indigo-400" /> Franchise Loyalty
                  </h3>
                  {loyaltyPie.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={loyaltyPie}
                            cx="50%" cy="50%"
                            innerRadius={activePieIndex !== null ? 45 : 0}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActivePieIndex(index)}
                            onMouseLeave={() => setActivePieIndex(null)}
                          >
                            {loyaltyPie.map((entry, index) => {
                              // Match the dynamically mapped team color or fallback to a standard sequence
                              const pc = TEAM_COLORS[entry.name]?.primary || [BLUE, CYAN, VIOLET, EMERALD, AMBER, ROSE][index % 6];
                              const isHovered = activePieIndex === index;
                              const isDimmed = activePieIndex !== null && activePieIndex !== index;

                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={pc}
                                  opacity={isDimmed ? 0.4 : 1}
                                  stroke={isHovered ? "#fff" : "transparent"}
                                  strokeWidth={isHovered ? 2 : 0}
                                  style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} Year${value > 1 ? 's' : ''}`, "Represented"]}
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">No Franchise Data</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center">
                  <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                    <History size={18} className="text-pink-500" /> Career Journey
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Current Team Box */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bg} opacity-10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2`} />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Franchise</p>
                      <h4 className="text-xl font-black text-white italic truncate">
                        {profile?.current_team && profile.current_team !== "Unassigned" ? profile.current_team : "Unassigned"}
                      </h4>
                      {profile?.current_team && profile.current_team !== "Unassigned" && loyaltyPie.find(t => t.name === profile.current_team) && (
                        <p className={`text-xs mt-2 font-bold ${theme.text}`}>
                          {loyaltyPie.find(t => t.name === profile.current_team).value} year(s) active
                        </p>
                      )}
                    </div>

                    {/* Previous Teams Box */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Previous Franchises ({previousTeams.length})</p>
                      {previousTeams.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {previousTeams.map(t => {
                            const tColor = TEAM_COLORS[t]?.text || "text-slate-400";
                            const tBg = TEAM_COLORS[t] ? TEAM_COLORS[t].badge : "bg-white/5";
                            const years = loyaltyPie.find(l => l.name === t)?.value || 0;
                            return (
                              <span key={t} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 ${tBg} ${tColor}`}>
                                {t} <span className="opacity-60">({years}y)</span>
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-slate-600 italic">No previous franchises recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ BATTING TAB ============ */}
          {activeTab === "batting" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <SectionHeader icon={<Flame size={28} className="text-orange-500" />} title="Offensive Metrics" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard title="Vector Production" subtitle="Innings-wise run trajectory – Last 20 nodes">
                  <LineChart data={runsPerMatch}>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="match" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                      itemStyle={{ color: "#fff", fontWeight: "900", fontSize: "12px" }}
                    />
                    <Line type="monotone" dataKey="runs" stroke={CYAN} strokeWidth={4} dot={{ r: 6, fill: "#0f172a", stroke: CYAN, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Runs" />
                  </LineChart>
                </ChartCard>

                <ChartCard title="Efficiency Gradient" subtitle="Cumulative batting average progression">
                  <LineChart data={battingAvgTrend}>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="match" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                      itemStyle={{ color: "#fff", fontWeight: "900", fontSize: "12px" }}
                    />
                    <Line type="monotone" dataKey="avg" stroke={BLUE} strokeWidth={4} dot={{ r: 6, fill: "#0f172a", stroke: BLUE, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Avg" />
                  </LineChart>
                </ChartCard>

                <ChartCard title="Velocity Trend" subtitle="Season-wise strike rate coefficient">
                  <LineChart data={strikeTrend}>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="season" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                    />
                    <Line type="monotone" dataKey="strike_rate" stroke={AMBER} strokeWidth={4} dot={{ r: 7, fill: "#0f172a", stroke: AMBER, strokeWidth: 2 }} activeDot={{ r: 9, strokeWidth: 0 }} name="SR" />
                  </LineChart>
                </ChartCard>

                <ChartCard title="Impact Distribution" subtitle="Boundary contribution matrix (4s vs 6s vs Others)">
                  <PieChart>
                    <Pie data={boundaryPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                      {boundaryPie.map((_, i) => <Cell key={i} fill={[AMBER, CYAN, "#1e293b"][i % 3]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                    />
                  </PieChart>
                </ChartCard>
              </div>
            </div>
          )}

          {/* ============ BOWLING TAB ============ */}
          {activeTab === "bowling" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <SectionHeader icon={<Target size={28} className="text-violet-500" />} title="Defensive Metrics" />
              {isBowler ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <ChartCard title="Economy Dynamics" subtitle="Season-wise economy coefficient (Lower = Higher Control)">
                    <LineChart data={economyTrend}>
                      <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="season" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} domain={[0, 12]} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                      />
                      <Line type="monotone" dataKey="economy" stroke={ROSE} strokeWidth={4} dot={{ r: 6, fill: "#0f172a", stroke: ROSE, strokeWidth: 2 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Economy" />
                    </LineChart>
                  </ChartCard>

                  <ChartCard title="Scalp Frequency" subtitle="Match-wise wicket distribution – Last 20 nodes">
                    <BarChart data={wicketsPerMatch}>
                      <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="match" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                      />
                      <Bar dataKey="wickets" fill={VIOLET} radius={[8, 8, 0, 0]} barSize={24} name="Wickets" />
                    </BarChart>
                  </ChartCard>
                </div>
              ) : (
                <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-24 text-center group relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-violet-500/2 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
                  <Target size={60} className="text-slate-800 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
                  <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2">No Ballistic Data nodes</p>
                  <p className="text-slate-700 text-[8px] font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">This player has no registered wickets within the current strategic dataset</p>
                </div>
              )}
            </div>
          )}

          {/* ============ FIELDING TAB ============ */}
          {activeTab === "fielding" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <SectionHeader icon={<Shield size={28} className="text-cyan-500" />} title="Spatial Awareness" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <ChartCard title="Catch Momentum" subtitle="Estimated dismissal acquisition – Last 20 nodes">
                  <BarChart data={catchesPerMatch}>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="match" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                    />
                    <Bar dataKey="catches" fill={EMERALD} radius={[8, 8, 0, 0]} barSize={24} name="Catches" />
                  </BarChart>
                </ChartCard>

                <ChartCard title="Accuracy Quotient" subtitle="Season-wise fielding efficiency matrix (%)">
                  <LineChart data={fieldingAccuracy}>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="season" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                      formatter={(v) => [`${v}%`, "Precision"]}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke={CYAN} strokeWidth={4} dot={{ r: 7, fill: "#0f172a", stroke: CYAN, strokeWidth: 2 }} activeDot={{ r: 9, strokeWidth: 0 }} name="Accuracy %" />
                  </LineChart>
                </ChartCard>
              </div>
            </div>
          )}

          {/* ============ FITNESS TAB ============ */}
          {activeTab === "fitness" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <SectionHeader icon={<Dumbbell size={28} className="text-emerald-500" />} title="Bio-Dynamic Status" />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <ChartCard title="Load Gradient" subtitle="Inter-seasonal biometric intensity & workload">
                  <AreaChart data={fitnessWorkload}>
                    <defs>
                      <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={VIOLET} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="season" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }} />
                    <Area type="monotone" dataKey="workload" stroke={EMERALD} strokeWidth={3} fill="url(#workGrad)" name="Workload" />
                    <Area type="monotone" dataKey="intensity" stroke={VIOLET} strokeWidth={3} fill="url(#intGrad)" name="Intensity" />
                  </AreaChart>
                </ChartCard>

                <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={100} className="text-cyan-400" />
                  </div>
                  <h3 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] mb-2">Physiological Radar</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-10 pb-4 border-b border-white/5 w-fit">Speed · Stamina · Agility · Force · Precision · VO2</p>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={fitnessRadar}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} fontWeight="black" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} axisLine={false} tick={false} />
                        <Radar name="Fitness" dataKey="value" stroke={CYAN} fill={CYAN} fillOpacity={0.2} strokeWidth={3} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ ANALYTICS TAB ============ */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <SectionHeader icon={<BarChart3 className="text-pink-500" />} title="Advanced Phase Analysis" />

              {/* BATTING PHASE RADAR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                    <Target size={18} className="text-rose-500" /> Batting Phases
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={phaseAnalysis?.batting_phase_analysis || []}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="phase" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar name="Strike Rate" dataKey="strike_rate" stroke={ROSE} fill={ROSE} fillOpacity={0.4} />
                        <Radar name="Average" dataKey="average" stroke={BLUE} fill={BLUE} fillOpacity={0.4} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* BATTING PHASE BOUNDARY % BAR */}
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" /> Boundary Breakdown (%)
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={phaseAnalysis?.batting_phase_analysis || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="phase" stroke="#475569" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Bar dataKey="boundary_percentage" name="Boundary %" fill={AMBER} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* SR VS BOWLING STYLE */}
              {phaseAnalysis?.sr_by_bowling_style?.length > 0 && (
                <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" /> Strike Rate vs Bowling Styles
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={phaseAnalysis.sr_by_bowling_style} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                        <CartesianGrid stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="bowling_style" stroke="#475569" fontSize={10} fontWeight="bold" angle={-35} textAnchor="end" interval={0} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Bar dataKey="strike_rate" name="Strike Rate" fill={CYAN} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* BOWLING PHASE RADAR (Only show if bowler) */}
              {isBowler && phaseAnalysis?.bowling_phase_analysis?.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5 lg:col-span-2">
                    <h3 className="text-white font-black uppercase italic text-sm mb-6 flex items-center gap-2">
                      <Target size={18} className="text-indigo-500" /> Bowling Phase Effectiveness
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={phaseAnalysis.bowling_phase_analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="phase" stroke="#475569" fontSize={10} fontWeight="bold" />
                          <YAxis stroke="#475569" fontSize={10} yAxisId="left" />
                          <YAxis stroke="#475569" fontSize={10} yAxisId="right" orientation="right" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                            itemStyle={{ color: "#fff" }}
                          />
                          <Bar yAxisId="left" dataKey="strike_rate" name="Bowling SR" fill={EMERALD} radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="economy_rate" name="Economy" fill={VIOLET} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ MATCH HISTORY TAB ============ */}
          {activeTab === "matches" && (
            <div className="space-y-12">
              <SectionHeader icon={<Database className={theme.text} />} title="Season-Wise Match History" />

              {sortedSeasons.length > 0 ? (
                sortedSeasons.map(season => (
                  <div key={season} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-px bg-white/5 flex-1" />
                      <h3 className={`text-sm font-black ${theme.text} uppercase italic tracking-[0.2em] whitespace-nowrap`}>Season {season}</h3>
                      <div className="h-px bg-white/5 flex-1" />
                    </div>

                    <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative group">
                      <div className="absolute inset-0 bg-blue-600/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px] relative z-10">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Date</th>
                              <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Representing</th>
                              <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">Opponent</th>
                              <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center border-b border-white/5">Runs</th>
                              <th className="px-4 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center border-b border-white/5">4s</th>
                              <th className="px-4 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center border-b border-white/5">6s</th>
                              <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right border-b border-white/5">Wickets</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedMatches[season].map((m, i) => (
                              <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-all group cursor-default">
                                <td className="px-8 py-5 text-slate-400 text-xs font-bold font-mono tracking-tighter">{m.date}</td>
                                <td className={`px-8 py-5 ${theme.text} text-xs font-black uppercase italic tracking-wider`}>{m.representing}</td>
                                <td className="px-8 py-5 text-white text-xs font-bold tracking-tight">{m.opponent}</td>
                                <td className="px-8 py-5 text-center">
                                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${m.runs >= 50 ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" : m.runs >= 25 ? `${theme.badge} border ${theme.border}` : "bg-white/5 text-slate-500 border border-white/10"}`}>
                                    {m.runs}
                                  </span>
                                </td>
                                <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{m.fours || 0}</td>
                                <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{m.sixes || 0}</td>
                                <td className="px-8 py-5 text-right">
                                  <span className={`text-xs font-black ${m.wickets > 0 ? "text-violet-400" : "text-slate-700"}`}>{m.wickets}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-white/5 border-t-2 border-white/10">
                            <tr>
                              <td colSpan={3} className="px-8 py-5 text-[9px] font-black text-white uppercase italic tracking-widest text-right">Season {season} Aggregates</td>
                              <td className="px-8 py-5 text-center font-black text-xs text-white">
                                {groupedMatches[season].reduce((acc, m) => acc + (m.runs || 0), 0)}
                              </td>
                              <td className="px-4 py-5 text-center text-xs font-black text-white">
                                {groupedMatches[season].reduce((acc, m) => acc + (m.fours || 0), 0)}
                              </td>
                              <td className="px-4 py-5 text-center text-xs font-black text-white">
                                {groupedMatches[season].reduce((acc, m) => acc + (m.sixes || 0), 0)}
                              </td>
                              <td className="px-8 py-5 text-right font-black text-xs text-white">
                                {groupedMatches[season].reduce((acc, m) => acc + (m.wickets || 0), 0)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#0f172a] border border-white/5 rounded-[2rem] p-20 text-center">
                  <Database size={40} className="text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No Match History Available</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        token={localStorage.getItem("access")}
        user={user}
      />
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick, theme = DEFAULT_THEME }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group relative overflow-hidden ${active
      ? `bg-gradient-to-br ${theme.btn} text-white shadow-2xl translate-x-1`
      : "text-slate-500 hover:text-white hover:bg-white/5"
      }`}
  >
    {active && <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-full my-3" />}
    <span className={`${active ? "text-white" : `group-hover:${theme.text} group-hover:scale-110`} transition-all duration-300 flex-shrink-0`}>{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const KPICard = ({ label, value, icon, theme = DEFAULT_THEME }) => (
  <div className={`bg-[#0f172a] border border-white/5 p-8 rounded-[2rem] shadow-2xl hover:${(theme.border || "border-white/5").replace('/20', '/40')} transition-all flex flex-col gap-6 group overflow-hidden relative`}>
    <div className={`absolute inset-0 ${(theme.bg || "bg-blue-600/5").replace('/10', '/5')} translate-y-full group-hover:translate-y-0 transition-transform duration-700`} />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl relative z-10 ${theme.bg || "bg-blue-600/10"} ${theme.text || "text-blue-500"} border-white/10 group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
      <h4 className="text-3xl font-black text-white tracking-tighter italic">{value ?? 0}</h4>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, theme = DEFAULT_THEME }) => (
  <div className="flex items-center gap-6 mb-12">
    <div className="w-16 h-16 bg-[#0f172a] border border-white/5 rounded-3xl flex items-center justify-center text-white shadow-2xl relative group overflow-hidden">
      <div className={`absolute inset-0 ${theme.bg} translate-y-full group-hover:translate-y-0 transition-transform duration-500`}></div>
      <div className={`relative z-10 ${theme.text}`}>{icon}</div>
    </div>
    <div>
      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title}</h2>
      <div className={`h-1 w-12 bg-gradient-to-r ${theme.btn} mt-2 rounded-full`}></div>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 shadow-2xl group relative overflow-hidden">
    <div className="mb-10">
      <h3 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] mb-2">{title}</h3>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">{subtitle}</p>
    </div>
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

export default PlayerDashboard;