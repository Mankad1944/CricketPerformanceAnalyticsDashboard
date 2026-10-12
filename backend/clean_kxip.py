import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Match, Team, Innings, Coach

print("Consolidating Kings XI Punjab -> Punjab Kings")

# 1. Update Match teams
m1 = Match.objects.filter(team1="Kings XI Punjab").update(team1="Punjab Kings")
m2 = Match.objects.filter(team2="Kings XI Punjab").update(team2="Punjab Kings")
mt = Match.objects.filter(toss_winner="Kings XI Punjab").update(toss_winner="Punjab Kings")
mw = Match.objects.filter(winner="Kings XI Punjab").update(winner="Punjab Kings")
print(f"Updated Match models: team1={m1}, team2={m2}, toss={mt}, winner={mw}")

# 2. Update Innings batting_team
inn = Innings.objects.filter(batting_team="Kings XI Punjab").update(batting_team="Punjab Kings")
print(f"Updated Innings models: {inn}")

# 3. Update Team actual registry 
# Note: we might have two teams (KXIP and PBKS) or just one. Check if PBKS exists.
try:
    pbks = Team.objects.get(name="Punjab Kings")
    # if pbks exists, we shouldn't rename KXIP to PBKS (unique constraint error). 
    # Just delete KXIP if it exists as it has 0 players/matches tied to it now (since we moved the matches).
    try:
        kxip = Team.objects.get(name="Kings XI Punjab")
        kxip.delete()
        print("Deleted legacy KXIP team object.")
    except Team.DoesNotExist:
        pass
except Team.DoesNotExist:
    # PBKS doesn't exist, just rename KXIP
    t = Team.objects.filter(name="Kings XI Punjab").update(name="Punjab Kings")
    print(f"Renamed KXIP team object to PBKS: {t}")

# 4. Update Coach assignments 
co = Coach.objects.filter(team_name="Kings XI Punjab").update(team_name="Punjab Kings")
print(f"Updated Coach models: {co}")

print("Cleaned!")
