from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # API Routes
    path("api/", include("api.urls")),
]
