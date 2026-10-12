from django.db.models import Sum
from django.core.cache import cache
from api.models import MatchPerformance


class LeaderboardService:

    @staticmethod
    def top_batsmen(limit=10):
        cache_key = f"top_batsmen_leaderboard_{limit}"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data

        queryset = (
            MatchPerformance.objects
            .values("player__id", "player__name")
            .annotate(total_runs=Sum("runs"))
            .order_by("-total_runs")[:limit]
        )

        data = list(queryset) if queryset.exists() else []

        cache.set(cache_key, data, timeout=60 * 10)  # 10 minutes

        return data
