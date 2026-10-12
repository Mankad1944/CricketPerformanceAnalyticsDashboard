from django.core.management.base import BaseCommand # type: ignore
from api.models import Player # type: ignore
from api.utils.wiki_cleaner import clean_wiki_text
from urllib.request import urlopen, Request
import urllib.parse
import json
import re
import time

class Command(BaseCommand):
    help = "Bulk fetch missing batting and bowling styles for players from Wikipedia"

    def handle(self, *args, **kwargs):
        players = Player.objects.filter(batting_style__isnull=True) | Player.objects.filter(batting_style="") | Player.objects.filter(bowling_style__isnull=True) | Player.objects.filter(bowling_style="")
        players = players.distinct()
        
        total = players.count()
        if total == 0:
            self.stdout.write(self.style.SUCCESS("All players already have styles assigned!"))
            return
            
        self.stdout.write(f"Found {total} players missing styles. Starting batch fetch...")
        
        updated_count = 0
        
        for i, player in enumerate(players, 1):
            player_name = player.name
            try:
                # We search wikipedia for the player
                url = f'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles={urllib.parse.quote(player_name)}&format=json'
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
                        self.stdout.write(self.style.WARNING(f"[{i}/{total}] Could not find Wikipedia page for {player_name}"))
                        # Mark as N/A to avoid repeat failures
                        player.batting_style = "N/A"
                        player.bowling_style = "N/A"
                        player.role = "N/A"
                        player.save()
                        continue

                content = page.get('revisions', [{}])[0].get('*', '')
                
                # Simple regex to extract styles from infobox
                batting_match = re.search(r'\|\s*batting[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                bowling_match = re.search(r'\|\s*bowling[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                role_match = re.search(r'\|\s*role[ \t]*=[ \t]*([^\n|}]+)', content, re.IGNORECASE)
                
                batting = batting_match.group(1).strip() if batting_match else ""
                bowling = bowling_match.group(1).strip() if bowling_match else ""
                role = role_match.group(1).strip() if role_match else ""
                
                # Clean up wikitext using centralized utility
                player.batting_style = clean_wiki_text(batting)
                player.bowling_style = clean_wiki_text(bowling)
                player.role = clean_wiki_text(role)
                
                changed = (batting and player.batting_style != "N/A") or \
                          (bowling and player.bowling_style != "N/A") or \
                          (role and player.role != "N/A")
                    
                if changed:
                    player.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f"[{i}/{total}] Updated {player_name} - Bat: {player.batting_style}, Bowl: {player.bowling_style}, Role: {player.role}"))
                else:
                    self.stdout.write(f"[{i}/{total}] Skipped {player_name} - No styles found in infobox")
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"[{i}/{total}] Error fetching {player_name}: {e}"))
                
            time.sleep(0.5) # Be polite to Wikipedia API

        self.stdout.write(self.style.SUCCESS(f"\nDone! Successfully updated styles for {updated_count} players."))
