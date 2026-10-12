from rest_framework.permissions import AllowAny
from rest_framework import generics # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from django.contrib.auth.models import User # type: ignore
from api.models import Player, Team, Delivery, Match, Profile # type: ignore
from django.db.models import Q # type: ignore
from api.serializers import PlayerSerializer # type: ignore
from django.core.exceptions import PermissionDenied # type: ignore
from urllib.request import urlopen, Request
import urllib.parse
import json
import re
from rest_framework.views import APIView # type: ignore
from api.utils.wiki_cleaner import clean_wiki_text
from api.utils.team_normalization import normalize_team_name

from api.utils.player_names import PLAYER_ALIASES

class IsCoachOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        is_authenticated = super().has_permission(request, view)
        if not is_authenticated:
            return False
            
        # Explicitly allow superusers
        if request.user.is_superuser:
            return True
            
        role = getattr(request.user.profile, 'role', None)
        return role in ['coach', 'admin', 'analyst']

class PlayerListView(generics.ListAPIView):
    queryset = Player.objects.all().order_by('name')
    serializer_class = PlayerSerializer
    permission_classes = [IsCoachOrAdmin]

class PlayerCreateView(generics.CreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsCoachOrAdmin]

class PlayerUpdateView(generics.UpdateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsCoachOrAdmin]

class PlayerDeleteView(generics.DestroyAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsCoachOrAdmin]

# Removed local clean_wiki_text in favor of api.utils.wiki_cleaner

