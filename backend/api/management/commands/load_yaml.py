from django.core.management.base import BaseCommand
from api.services.yaml_to_db_loader import load_yaml_to_db


class Command(BaseCommand):
    help = "Load YAML cricket data into MySQL database"

    def handle(self, *args, **kwargs):
        self.stdout.write("⏳ Loading YAML data into database...")
        load_yaml_to_db()
        self.stdout.write(self.style.SUCCESS("✅ YAML Data Loaded Successfully!"))
