import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [activeRole, setActiveRole] = useState("Player");

  const [errorMsg, setErrorMsg] = useState("");

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/dashboard", { replace: true });
    } else if (user?.role === "player") {
      navigate("/playerDashboard", { replace: true });
    } else if (user?.role === "coach") {
      navigate("/coachDashboard", { replace: true });
    } else if (user?.role === "analyst") {
      navigate("/analystDashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await login({ ...form, role: activeRole.toLowerCase() });
    } catch {
      setErrorMsg("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Navbar */}
      <nav className="w-full px-8 h-20 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-white font-bold tracking-tight uppercase italic">IPL<span className="text-blue-500">Analytics</span></span>
        </div>

        <button
          type="button"
          onClick={() => setActiveRole(prev => prev === "Admin" ? "Player" : "Admin")}
          className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border flex items-center gap-2 transition-all duration-500 ${activeRole === "Admin"
            ? "bg-amber-500 border-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-white/5"
            }`}
        >
          <Shield size={12} fill={activeRole === "Admin" ? "currentColor" : "none"} />
          Admin Portal
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-2xl p-8 relative">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {activeRole === "Admin" ? "🛡️ Admin Access" : "🏏 Welcome Back"}
            </h1>
            <p className="text-slate-400 mt-2">
              {activeRole === "Admin" ? "Secure management portal" : "Select your role to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {activeRole !== "Admin" && (
              <div className="flex bg-slate-900 p-1 rounded-xl mb-6 gap-1">
                {["Player", "Coach", "Analyst"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${activeRole === role
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold text-white transition-all duration-300"
            >
              Login
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
