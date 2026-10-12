import re
from rest_framework.decorators import api_view, permission_classes # type: ignore
from rest_framework.permissions import IsAuthenticated, IsAdminUser # type: ignore
from rest_framework.response import Response # type: ignore
from django.contrib.auth.models import User # type: ignore
from api.models import Player, Match, Delivery, Coach, Analyst, Team # type: ignore
from django.db.models import Count, Sum, Q # type: ignore

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_chat_processor(request):
    """
    Parses natural language commands from the Admin and returns an action or info.
    Supports conversational context for follow-up questions.
    """
    message = request.data.get('message', '').strip().lower()
    context = request.data.get('context', {}) # Contains last_player, last_team
    
    if not message:
        return Response({"reply": "I'm listening, Admin. How can I assist you today?", "context": context})

    last_player_id = context.get('last_player_id')
    last_team_id = context.get('last_team_id')

    # HELPER: Team Alias Resolver
    TEAM_ALIASES = {
        "csk": "Chennai Super Kings", "rcb": "Royal Challengers Bangalore", "mi": "Mumbai Indians",
        "kkr": "Kolkata Knight Riders", "dc": "Delhi Capitals", "pbks": "Punjab Kings",
        "rr": "Rajasthan Royals", "gt": "Gujarat Titans", "lsg": "Lucknow Super Giants",
        "srh": "Sunrisers Hyderabad", "punjab": "Punjab Kings", "bangalore": "Royal Challengers Bangalore",
        "mumbai": "Mumbai Indians", "chennai": "Chennai Super Kings", "calcutta": "Kolkata Knight Riders"
    }
    def resolve_team(q):
        q = re.sub(r'[^\w\s]+$', '', q.lower()).strip()
        if q in TEAM_ALIASES: return Team.objects.filter(name__iexact=TEAM_ALIASES[q]).first()
        return Team.objects.filter(name__icontains=q).first()

    # 0. CONVERSATIONAL / SMALL TALK
    if any(q in message for q in ["hi", "hello", "hey", "greetings"]):
        return Response({"reply": "Hello, Admin. ADMIN-AI node is online and ready for commands. How can I assist you today?", "context": context})
    
    if any(q in message for q in ["how are you", "how're you", "how you doing"]):
        return Response({"reply": "I am functioning at optimal capacity, thank you for asking! My diagnostic scores are nominal. How can I help you with the IPL database today?", "context": context})

    if any(q in message for q in ["what is your work", "what do you do", "your role"]):
        return Response({"reply": "I am your **Autonomous Assistant Node**. My role is to govern this system, provide real-time data insights, manage franchise staff, and assist with any analytical queries across the league.", "context": context})

    if any(q in message for q in ["clear chat", "reset chat", "purge chat", "clean chat"]):
        return Response({
            "reply": "System buffer purge initiated. Resetting local interface.",
            "action": "CLEAR_CHAT"
        })

    # 1. NAVIGATION COMMANDS
    nav_match = re.search(r"go to (.*)|navigate to (.*)|open (.*)|show (.*)", message)
    if nav_match:
        target = (nav_match.group(1) or nav_match.group(2) or nav_match.group(3) or nav_match.group(4)).strip()
        
        tab_map = {
            "stats": "System Stats",
            "system stats": "System Stats",
            "usage": "Data Usage",
            "data usage": "Data Usage",
            "performance": "Global Performance",
            "global performance": "Global Performance",
            "reports": "Reports",
            "report": "Reports",
            "users": "User Management",
            "user management": "User Management",
            "coaches": "Coach Management",
            "coach management": "Coach Management",
            "analysts": "Analyst Management",
            "analyst management": "Analyst Management",
            "players": "Player Management",
            "player management": "Player Management",
            "data": "Data Control",
            "data control": "Data Control",
            "control": "Data Control",
            "seeder": "Data Control"
        }
        
        for key, tab in tab_map.items():
            if key in target:
                return Response({
                    "reply": f"Understood. Initiating navigation to **{tab}** node.",
                    "action": "NAVIGATE",
                    "payload": {"tab": tab}
                })

    # 2. DATA OPERATIONS (These trigger frontend handlers via action flags)
    if any(cmd in message for cmd in ["sync styles", "fetch styles", "update styles"]):
        return Response({
            "reply": "Acknowledged. I'll begin syncing player styles from external sources now.",
            "action": "SYNC_STYLES"
        })
    
    if any(cmd in message for cmd in ["reload matches", "seed matches", "refresh matches"]):
        return Response({
            "reply": "Received. Reloading all match data from YAML repositories. This will take a moment.",
            "action": "SEED_MATCHES"
        })

    if any(cmd in message for cmd in ["sync teams", "refresh teams"]):
        return Response({
            "reply": "Node synchronization in progress. Updating team registry from YAML configuration.",
            "action": "SYNC_TEAMS"
        })

    # 3. USER MANAGEMENT (Password Resets)
    reset_match = re.search(r"reset (.*) password to (.*)", message)
    if reset_match:
        username = reset_match.group(1).strip()
        new_password = reset_match.group(2).strip()
        try:
            user_to_reset = User.objects.get(username__iexact=username)
            user_to_reset.set_password(new_password)
            user_to_reset.save()
            return Response({
                "reply": f"Security overwrite successful. Password for **{username}** has been updated as requested.",
                "action": "STATUS_OK"
            })
        except User.DoesNotExist:
            return Response({"reply": f"Error: Subject **{username}** was not found in the central registry.", "action": "STATUS_ERROR"})

    # 4. FRANCHISE STAFF QUERIES
    staff_match = re.search(r"(?:who is the )?(coach|analyst) of (.*)", message)
    if staff_match:
        role_type, team_query = staff_match.group(1), staff_match.group(2)
        team = resolve_team(team_query)
        if not team: return Response({"reply": f"Team **{team_query}** not found.", "action": "NONE"})
        
        if role_type == "coach":
            staff = Coach.objects.filter(team=team).first()
            return Response({"reply": f"The Head Coach for **{team.name}** is **{staff.coach_name}**." if staff else f"No coach for {team.name}."})
        else:
            staff = Analyst.objects.filter(team=team).first()
            return Response({"reply": f"The Lead Analyst for **{team.name}** is **{staff.analyst_name}**." if staff else f"No analyst for {team.name}."})

    # 4.5 LIST COMMANDS
    if any(q in message for q in ["list all coaches", "all coaches", "show coaches"]):
        coaches = Coach.objects.all().select_related('team')
        reply = "Central Registry: **Assigned Coaches**\n" + "\n".join([f"- **{c.coach_name}** ({c.team.name})" for c in coaches])
        return Response({"reply": reply})
    
    if any(q in message for q in ["list all analysts", "all analysts", "show analysts"]):
        analysts = Analyst.objects.all().select_related('team')
        reply = "Central Registry: **Assigned Analysts**\n" + "\n".join([f"- **{a.analyst_name}** ({a.team.name if a.team else 'Global'})" for a in analysts])
        return Response({"reply": reply})

    # 5. PROJECT IDENTITY & KNOWLEDGE BASE
    if any(q in message for q in ["what is this project", "about this project", "who are you", "what do you do", "what is this"]):
        return Response({
            "reply": "This is **IPL-CORE Analytics**, a high-performance franchise management engine. \n\n"
                     "Designed for elite cricket staff, it provides: \n"
                     "- **Real-time Performance Metrics** for players. \n"
                     "- **Tactical Training Management** for Coaches. \n"
                     "- **Deep-Dive Data Intelligence** for Analysts. \n"
                     "- **Wikipedia Node Synchronization** for up-to-date styles. \n\n"
                     "I am **ADMIN-AI**, your automated interface for system governance.",
            "action": "INFO"
        })

    # 6. PLAYER PROFILES & ROSTERS
    roster_match = re.search(r"(?:players of |roster of |who plays for )(.*)", message)
    if roster_match:
        team_query = roster_match.group(1)
        team = resolve_team(team_query)
        if team:
            players = Player.objects.filter(team=team).order_by('name')
            reply = f"Tactical Roster for **{team.name}** ({players.count()} units):\n"
            reply += ", ".join([p.name for p in players[:15]]) + (f"... and {players.count()-15} more" if players.count() > 15 else "")
            return Response({"reply": reply, "context": {**context, "last_team_id": team.id}})
        return Response({"reply": f"Team **{team_query}** unrecognized."})

    profile_match = re.search(r"(?:who is |profile of |lookup |search for )(.*)", message)
    if profile_match:
        player_query = profile_match.group(1).strip()
        player_query = re.sub(r'[^\w\s]+$', '', player_query).strip() # Strip ?
        
        player = Player.objects.filter(name__icontains=player_query).first()
        if player:
            new_context = {**context, "last_player_id": player.id}
            reply = (
                f"Subject identified: **{player.name}**. \n"
                f"- **Team**: {player.team.name if player.team else 'Free Agent'}\n"
                f"- **Role**: {player.role or 'Unknown'}\n"
                f"- **Style**: {player.batting_style or 'N/A'} / {player.bowling_style or 'N/A'}"
            )
            return Response({
                "reply": reply,
                "action": "INFO",
                "context": new_context,
                "suggestions": ["Get Strike Rate", "Get Runs", "Get Wickets"]
            })
        return Response({"reply": f"No subject matching **{player_query}** found in the central registry.", "action": "NONE"})

    # 7. STATISTICAL QUERIES (Player Stats)
    # Match patterns like "ms dhoni strike rate", "his runs", "striking rate"
    stat_match = re.search(r"(.*) (strike rate|runs|wickets|avg|average|economy|econ|striking rate)", message)
    
    # Check for follow-up pronouns if a player was previously discussed
    is_follow_up = any(p in message for p in ["his ", "he ", "him ", "stats of ", "striking rate", "strike rate", "runs", "wickets"])
    
    player = None
    if stat_match:
        player_query = stat_match.group(1).replace("the code of", "").replace("his", "").strip()
        requested_stat = stat_match.group(2).strip()
        
        if not player_query and last_player_id:
             player = Player.objects.filter(id=last_player_id).first()
        else:
            player = Player.objects.filter(name__icontains=player_query).first()
    elif is_follow_up and last_player_id:
        player = Player.objects.filter(id=last_player_id).first()
        requested_stat = message # Use whole message to find keywords
    
    if player:
        name = player.name
        new_context = {**context, "last_player_id": player.id}
        reply = f"Accessing database for **{name}**... \n"
        
        # Determine stat type from message or captured group
        target_stat = requested_stat if 'requested_stat' in locals() else message
        
        if any(s in target_stat for s in ["runs", "avg", "average", "strike rate", "striking rate"]):
            # Batting Stats
            bat_dels = Delivery.objects.filter(batsman=player)
            runs = bat_dels.aggregate(total=Sum('runs_batsman'))['total'] or 0
            balls = bat_dels.count()
            outs = Delivery.objects.filter(player_out=player).count()
            
            if "runs" in target_stat:
                reply += f"- Total Runs: **{runs}**"
            elif "strike rate" in target_stat or "striking rate" in target_stat:
                sr = (float(runs) / float(balls) * 100.0) if balls > 0 else 0
                reply += f"- Strike Rate: **{sr:.2f}**"
            elif any(s in target_stat for s in ["avg", "average"]):
                avg = (float(runs) / float(outs)) if outs > 0 else float(runs)
                reply += f"- Batting Average: **{avg:.2f}**"
        
        elif any(s in target_stat for s in ["wickets", "economy", "econ"]):
            # Bowling Stats
            bowl_dels = Delivery.objects.filter(bowler=player)
            wickets = bowl_dels.filter(is_wicket=True, dismissal_type__in=[
                "bowled", "caught", "lbw", "stumped", "caught and bowled", "hit wicket"
            ]).count()
            runs_conceded = bowl_dels.aggregate(total=Sum('runs_total'))['total'] or 0
            balls_bowled = bowl_dels.count()
            overs = float(balls_bowled) / 6.0
            
            if "wickets" in target_stat:
                reply += f"- Total Wickets: **{wickets}**"
            elif "econ" in target_stat:
                econ = (float(runs_conceded) / overs) if overs > 0 else 0
                reply += f"- Economy: **{econ:.2f}**"
        
        return Response({
            "reply": reply,
            "action": "INFO",
            "context": new_context,
            "suggestions": ["Get Strike Rate", "Get Wickets", "Show Runs"]
        })

    # 7.5 PLAYER COMPARISON
    comp_match = re.search(r"compare (.*) and (.*)", message)
    if comp_match:
        p1_q, p2_q = comp_match.group(1), comp_match.group(2)
        p1 = Player.objects.filter(name__icontains=p1_q.strip()).first()
        p2 = Player.objects.filter(name__icontains=p2_q.strip()).first()
        if p1 and p2:
            s1 = Delivery.objects.filter(batsman=p1).aggregate(r=Sum('runs_batsman'), b=Count('id'))
            s2 = Delivery.objects.filter(batsman=p2).aggregate(r=Sum('runs_batsman'), b=Count('id'))
            sr1 = (s1['r']/s1['b']*100) if s1['b'] else 0
            sr2 = (s2['r']/s2['b']*100) if s2['b'] else 0
            return Response({"reply": f"**Comparison Analysis:**\n- **{p1.name}**: {s1['r']} runs (SR: {sr1:.1f})\n- **{p2.name}**: {s2['r']} runs (SR: {sr2:.1f})"})

    # 8. SYSTEM & TEAM QUERIES
    team_stat_match = re.search(r"(?:wins for |stats of )(.*)", message)
    if team_stat_match:
        team = resolve_team(team_stat_match.group(1))
        if team:
            wins = Match.objects.filter(winner__iexact=team.name).count()
            total = Match.objects.filter(Q(team1__iexact=team.name)|Q(team2__iexact=team.name)).count()
            return Response({"reply": f"**{team.name}** Archive:\n- Total Matches: {total}\n- Official Wins: **{wins}**"})

    if any(cmd in message for cmd in ["system status", "health", "metrics"]):
        user_count = User.objects.count()
        match_count = Match.objects.count()
        player_count = Player.objects.count()
        return Response({
            "reply": f"System Status: **HEALTHY**. \n- Users: {user_count}\n- Registered Players: {player_count}\n- Processed Matches: {match_count}",
            "action": "INFO",
            "context": context
        })

    return Response({
        "reply": "I recognized the input, but I don't have a direct protocol for that command yet. Try asking me to 'Navigate to Player Management' or 'Sync player styles'.",
        "action": "NONE"
    })
