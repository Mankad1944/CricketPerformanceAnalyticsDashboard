import os
import yaml # type: ignore
from api.models import Team # type: ignore
from api.utils.team_normalization import normalize_team_name

def load_teams_from_yaml():
    """
    Extract unique teams from YAML files and save to database.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    yaml_folder = os.path.join(base_dir, "data", "ipl")
    
    if not os.path.exists(yaml_folder):
        print(f"❌ YAML folder not found: {yaml_folder}")
        return {"error": "YAML folder not found"}

    yaml_files = [f for f in os.listdir(yaml_folder) if f.endswith((".yaml", ".yml"))]
    teams_seen = set()

    for file in yaml_files:
        file_path = os.path.join(yaml_folder, file)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                match_data = yaml.safe_load(f)
                info = match_data.get("info", {})
                teams = info.get("teams", [])
                for team_name in teams:
                    teams_seen.add(normalize_team_name(team_name))
        except Exception as e:
            print(f"❌ Error reading {file}: {e}")
            continue

    from api.models import Player, Coach, Match, Innings
    
    # 1. Handle migration before processing new team list
    old_rcb = Team.objects.filter(name="Royal Challengers Bangalore").first()
    if old_rcb:
        new_rcb, _ = Team.objects.get_or_create(name="Royal Challengers Bengaluru")
        
        # Migrate Players
        Player.objects.filter(team=old_rcb).update(team=new_rcb)
        
        # Migrate Coaches
        Coach.objects.filter(team=old_rcb).update(team=new_rcb, team_name="Royal Challengers Bengaluru")
        
        # Migrate Matches (Historical Data)
        Match.objects.filter(team1="Royal Challengers Bangalore").update(team1="Royal Challengers Bengaluru")
        Match.objects.filter(team2="Royal Challengers Bangalore").update(team2="Royal Challengers Bengaluru")
        Match.objects.filter(winner="Royal Challengers Bangalore").update(winner="Royal Challengers Bengaluru")
        Match.objects.filter(toss_winner="Royal Challengers Bangalore").update(toss_winner="Royal Challengers Bengaluru")
        
        # Migrate Innings (Historical Data)
        Innings.objects.filter(batting_team="Royal Challengers Bangalore").update(batting_team="Royal Challengers Bengaluru")

        # Finally delete the duplicate record
        old_rcb.delete()

    created_count: int = 0
    for team_name in teams_seen:
        obj, created = Team.objects.get_or_create(name=team_name)
        if created:
            created_count += 1 # type: ignore

    return {
        "total_teams_found": len(teams_seen),
        "new_teams_created": created_count
    }
