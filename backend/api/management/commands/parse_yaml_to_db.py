import os
from django.core.management.base import BaseCommand

from api.services.yaml_db_parser import parse_yaml_and_store_to_db


class Command(BaseCommand):
    help = "Parse all YAML files and store match + player data into MySQL database"

    def handle(self, *args, **kwargs):

        yaml_folder = os.path.join("api", "data", "ipl")

        self.stdout.write(self.style.WARNING(f"Reading YAML files from: {yaml_folder}"))

        result = parse_yaml_and_store_to_db(yaml_folder)

        self.stdout.write(self.style.SUCCESS("✅ YAML Parsing Completed Successfully"))
        self.stdout.write(self.style.SUCCESS(f"YAML Files Processed: {result['yaml_files_processed']}"))
        self.stdout.write(self.style.SUCCESS(f"Matches Saved: {result['matches_saved']}"))
        self.stdout.write(self.style.SUCCESS(f"Players Saved: {result['players_saved']}"))
