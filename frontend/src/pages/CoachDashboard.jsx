import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import YearSelector from "../components/YearSelector";

// ✅ Recharts components go here
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend,
  ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts';

import {
  Target, Zap, Users, Activity, Star, LogOut, Search, ClipboardList, ChevronRight,
  Trash2, Edit3, Cpu, FileDown, Layers, TrendingUp, BarChart3, Database, HeartPulse, Settings,
  Menu, X
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import StatComparisonRow from '../components/StatComparisonRow';
import SearchableDropdown from '../components/SearchableDropdown';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
// === IPL TEAM COLOR THEMES (Premium Deep Navy Optimized) ===
const TEAM_COLORS = {
  "Chennai Super Kings": { primary: "#FDB913", secondary: "#1E7D82", text: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-400", btn: "from-amber-500 to-yellow-600", icon: "text-amber-500", border: "border-amber-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-amber-600 hover:text-white border border-white/5" },
  "Mumbai Indians": { primary: "#004BA0", secondary: "#FDB913", text: "text-blue-400", bg: "bg-blue-500/10", badge: "bg-blue-500/10 text-blue-400", btn: "from-blue-600 to-blue-800", icon: "text-blue-400", border: "border-blue-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-blue-600 hover:text-white border border-white/5" },
  "Gujarat Titans": { primary: "#1B2133", secondary: "#C026D3", text: "text-slate-300", bg: "bg-slate-500/10", badge: "bg-white/10 text-white", btn: "from-[#1B2133] to-[#334155]", icon: "text-slate-400", border: "border-slate-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5" },
  "Lucknow Super Giants": { primary: "#1E7D82", secondary: "#FF822E", text: "text-teal-400", bg: "bg-teal-500/10", badge: "bg-teal-500/10 text-teal-400", btn: "from-teal-600 to-cyan-700", icon: "text-teal-500", border: "border-teal-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-teal-600 hover:text-white border border-white/5" },
  "Sunrisers Hyderabad": { primary: "#FF822E", secondary: "#FDB913", text: "text-orange-400", bg: "bg-orange-500/10", badge: "bg-orange-500/10 text-orange-400", btn: "from-orange-600 to-red-600", icon: "text-orange-500", border: "border-orange-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-orange-600 hover:text-white border border-white/5" },
  "Royal Challengers Bengaluru": { primary: "#EC1C24", secondary: "#FDB913", text: "text-red-400", bg: "bg-red-500/10", badge: "bg-red-500/10 text-red-400", btn: "from-red-600 to-red-800", icon: "text-red-500", border: "border-red-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-red-600 hover:text-white border border-white/5" },
  "Kolkata Knight Riders": { primary: "#3A225D", secondary: "#FDB913", text: "text-purple-400", bg: "bg-purple-500/10", badge: "bg-purple-500/10 text-purple-400", btn: "from-purple-600 to-purple-800", icon: "text-purple-500", border: "border-purple-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-purple-600 hover:text-white border border-white/5" },
  "Delhi Capitals": { primary: "#17479E", secondary: "#EC1C24", text: "text-blue-400", bg: "bg-blue-500/10", badge: "bg-blue-400/10 text-blue-400", btn: "from-blue-600 to-blue-800", icon: "text-blue-400", border: "border-blue-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-blue-600 hover:text-white border border-white/5" },
  "Punjab Kings": { primary: "#ED1B24", secondary: "#FDB913", text: "text-rose-400", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-400", btn: "from-rose-600 to-red-700", icon: "text-rose-500", border: "border-rose-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-rose-600 hover:text-white border border-white/5" },
  "Kings XI Punjab": { primary: "#ED1B24", secondary: "#FDB913", text: "text-rose-400", bg: "bg-rose-500/10", badge: "bg-rose-500/10 text-rose-400", btn: "from-rose-600 to-red-700", icon: "text-rose-500", border: "border-rose-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-rose-600 hover:text-white border border-white/5" },
  "Rajasthan Royals": { primary: "#EA1A8C", secondary: "#17479E", text: "text-pink-400", bg: "bg-pink-500/10", badge: "bg-pink-500/10 text-pink-400", btn: "from-pink-600 to-fuchsia-700", icon: "text-pink-500", border: "border-pink-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-pink-600 hover:text-white border border-white/5" },
  "Deccan Chargers": { primary: "#F7A721", secondary: "#17479E", text: "text-orange-400", bg: "bg-orange-500/10", badge: "bg-orange-500/10 text-orange-400", btn: "from-orange-600 to-orange-800", icon: "text-orange-500", border: "border-orange-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-orange-600 hover:text-white border border-white/5" },
  "Kochi Tuskers Kerala": { primary: "#F15A29", secondary: "#0EA5E9", text: "text-amber-400", bg: "bg-amber-500/10", badge: "bg-amber-500/10 text-amber-400", btn: "from-amber-600 to-orange-700", icon: "text-amber-500", border: "border-amber-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-amber-600 hover:text-white border border-white/5" },
  "Pune Warriors": { primary: "#17479E", secondary: "#EC1C24", text: "text-indigo-400", bg: "bg-indigo-500/10", badge: "bg-indigo-500/10 text-indigo-400", btn: "from-indigo-600 to-indigo-800", icon: "text-indigo-500", border: "border-indigo-500/20", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-indigo-600 hover:text-white border border-white/5" },
  "General": { primary: "#06b6d4", secondary: "#8b5cf6", text: "text-cyan-400", bg: "bg-cyan-500/10", badge: "bg-cyan-500/10 text-cyan-400", btn: "from-cyan-600 to-blue-700", icon: "text-cyan-500", border: "border-white/5", nav: "bg-[#0f172a] border-b border-white/5 text-white", btnSecondary: "bg-white/5 text-slate-300 hover:bg-cyan-600 hover:text-white border border-white/5" }
};

const DEFAULT_THEME = {
  primary: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-400",
  border: "border-white/5", shadow: "shadow-black/20",
  ring: "ring-slate-500/20", badge: "bg-cyan-500/10 text-cyan-400",
  btn: "from-cyan-600 to-blue-700", nav: "bg-[#0f172a] border-b border-white/5 text-white",
  hover: "hover:border-white/10",
  btnSecondary: "bg-white/5 text-slate-300 hover:bg-cyan-600 hover:text-white border border-white/5",
  icon: "text-cyan-500"
};


const CoachDashboard = () => {
  const { user, logout } = useContext(AuthContext); // Use logout from context
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("squad");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);

  // Auto-Squad Generation States
  const [squadOptions, setSquadOptions] = useState(null);
  const [generatingSquad, setGeneratingSquad] = useState(false);

  // Advanced Analytics States
  const [comparisonPlayers, setComparisonPlayers] = useState({ p1: "", p2: "" });
  const [comparisonData, setComparisonData] = useState(null);
  const [matchupPlayers, setMatchupPlayers] = useState({ batsman: "", bowler: "" });
  const [matchupData, setMatchupData] = useState(null);
  const [teamContribution, setTeamContribution] = useState([]);
  const [playerForm, setPlayerForm] = useState(null);
  const [workloadStats, setWorkloadStats] = useState({ fatigue_trend: [], weekly_metabolic: [] });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchInsights, setMatchInsights] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  const [formData, setFormData] = useState({ name: "", team_id: "", batting_style: "", bowling_style: "", height_cm: "", weight_kg: "", fitness_score: "" });
  const [trainingFormData, setTrainingFormData] = useState({
    date: "",
    time: "",
    venue: "",
    intensity: "Medium",
    drills: ""
  });

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      logout();
      navigate("/");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const q = `year=${selectedYear}`;
    setLoading(true);
    try {
      const [squadRes, statsRes, matchesRes, perfRes, trainingRes, allPlayersRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/analytics/squad/?${q}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/dashboard/?${q}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/analytics/team-matches/?${q}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/analytics/team-performance/?${q}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/training/sessions/`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/players/list/`, { headers })
      ]);
      setPlayers(squadRes.data.players || []);
      setAllPlayers(allPlayersRes.data || []);
      setTeamStats(statsRes.data);
      setMatches(matchesRes.data || []);
      setPerformanceData(perfRes.data || []);
      setTrainingSessions(trainingRes.data || []);

      if (matchesRes.data?.[0]) {
        fetchMatchInsights(matchesRes.data[0].match_id);
      }
    } catch (err) {
      console.error("Error fetching core dashboard data:", err);
      if (err.response?.status === 401) {
        logout();
        navigate("/");
      }
    }

    // Fetch advanced analytics independently to prevent blocking
    try {
      axios.get(`http://127.0.0.1:8000/api/analytics/team-contribution/?year=${selectedYear}`, { headers })
        .then(res => setTeamContribution(res.data || []))
        .catch(err => console.error("Error fetching team contribution:", err));

      axios.get(`http://127.0.0.1:8000/api/analytics/workload-stats/?year=${selectedYear}`, { headers })
        .then(res => setWorkloadStats(res.data || { fatigue_trend: [], weekly_metabolic: [] }))
        .catch(err => console.error("Error fetching workload stats:", err));
    } catch (err) {
      console.error("Error initiating advanced analytics fetches:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncSpecificPlayer = async (player) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/players/fetch-external-styles/?name=${encodeURIComponent(player.name)}`, { headers });

      const payload = {
        ...player,
        batting_style: res.data.batting_style || player.batting_style,
        bowling_style: res.data.bowling_style || player.bowling_style,
        team: player.team
      };

      await axios.put(`http://127.0.0.1:8000/api/players/edit/${player.id}/`, payload, { headers });
      fetchDashboardData();
    } catch (err) {
      console.error("Manual sync failure:", err);
    }
  };

  const syncAllSquad = async () => {
    if (!window.confirm("Batch sync all squad player styles from Wikipedia? This may take a few moments.")) return;
    const token = localStorage.getItem("access");
    const headers = { Authorization: `Bearer ${token}` };

    setLoading(true);
    try {
      for (const player of players) {
        // Individual fetch to respect Wikipedia/Backend structure
        const res = await axios.get(`http://127.0.0.1:8000/api/players/fetch-external-styles/?name=${encodeURIComponent(player.name)}`, { headers });
        const payload = {
          ...player,
          batting_style: res.data.batting_style || player.batting_style,
          bowling_style: res.data.bowling_style || player.bowling_style,
        };
        await axios.put(`http://127.0.0.1:8000/api/players/edit/${player.id}/`, payload, { headers });
      }
      fetchDashboardData();
      alert("✅ Squad synchronization complete!");
    } catch (err) {
      console.error("Batch sync error:", err);
      alert("Error during squad sync.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchInsights = async (matchId) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/analytics/match-insights/${matchId}/`, { headers });
      setMatchInsights(res.data);
      setSelectedMatch(matchId);
    } catch (err) {
      console.error("Error fetching match insights:", err);
    }
  };

  const fetchPlayerComparison = async (p1, p2) => {
    if (!p1 || !p2) return;
    const token = localStorage.getItem("access");
    if (!token) { logout(); navigate("/"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/analytics/player-comparison/?player1=${p1}&player2=${p2}`, { headers });
      setComparisonData(res.data);
    } catch (err) {
      console.error("Error fetching comparison:", err);
      if (err.response?.status === 401) { logout(); navigate("/"); }
    }
  };

  const fetchHeadToHeadMatchup = async (batsman, bowler) => {
    if (!batsman || !bowler) return;
    const token = localStorage.getItem("access");
    if (!token) { logout(); navigate("/"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/matchup/${batsman}/vs/${bowler}/`, { headers });
      setMatchupData(res.data);
    } catch (err) {
      console.error("Error fetching matchup:", err);
      if (err.response?.status === 401) { logout(); navigate("/"); }
    }
  };

  const fetchPlayerForm = async (playerName) => {
    const token = localStorage.getItem("access");
    if (!token) { logout(); navigate("/"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/analytics/player-form/${playerName}/`, { headers });
      setPlayerForm({ name: playerName, history: res.data });
    } catch (err) {
      console.error("Error fetching form:", err);
      if (err.response?.status === 401) { logout(); navigate("/"); }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const handleLogout = () => {
    logout(); // Use context logout
    navigate("/", { replace: true });
  };

  const openModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        team_id: player.team || teamStats?.team_id || "",
        batting_style: player.batting_style || "",
        bowling_style: player.bowling_style || "",
        height_cm: player.height_cm || "",
        weight_kg: player.weight_kg || "",
        fitness_score: player.fitness_score || ""
      });
    } else {
      setEditingPlayer(null);
      setFormData({ name: "", team_id: teamStats?.team_id || "", batting_style: "", bowling_style: "", height_cm: "", weight_kg: "", fitness_score: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
    try {
      const payload = { ...formData };
      if (payload.team_id) payload.team = payload.team_id;
      else payload.team = null;

      if (payload.height_cm === "") payload.height_cm = null;
      if (payload.weight_kg === "") payload.weight_kg = null;
      if (payload.fitness_score === "") payload.fitness_score = null;

      if (editingPlayer) {
        await axios.put(`http://127.0.0.1:8000/api/players/edit/${editingPlayer.id}/`, payload, { headers });
      } else {
        await axios.post("http://127.0.0.1:8000/api/players/add/", payload, { headers });
      }
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert("Error saving player: " + (err.response?.data?.name?.[0] || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Terminate operative entry?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/players/delete/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Deletion failure:", err);
    }
  };

  const handleTrainingDelete = async (id) => {
    if (!window.confirm("Cancel this training session?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/training/sessions/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Training cancellation failure:", err);
    }
  };

  const openTrainingModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setTrainingFormData({
        date: session.date,
        time: session.time,
        venue: session.venue,
        intensity: session.intensity,
        drills: session.drills
      });
    } else {
      setEditingSession(null);
      setTrainingFormData({
        date: "",
        time: "",
        venue: "",
        intensity: "Medium",
        drills: ""
      });
    }
    setIsTrainingModalOpen(true);
  };

  const handleTrainingSave = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
    try {
      if (editingSession) {
        await axios.put(`http://127.0.0.1:8000/api/training/sessions/${editingSession.id}/`, trainingFormData, { headers });
      } else {
        await axios.post("http://127.0.0.1:8000/api/training/sessions/", trainingFormData, { headers });
      }
      setIsTrainingModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to save training session:", err);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
      const res = await axios.post("http://127.0.0.1:8000/api/training/auto-generate/", {}, { headers });
      setPerformanceAnalysis(res.data.analysis);
      setTrainingSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Auto-generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const theme = TEAM_COLORS[teamStats?.team_name] || DEFAULT_THEME;

  const handleExportSquad = async (format) => {
    const headersList = ['#', 'Name', 'Batting Style', 'Bowling Style'];
    const rows = players.map((p, i) => [i + 1, p.full_name || p.name, p.batting_style || '-', p.bowling_style || '-']);
    const title = `${teamStats?.team_name || 'Team'} — Squad Roster`;

    if (format === 'pdf') {
      exportToPDF(title, headersList, rows, 'squad_roster');
      logActivity('REPORT_PDF', 'Exported Squad Roster PDF');
    } else {
      exportToExcel('Squad', headersList, rows, 'squad_roster');
      logActivity('REPORT_EXCEL', 'Exported Squad Roster Excel');
    }
  };

  const handleExportMatches = async (format) => {
    const headersList = ['Match ID', 'Opponent', 'Venue', 'Date', 'Result'];
    const rows = matches.map(m => [
      m.match_id,
      m.team1 === teamStats?.team_name ? m.team2 : m.team1,
      m.venue || '-',
      m.match_date || '-',
      m.winner === teamStats?.team_name ? 'Won' : m.winner ? 'Lost' : 'N/A'
    ]);
    const title = `${teamStats?.team_name || 'Team'} — Match History`;

    if (format === 'pdf') {
      exportToPDF(title, headersList, rows, 'match_history');
      logActivity('REPORT_PDF', 'Exported Match History PDF');
    } else {
      exportToExcel('Matches', headersList, rows, 'match_history');
      logActivity('REPORT_EXCEL', 'Exported Match History Excel');
    }
  };

  const handleExportTraining = async (format) => {
    const headersList = ['Date', 'Time', 'Venue', 'Intensity', 'Drills / Objectives'];
    const rows = trainingSessions.map(s => [s.date, s.time, s.venue, s.intensity, s.drills || '-']);
    const title = `${teamStats?.team_name || 'Team'} — Training Plan`;

    if (format === 'pdf') {
      exportToPDF(title, headersList, rows, 'training_plan');
      logActivity('REPORT_PDF', 'Exported Training Plan PDF');
    } else {
      exportToExcel('Training', headersList, rows, 'training_plan');
      logActivity('REPORT_EXCEL', 'Exported Training Plan Excel');
    }
  };

  const handleExportAutoSquad = async (format) => {
    if (!squadOptions) {
      alert("Please generate squads first.");
      return;
    }
    const headersList = ['Option', 'Player', 'Role', 'Key Metric'];
    const rows = [];
    squadOptions.forEach((opt, idx) => {
      opt.players.forEach(p => {
        rows.push([`Option ${idx + 1}: ${opt.name}`, p.full_name || p.name, p.role, `${p.stat_value} ${p.stat_label}`]);
      });
    });
    const title = `${teamStats?.team_name || 'Team'} — Tactical Squad Options`;

    if (format === 'pdf') {
      exportToPDF(title, headersList, rows, 'tactical_squad_options');
      logActivity('REPORT_PDF', 'Exported Tactical Squad Options PDF');
    } else {
      exportToExcel('Squad Options', headersList, rows, 'tactical_squad_options');
      logActivity('REPORT_EXCEL', 'Exported Tactical Squad Options Excel');
    }
  };


  const logActivity = async (action, details) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
      await axios.post('http://127.0.0.1:8000/api/admin/log-action/', { action, details }, { headers });
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white uppercase tracking-[0.3em] font-black italic animate-pulse">Initialising Squad Data...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-400 font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-amber-500/30">

      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f172a] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className={`${theme.bg} p-1.5 rounded-xl shadow-lg ${theme.shadow} border border-white/5`}>
            <Target className={theme.text} size={18} />
          </div>
          <h1 className="text-sm font-black text-white tracking-tight uppercase italic">Coach<span className={theme.text}>Center</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className={`${theme.text} p-2 hover:bg-white/5 rounded-xl transition-all`}>
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
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#0f172a] z-[70] lg:hidden transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full border-r border-white/5'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#020617]/50">
          <div className="flex items-center gap-2">
            <div className={`${theme.bg} p-1.5 rounded-xl shadow-lg ${theme.shadow} border border-white/5`}>
              <Target className={theme.text} size={20} />
            </div>
            <h1 className="text-lg font-black text-white tracking-tight uppercase italic">Coach<span className={theme.text}>Center</span></h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 p-2 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-180px)]">
          <NavItem icon={<Users size={18} />} label="Squad Management" active={activeTab === "squad"} onClick={() => { setActiveTab("squad"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<Layers size={18} />} label="Player Comparison" active={activeTab === "comparison"} onClick={() => { setActiveTab("comparison"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<BarChart3 size={18} />} label="Team Analytics" active={activeTab === "team"} onClick={() => { setActiveTab("team"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<TrendingUp size={18} />} label="Performance & Form" active={activeTab === "form"} onClick={() => { setActiveTab("form"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<Database size={18} />} label="Match Insights" active={activeTab === "insights"} onClick={() => { setActiveTab("insights"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<ClipboardList size={18} />} label="Training Planner" active={activeTab === "training"} onClick={() => { setActiveTab("training"); setIsMobileMenuOpen(false); }} theme={theme} />
          <NavItem icon={<Zap size={18} />} label="Auto-Generate Squad" active={activeTab === "autosquad"} onClick={() => { setActiveTab("autosquad"); setIsMobileMenuOpen(false); }} theme={theme} />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#020617]/50">
          <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${theme.btnSecondary}`}>
            <LogOut size={14} /> Log Out Operative
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="w-48 border-r border-white/5 bg-[#0f172a] hidden lg:flex flex-col sticky top-0 h-screen">
        {/* LOGO */}
        <div className="px-5 py-4 flex items-center gap-2 border-b border-white/5">
          <div className={`${theme.bg} p-1.5 rounded-lg shadow-lg border border-white/5 flex-shrink-0`}>
            <Target className={theme.text} size={16} />
          </div>
          <h1 className="text-sm font-black text-white tracking-tight uppercase">COACH<span className={theme.text}>CENTER</span></h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={<Users size={15} />} label="Squad Management" active={activeTab === "squad"} onClick={() => setActiveTab("squad")} theme={theme} />
          <NavItem icon={<Layers size={15} />} label="Player Comparison" active={activeTab === "comparison"} onClick={() => setActiveTab("comparison")} theme={theme} />
          <NavItem icon={<BarChart3 size={15} />} label="Team Analytics" active={activeTab === "team"} onClick={() => setActiveTab("team")} theme={theme} />
          <NavItem icon={<TrendingUp size={15} />} label="Performance & Form" active={activeTab === "form"} onClick={() => setActiveTab("form")} theme={theme} />
          <NavItem icon={<Database size={15} />} label="Match Insights" active={activeTab === "insights"} onClick={() => setActiveTab("insights")} theme={theme} />
          <NavItem icon={<ClipboardList size={15} />} label="Training Planner" active={activeTab === "training"} onClick={() => setActiveTab("training")} theme={theme} />
          <NavItem icon={<Zap size={15} />} label="Auto Generate Squad" active={activeTab === "autosquad"} onClick={() => setActiveTab("autosquad")} theme={theme} />
        </nav>

        {/* USER + BUTTONS */}
        <div className="px-3 pb-4 border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center ${theme.text} text-xs font-black border border-white/10 flex-shrink-0`}>
              {user?.username?.charAt(0).toUpperCase() || "C"}
            </div>
            <div className="truncate">
              <p className="text-[9px] font-black text-white truncate uppercase">{user?.username || "Head Coach"}</p>
              <p className={`text-[8px] ${theme.text} uppercase font-black tracking-widest`}>Commanding</p>
            </div>
          </div>
          <button onClick={() => setIsProfileModalOpen(true)} className={`w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white`}>
            <Settings size={11} /> Settings
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white`}>
            <LogOut size={11} /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto lg:h-screen bg-[#020617]">
        <header className="hidden lg:flex h-14 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-2xl items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} />
            <div className="h-5 w-px bg-white/10" />
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Command Center: <span className="text-white">{teamStats?.team_name || "GLOBAL UNIT"}</span></span>
            <span className="bg-emerald-500/10 text-emerald-500 text-[8px] px-2.5 py-1 rounded-full font-black flex items-center gap-1.5 border border-emerald-500/20 tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "squad" && (
              <>
                <button
                  onClick={syncAllSquad}
                  disabled={loading}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${theme.btnSecondary}`}
                >
                  <Cpu size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing Intelligence..." : "Batch Sync"}
                </button>
                <button
                  onClick={() => openModal()}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 bg-gradient-to-r ${theme.btn} text-white shadow-black/20`}
                >
                  <Zap size={14} /> Add Operative
                </button>
              </>
            )}
            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => {
                if (activeTab === 'squad') handleExportSquad('excel');
                else if (activeTab === 'insights') handleExportMatches('excel');
                else if (activeTab === 'training') handleExportTraining('excel');
                else if (activeTab === 'autosquad') handleExportAutoSquad('excel');
                else exportToExcel([], `coach_${activeTab}_data`);
              }}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${theme.btnSecondary}`}>
                <FileDown size={14} /> <span className="hidden xl:inline">Excel</span>
              </button>
              <button onClick={() => {
                if (activeTab === 'squad') handleExportSquad('pdf');
                else if (activeTab === 'insights') handleExportMatches('pdf');
                else if (activeTab === 'training') handleExportTraining('pdf');
                else if (activeTab === 'autosquad') handleExportAutoSquad('pdf');
                else exportToPDF([], `Coach ${activeTab.toUpperCase()} REPORT`, [`${activeTab.toUpperCase()} Data`]);
              }}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${theme.btnSecondary}`}>
                <FileDown size={14} /> <span className="hidden xl:inline">PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE ACTION BAR */}
        <div className="lg:hidden p-4 border-b border-white/5 bg-[#0f172a] flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {activeTab === "squad" && (
            <div className="flex gap-2">
              <button
                onClick={syncAllSquad}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest ${theme.btnSecondary}`}
              >
                <Cpu size={12} /> Sync
              </button>
              <button
                onClick={() => openModal()}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-gradient-to-r ${theme.btn} text-white shadow-xl shadow-black/20`}
              >
                <Zap size={12} /> Add
              </button>
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={() => {
              if (activeTab === 'squad') handleExportSquad('excel');
              else if (activeTab === 'insights') handleExportMatches('excel');
              else if (activeTab === 'training') handleExportTraining('excel');
              else exportToExcel([], `coach_${activeTab}_data`);
            }} className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-xl ${theme.btnSecondary}`}>Excel</button>
            <button onClick={() => {
              if (activeTab === 'squad') handleExportSquad('pdf');
              else if (activeTab === 'insights') handleExportMatches('pdf');
              else if (activeTab === 'training') handleExportTraining('pdf');
              else exportToPDF([], `Coach ${activeTab.toUpperCase()} REPORT`, [`${activeTab.toUpperCase()} Data`]);
            }} className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-xl ${theme.btnSecondary}`}>PDF</button>
          </div>
        </div>

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CoachStatCard label="In-Field Engagements" value={teamStats?.total_matches || 0} trend="Total Matches" icon={<Activity className="text-blue-500" />} />
            <CoachStatCard label="Unit Victories" value={teamStats?.wins || 0} trend={teamStats?.win_rate || "0% SUCCESS"} icon={<Star className="text-amber-500" />} />
            <CoachStatCard label="Active Personnel" value={teamStats?.total_players || 0} trend="Squad Roster" icon={<Users className="text-emerald-500" />} theme={theme} />
          </div>

          {activeTab === "squad" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Squad Roster Intelligence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((p) => (
                  <div key={p.id} className="group bg-[#0f172a] border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-5 relative overflow-hidden transition-all hover:border-amber-500/30 shadow-2xl shadow-black/40">
                    <div className="w-16 h-16 rounded-3xl bg-[#0b1120] flex items-center justify-center font-black text-white overflow-hidden border border-white/5 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      {p.img ? p.img : (p.full_name || p.name).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-white uppercase italic truncate pr-16">{p.name || p.full_name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.full_name || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} border border-white/5 uppercase tracking-tighter`}>{p.role || "OPERATIVE"}</span>
                      </div>
                    </div>

                    {/* Management Controls */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => openModal(p)} className={`p-2.5 rounded-xl transition-all ${theme.btnSecondary}`}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className={`p-2.5 rounded-xl transition-all ${theme.btnSecondary}`}>
                        <Trash2 size={14} className="text-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "comparison" && (
            <div className="space-y-10">
              <div className="bg-[#0f172a] border border-white/5 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-white/5 pb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Strategic Duel</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Side-by-side performance matrix</p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <SearchableDropdown
                      options={allPlayers}
                      value={comparisonPlayers.p1}
                      onChange={(newP1) => {
                        setComparisonPlayers(prev => ({ ...prev, p1: newP1 }));
                        fetchPlayerComparison(newP1, comparisonPlayers.p2);
                      }}
                      placeholder="Select Operative Alpha"
                    />
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">VS</div>
                    <SearchableDropdown
                      options={allPlayers}
                      value={comparisonPlayers.p2}
                      onChange={(newP2) => {
                        setComparisonPlayers(prev => ({ ...prev, p2: newP2 }));
                        fetchPlayerComparison(comparisonPlayers.p1, newP2);
                      }}
                      placeholder="Select Operative Beta"
                    />
                  </div>
                </div>

                {comparisonData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="h-[450px]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 text-center bg-[#0b1120] py-2 rounded-xl border border-white/5 w-fit mx-auto px-6 italic">Tactical Matrix (Skill Analysis)</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { subject: 'Runs', A: comparisonData.player1.batting.runs, B: comparisonData.player2.batting.runs, fullMark: Math.max(comparisonData.player1.batting.runs, comparisonData.player2.batting.runs) },
                          { subject: 'SR', A: comparisonData.player1.batting.strike_rate, B: comparisonData.player2.batting.strike_rate, fullMark: 200 },
                          { subject: 'Wickets', A: comparisonData.player1.bowling.wickets * 20, B: comparisonData.player2.bowling.wickets * 20, fullMark: 100 },
                          { subject: 'Econ', A: (15 - comparisonData.player1.bowling.economy) * 10, B: (15 - comparisonData.player2.bowling.economy) * 10, fullMark: 150 },
                          { subject: 'Matches', A: comparisonData.player1.matches * 2, B: comparisonData.player2.matches * 2, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                          <Radar name={comparisonData.player1.name || comparisonData.player1.full_name} dataKey="A" stroke={theme.primary} fill={theme.primary} fillOpacity={0.4} />
                          <Radar name={comparisonData.player2.name || comparisonData.player2.full_name} dataKey="B" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 italic">Head-to-Head Statistics</h4>
                      <div className="space-y-5">
                        <StatComparisonRow label="Career Runs" v1={comparisonData.player1.batting.runs} v2={comparisonData.player2.batting.runs} theme={theme} />
                        <StatComparisonRow label="Strike Rate" v1={comparisonData.player1.batting.strike_rate} v2={comparisonData.player2.batting.strike_rate} theme={theme} />
                        <StatComparisonRow label="Wickets" v1={comparisonData.player1.bowling.wickets} v2={comparisonData.player2.bowling.wickets} theme={theme} />
                        <StatComparisonRow label="Economy" v1={comparisonData.player1.bowling.economy} v2={comparisonData.player2.bowling.economy} inverse theme={theme} />
                        <StatComparisonRow label="Sixes" v1={comparisonData.player1.batting.sixes} v2={comparisonData.player2.batting.sixes} theme={theme} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[350px] flex flex-col items-center justify-center text-slate-600 gap-6">
                    <Layers size={50} className="opacity-10 animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] italic opacity-50">Select operative assets for duel comparison</p>
                  </div>
                )}
              </div>

              {/* HEAD TO HEAD BATSMAN VS BOWLER */}
              <div className="bg-[#0f172a] border border-white/5 p-8 lg:p-12 rounded-[2.5rem] mt-10 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 mb-10 gap-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <Zap size={24} className="text-orange-500" /> Direct Duel
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Tactical Matchup Identification</p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <SearchableDropdown
                      options={allPlayers}
                      value={matchupPlayers.batsman}
                      onChange={(newBatsman) => {
                        setMatchupPlayers(prev => ({ ...prev, batsman: newBatsman }));
                        fetchHeadToHeadMatchup(newBatsman, matchupPlayers.bowler);
                      }}
                      placeholder="Select Striker"
                    />
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">VS</div>
                    <SearchableDropdown
                      options={allPlayers}
                      value={matchupPlayers.bowler}
                      onChange={(newBowler) => {
                        setMatchupPlayers(prev => ({ ...prev, bowler: newBowler }));
                        fetchHeadToHeadMatchup(matchupPlayers.batsman, newBowler);
                      }}
                      placeholder="Select Bowler"
                    />
                  </div>
                </div>

                {matchupData ? (
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#0b1120] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl group hover:border-amber-500/20 transition-all">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-[0.2em]">Total Runs</p>
                      <span className="text-4xl lg:text-5xl font-black text-white italic group-hover:scale-110 transition-transform">{matchupData.matchup_stats.runs}</span>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl group hover:border-amber-500/20 transition-all">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-[0.2em]">Balls Faced</p>
                      <span className="text-4xl lg:text-5xl font-black text-white italic group-hover:scale-110 transition-transform">{matchupData.matchup_stats.balls}</span>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl group hover:border-amber-500/20 transition-all">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-[0.2em]">Strike Rate</p>
                      <span className={`text-4xl lg:text-5xl font-black ${theme.text} italic group-hover:scale-110 transition-transform`}>{matchupData.matchup_stats.strike_rate}</span>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl group hover:border-rose-500/20 transition-all">
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl" />
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-[0.2em] z-10">Dismissals</p>
                      <span className="text-4xl lg:text-5xl font-black text-rose-500 italic z-10 group-hover:scale-110 transition-transform">{matchupData.matchup_stats.dismissals}</span>
                    </div>
                    <div className="bg-[#0b1120]/50 border border-white/5 p-6 rounded-3xl flex justify-between items-center md:col-span-2 shadow-xl">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Dot Ball Percentage</span>
                      <span className="font-black text-white text-lg tracking-tighter">{matchupData.matchup_stats.dot_percentage}%</span>
                    </div>
                    <div className="bg-[#0b1120]/50 border border-white/5 p-6 rounded-3xl flex justify-between items-center md:col-span-2 shadow-xl">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Boundary Distribution (4s / 6s)</span>
                      <span className="font-black text-white text-lg tracking-tighter">{matchupData.matchup_stats.fours} / {matchupData.matchup_stats.sixes}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-slate-600 gap-6">
                    <Target size={50} className="opacity-10 animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] italic opacity-50">Identify combatants for H2H intelligence</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit">Combat Efficiency (Win/Loss)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Victories', value: teamStats?.wins || 0 },
                            { name: 'Defeats', value: (teamStats?.total_matches || 0) - (teamStats?.wins || 0) }
                          ]}
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          <Cell fill={theme.primary} />
                          <Cell fill="#cbbc14ff" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '30px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit">Top Tactical Contributors</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamContribution.length > 0 ? teamContribution.slice(0, 10) : []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tick={{ fill: '#64748b', fontWeight: 'bold' }} interval={0} angle={-30} textAnchor="end" height={60} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                        <Bar dataKey="runs" fill={theme.primary} radius={[12, 12, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit">Historical Progression Trend</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.primary} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="season" stroke="#64748b" fontSize={10} fontStyle="italic" />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="wins" stroke={theme.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorWins)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "form" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="bg-[#0f172a] border border-white/5 p-10 lg:p-12 rounded-[3.rem] shadow-2xl shadow-black/40">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-8 border-b border-white/5">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Individual Form Matrix</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Live performance tracking module</p>
                  </div>
                  <select
                    onChange={(e) => fetchPlayerForm(e.target.value)}
                    className="bg-[#0b1120] border border-white/10 rounded-2xl px-6 py-3.5 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all uppercase tracking-widest cursor-pointer hover:border-white/20 custom-select"
                  >
                    <option value="">Select Personnel</option>
                    {players.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                {playerForm ? (
                  <div className="h-[400px]">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 text-center italic">{playerForm.name}'s Operational Volatility (Last 5 Engagements)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={playerForm.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="match" stroke="#64748b" fontSize={10} fontStyle="italic" />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                        <Bar dataKey="runs" fill={theme.primary} radius={[12, 12, 0, 0]} barSize={50} />
                        <Line type="monotone" dataKey="runs" stroke="#64748b" strokeWidth={3} dot={{ fill: '#64748b', r: 6, strokeWidth: 2, stroke: '#0f172a' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-slate-600 gap-6">
                    <TrendingUp size={50} className="opacity-10 animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] italic opacity-50">Select operative to visualize form volatility</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 flex items-center gap-3">
                    <HeartPulse size={20} className="text-rose-500" /> Bio-Workload Index
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={workloadStats?.fatigue_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                        <Area type="monotone" name="Workload" dataKey="workload" stackId="1" stroke={theme.primary} strokeWidth={3} fill={theme.primary} fillOpacity={0.4} />
                        <Area type="monotone" name="Fatigue" dataKey="fatigue" stackId="1" stroke="#f43f5e" strokeWidth={3} fill="#f43f5e" fillOpacity={0.2} />
                        <Legend verticalAlign="top" height={36} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10">Metabolic Consistency Score</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workloadStats?.weekly_metabolic}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="week" stroke="#64748b" fontSize={10} fontStyle="italic" />
                        <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                        <Bar dataKey="score" fill="#10b981" radius={[12, 12, 12, 12]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="lg:w-1/3 bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40 h-fit">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-8 pb-4 border-b border-white/5 w-fit">Tactical Engagements</h3>
                  <div className="space-y-3 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar">
                    {matches.map(m => (
                      <button
                        key={m.match_id}
                        onClick={() => fetchMatchInsights(m.match_id)}
                        className={`w-full text-left py-5 px-6 rounded-[2rem] border transition-all duration-300 shadow-xl ${selectedMatch === m.match_id ? `bg-white/10 border-amber-500/30 text-white` : 'bg-[#0b1120] border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
                      >
                        <div className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60 italic">{m.date}</div>
                        <div className="text-[12px] font-black uppercase italic truncate tracking-tight">{m.team1} <span className="text-slate-700 mx-1">VS</span> {m.team2}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {matchInsights ? (
                  <div className="lg:w-2/3 space-y-10">
                    <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                      <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit italic">Historical Worm (Delta Progression)</h3>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={matchInsights.worm}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="ball" stroke="#64748b" fontSize={8} interval={24} fontStyle="italic" />
                            <YAxis stroke="#64748b" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                            <Line type="monotone" name={matchInsights.teams[0]} dataKey="team1" stroke={theme.primary} strokeWidth={4} dot={false} connectNulls />
                            <Line type="monotone" name={matchInsights.teams[1]} dataKey="team2" stroke="#64748b" strokeWidth={4} dot={false} connectNulls />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-2xl shadow-black/40">
                      <h3 className="text-sm font-black text-white uppercase italic tracking-[0.3em] mb-10 pb-4 border-b border-white/5 w-fit italic">Manhattan Chart (Aggression Matrix)</h3>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={matchInsights.manhattan}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="over" stroke="#64748b" fontSize={10} fontStyle="italic" />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                            <Bar name={matchInsights.teams[0]} dataKey="team1" fill={theme.primary} radius={[6, 6, 0, 0]} barSize={20} />
                            <Bar name={matchInsights.teams[1]} dataKey="team2" fill="#334155" radius={[6, 6, 0, 0]} barSize={20} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lg:w-2/3 bg-[#0f172a] border border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 shadow-2xl py-32">
                    <Database size={60} className="opacity-10 mb-6 animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] italic opacity-50 text-center px-10">Select operational engagement to visualize strategic progression</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "training" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {/* AUTO-GENERATE SECTION */}
              <div className="bg-[#0f172a] border border-white/5 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-black/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-white/5">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <Cpu size={24} className={theme.text} /> Operational Engine
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Driven Tactical Generation · Dataset Optima</p>
                  </div>
                  <button
                    onClick={handleAutoGenerate}
                    disabled={generating}
                    className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${theme.btn} text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50`}
                  >
                    <Zap size={16} /> {generating ? "Analyzing Matrix..." : "Execute Tactical Generation"}
                  </button>
                </div>

                {performanceAnalysis && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4">
                    <div className="bg-[#0b1120] border border-white/5 p-6 rounded-3xl text-center shadow-xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Batting Efficiency (SR)</p>
                      <p className={`text-2xl lg:text-3xl font-black italic ${performanceAnalysis.batting_strike_rate >= 130 ? 'text-emerald-500' : performanceAnalysis.batting_strike_rate >= 120 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {performanceAnalysis.batting_strike_rate}
                      </p>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-6 rounded-3xl text-center shadow-xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Bowl Suppression (Econ)</p>
                      <p className={`text-2xl lg:text-3xl font-black italic ${performanceAnalysis.bowling_economy <= 7 ? 'text-emerald-500' : performanceAnalysis.bowling_economy <= 8.5 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {performanceAnalysis.bowling_economy}
                      </p>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-6 rounded-3xl text-center shadow-xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Win Ratio (Delta)</p>
                      <p className={`text-2xl lg:text-3xl font-black italic ${performanceAnalysis.win_rate >= 55 ? 'text-emerald-500' : performanceAnalysis.win_rate >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {performanceAnalysis.win_rate}%
                      </p>
                    </div>
                    <div className="bg-[#0b1120] border border-white/5 p-6 rounded-3xl text-center shadow-xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Inertia Factor (Dot %)</p>
                      <p className={`text-2xl lg:text-3xl font-black italic ${performanceAnalysis.dot_ball_percentage <= 35 ? 'text-emerald-500' : performanceAnalysis.dot_ball_percentage <= 42 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {performanceAnalysis.dot_ball_percentage}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SESSION CARDS */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-8">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Planned Operations (Active Missions)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trainingSessions.map((s) => (
                  <div key={s.id} className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-2xl shadow-black/40">
                    <div className="absolute top-0 right-0 p-5 rounded-bl-[2rem] bg-white/5 border-l border-b border-white/5">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ${s.intensity === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        s.intensity === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                        {s.intensity} INTENSITY
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 italic">{s.date} • {s.time}</div>
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-amber-500 transition-colors">{s.venue}</h4>
                    </div>

                    <div className="p-6 bg-[#0b1120] rounded-[2rem] mb-10 border border-white/5 shadow-inner">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">Operational Directives</p>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold italic">{s.drills || "No tactical objectives defined for this session."}</p>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => handleTrainingDelete(s.id)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme.btnSecondary} hover:bg-rose-500/10 hover:text-rose-500`}>
                        Terminate Ops
                      </button>
                    </div>
                  </div>
                ))}
                {trainingSessions.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-white/5 bg-[#0b1120] rounded-[3rem] py-32 flex flex-col items-center justify-center text-slate-600 shadow-2xl">
                    <ClipboardList size={60} className="mb-6 opacity-10 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] italic">No Tactical Sessions Logged</p>
                    <p className="text-[10px] text-slate-700 font-bold mt-4 uppercase tracking-widest opacity-60">Utilise Operational Engine above to initiate plan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "autosquad" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="bg-[#0f172a] border border-white/5 p-10 lg:p-12 rounded-[3rem] shadow-2xl shadow-black/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <Zap size={24} className={theme.text} /> Intelligent Squad Synthesizer
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Calculates optimal Starting XIs based on historical franchise data matrix</p>
                  </div>
                  <button
                    onClick={async () => {
                      setGeneratingSquad(true);
                      try {
                        const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };
                        const res = await axios.get("http://127.0.0.1:8000/api/analytics/auto-squad/", { headers });
                        setSquadOptions(res.data.options);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setGeneratingSquad(false);
                      }
                    }}
                    disabled={generatingSquad}
                    className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${theme.btn} text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50`}
                  >
                    <Zap size={16} /> {generatingSquad ? "Processing Core Data..." : squadOptions ? "Regenerate Formations" : "Synthesize Formations"}
                  </button>
                </div>

                {squadOptions && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {squadOptions.map((opt, idx) => (
                      <div key={opt.id} className="bg-[#0b1120] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-amber-500/20 transition-all shadow-2xl h-fit">
                        <div className={`absolute top-0 right-0 p-5 rounded-bl-3xl bg-gradient-to-br ${idx === 0 ? 'from-amber-500 to-orange-600' : idx === 1 ? 'from-rose-500 to-red-600' : 'from-blue-500 to-indigo-600'} text-white shadow-xl`}>
                          <span className="text-[10px] font-black uppercase tracking-widest">Formation {idx + 1}</span>
                        </div>
                        <h4 className={`text-xl font-black uppercase italic tracking-tighter mb-3 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-rose-500' : 'text-blue-500'}`}>{opt.name}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-8 h-10 leading-relaxed italic opacity-80">{opt.description}</p>

                        <div className="space-y-3">
                          {opt.players.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/player shadow-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-xl bg-[#0f172a] border border-white/10 flex flex-shrink-0 items-center justify-center text-[10px] font-black text-white italic group-hover/player:scale-110 transition-transform">{i + 1}</div>
                                <div className="truncate">
                                  <div className="text-[11px] font-black text-white uppercase truncate max-w-[140px] italic">{p.name}</div>
                                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{p.role}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className={`text-[11px] font-black uppercase italic ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-rose-400' : 'text-blue-400'}`}>{p.stat_value}</div>
                                <div className="text-[8px] text-slate-700 font-black uppercase tracking-[0.2em]">{p.stat_label}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!squadOptions && !generatingSquad && (
                  <div className="border-2 border-dashed border-white/5 bg-[#0b1120] rounded-[3rem] py-40 flex flex-col items-center justify-center text-slate-700 mt-6 shadow-2xl">
                    <Zap size={60} className="mb-6 opacity-10 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.4em] italic text-center px-10">Initiate Synthesis Engine to view optimized personnel configurations</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PLAYER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {editingPlayer ? "Refine Operative" : "New Asset Induction"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-all bg-white/5 p-2 rounded-xl border border-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-8 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Personnel Core Designation (Name)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all placeholder:text-slate-700 font-bold"
                  required
                  placeholder="e.g. MS Dhoni"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Batting Modality</label>
                  <input
                    type="text"
                    value={formData.batting_style}
                    onChange={(e) => setFormData({ ...formData, batting_style: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all placeholder:text-slate-700 font-bold"
                    placeholder="e.g. Right hand Bat"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Bowling Modality</label>
                  <input
                    type="text"
                    value={formData.bowling_style}
                    onChange={(e) => setFormData({ ...formData, bowling_style: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all placeholder:text-slate-700 font-bold"
                    placeholder="e.g. Right arm Fast"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Height (cm)</label>
                  <input type="number" min="100" max="250" value={formData.height_cm} onChange={e => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-slate-500/10 placeholder:text-slate-700 font-bold"
                    placeholder="180" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Weight (kg)</label>
                  <input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-slate-500/10 placeholder:text-slate-700 font-bold"
                    placeholder="75.5" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Fitness Index</label>
                  <input type="number" step="0.1" value={formData.fitness_score} onChange={e => setFormData({ ...formData, fitness_score: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-slate-500/10 placeholder:text-slate-700 font-bold"
                    placeholder="18.5" />
                </div>
              </div>

              <div className="flex gap-5 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme.btnSecondary}`}>
                  Abort Mission
                </button>
                <button type="submit" className={`flex-1 py-5 rounded-2xl bg-gradient-to-r ${theme.btn} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/40 active:scale-95`}>
                  {editingPlayer ? "Finalise Refinement" : "Commence Induction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRAINING MODAL */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {editingSession ? "Reschedule Ops" : "Initiate Training Ops"}
              </h2>
              <button onClick={() => setIsTrainingModalOpen(false)} className="text-slate-500 hover:text-white transition-all bg-white/5 p-2 rounded-xl border border-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTrainingSave} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Date</label>
                  <input
                    type="date"
                    value={trainingFormData.date}
                    onChange={(e) => setTrainingFormData({ ...trainingFormData, date: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Mission Kickoff</label>
                  <input
                    type="time"
                    value={trainingFormData.time}
                    onChange={(e) => setTrainingFormData({ ...trainingFormData, time: e.target.value })}
                    className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Tactical Venue</label>
                <input
                  type="text"
                  value={trainingFormData.venue}
                  onChange={(e) => setTrainingFormData({ ...trainingFormData, venue: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-700 font-bold"
                  placeholder="e.g. MA Chidambaram Stadium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Combat Intensity Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTrainingFormData({ ...trainingFormData, intensity: level })}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${trainingFormData.intensity === level
                        ? `${theme.bg} border-transparent ${theme.text} shadow-xl`
                        : 'bg-[#0b1120] border-white/5 text-slate-500 hover:border-white/20'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Strategic Drill Directives</label>
                <textarea
                  value={trainingFormData.drills}
                  onChange={(e) => setTrainingFormData({ ...trainingFormData, drills: e.target.value })}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[150px] resize-none placeholder:text-slate-700 font-bold"
                  placeholder="Define mission objectives and specific personnel directives..."
                />
              </div>

              <div className="flex gap-5 pt-4">
                <button type="button" onClick={() => setIsTrainingModalOpen(false)} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme.btnSecondary}`}>
                  Abort Ops
                </button>
                <button type="submit" className={`flex-1 py-5 rounded-2xl bg-gradient-to-r ${theme.btn} text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/40 active:scale-95`}>
                  {editingSession ? "Commit Adjustment" : "Authorise Mission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        token={localStorage.getItem("access")}
        user={user}
      />
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    <div className={`${active ? 'text-white' : 'opacity-70'} flex-shrink-0`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest truncate">{label}</span>
  </div>
);

const CoachStatCard = ({ label, value, trend, icon }) => (
  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl shadow-black/40 group hover:bg-[#0f172a]/80 transition-all">
    <div className="p-5 bg-white/5 border border-white/5 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <h4 className="text-3xl font-black text-white italic tracking-tighter">{value}</h4>
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{trend}</span>
      </div>
    </div>
  </div>
);

export default CoachDashboard;