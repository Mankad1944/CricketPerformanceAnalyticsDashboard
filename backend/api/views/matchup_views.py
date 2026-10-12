from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import AllowAny # type: ignore
from rest_framework.response import Response # type: ignore
from django.db.models import Sum, Count, Case, When, IntegerField # type: ignore
from django.shortcuts import get_object_or_404 # type: ignore
from api.models import Player, Delivery # type: ignore

@api_view(["GET"])
@permission_classes([AllowAny])
def player_matchup(request, batsman_name, bowler_name):
    batsman = get_object_or_404(Player, name__iexact=batsman_name)
    bowler = get_object_or_404(Player, name__iexact=bowler_name)
    
    deliveries = Delivery.objects.filter(batsman=batsman, bowler=bowler)
    
    stats = deliveries.aggregate(
        total_runs=Sum('runs_batsman'),
        total_balls=Count('id'),
        boundaries=Sum(
            Case(
                When(runs_batsman__in=[4, 6], then=1),
                default=0,
                output_field=IntegerField()
            )
        ),
        sixes=Sum(
            Case(
                When(runs_batsman=6, then=1),
                default=0,
                output_field=IntegerField()
            )
        ),
        fours=Sum(
            Case(
                When(runs_batsman=4, then=1),
                default=0,
                output_field=IntegerField()
            )
        ),
        dismissals=Count(
            Case(
                When(is_wicket=True, player_out=batsman, then=1),
                output_field=IntegerField()
            )
        ),
        dot_balls=Sum(
            Case(
                When(runs_batsman=0, then=1),
                default=0,
                output_field=IntegerField()
            )
        )
    )
    
    runs = stats['total_runs'] or 0
    balls = stats['total_balls'] or 0
    dismissals = stats['dismissals'] or 0
    fours = stats['fours'] or 0
    sixes = stats['sixes'] or 0
    dot_balls = stats['dot_balls'] or 0
    
    strike_rate = round((runs / balls) * 100, 2) if balls > 0 else 0
    average = round((runs / dismissals), 2) if dismissals > 0 else runs
    dot_percentage = round((dot_balls / balls) * 100, 2) if balls > 0 else 0
    
    return Response({
        "batsman": batsman.name,
        "batsman_team": batsman.team.name if batsman.team else "Unassigned",
        "bowler": bowler.name,
        "bowler_team": bowler.team.name if bowler.team else "Unassigned",
        "matchup_stats": {
            "runs": runs,
            "balls": balls,
            "strike_rate": strike_rate,
            "average": average,
            "dismissals": dismissals,
            "fours": fours,
            "sixes": sixes,
            "dot_balls": dot_balls,
            "dot_percentage": dot_percentage
        }
    })
