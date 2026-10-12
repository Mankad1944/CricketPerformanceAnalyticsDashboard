import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import YearSelector from "../components/YearSelector";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LineChart, Line, AreaChart, Area,
    ComposedChart, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
    BarChart3, Users, Activity, LogOut, Trophy, Target, Zap, GitCompare,
    TrendingUp, Database, Search, SlidersHorizontal, X, ChevronDown, RotateCcw, FileDown,
    Globe, Shield, Brain, Microscope, PieChart as PieIcon, MapPin, Settings, Menu
} from "lucide-react";

const TEAM_COLORS = {
    "Chennai Super Kings": { primary: "#FDB913", secondary: "#1E7D82", text: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-400", btn: "from-amber-500 to-yellow-600", icon: "text-amber-500", border: "border-amber-500/20" },
    "Mumbai Indians": { primary: "#004BA0", secondary: "#FDB913", text: "text-blue-400", bg: "bg-blue-500/10", badge: "bg-blue-500/10 text-blue-400", btn: "from-blue-600 to-blue-800", icon: "text-blue-400", border: "border-blue-500/20" },
    "Gujarat Titans": { primary: "#1B2133", secondary: "#C026D3", text: "text-slate-300", bg: "bg-slate-500/10", badge: "bg-white/10 text-white", btn: "from-[#1B2133] to-[#334155]", icon: "text-slate-400", border: "border-fuchsia-500/20" },
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

const COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];
const BASE = "http://127.0.0.1:8000/api";

// ============ CUSTOM PLAYER SEARCH INPUT ============
const PlayerSearchInput = ({ value, onChange, players, placeholder, label, theme }) => {
    const [focused, setFocused] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const wrapperRef = useRef(null);
    const isCyan = !theme || theme.primary === "#06b6d4";

    const query = value.toLowerCase().trim();
    const filtered = query.length > 0
        ? players.filter(n => {
            const name = typeof n === 'string' ? n : (n.full_name || n.name);
            const shortName = typeof n === 'string' ? '' : n.name;
            return name.toLowerCase().includes(query) || shortName.toLowerCase().includes(query);
        }).slice(0, 12)
        : [];
    const showDropdown = focused && query.length > 0 && filtered.length > 0;

    const handleSelect = (opt) => {
        const name = typeof opt === 'string' ? opt : opt.name;
        onChange(name);
        setFocused(false);
        setHighlightIdx(-1);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(p => Math.min(p + 1, filtered.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx(p => Math.max(p - 1, 0)); }
        else if (e.key === "Enter" && highlightIdx >= 0) { e.preventDefault(); handleSelect(filtered[highlightIdx]); }
        else if (e.key === "Escape") setFocused(false);
    };

    useEffect(() => {
        const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setFocused(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</label>
            <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={value} onChange={(e) => { onChange(e.target.value); setHighlightIdx(-1); }} onFocus={() => setFocused(true)} onKeyDown={handleKeyDown}
                    className={`w-full bg-[#0f172a] border border-white/5 rounded-2xl pl-10 pr-5 py-4 text-white text-sm font-bold transition-all placeholder:text-slate-600 focus:outline-none focus:ring-2 ${theme ? `focus:border-${theme.text.split('-')[1]}-500 focus:ring-${theme.text.split('-')[1]}-500/20` : 'focus:border-cyan-500 focus:ring-cyan-500/20'}`}
                    placeholder={placeholder} autoComplete="off" />
            </div>
            {showDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl">
                    <div className="max-h-64 overflow-y-auto">
                        {filtered.map((opt, i) => {
                            const d = typeof opt === 'string' ? opt : (opt.full_name || opt.name);
                            const hi = i === highlightIdx;
                            return (
                                <div key={i} onMouseDown={() => handleSelect(opt)} onMouseEnter={() => setHighlightIdx(i)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-white/5 last:border-0 ${hi ? `bg-white/5 ${theme ? theme.text : 'text-cyan-400'}` : 'text-slate-400 hover:bg-white/5'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${hi ? `${theme ? theme.icon.replace('text', 'bg') : 'bg-cyan-500'} text-white shadow-lg` : 'bg-slate-800 text-slate-500'}`}>{d.charAt(0)}</div>
                                    <span className="text-xs font-bold truncate tracking-tight">{d}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-4 py-2 bg-white/5 border-t border-white/5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{filtered.length} match{filtered.length !== 1 ? 'es' : ''} · ↑↓ navigate · Enter select</p>
                    </div>
                </div>
            )}
        </div>
    );
};


// ============ FILTER BAR ============
const FilterBar = ({ filters, setFilters, options, activeCount, onReset, onApply, theme }) => {
    const [open, setOpen] = useState(false);

    const sel = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 transition-all hover:bg-[#151e36]">
            <div className="flex items-center justify-between px-6 py-5 cursor-pointer" onClick={() => setOpen(o => !o)}>
                <div className="flex items-center gap-3">
                    <SlidersHorizontal size={16} className={theme.icon} />
                    <span className="text-sm font-black text-white uppercase tracking-widest italic tracking-tight">Intelligence Filters</span>
                    {activeCount > 0 && (
                        <span className={`${theme.icon.replace('text', 'bg')} text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse`}>{activeCount} active</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {activeCount > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); onReset(); }}
                            className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-red-500 transition-all uppercase tracking-widest">
                            <RotateCcw size={12} /> Reset System
                        </button>
                    )}
                    <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {open && (
                <div className="border-t border-white/5 px-6 pb-6 pt-5 bg-[#0b1120]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Season */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Season</label>
                            <div className="relative">
                                <select value={filters.season} onChange={(e) => sel('season', e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer hover:bg-[#1e293b] transition-all">
                                    <option value="">All Seasons</option>
                                    {options.seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Team */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Team</label>
                            <div className="relative">
                                <select value={filters.team} onChange={(e) => sel('team', e.target.value)}
                                    disabled={filters.lockedTeam}
                                    className={`w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer transition-all ${filters.lockedTeam ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1e293b]'}`}>
                                    <option value="">All Teams</option>
                                    {options.teams.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Venue */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Venue</label>
                            <div className="relative">
                                <select value={filters.venue} onChange={(e) => sel('venue', e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer hover:bg-[#1e293b] transition-all">
                                    <option value="">All Venues</option>
                                    {options.venues.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Match Type */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Match Type</label>
                            <div className="relative">
                                <select value={filters.match_type} onChange={(e) => sel('match_type', e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer hover:bg-[#1e293b] transition-all">
                                    <option value="">All Types</option>
                                    {options.match_types.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Active filter tags */}
                    {activeCount > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(filters).map(([k, v]) => v ? (
                                <span key={k} className={`${theme.badge} border border-white/5 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-black/20`}>
                                    <span className="text-slate-600 capitalize">{k.replace('_', ' ')}:</span> {v}
                                    <X size={10} className="cursor-pointer hover:text-white transition-colors" onClick={() => sel(k, '')} />
                                </span>
                            ) : null)}
                        </div>
                    )}

                    <button onClick={() => { onApply(); setOpen(false); }}
                        className={`px-10 py-4 bg-gradient-to-r ${theme.btn} text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95`}>
                        ⚡ Run Intelligence Engine
                    </button>
                </div>
            )}
        </div>
    );
};


const AnalystDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Filter state
    const isRestricted = user?.team_name && user.team_name !== "General" && user.team_name !== "Unassigned";
    const theme = TEAM_COLORS[user?.team_name] || TEAM_COLORS["General"];

    const [filters, setFilters] = useState({
        season: '',
        team: isRestricted ? user.team_name : '',
        venue: '',
        match_type: '',
        lockedTeam: isRestricted
    });
    const [appliedFilters, setAppliedFilters] = useState({
        season: '',
        team: isRestricted ? user.team_name : '',
        venue: '',
        match_type: ''
    });
    const [filterOptions, setFilterOptions] = useState({ seasons: [], teams: [], venues: [], match_types: [] });

    // Data states
    const [overview, setOverview] = useState(null);
    const [topBatsmen, setTopBatsmen] = useState([]);
    const [topBowlers, setTopBowlers] = useState([]);
    const [scatterData, setScatterData] = useState({ batting: [], bowling: [] });
    const [trendData, setTrendData] = useState({ season_trends: [], rolling_avg: [] });
    const [venueData, setVenueData] = useState({ venue_runs: [], heatmap: [] });
    const [deepInsights, setDeepInsights] = useState({ opposition: { player_vs_team: [], dismissals: [] }, predictive: { projections: [], accuracy_trend: [] } });
    const [dataLoading, setDataLoading] = useState(false);

    // Comparison
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [comparisonData, setComparisonData] = useState(null);
    const [compLoading, setCompLoading] = useState(false);
    const [compError, setCompError] = useState("");
    const [allPlayers, setAllPlayers] = useState([]);

    const token = localStorage.getItem("access");
    const headers = { Authorization: `Bearer ${token}` };
    const handleLogout = () => { logout(); navigate("/"); };

    // Build query string from applied filters
    const buildQuery = (extra = {}) => {
        const p = { season: selectedYear, ...appliedFilters, ...extra };
        return Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    };

    const fetchAnalystData = useCallback(async (af = appliedFilters) => {
        setDataLoading(true);
        const p = { season: selectedYear, ...af };
        const q = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        try {
            const [ovRes, batRes, bowlRes, scatterRes, trendRes, venueRes, insightsRes] = await Promise.all([
                axios.get(`${BASE}/analytics/analyst-overview/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/leaderboard/top-batsmen/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/leaderboard/top-bowlers/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/analytics/performance-scatter/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/analytics/trends/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/analytics/venue-stats/${q ? '?' + q : ''}`, { headers }),
                axios.get(`${BASE}/analytics/deep-insights/${q ? '?' + q : ''}`, { headers }),
            ]);
            setOverview(ovRes.data);
            setTopBatsmen(batRes.data || []);
            setTopBowlers(bowlRes.data || []);
            setScatterData(scatterRes.data || { batting: [], bowling: [] });
            setTrendData(trendRes.data || { season_trends: [], rolling_avg: [] });
            setVenueData(venueRes.data || { venue_runs: [], heatmap: [] });
            setDeepInsights(insightsRes.data || { opposition: { player_vs_team: [], dismissals: [] }, predictive: { projections: [], accuracy_trend: [] } });
        } catch (err) {
            console.error("Data fetch failed:", err);
            if (err.response?.status === 401) {
                logout();
                navigate("/");
            }
        }
        finally { setDataLoading(false); }
    }, [appliedFilters, navigate, logout, selectedYear]);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const init = async () => {
            try {
                const [optRes, plRes] = await Promise.all([
                    axios.get(`${BASE}/analytics/analyst-filter-options/`, { headers }),
                    axios.get(`${BASE}/players/`, { headers }),
                ]);
                setFilterOptions(optRes.data);
                const pl = optRes.data; // filter options loaded
                const playerList = plRes.data?.players || plRes.data || [];
                setAllPlayers(Array.isArray(playerList) ? playerList : []);
            } catch (err) {
                console.error("Init failed:", err);
                if (err.response?.status === 401) {
                    logout();
                    navigate("/");
                }
            }
            finally { setLoading(false); }
        };
        init();
        fetchAnalystData();
    }, [navigate, logout, token, fetchAnalystData]);

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
        fetchAnalystData(filters);
        setComparisonData(null);
    };

    const handleResetFilters = () => {
        const resetTeam = isRestricted ? user.team_name : '';
        const empty = { season: '', team: resetTeam, venue: '', match_type: '', lockedTeam: isRestricted };
        const appliedEmpty = { season: '', team: resetTeam, venue: '', match_type: '' };
        setFilters(empty);
        setAppliedFilters(appliedEmpty);
        fetchAnalystData(appliedEmpty);
        setComparisonData(null);
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const handleCompare = async () => {
        if (!player1.trim() || !player2.trim()) return;
        setCompLoading(true); setCompError(""); setComparisonData(null);
        const q = buildQuery({ player1: player1.trim(), player2: player2.trim() });
        try {
            const res = await axios.get(`${BASE}/analytics/player-comparison/?${q}`, { headers });
            setComparisonData(res.data);
        } catch (err) {
            setCompError(err.response?.data?.error || "Player not found. Check the spelling.");
        } finally { setCompLoading(false); }
    };

    const boundaryPie = overview ? [
        { name: "Fours", value: overview.total_fours },
        { name: "Sixes", value: overview.total_sixes },
    ] : [];

    const logActivity = async (action, details) => {
        try {
            await axios.post(`${BASE}/admin/log-action/`, { action, details }, { headers });
        } catch (e) {
            console.error("Failed to log activity:", e);
        }
    };

    const handleExportLeaderboard = async (format) => {
        const batHeaders = ["#", "Player", "Total Runs", "Average", "Matches"];
        const batRows = topBatsmen.map((b, i) => [i + 1, b.name || b.full_name, b.total_runs, b.batting_average ? parseFloat(b.batting_average).toFixed(2) : "—", b.matches]);
        const bowlHeaders = ["#", "Player", "Total Wickets", "Matches"];
        const bowlRows = topBowlers.map((b, i) => [i + 1, b.name || b.full_name, b.total_wickets, b.matches]);

        if (format === "pdf") {
            exportToPDF("IPL Leaderboard — Top Batsmen", batHeaders, batRows, "leaderboard_batsmen");
            setTimeout(() => exportToPDF("IPL Leaderboard — Top Bowlers", bowlHeaders, bowlRows, "leaderboard_bowlers"), 500);
            logActivity('REPORT_PDF', 'Exported Leaderboard PDF');
        } else {
            exportToExcel("Top Batsmen", batHeaders, batRows, "ipl_leaderboard_batsmen");
            setTimeout(() => exportToExcel("Top Bowlers", bowlHeaders, bowlRows, "ipl_leaderboard_bowlers"), 300);
            logActivity('REPORT_EXCEL', 'Exported Leaderboard Excel');
        }
    };

    const handleExportOverview = async (format) => {
        const hList = ["Metric", "Value"];
        const rows = [
            ["Total Matches", overview?.total_matches ?? 0],
            ["Total Players", overview?.total_players ?? 0],
            ["Total Teams", overview?.total_teams ?? 0],
            ["Total Deliveries", overview?.total_deliveries ?? 0],
            ["Total Runs", overview?.total_runs ?? 0],
            ["Total Wickets", overview?.total_wickets ?? 0],
            ["Total Fours", overview?.total_fours ?? 0],
            ["Total Sixes", overview?.total_sixes ?? 0],
        ];
        const title = `IPL League Overview${appliedFilters.season ? ` — Season ${appliedFilters.season}` : ""}${appliedFilters.team ? ` | ${appliedFilters.team}` : ""}`;
        if (format === "pdf") {
            exportToPDF(title, hList, rows, "league_overview");
            logActivity('REPORT_PDF', 'Exported League Overview PDF');
        } else {
            exportToExcel("Overview", hList, rows, "league_overview");
            logActivity('REPORT_EXCEL', 'Exported League Overview Excel');
        }
    };

    const handleExportComparison = async (format) => {
        if (!comparisonData) return;
        const p1 = comparisonData.player1;
        const p2 = comparisonData.player2;
        const p1Display = p1.name || p1.full_name;
        const p2Display = p2.name || p2.full_name;
        const hList = ["Stat", p1Display, p2Display];
        const rows = [
            ["Runs", p1.batting.runs, p2.batting.runs],
            ["Average", p1.batting.average ? parseFloat(p1.batting.average).toFixed(2) : "—", p2.batting.average ? parseFloat(p2.batting.average).toFixed(2) : "—"],
            ["Strike Rate", p1.batting.strike_rate, p2.batting.strike_rate],
            ["Fours", p1.batting.fours, p2.batting.fours],
            ["Sixes", p1.batting.sixes, p2.batting.sixes],
            ["Wickets", p1.bowling.wickets, p2.bowling.wickets],
            ["Economy", p1.bowling.economy, p2.bowling.economy],
            ["Matches", p1.matches, p2.matches],
        ];
        const title = `Player Comparison: ${p1Display} vs ${p2Display}`;
        if (format === "pdf") {
            exportToPDF(title, hList, rows, `compare_${p1.name}_vs_${p2.name}`.replace(/ /g, "_"));
            logActivity('REPORT_PDF', 'Exported Player Comparison PDF');
        } else {
            exportToExcel("Comparison", hList, rows, `compare_${p1.name}_vs_${p2.name}`.replace(/ /g, "_"));
            logActivity('REPORT_EXCEL', 'Exported Player Comparison Excel');
        }
    };

    if (loading) return <div className="h-screen bg-[#0a0e1a] flex items-center justify-center text-cyan-500 uppercase tracking-widest font-black">Loading Intelligence Hub...</div>;

    const filterBar = (
        <FilterBar
            filters={filters}
            setFilters={setFilters}
            options={filterOptions}
            activeCount={activeFilterCount}
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
            theme={theme}
        />
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col lg:flex-row overflow-hidden text-sm uppercase selection:bg-cyan-500/30">

            {/* MOBILE HEADER */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f172a] sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className={`${theme.icon.replace('text', 'bg')} p-1 rounded-lg shadow-lg`}>
                        <BarChart3 className="text-white" size={18} />
                    </div>
                    <h1 className="text-sm font-bold text-white tracking-tight uppercase italic">Analyst<span className={theme.text}>Hub</span></h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className={`${theme.text} p-2 hover:bg-white/5 rounded-xl transition-all`}>
                    <Menu size={24} />
                </button>
            </div>

            {/* MOBILE DRAWER OVERLAY */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* MOBILE DRAWER */}
            <div className={`fixed inset-y-0 left-0 w-80 bg-[#0f172a] border-r border-white/5 z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/5 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`${theme.icon.replace('text', 'bg')} p-1.5 rounded-lg shadow-lg`}>
                            <BarChart3 className="text-white" size={20} />
                        </div>
                        <h1 className="text-lg font-bold text-white tracking-tight uppercase italic">Analyst<span className={theme.text}>Hub</span></h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 p-2 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-200px)]">
                    <NavItem icon={<Database size={18} />} label="League Overview" active={activeTab === "overview"} theme={theme} onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<GitCompare size={18} />} label="Player Comparison" active={activeTab === "compare"} theme={theme} onClick={() => { setActiveTab("compare"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<Trophy size={18} />} label="Leaderboard" active={activeTab === "leaderboard"} theme={theme} onClick={() => { setActiveTab("leaderboard"); setIsMobileMenuOpen(false); }} />
                    <div className="pt-6 pb-2 px-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-t border-white/5 mt-4">Intelligence</div>
                    <NavItem icon={<Microscope size={18} />} label="Advanced Analytics" active={activeTab === "advanced"} theme={theme} onClick={() => { setActiveTab("advanced"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<Activity size={18} />} label="Trend Analysis" active={activeTab === "trends"} theme={theme} onClick={() => { setActiveTab("trends"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<MapPin size={18} />} label="Venue Performance" active={activeTab === "venue"} theme={theme} onClick={() => { setActiveTab("venue"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<Shield size={18} />} label="Opposition analysis" active={activeTab === "opposition"} theme={theme} onClick={() => { setActiveTab("opposition"); setIsMobileMenuOpen(false); }} />
                    <NavItem icon={<Brain size={18} />} label="Predictive Stats" active={activeTab === "predictive"} theme={theme} onClick={() => { setActiveTab("predictive"); setIsMobileMenuOpen(false); }} />
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#0b1120]">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <LogOut size={14} /> Log Out System
                    </button>
                </div>
            </div>

            {/* SIDEBAR */}
            <aside className="w-64 border-r border-white/5 bg-[#0f172a] hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
                <div className="p-6 flex items-center gap-3">
                    <div className={`${theme.icon.replace('text', 'bg')} p-1.5 rounded-lg shadow-lg shadow-black/20`}><BarChart3 className="text-white" size={20} /></div>
                    <h1 className="text-lg font-bold text-white tracking-tight uppercase italic">Analyst<span className={theme.text}>Hub</span></h1>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <NavItem icon={<Database size={18} />} label="League Overview" active={activeTab === "overview"} theme={theme} onClick={() => setActiveTab("overview")} />
                    <NavItem icon={<GitCompare size={18} />} label="Player Comparison" active={activeTab === "compare"} theme={theme} onClick={() => setActiveTab("compare")} />
                    <NavItem icon={<Trophy size={18} />} label="Leaderboard" active={activeTab === "leaderboard"} theme={theme} onClick={() => setActiveTab("leaderboard")} />
                    <div className="pt-6 pb-2 px-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-t border-white/5 mt-4">Intelligence</div>
                    <NavItem icon={<Microscope size={18} />} label="Advanced Analytics" active={activeTab === "advanced"} theme={theme} onClick={() => setActiveTab("advanced")} />
                    <NavItem icon={<Activity size={18} />} label="Trend Analysis" active={activeTab === "trends"} theme={theme} onClick={() => setActiveTab("trends")} />
                    <NavItem icon={<MapPin size={18} />} label="Venue Performance" active={activeTab === "venue"} theme={theme} onClick={() => setActiveTab("venue")} />
                    <NavItem icon={<Shield size={18} />} label="Opposition analysis" active={activeTab === "opposition"} theme={theme} onClick={() => setActiveTab("opposition")} />
                    <NavItem icon={<Brain size={18} />} label="Predictive Stats" active={activeTab === "predictive"} theme={theme} onClick={() => setActiveTab("predictive")} />
                </nav>
                <div className="p-5 border-t border-white/5 bg-[#0b1120] mx-4 mb-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-2xl ${theme.icon.replace('text', 'bg')} flex items-center justify-center text-white font-black shadow-lg shadow-black/30`}>{user?.username?.charAt(0).toUpperCase() || "A"}</div>
                        <div className="truncate">
                            <p className="text-xs font-black text-white truncate italic">{user?.username || "Analyst"}</p>
                            <p className={`text-[9px] ${theme.text} uppercase font-black tracking-widest opacity-80`}>System Analyst</p>
                        </div>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(true)} className="w-full flex items-center justify-center gap-2 mb-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5">
                        <Settings size={14} /> Settings
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                        <LogOut size={14} /> Log Out
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto lg:h-screen bg-[#020617]">
                <header className="hidden lg:flex h-20 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-2xl items-center justify-between px-8 sticky top-0 z-40 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <span className={`text-xl font-black ${theme.text} uppercase tracking-tighter italic`}>
                            {isRestricted ? user.team_name : 'Analyst Hub'}
                        </span>
                        <span className={`${theme.badge} text-[10px] px-3 py-1 rounded-full font-black flex items-center gap-1.5 border border-white/10`}>
                            <div className={`w-1.5 h-1.5 ${theme.icon.replace('text', 'bg')} rounded-full animate-pulse`} />
                            {isRestricted ? 'OFFICIAL ANALYTICS' : 'GLOBAL INTELLIGENCE'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
                        {activeFilterCount > 0 && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                <SlidersHorizontal size={12} className={theme.icon} />
                                {activeFilterCount} active
                            </div>
                        )}
                    </div>
                </header>

                {/* MOBILE SUB-HEADER */}
                <div className="lg:hidden p-4 border-b border-white/5 flex flex-col gap-4 bg-[#0f172a]/95 backdrop-blur-xl sticky top-[72px] z-40">
                    <div className="flex items-center justify-between">
                        <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
                        <div className="flex gap-2">
                            <button onClick={() => activeTab === 'overview' ? handleExportOverview('excel') : handleExportComparison('excel')} className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl"><FileDown size={14} /></button>
                            <button onClick={() => activeTab === 'overview' ? handleExportOverview('pdf') : handleExportComparison('pdf')} className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl"><FileDown size={14} /></button>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto space-y-6">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {filterBar}
                            <div className="hidden lg:flex justify-end gap-3">
                                <button onClick={() => handleExportOverview('excel')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group">
                                    <FileDown size={14} className="group-hover:scale-110 transition-transform" /> Excel Export
                                </button>
                                <button onClick={() => handleExportOverview('pdf')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all group">
                                    <FileDown size={14} className="group-hover:scale-110 transition-transform" /> PDF Report
                                </button>
                            </div>

                            <div className={`transition-opacity duration-500 ${dataLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard label="Total Matches" value={overview?.total_matches} icon={<Activity className={theme.icon} />} theme={theme} />
                                    <StatCard label="Total Players" value={overview?.total_players} icon={<Users className={theme.icon} />} theme={theme} />
                                    <StatCard label="Total Runs" value={overview?.total_runs?.toLocaleString()} icon={<TrendingUp className={theme.icon} />} theme={theme} />
                                    <StatCard label="Total Wickets" value={overview?.total_wickets?.toLocaleString()} icon={<Target className={theme.icon} />} theme={theme} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    <StatCard label="Teams" value={overview?.total_teams} icon={<Trophy className={theme.icon} />} theme={theme} />
                                    <StatCard label="Deliveries" value={overview?.total_deliveries?.toLocaleString()} icon={<Database className={theme.icon} />} theme={theme} />
                                    <StatCard label="Total Sixes" value={overview?.total_sixes?.toLocaleString()} icon={<Zap className={theme.icon} />} theme={theme} />
                                    <StatCard label="Total Fours" value={overview?.total_fours?.toLocaleString()} icon={<BarChart3 className={theme.icon} />} theme={theme} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-8">
                                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                            <TrendingUp className={theme.text} size={20} /> Top Run Scorers
                                        </h3>
                                        <div className="h-[300px] lg:h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={topBatsmen} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} angle={-35} textAnchor="end" tickLine={false} interval={0} fontWeight="bold" />
                                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#f1f5f9", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", backdropBlur: "12px" }} />
                                                    <Bar dataKey="total_runs" fill={theme.primary} radius={[6, 6, 0, 0]} barSize={24} name="Runs" animationDuration={1500} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                            <Target className="text-violet-500" size={20} /> Top Wicket Takers
                                        </h3>
                                        <div className="h-[300px] lg:h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={topBowlers} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="full_name" stroke="#64748b" fontSize={9} angle={-35} textAnchor="end" tickLine={false} interval={0} fontWeight="bold" />
                                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", color: "#f1f5f9", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", backdropBlur: "12px" }} />
                                                    <Bar dataKey="total_wickets" fill={theme.secondary || "#8b5cf6"} radius={[6, 6, 0, 0]} barSize={24} name="Wickets" animationDuration={1500} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] mt-8 shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                        <Zap className="text-yellow-500" size={20} /> Boundary Distribution Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                                        <div className="flex flex-col gap-5">
                                            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-5 transition-all hover:bg-white/10">
                                                <div className={`w-12 h-12 rounded-2xl ${theme.icon.replace('text', 'bg')} flex items-center justify-center text-white shadow-lg shadow-black/20`}><Zap size={20} /></div>
                                                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total Fours Hit</p><p className="text-3xl font-black text-white italic tracking-tighter">{overview?.total_fours?.toLocaleString()}</p></div>
                                            </div>
                                            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center gap-5 transition-all hover:bg-white/10">
                                                <div className={`w-12 h-12 rounded-2xl ${theme.icon.replace('text', 'bg')} opacity-60 flex items-center justify-center text-white shadow-lg shadow-black/20`}><Zap size={20} /></div>
                                                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total Sixes Hit</p><p className="text-3xl font-black text-white italic tracking-tighter">{overview?.total_sixes?.toLocaleString()}</p></div>
                                            </div>
                                        </div>
                                        {/* PIE CHART FOR BOUNDARIES */}
                                        <div className="h-[300px] flex items-center justify-center relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={boundaryPie}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        stroke="none"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        animationDuration={1500}
                                                    >
                                                        {boundaryPie.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={COLORS[index % COLORS.length]}
                                                                className="filter drop-shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:opacity-80"
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: "#ffff",
                                                            border: "1px solid rgba(255,255,255,0.1)",
                                                            borderRadius: "16px",
                                                            color: "#f1f5f9",
                                                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                                                            backdropFilter: "blur(12px)"
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Impact</p>
                                                <p className={`text-2xl font-black ${theme.text} italic tracking-tighter`}>
                                                    {((overview?.total_fours || 0) + (overview?.total_sixes || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ COMPARISON TAB ============ */}
                    {activeTab === "compare" && (
                        <div className="space-y-6">
                            {filterBar}
                            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                                    <GitCompare className={theme.text} size={22} /> Player Head-to-Head
                                </h3>
                                <p className="text-xs text-slate-500 font-bold mb-8 italic">
                                    Search and select two players to compare their statistics in the system
                                    {Object.values(appliedFilters).some(Boolean) && <span className={`ml-2 ${theme.text}`}>· Filtered by active intelligence criteria</span>}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                    <PlayerSearchInput value={player1} onChange={setPlayer1} players={allPlayers} placeholder="Search player..." label="Primary Player" theme={theme} />
                                    <div className="flex flex-col items-center justify-end pt-6">
                                        <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Tactical VS</div>
                                        <button onClick={handleCompare} disabled={compLoading || !player1 || !player2}
                                            className={`w-full px-6 py-4 bg-gradient-to-r ${theme.btn} text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-black/20 disabled:opacity-30 disabled:grayscale active:scale-95`}>
                                            {compLoading ? "Analyzing Data..." : "⚡ Execute Comparison"}
                                        </button>
                                    </div>
                                    <PlayerSearchInput value={player2} onChange={setPlayer2} players={allPlayers} placeholder="Search player..." label="Opposition Player" theme={theme} />
                                </div>
                                {compError && <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl">⚠️ System Error: {compError}</div>}
                            </div>

                            {comparisonData && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <PlayerCompCard data={comparisonData.player1} color="cyan" theme={theme} />
                                        <PlayerCompCard data={comparisonData.player2} color="violet" theme={theme} />
                                    </div>
                                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><Database className={theme.text} size={18} /> Batting Comparison Metrics</h4>
                                        <div className="space-y-6">
                                            <CompBar label="Runs" v1={comparisonData.player1.batting.runs} v2={comparisonData.player2.batting.runs} theme={theme} />
                                            <CompBar label="Average" v1={comparisonData.player1.batting.average} v2={comparisonData.player2.batting.average} theme={theme} />
                                            <CompBar label="Strike Rate" v1={comparisonData.player1.batting.strike_rate} v2={comparisonData.player2.batting.strike_rate} theme={theme} />
                                            <CompBar label="Boundary Count" v1={comparisonData.player1.batting.fours + comparisonData.player1.batting.sixes} v2={comparisonData.player2.batting.fours + comparisonData.player2.batting.sixes} theme={theme} />
                                        </div>
                                    </div>
                                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><Target className={theme.text} size={18} /> Bowling Comparison Metrics</h4>
                                        <div className="space-y-6">
                                            <CompBar label="Wickets" v1={comparisonData.player1.bowling.wickets} v2={comparisonData.player2.bowling.wickets} theme={theme} />
                                            <CompBar label="Economy Rate" v1={comparisonData.player1.bowling.economy} v2={comparisonData.player2.bowling.economy} theme={theme} invert />
                                        </div>
                                    </div>
                                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                        <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8">📊 Statistical Visualization</h4>
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { stat: "Runs", [comparisonData.player1.name]: comparisonData.player1.batting.runs, [comparisonData.player2.name]: comparisonData.player2.batting.runs },
                                                    { stat: "Fours", [comparisonData.player1.name]: comparisonData.player1.batting.fours, [comparisonData.player2.name]: comparisonData.player2.batting.fours },
                                                    { stat: "Sixes", [comparisonData.player1.name]: comparisonData.player1.batting.sixes, [comparisonData.player2.name]: comparisonData.player2.batting.sixes },
                                                    { stat: "Wickets", [comparisonData.player1.name]: comparisonData.player1.bowling.wickets, [comparisonData.player2.name]: comparisonData.player2.bowling.wickets },
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="stat" stroke="#64748b" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                    <Bar dataKey={comparisonData.player1.name} fill={theme.primary} radius={[6, 6, 0, 0]} barSize={24} />
                                                    <Bar dataKey={comparisonData.player2.name} fill={theme.secondary || "#8b5cf6"} radius={[6, 6, 0, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <button onClick={() => handleExportComparison('excel')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all disabled:opacity-30" disabled={!comparisonData}>
                                    <FileDown size={14} /> Excel Export
                                </button>
                                <button onClick={() => handleExportComparison('pdf')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all disabled:opacity-30" disabled={!comparisonData}>
                                    <FileDown size={14} /> PDF Report
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ============ LEADERBOARD TAB ============ */}
                    {activeTab === "leaderboard" && (
                        <div className="space-y-6">
                            {filterBar}
                            <div className="flex justify-end gap-3">
                                <button onClick={() => handleExportLeaderboard('excel')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
                                    <FileDown size={14} /> Excel Export
                                </button>
                                <button onClick={() => handleExportLeaderboard('pdf')} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                    <FileDown size={14} /> PDF Report
                                </button>
                            </div>
                            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                    <TrendingUp className={theme.text} size={20} /> Top Performers: Batting
                                </h3>
                                <div className="space-y-4">
                                    {topBatsmen.map((b, i) => (
                                        <div key={b.name} className={`flex items-center justify-between bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-${theme.icon.split('-')[1]}-500/30 transition-all group`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg ${i < 3 ? `bg-gradient-to-br ${theme.btn} text-white shadow-black/20` : 'bg-white/5 text-slate-500'}`}>#{i + 1}</div>
                                                <div>
                                                    <h4 className="font-black text-white uppercase italic text-base tracking-tight">{b.name || b.full_name}</h4>
                                                    <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">Certified Elite Analyst</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="text-right"><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Total runs</p><p className={`text-xl font-black ${theme.text} italic tabular-nums`}>{b.total_runs?.toLocaleString()}</p></div>
                                                <div className="text-right hidden sm:block"><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Batting Avg</p><p className="text-xl font-black text-white italic tabular-nums">{b.batting_average ? parseFloat(b.batting_average).toFixed(2) : "—"}</p></div>
                                                <div className="text-right hidden lg:block"><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Matches</p><p className="text-xl font-black text-white italic tabular-nums">{b.matches}</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] mt-8 shadow-2xl shadow-black/40">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                    <Target className="text-violet-500" size={20} /> Top Performers: Bowling
                                </h3>
                                <div className="space-y-4">
                                    {topBowlers.map((b, i) => (
                                        <div key={b.name} className={`flex items-center justify-between bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-${theme.icon.split('-')[1]}-500/30 transition-all group`}>
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg ${i < 3 ? `bg-gradient-to-br ${theme.btn} text-white shadow-black/20` : 'bg-white/5 text-slate-500'}`}>#{i + 1}</div>
                                                <div>
                                                    <h4 className="font-black text-white uppercase italic text-base tracking-tight">{b.name || b.full_name}</h4>
                                                    <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">Bowling Specialist</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="text-right"><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Wickets</p><p className={`text-xl font-black ${theme.text} italic tabular-nums`}>{b.total_wickets}</p></div>
                                                <div className="text-right"><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Matches</p><p className="text-xl font-black text-white italic tabular-nums">{b.matches}</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ ADVANCED ANALYTICS TAB ============ */}
                    {activeTab === "advanced" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filterBar}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                                        <Microscope className={theme.text} size={22} /> Strike Rate vs Average
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold mb-8 italic">Performance benchmarking for elite run scorers</p>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis type="number" dataKey="avg" name="Average" stroke="#64748b" label={{ value: 'Average', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 'black' }} tickLine={false} axisLine={false} />
                                                <YAxis type="number" dataKey="sr" name="Strike Rate" stroke="#64748b" label={{ value: 'Strike Rate', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 'black' }} tickLine={false} axisLine={false} />
                                                <ZAxis type="number" dataKey="runs" range={[64, 400]} name="Total Runs" />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                <Scatter name="Players" data={scatterData.batting} fill={theme.primary}>
                                                    {scatterData.batting.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Scatter>
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2 flex items-center gap-3">
                                        <Target className="text-violet-500" size={22} /> Economy vs Wickets
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold mb-8 italic">Efficiency benchmarking for primary bowlers</p>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis type="number" dataKey="wickets" name="Wickets" stroke="#64748b" label={{ value: 'Wickets', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10, fontWeight: 'black' }} tickLine={false} axisLine={false} />
                                                <YAxis type="number" dataKey="econ" name="Economy" stroke="#64748b" label={{ value: 'Economy', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 'black' }} reversed tickLine={false} axisLine={false} />
                                                <ZAxis type="number" dataKey="runs" range={[64, 400]} name="Runs Conceded" />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                <Scatter name="Bowlers" data={scatterData.bowling} fill={theme.secondary || "#8b5cf6"}>
                                                    {scatterData.bowling.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                                                    ))}
                                                </Scatter>
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ TREND ANALYSIS TAB ============ */}
                    {activeTab === "trends" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filterBar}
                            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                    <TrendingUp className="text-emerald-500" size={22} /> League-Wide Scoring Trends
                                </h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData.season_trends}>
                                            <defs>
                                                <linearGradient id="colorRpo" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.primary} stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="season" stroke="#64748b" fontSize={12} fontWeight="black" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Runs Per Over', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 'black' }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                            <Area type="monotone" dataKey="rpo" stroke={theme.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorRpo)" animationDuration={1500} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                    <Activity className="text-blue-500" size={22} /> Rolling Average Performance
                                </h3>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData.rolling_avg}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="match" stroke="#64748b" fontSize={12} fontWeight="black" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line type="stepAfter" dataKey="avg" name="Team Average Score" stroke={theme.primary} strokeWidth={3} dot={{ r: 6, fill: theme.primary, strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 8 }} animationDuration={1500} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ VENUE PERFORMANCE TAB ============ */}
                    {activeTab === "venue" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filterBar}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                        <MapPin className="text-pink-500" size={22} /> Highest Scoring Venues
                                    </h3>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={venueData.venue_runs} margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis type="number" stroke="#64748b" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                                                <YAxis dataKey="venue" type="category" stroke="#64748b" fontSize={10} width={100} fontWeight="black" tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                <Bar dataKey="avg_runs" name="Avg Match Total" fill={theme.primary} radius={[0, 8, 8, 0]} barSize={25} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                        <Zap className="text-yellow-500" size={22} /> Pitch Behavior Heatmap
                                    </h3>
                                    <div className="space-y-6">
                                        {venueData.heatmap.map((h, i) => (
                                            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl shadow-lg transition-all hover:bg-white/10">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-black text-white uppercase italic tracking-widest">{h.venue}</span>
                                                    <div className="flex gap-2">
                                                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 text-[8px] font-black rounded-full uppercase border border-cyan-500/20">Batting: {h.batting}%</span>
                                                        <span className="px-3 py-1 bg-violet-500/10 text-violet-500 text-[8px] font-black rounded-full uppercase border border-violet-500/20">Bowling: {h.bowling}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                                    <div style={{ width: `${h.batting}%` }} className={`bg-gradient-to-r ${theme.btn} rounded-full`} />
                                                    <div style={{ width: `${h.bowling}%` }} className="bg-slate-700 rounded-full opacity-60 ml-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ OPPOSITION ANALYSIS TAB ============ */}
                    {activeTab === "opposition" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filterBar}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                        <Shield className="text-indigo-500" size={22} /> Tactical Performance vs Key Opponents
                                    </h3>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={deepInsights.opposition.player_vs_team}>
                                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                <PolarAngleAxis dataKey="opponent" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'black' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} />
                                                <Radar name="Runs" dataKey="runs" stroke={theme.primary} fill={theme.primary} fillOpacity={0.3} dot={{ r: 4, fill: theme.primary }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                        <PieIcon className="text-rose-500" size={22} /> Dismiss intelligence: Modus Operandi
                                    </h3>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={deepInsights.opposition.dismissals} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                    {deepInsights.opposition.dismissals.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#ffff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ PREDICTIVE STATS TAB ============ */}
                    {activeTab === "predictive" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className={`bg-gradient-to-r from-slate-900 to-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-black/40`}>
                                <div className={`p-6 bg-white/5 rounded-[2rem] shadow-xl border border-white/5`}><Brain className={theme.icon} size={48} /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Predictive Intelligence Engine</h3>
                                    <p className={`text-[10px] ${theme.text} font-black uppercase tracking-[0.3em] opacity-80 mb-3`}>Neural Network Projection · Market Analysis Analysis</p>
                                    <div className="flex flex-wrap gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">Auto-Learning Active</span>
                                        <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">Bayesian Inference Mode</span>
                                        <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5">Projected Confidence: 89%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><TrendingUp className={theme.text} size={20} /> Neural Projections: Season Out-performance</h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={deepInsights.predictive.projections}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="match" stroke="#64748b" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                <Bar dataKey="predicted" name="Predicted Score" fill={theme.primary} radius={[6, 6, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3"><Database className={theme.text} size={20} /> Model Accuracy Performance Graph</h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={deepInsights.predictive.accuracy_trend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="match" stroke="#64748b" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f1f5f9' }} />
                                                <Legend wrapperStyle={{ paddingTop: 20 }} />
                                                <Bar dataKey="act" name="Actual Intelligence" fill={theme.secondary || "#8b5cf6"} radius={[4, 4, 0, 0]} barSize={25} />
                                                <Line type="monotone" dataKey="pred" name="Model Prediction" stroke={theme.primary} strokeWidth={4} dot={{ r: 4, fill: theme.primary }} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main >

            <ProfileSettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                token={token}
                user={user}
            />
        </div >
    );
};

// ============ SUB-COMPONENTS ============

const NavItem = ({ icon, label, active, onClick, theme }) => (
    <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? `bg-gradient-to-r ${theme.btn} text-white shadow-xl shadow-black/20` : 'text-slate-400 hover:text-white hover:bg-white/5 group'}`}>
        <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors`}>{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-[0.1em]">{label}</span>
    </div>
);

const StatCard = ({ label, value, icon, theme }) => (
    <div className="bg-[#0f172a] border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl shadow-black/40 transition-all hover:border-white/10 group">
        <div className={`p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">{value ?? "—"}</h4>
        </div>
    </div>
);

const PlayerCompCard = ({ data, color, theme }) => (
    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-5 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${color === 'cyan' ? `${theme.badge} ${theme.text}` : 'bg-slate-800 text-slate-400'}`}>{data.name.charAt(0)}</div>
            <div>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{data.name || data.full_name}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{data.batting_style} · {data.bowling_style}</p>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Matches" value={data.matches} theme={theme} />
            <MiniStat label="Runs" value={data.batting.runs} theme={theme} />
            <MiniStat label="Avg" value={data.batting.average ? parseFloat(data.batting.average).toFixed(2) : "—"} theme={theme} />
            <MiniStat label="SR" value={data.batting.strike_rate} theme={theme} />
            <MiniStat label="6s" value={data.batting.sixes} theme={theme} />
            <MiniStat label="Wickets" value={data.bowling.wickets} theme={theme} />
        </div>
    </div>
);

const MiniStat = ({ label, value, theme }) => (
    <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-center transition-all hover:bg-white/10">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-sm font-black text-white italic">{value ?? 0}</p>
    </div>
);

const CompBar = ({ label, v1, v2, theme, invert = false }) => {
    const total = (v1 || 0) + (v2 || 0) || 1;
    const p1 = ((v1 || 0) / total) * 100;
    const p2 = ((v2 || 0) / total) * 100;
    const w1 = invert ? v1 < v2 : v1 > v2;
    const w2 = invert ? v2 < v1 : v2 > v1;
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-2.5 px-1">
                <span className={`text-xs font-black ${w1 ? theme.text : 'text-slate-500'}`}>{typeof v1 === 'number' && label === 'Average' ? v1.toFixed(2) : v1}</span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
                <span className={`text-xs font-black ${w2 ? theme.text : 'text-slate-500'}`}>{typeof v2 === 'number' && label === 'Average' ? v2.toFixed(2) : v2}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-white/5 gap-1 p-0.5 border border-white/5 shadow-inner">
                <div className={`${(theme.icon || 'text-cyan-500').replace('text', 'bg')} rounded-l-full transition-all duration-1000 ease-out`} style={{ width: `${p1}%` }} />
                <div className="bg-slate-700/50 rounded-r-full transition-all duration-1000 ease-out" style={{ width: `${p2}%` }} />
            </div>
        </div>
    );
};

export default AnalystDashboard;
