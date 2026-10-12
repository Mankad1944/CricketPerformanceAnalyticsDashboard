// api/auth.js
import API from "./axios";

// ---------------- AUTH ----------------
export const loginUser = (data) => API.post("token/", data);
export const refreshToken = (data) => API.post("token/refresh/", data);

// ---------------- PROFILE ----------------
export const fetchPlayerProfile = () => API.get("player/profile/");

// ---------------- DASHBOARD ----------------
export const testDashboard = () => API.get("dashboard/test/");

// ---------------- TEAMS / PLAYERS ----------------
export const fetchTeams = () => API.get("teams/");
export const fetchPlayers = () => API.get("players/");

// ---------------- LEADERBOARD ----------------
export const fetchTopBatsmen = () =>
  API.get("leaderboard/top-batsmen/");

export const fetchTopBowlers = () =>
  API.get("leaderboard/top-bowlers/");

// ---------------- PLAYER ANALYTICS ----------------
export const fetchPlayerSummary = (playerName) =>
  API.get(`analytics/player/${encodeURIComponent(playerName)}/summary/`);

export const fetchRunsBySeason = (playerName) =>
  API.get(`analytics/player/${encodeURIComponent(playerName)}/runs-by-season/`);

export const fetchStrikeRateTrend = (playerName) =>
  API.get(`analytics/player/${encodeURIComponent(playerName)}/strike-rate-trend/`);

export const fetchPlayerMatches = (playerName) =>
  API.get(`analytics/player/${encodeURIComponent(playerName)}/matches/`);
