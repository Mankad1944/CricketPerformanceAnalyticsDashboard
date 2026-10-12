import os
from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAdminUser # type: ignore
from rest_framework.response import Response # type: ignore

from api.services.yaml_to_db_loader import load_yaml_to_db # type: ignore
from api.services.team_loader import load_teams_from_yaml # type: ignore


@api_view(["GET","POST"])
@permission_classes([])
def seed_yaml_data(request):
    """
    Admin-only API endpoint.
    Supports ?target=teams or ?target=matches or ?target=all (default)
    """
    target = request.query_params.get("target", "all")
    results: dict[str, any] = {} # type: ignore

    if target in ["matches", "all"]:
        results["match_result"] = load_yaml_to_db()
    
    if target in ["teams", "all"]:
        results["team_result"] = load_teams_from_yaml()

    return Response({
        "message": f"✅ YAML {target} data seeded successfully",
        **results
    })
