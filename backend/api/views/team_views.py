from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.response import Response # type: ignore
from api.services.yaml_loader import load_all_matches # type: ignore
from rest_framework.permissions import AllowAny # type: ignore
from api.utils.team_normalization import normalize_team_name

@api_view(['GET'])
@permission_classes([AllowAny])

def get_teams(request):
    matches = load_all_matches()
    teams = set()

    for match in matches:
        info = match.get("info", {})
        team_list = info.get("teams", [])
        for team in team_list:
            teams.add(normalize_team_name(team))

    return Response({
        "total_teams": len(teams),
        "teams": sorted(list(teams))
    })

