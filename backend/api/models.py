from django.db import models # type: ignore
from django.contrib.auth.models import User # type: ignore


class Profile(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("player", "Player"),
        ("coach", "Coach"),
        ("analyst", "Analyst"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True, default="")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="player")

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Match(models.Model):
    match_id = models.CharField(max_length=50, unique=True)
    competition = models.CharField(max_length=100, blank=True, null=True)
    match_type = models.CharField(max_length=50, blank=True, null=True)
    match_date = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    venue = models.CharField(max_length=200, blank=True, null=True)
    team1 = models.CharField(max_length=100, blank=True, null=True)
    team2 = models.CharField(max_length=100, blank=True, null=True)
    toss_winner = models.CharField(max_length=100, blank=True, null=True)
    toss_decision = models.CharField(max_length=20, blank=True, null=True)
    winner = models.CharField(max_length=100, blank=True, null=True)
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match_id} - {self.team1} vs {self.team2}"

class Innings(models.Model):
    match = models.ForeignKey("Match", on_delete=models.CASCADE)
    inning_number = models.IntegerField()
    batting_team = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.match.match_id} - Innings {self.inning_number}"

class Delivery(models.Model):
    match = models.ForeignKey("Match", on_delete=models.CASCADE)
    inning = models.ForeignKey("Innings", on_delete=models.CASCADE)

    over_number = models.IntegerField()
    ball_number = models.IntegerField()

    batsman = models.ForeignKey("Player", related_name="batting_deliveries", on_delete=models.CASCADE)
    non_striker = models.ForeignKey("Player", related_name="non_strike_deliveries", on_delete=models.CASCADE)
    bowler = models.ForeignKey("Player", related_name="bowling_deliveries", on_delete=models.CASCADE)

    runs_batsman = models.IntegerField(default=0)
    runs_extras = models.IntegerField(default=0)
    runs_total = models.IntegerField(default=0)

    is_wicket = models.BooleanField(default=False)
    dismissal_type = models.CharField(max_length=50, null=True, blank=True)
    player_out = models.ForeignKey("Player", null=True, blank=True, related_name="dismissals", on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.match.match_id} - {self.over_number}.{self.ball_number}"


class Player(models.Model):
    name = models.CharField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    team = models.ForeignKey("Team", on_delete=models.SET_NULL, null=True, blank=True, related_name="players")
    batting_style = models.CharField(max_length=100, null=True, blank=True)
    bowling_style = models.CharField(max_length=100, null=True, blank=True)
    role = models.CharField(max_length=100, null=True, blank=True)
    height_cm = models.IntegerField(null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fitness_score = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        team_display = f" ({self.team.name})" if self.team else ""
        return f"{self.name}{team_display}"

class Wicket(models.Model):
    delivery = models.ForeignKey("Delivery", on_delete=models.CASCADE)
    bowler = models.ForeignKey("Player", related_name="wickets_taken", on_delete=models.CASCADE)
    player_out = models.ForeignKey("Player", related_name="out_by", on_delete=models.CASCADE)
    dismissal_type = models.CharField(max_length=50)
    fielder = models.ForeignKey("Player", null=True, blank=True, related_name="fielding_wickets", on_delete=models.SET_NULL)

class Team(models.Model):
    team_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=100, default="Active")

    def __str__(self):
        return self.name

class TrainingSession(models.Model):
    INTENSITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="training_sessions")
    date = models.DateField()
    time = models.TimeField()
    venue = models.CharField(max_length=255)
    intensity = models.CharField(max_length=20, choices=INTENSITY_CHOICES, default='Medium')
    drills = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.team.name} - {self.date} at {self.venue}"

class Coach(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name="coach_profile")
    coach_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    team_name = models.CharField(max_length=255)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="coaches")

    def __str__(self):
        return self.coach_name


class Analyst(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name="analyst_profile")
    analyst_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    team_name = models.CharField(max_length=255, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="analysts", null=True, blank=True)

    def __str__(self):
        return self.analyst_name


class SystemActivityLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'Login'),
        ('REPORT_PDF', 'Export PDF'),
        ('REPORT_EXCEL', 'Export Excel'),
        ('VIEW_WEB', 'View Web Report'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs")
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.action} at {self.timestamp}"

class TeamCaptain(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="captains")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="captaincies")
    season = models.IntegerField()

    def __str__(self):
        return f"{self.player.name} - {self.team.name} ({self.season})"

    class Meta:
        unique_together = ('team', 'season')
