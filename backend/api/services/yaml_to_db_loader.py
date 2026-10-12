import os
import yaml
from datetime import datetime
from django.db import transaction
from django.contrib.auth.models import User
from django.db import IntegrityError

from api.models import Match, Delivery, Player, Innings, Profile, Wicket
from api.utils.team_normalization import normalize_team_name
from api.utils.player_names import PLAYER_ALIASES


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YAML_FOLDER = os.path.join(BASE_DIR, "data", "ipl")


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def parse_date(date_value):
    """Convert YAML date to Python date"""
    if isinstance(date_value, list) and date_value:
        date_value = date_value[0]

    try:
        return datetime.strptime(str(date_value), "%Y-%m-%d").date()
    except Exception:
        return None


def get_or_create_user(player_name):
    """Create Django auth user for player if not exists"""

    if not player_name:
        return None

    try:
        full_name = PLAYER_ALIASES.get(player_name, player_name)
        user, created = User.objects.get_or_create(
            username=player_name,
            defaults={
                "first_name": player_name.split(" ")[0],
                "last_name": " ".join(player_name.split(" ")[1:]) if len(player_name.split(" ")) > 1 else "",
            }
        )

        if created:
            user.set_password(player_name)  # password same as username
            user.save()

        Profile.objects.update_or_create(user=user, defaults={"role": "player", "full_name": full_name})
        return user

    except IntegrityError:
        return User.objects.filter(username=player_name).first()


def get_or_create_player(player_name):
    """Ensure Player + linked User exists"""

    if not player_name:
        return None

    full_name = PLAYER_ALIASES.get(player_name, player_name)
    player, _ = Player.objects.get_or_create(name=player_name, defaults={"full_name": full_name})
    get_or_create_user(player_name)

    return player


# ---------------------------------------------------------
# MAIN LOADER
# ---------------------------------------------------------

@transaction.atomic
def load_yaml_to_db():
    """Load only NEW YAML matches into database"""

    if not os.path.exists(YAML_FOLDER):
        print("❌ YAML folder not found:", YAML_FOLDER)
        return

    yaml_files = [f for f in os.listdir(YAML_FOLDER) if f.endswith((".yaml", ".yml"))]

    # 🔥 Get already loaded matches
    existing_match_ids = set(
        Match.objects.values_list("match_id", flat=True)
    )

    total_matches = 0
    total_innings = 0
    total_deliveries = 0
    total_wickets = 0

    print(f"\n📂 Found {len(yaml_files)} YAML files")
    print("⏳ Checking for new matches...\n")

    for file in yaml_files:
        match_id = file.replace(".yaml", "").replace(".yml", "")

        # 🚀 Skip if already exists
        if match_id in existing_match_ids:
            continue

        file_path = os.path.join(YAML_FOLDER, file)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                match_data = yaml.safe_load(f)
        except Exception as e:
            print(f"❌ Error reading {file}: {e}")
            continue

        if not match_data:
            continue

        info = match_data.get("info", {})
        innings_data = match_data.get("innings", [])

        match_date = parse_date(info.get("dates"))

        match_obj = Match.objects.create(
            match_id=match_id,
            competition=info.get("competition"),
            match_type=info.get("match_type"),
            match_date=match_date,
            city=info.get("city"),
            venue=info.get("venue"),
            team1=normalize_team_name(info.get("teams", [None, None])[0]),
            team2=normalize_team_name(info.get("teams", [None, None])[1]),
            toss_winner=normalize_team_name(info.get("toss", {}).get("winner")),
            toss_decision=info.get("toss", {}).get("decision"),
            winner=normalize_team_name(info.get("outcome", {}).get("winner")),
        )

        total_matches += 1

        # ---------------- INNINGS ----------------
        for inning_index, inning in enumerate(innings_data, start=1):
            inning_dict = list(inning.values())[0]

            inning_obj = Innings.objects.create(
                match=match_obj,
                inning_number=inning_index,
                batting_team=normalize_team_name(inning_dict.get("team"))
            )

            total_innings += 1

            # -------------- DELIVERIES --------------
            for delivery in inning_dict.get("deliveries", []):
                ball_key = list(delivery.keys())[0]
                ball_data = delivery[ball_key]

                try:
                    over, ball = map(int, str(ball_key).split("."))
                except:
                    continue

                batsman = get_or_create_player(
                    ball_data.get("batter") or ball_data.get("batsman")
                )
                non_striker = get_or_create_player(ball_data.get("non_striker"))
                bowler = get_or_create_player(ball_data.get("bowler"))

                runs = ball_data.get("runs", {})
                runs_batsman = runs.get("batter") or runs.get("batsman") or 0
                runs_extras = runs.get("extras") or 0
                runs_total = runs.get("total") or 0

                wicket_data = ball_data.get("wicket")

                is_wicket = False
                dismissal_type = None
                player_out = None
                fielder = None

                if wicket_data:
                    is_wicket = True

                    if isinstance(wicket_data, dict):
                        dismissal_type = wicket_data.get("kind")
                        player_out = get_or_create_player(wicket_data.get("player_out"))

                        fielders = wicket_data.get("fielders", [])
                        if fielders:
                            fielder = get_or_create_player(fielders[0])

                delivery_obj = Delivery.objects.create(
                    match=match_obj,
                    inning=inning_obj,
                    over_number=over,
                    ball_number=ball,
                    batsman=batsman,
                    non_striker=non_striker,
                    bowler=bowler,
                    runs_batsman=runs_batsman,
                    runs_extras=runs_extras,
                    runs_total=runs_total,
                    is_wicket=is_wicket,
                    dismissal_type=dismissal_type,
                    player_out=player_out
                )

                total_deliveries += 1

                if is_wicket and dismissal_type and player_out:
                    Wicket.objects.create(
                        delivery=delivery_obj,
                        dismissal_type=dismissal_type,
                        bowler=bowler,
                        player_out=player_out,
                        fielder=fielder
                    )
                    total_wickets += 1

    print("\n✅ NEW MATCH LOAD COMPLETE")
    print(f"📌 New Matches Inserted: {total_matches}")
    print(f"📌 Innings Inserted: {total_innings}")
    print(f"📌 Deliveries Inserted: {total_deliveries}")
    print(f"📌 Wickets Inserted: {total_wickets}")