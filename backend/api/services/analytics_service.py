from django.core.cache import cache
from django.db.models import Sum, Avg, Count
from api.models import MatchPerformance


class PlayerAnalyticsService:

    @staticmethod
    def career_summary(player_id):
        cache_key = f"career_summary_{player_id}"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data

        aggregates = (
            MatchPerformance.objects
            .filter(player_id=player_id)
            .aggregate(
                total_runs=Sum("runs"),
                average_runs=Avg("runs"),
                total_matches=Count("id")
            )
        )

        total_runs = aggregates["total_runs"] or 0
        average = aggregates["average_runs"] or 0
        matches = aggregates["total_matches"] or 0

        data = {
            "player_id": player_id,
            "total_matches": matches,
            "total_runs": total_runs,
            "average": round(average, 2),
        }

        cache.set(cache_key, data, timeout=60 * 15)  # 15 minutes

        return data
