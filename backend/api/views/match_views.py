from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.response import Response # type: ignore
from api.services.yaml_loader import load_all_matches # type: ignore
from rest_framework.permissions import IsAuthenticated, AllowAny # type: ignore

@api_view(['GET'])
# @permission_classes([AllowAny])
def get_matches(request):
    matches = load_all_matches()
    match_list = []

    for idx, match in enumerate(matches):
        info = match.get("info", {})

        match_list.append({
            "id": idx + 1,
            "date": info.get("dates", [None])[0],
            "team1": info.get("teams", [None, None])[0],
            "team2": info.get("teams", [None, None])[1],
            "venue": info.get("venue"),
            "winner": info.get("outcome", {}).get("winner")
        })

    return Response({
        "total_matches": len(match_list),
        "matches": match_list
    })

from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from rest_framework.response import Response # type: ignore

from api.models import Match # type: ignore


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_matches(request):
    """
    Return all match list (player can view all match schedule).
    """
    matches = Match.objects.all().order_by("-match_date")

    data = []
    for match in matches:
        data.append({
            "match_id": match.match_id,
            "team1": match.team1,
            "team2": match.team2,
            "venue": match.venue,
            "city": match.city,
            "date": match.match_date,
            "winner": match.winner,
            "toss_winner": match.toss_winner,
            "toss_decision": match.toss_decision,
            "match_type": match.match_type,
            "competition": match.competition,
        })

    return Response(data)
