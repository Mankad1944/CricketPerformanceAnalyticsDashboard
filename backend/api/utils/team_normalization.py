def normalize_team_name(name):
    """
    Consolidate team names into a single canonical version.
    Current rules:
    - Royal Challengers Bangalore -> Royal Challengers Bengaluru
    - Kings XI Punjab -> Punjab Kings
    """
    if not name:
        return name
    
    if name == "Royal Challengers Bangalore":
        return "Royal Challengers Bengaluru"
        
    if name == "Kings XI Punjab":
        return "Punjab Kings"
        
    return name
