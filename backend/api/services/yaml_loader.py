import os
import yaml
from django.conf import settings

IPL_DATA_PATH = os.path.join(settings.BASE_DIR, 'api', 'data', 'ipl')

_cached_matches = None


def load_all_matches():
    global _cached_matches

    if _cached_matches is not None:
        return _cached_matches

    matches = []

    if not os.path.exists(IPL_DATA_PATH):
        return []

    for file in os.listdir(IPL_DATA_PATH):
        if file.endswith(".yaml"):
            file_path = os.path.join(IPL_DATA_PATH, file)

            with open(file_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                matches.append(data)

    _cached_matches = matches
    return matches

from django.core.cache import cache

cache.clear()