class FetchExternalStylesView(APIView):
    permission_classes = [IsCoachOrAdmin]

    def get(self, request):
        player_name = request.GET.get('name', '').strip()
        if not player_name:
            return Response({"error": "Player name is required"}, status=400)
            
        try:
            # Check for alias
            search_name = PLAYER_ALIASES.get(player_name, player_name)
            
            # We search wikipedia for the player
            url = f'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles={urllib.parse.quote(search_name)}&format=json'
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = json.loads(urlopen(req, timeout=5).read().decode('utf-8'))
            
            pages = data.get('query', {}).get('pages', {})
            page = list(pages.values())[0]
            if 'missing' in page:
                # FALLBACK: Try Wikipedia search to find the correct title
                search_url = f'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(player_name + " cricketer")}&format=json'
                search_req = Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
                search_data = json.loads(urlopen(search_req, timeout=5).read().decode('utf-8'))
                search_results = search_data.get('query', {}).get('search', [])
                
                if search_results:
                    best_title = search_results[0]['title']
                    url = f'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles={urllib.parse.quote(best_title)}&format=json'
                    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    data = json.loads(urlopen(req, timeout=5).read().decode('utf-8'))
                    pages = data.get('query', {}).get('pages', {})
                    page = list(pages.values())[0]
                
                if 'missing' in page:
                    return Response({"batting_style": "N/A", "bowling_style": "N/A", "role": "N/A"})

            content = page.get('revisions', [{}])[0].get('*', '')
            
            # More robust regexes for infobox parsing
            batting_match = re.search(r'\|\s*batting[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
            bowling_match = re.search(r'\|\s*bowling[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
            role_match = re.search(r'\|\s*role[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
            
            batting = batting_match.group(1).strip() if batting_match else ""
            bowling = bowling_match.group(1).strip() if bowling_match else ""
            role = role_match.group(1).strip() if role_match else ""

            return Response({
                "batting_style": clean_wiki_text(batting),
                "bowling_style": clean_wiki_text(bowling),
                "role": clean_wiki_text(role)
            })
            
        except Exception as e:
            print("Fetch Exception:", str(e))
            return Response({"error": "Failed to fetch from external sources", "details": str(e)}, status=500)

class SyncAllStylesView(APIView):
    permission_classes = [IsCoachOrAdmin]

    def post(self, request):
        sync_type = request.GET.get('type', 'style') # Default to style
        force = request.GET.get('force', 'false').lower() == 'true'
        
        if force:
            players = Player.objects.all()
        else:
            if sync_type == 'role':
                players = Player.objects.filter(role__isnull=True) | Player.objects.filter(role="") | Player.objects.filter(role="N/A")
            else:
                players = Player.objects.filter(
                    batting_style__isnull=True
                ) | Player.objects.filter(
                    batting_style=""
                ) | Player.objects.filter(
                    batting_style="N/A"
                ) | Player.objects.filter(
                    bowling_style__isnull=True
                ) | Player.objects.filter(
                    bowling_style=""
                ) | Player.objects.filter(
                    bowling_style="N/A"
                )
        
        players = players.distinct()
        
        remaining = players.count()
        if remaining == 0:
            return Response({"synced": 0, "remaining": 0, "message": f"All active players already have {sync_type}s synced!"})
            
        batch = players[:10]
        synced_count = 0
        
        for player in batch:
            player_name = player.name
            try:
                search_name = PLAYER_ALIASES.get(player_name, player_name)
                url = f'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles={urllib.parse.quote(search_name)}&format=json'
                req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                data = json.loads(urlopen(req, timeout=3).read().decode('utf-8'))
                
                pages = data.get('query', {}).get('pages', {})
                page = list(pages.values())[0]
                
                if 'missing' in page:
                    search_url = f'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(player_name + " cricketer")}&format=json'
                    search_req = Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
                    search_data = json.loads(urlopen(search_req, timeout=3).read().decode('utf-8'))
                    search_results = search_data.get('query', {}).get('search', [])
                    
                    if search_results:
                        best_title = search_results[0]['title']
                        url = f'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles={urllib.parse.quote(best_title)}&format=json'
                        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        data = json.loads(urlopen(req, timeout=3).read().decode('utf-8'))
                        pages = data.get('query', {}).get('pages', {})
                        page = list(pages.values())[0]
                    
                    if 'missing' in page:
                        if sync_type == 'role':
                            player.role = "N/A"
                        else:
                            player.batting_style = "N/A"
                            player.bowling_style = "N/A"
                        player.save()
                        continue

                content = page.get('revisions', [{}])[0].get('*', '')
                
                if sync_type == 'role':
                    role_match = re.search(r'\|\s*role[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                    role = role_match.group(1).strip() if role_match else "N/A"
                    player.role = clean_wiki_text(role)
                else:
                    batting_match = re.search(r'\|\s*batting[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                    bowling_match = re.search(r'\|\s*bowling[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                    batting = batting_match.group(1).strip() if batting_match else "N/A"
                    bowling = bowling_match.group(1).strip() if bowling_match else "N/A"
                    player.batting_style = clean_wiki_text(batting)
                    player.bowling_style = clean_wiki_text(bowling)
                
                player.save()
                synced_count += 1
                
            except Exception as e:
                # Fallback to prevent infinite loops
                if sync_type == 'role':
                    player.role = "N/A"
                else:
                    player.batting_style = "N/A"
                    player.bowling_style = "N/A"
                player.save()
                continue
                
        # Re-evaluate remaining
        if sync_type == 'role':
            new_remaining = Player.objects.filter(role__isnull=True) | Player.objects.filter(role="")
        else:
            new_remaining = Player.objects.filter(batting_style__isnull=True) | Player.objects.filter(batting_style="") | Player.objects.filter(bowling_style__isnull=True) | Player.objects.filter(bowling_style="")
        
        new_remaining = new_remaining.distinct().count()
                
        return Response({
            "synced": synced_count, 
            "remaining": new_remaining, 
            "message": f"Successfully synced {synced_count} {sync_type}s."
        })

class AutoAssignTeamsView(APIView):
    permission_classes = [IsCoachOrAdmin]

    def post(self, request):
        unassigned_players = Player.objects.filter(team__isnull=True)
        assigned_count = 0
        
        for player in unassigned_players:
            # Find the most recent behavior for this player
            latest_delivery = Delivery.objects.filter(
                Q(batsman=player) | Q(non_striker=player) | Q(bowler=player)
            ).select_related('match', 'inning').order_by('-match__match_date').first()
            
            if latest_delivery:
                match = latest_delivery.match
                inning = latest_delivery.inning
                
                # Determine team name
                if latest_delivery.batsman == player or latest_delivery.non_striker == player:
                    raw_team_name = inning.batting_team
                else:
                    raw_team_name = match.team1 if inning.batting_team == match.team2 else match.team2
                
                if raw_team_name:
                    canonical_name = normalize_team_name(raw_team_name)
                    team_obj, created = Team.objects.get_or_create(name=canonical_name)
                    player.team = team_obj
                    player.save()
                    assigned_count += 1
                    
        return Response({
            "assigned_count": assigned_count,
            "message": f"Successfully assigned teams to {assigned_count} players."
        })

class CleanupSubstitutesView(APIView):
    permission_classes = [IsCoachOrAdmin]

    def post(self, request):
        sub_players = Player.objects.filter(name__icontains="(sub)")
        count = sub_players.count()
        sub_players.delete()
        
        return Response({
            "deleted_count": count,
            "message": f"Successfully removed {count} substitute records."
        })
class SyncFullNamesView(APIView):
    permission_classes = [IsCoachOrAdmin]

    def post(self, request):
        updated_count = 0
        players = Player.objects.all()
        for player in players:
            # Check if there is a User with the same username as player name (slugified or exact)
            # Or if the player name itself is what we want to use as full_name
            # In this logic, we use the User's first_name + last_name to populate full_name if available
            try:
                # Some users have usernames that match player names
                user_match = User.objects.filter(username__iexact=player.name).first()
                if user_match:
                    new_full_name = f"{user_match.first_name} {user_match.last_name}".strip()
                    if new_full_name and player.full_name != new_full_name:
                        player.full_name = new_full_name
                        player.save()
                        updated_count += 1
                elif not player.full_name:
                    # Default: Use the 'name' field as initial 'full_name'
                    player.full_name = player.name
                    player.save()
                    updated_count += 1
            except Exception:
                continue
                
        # Also sync Profile full_name from User fields
        profiles = Profile.objects.all().select_related('user')
        for profile in profiles:
            user = profile.user
            new_name = f"{user.first_name} {user.last_name}".strip()
            if new_name and profile.full_name != new_name:
                profile.full_name = new_name
                profile.save()
                
        return Response({
            "updated_count": updated_count,
            "message": f"Successfully synced names for {updated_count} records."
        })
