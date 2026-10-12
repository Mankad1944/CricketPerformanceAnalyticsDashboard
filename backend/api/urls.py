from django.urls import path # type: ignore
from rest_framework_simplejwt.views import TokenRefreshView # type: ignore

from api.views.team_views import get_teams # type: ignore
from api.views.player_views import ( # type: ignore
    get_players,
    player_matches,
    player_profile,
    player_team_history,
    player_phase_analysis,
)
from api.views.matchup_views import player_matchup # type: ignore
from api.views.match_views import get_matches # type: ignore
from api.views.analytics_views import ( # type: ignore
    player_summary,
    runs_by_season,
    strike_rate_trend,
    top_batsmen,
    top_bowlers,
    dashboard_stats,
    squad_list,
    team_matches,
    team_performance_chart,
    analyst_overview,
    analyst_filter_options,
    player_comparison,
    match_insights,
    team_contribution,
    player_form_tracking,
    workload_monitoring,
    performance_scatter,
    trend_analysis,
    venue_analytics,
    analyst_deep_insights,
    admin_analytics_all,
    log_activity,
    auto_generate_squad,
    clear_cache,
)
from api.views.coach_views import CoachListView, appoint_coach, update_coach, delete_coach, available_teams  # type: ignore
from api.views.analyst_views import AnalystListView, appoint_analyst, update_analyst, delete_analyst  # type: ignore
from api.views.admin_seed_views import seed_yaml_data # type: ignore
from api.views.training_views import TrainingSessionListCreateView, TrainingSessionDetailView, auto_generate_training
from api.views.auth_views import CustomTokenObtainPairView # type: ignore
from api.serializers import UserListView # type: ignore
from api.views.player_management_views import ( # type: ignore
    PlayerListView, PlayerCreateView, PlayerUpdateView, PlayerDeleteView, FetchExternalStylesView, SyncAllStylesView,
    AutoAssignTeamsView, CleanupSubstitutesView, SyncFullNamesView
)
from api.views.user_views import UserCreateView, UserUpdateView, UserDeleteView, UserUpdateProfileView, UserGetProfileView, AdminPasswordResetView # type: ignore
from api.views.admin_chat_views import admin_chat_processor

urlpatterns = [

    # ---------------- BASIC ----------------
    path("teams/", get_teams),
    path("players/", get_players),
    path("matches/", get_matches),

    # ---------------- PLAYER ----------------
    path("player/<str:player_name>/profile/", player_profile),
    path("player/<str:player_name>/matches/", player_matches),
    path("player/<str:player_name>/team-history/", player_team_history),
    path("player/<str:player_name>/phase-analysis/", player_phase_analysis),
    path("matchup/<str:batsman_name>/vs/<str:bowler_name>/", player_matchup),

    # ---------------- PLAYER MANAGEMENT ----------------
    path("players/list/", PlayerListView.as_view()),
    path("players/add/", PlayerCreateView.as_view()),
    path("players/edit/<int:pk>/", PlayerUpdateView.as_view()),
    path("players/delete/<int:pk>/", PlayerDeleteView.as_view()),
    path("players/fetch-external-styles/", FetchExternalStylesView.as_view()),
    path("players/sync-all-styles/", SyncAllStylesView.as_view()),
    path("players/auto-assign-teams/", AutoAssignTeamsView.as_view()),
    path("players/sync-full-names/", SyncFullNamesView.as_view()),
    path("players/cleanup-subs/", CleanupSubstitutesView.as_view()),

    # ---------------- ANALYTICS ----------------
    path("player/<str:player_name>/summary/", player_summary),
    path("player/<str:player_name>/runs-by-season/", runs_by_season),
    path("player/<str:player_name>/strike-rate-trend/", strike_rate_trend),

    # ---------------- LEADERBOARD ----------------
    path("leaderboard/top-batsmen/", top_batsmen),
    path("leaderboard/top-bowlers/", top_bowlers),

    # ---------------- ANALYST ----------------
    path("analytics/analyst-overview/", analyst_overview),
    path("analytics/analyst-filter-options/", analyst_filter_options),
    path("analytics/player-comparison/", player_comparison),
    path("analytics/performance-scatter/", performance_scatter),
    path("analytics/trends/", trend_analysis),
    path("analytics/venue-stats/", venue_analytics),
    path("analytics/deep-insights/", analyst_deep_insights),

    # ---------------- COACH ----------------
    path("analytics/squad/", squad_list),
    path("analytics/team-matches/", team_matches),
    path("analytics/team-performance/", team_performance_chart),
    path("analytics/match-insights/<str:match_id>/", match_insights),
    path("analytics/team-contribution/", team_contribution),
    path("analytics/player-form/<str:player_name>/", player_form_tracking),
    path("analytics/workload-stats/", workload_monitoring),
    path("analytics/auto-squad/", auto_generate_squad),

    # ---------------- TRAINING ----------------
    path("training/sessions/", TrainingSessionListCreateView.as_view()),
    path("training/sessions/<int:pk>/", TrainingSessionDetailView.as_view()),
    path("training/auto-generate/", auto_generate_training),

    # ---------------- COACH MANAGEMENT ----------------
    path("coaches/appoint/", appoint_coach),
    path("coaches/update/<int:coach_id>/", update_coach),
    path("coaches/delete/<int:coach_id>/", delete_coach),
    path("coaches/teams/", available_teams),

    # ---------------- ANALYST MANAGEMENT ----------------
    path("analysts/appoint/", appoint_analyst),
    path("analysts/update/<int:analyst_id>/", update_analyst),
    path("analysts/delete/<int:analyst_id>/", delete_analyst),

    # ---------------- DASHBOARD ----------------
    path("dashboard/", dashboard_stats),
    path("admin/analytics-all/", admin_analytics_all),
    path("admin/chat/", admin_chat_processor),
    path("admin/clear-cache/", clear_cache),
    path("admin/log-action/", log_activity),

    # ---------------- AUTH ----------------
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ---------------- ADMIN ----------------
    path("admin/seed-yaml/", seed_yaml_data),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/add/', UserCreateView.as_view(), name='user-add'),
    path('users/update/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('users/delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
    path('users/reset-password/<int:pk>/', AdminPasswordResetView.as_view(), name='admin-password-reset'),
    path('coaches/', CoachListView.as_view(), name='coach-list'),
    path('analysts/', AnalystListView.as_view(), name='analyst-list'),
    path("users/me/update/", UserUpdateProfileView.as_view()),
    path("users/me/", UserGetProfileView.as_view()),
]