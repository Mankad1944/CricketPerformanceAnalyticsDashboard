import os
import yaml
from django.contrib.auth import get_user_model
from django.db import transaction
from api.models import Profile

User = get_user_model()


def normalize_username(player_name: str) -> str:
    return player_name.strip().lower().replace(" ", "_")


@transaction.atomic
def create_players_from_yaml(yaml_folder_path: str):

    if not os.path.exists(yaml_folder_path):
        raise Exception(f"YAML folder does not exist: {yaml_folder_path}")

    yaml_files = [
        f for f in os.listdir(yaml_folder_path)
        if f.endswith(".yaml") or f.endswith(".yml")
    ]

    total_players_saved = 0

    for file_name in yaml_files:
        file_path = os.path.join(yaml_folder_path, file_name)

        with open(file_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        if not data:
            continue

        info = data.get("info", {})
        players_dict = info.get("players", {})

        for team_name, players_list in players_dict.items():
            for player_name in players_list:

                username = normalize_username(player_name)
                password = username

                user_obj, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "first_name": player_name,
                    }
                )

                if created:
                    user_obj.set_password(password)
                    user_obj.save()
                    total_players_saved += 1

                Profile.objects.get_or_create(
                    user=user_obj,
                    defaults={
                        "role": "player"
                    }
                )

    return {
        "players_saved": total_players_saved,
        "yaml_files_processed": len(yaml_files)
    }
