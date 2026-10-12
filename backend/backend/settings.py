
import os
import importlib
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------
# Environment Variables
# --------------------------------------------------

try:
    from dotenv import load_dotenv

    # Load backend/.env first, otherwise root .env
    backend_env = BASE_DIR / ".env"
    root_env = BASE_DIR.parent / ".env"

    if backend_env.exists():
        load_dotenv(backend_env)
    elif root_env.exists():
        load_dotenv(root_env)
    else:
        load_dotenv()

except ImportError:
    pass


# --------------------------------------------------
# Optional Dependencies
# --------------------------------------------------

try:
    dj_database_url = importlib.import_module("dj_database_url")
except ImportError:
    dj_database_url = None

try:
    importlib.import_module("whitenoise")
    HAS_WHITENOISE = True
except ImportError:
    HAS_WHITENOISE = False


# --------------------------------------------------
# Temporary Database Switch
# --------------------------------------------------

# Set USE_SQLITE=true in Render to bypass MySQL temporarily.
# SQLite is intended for temporary testing, not production
# data storage unless persistent storage is configured.

USE_SQLITE = (
    os.environ.get("USE_SQLITE", "false").lower()
    in ("true", "1", "yes")
)


# --------------------------------------------------
# Security Settings
# --------------------------------------------------

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-change-this-key-for-production"
)

DEBUG = (
    os.environ.get("DEBUG", "True").lower()
    in ("true", "1", "yes")
)

allowed_hosts_env = os.environ.get("ALLOWED_HOSTS")

if allowed_hosts_env:
    ALLOWED_HOSTS = [
        host.strip()
        for host in allowed_hosts_env.split(",")
        if host.strip()
    ]
else:
    ALLOWED_HOSTS = ["*"]


# --------------------------------------------------
# Installed Applications
# --------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party applications
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Project application
    "api.apps.ApiConfig",
]


# --------------------------------------------------
# Middleware
# --------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
]

if HAS_WHITENOISE:
    MIDDLEWARE.append(
        "whitenoise.middleware.WhiteNoiseMiddleware"
    )

MIDDLEWARE += [
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# --------------------------------------------------
# URL and WSGI Configuration
# --------------------------------------------------

ROOT_URLCONF = "backend.urls"

WSGI_APPLICATION = "backend.wsgi.application"


# --------------------------------------------------
# Templates
# --------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# --------------------------------------------------
# Database Configuration
# --------------------------------------------------

database_url = os.environ.get("DATABASE_URL")

if USE_SQLITE:

    # Temporary mode: do not connect to MySQL.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

elif database_url and dj_database_url:

    # Hosted database configured through DATABASE_URL.
    DATABASES = {
        "default": dj_database_url.parse(
            database_url,
            conn_max_age=600,
        )
    }

    if "mysql" in database_url.lower():
        DATABASES["default"]["ENGINE"] = (
            "django.db.backends.mysql"
        )
        DATABASES["default"].setdefault("OPTIONS", {})
        DATABASES["default"]["OPTIONS"]["charset"] = "utf8mb4"

else:

    # Existing MySQL configuration.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.environ.get(
                "DB_NAME", "cricket_analytics"
            ),
            "USER": os.environ.get("DB_USER", "root"),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
            },
        }
    }

    db_ssl_ca = os.environ.get("DB_SSL_CA")

    if db_ssl_ca:
        DATABASES["default"]["OPTIONS"]["ssl"] = {
            "ca": db_ssl_ca
        }


# --------------------------------------------------
# Password Validation
# --------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# --------------------------------------------------
# Internationalization
# --------------------------------------------------

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# --------------------------------------------------
# Static Files
# --------------------------------------------------

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

if HAS_WHITENOISE:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": (
                "whitenoise.storage."
                "CompressedManifestStaticFilesStorage"
            ),
        },
    }


# --------------------------------------------------
# Default Primary Key
# --------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --------------------------------------------------
# Django REST Framework
# --------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}


# --------------------------------------------------
# JWT Configuration
# --------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = (
    os.environ.get(
        "CORS_ALLOW_ALL_ORIGINS", "True"
    ).lower()
    in ("true", "1", "yes")
)

cors_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS")

if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [
        origin.strip()
        for origin in cors_origins_env.split(",")
        if origin.strip()
    ]

CORS_ALLOW_CREDENTIALS = True
