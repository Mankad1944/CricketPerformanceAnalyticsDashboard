import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from api.views.player_views import player_matches

# Mock request
factory = RequestFactory()
request = factory.get('/api/player/RG Sharma/matches/')

# Call view
response = player_matches(request, player_name="RG Sharma")

# Verify data
data = response.data
matches = data.get("matches", [])

if matches:
    first_match = matches[0]
    print(f"Match ID: {first_match.get('match_id')}")
    print(f"Runs: {first_match.get('runs')}")
    print(f"Fours: {first_match.get('fours')}")
    print(f"Sixes: {first_match.get('sixes')}")
    print(f"Wickets: {first_match.get('wickets')}")
    
    if "fours" in first_match and "sixes" in first_match:
        print("SUCCESS: Fours and Sixes found in response!")
    else:
        print("FAILURE: Fours or Sixes missing from response!")
else:
    print("No matches found for player.")
