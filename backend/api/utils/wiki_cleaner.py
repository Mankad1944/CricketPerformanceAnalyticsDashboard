import re

def clean_wiki_text(text):
    if not text:
        return "N/A"
    
    # 1. Handle templates like {{ubl|item1|item2}} or {{flatlist|...}}
    # Extract the items and join them
    def template_repl(match):
        items = match.group(1).split('|')
        # Filter out named parameters like 'class=...'
        items = [i for i in items if '=' not in i]
        return ', '.join(items)
    
    text = re.sub(r'\{\{(?:ubl|flatlist|plainlist)\|([^}]+)\}\}', template_repl, text, flags=re.IGNORECASE)
    
    # 2. Remove all other templates {{...}}
    text = re.sub(r'\{\{[^}]+\}\}', '', text)
    
    # 3. Extract text from Wikipedia links: [[link|text]] -> text
    text = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]|]+)\]\]', r'\1', text)
    
    # 4. Remove any remaining brackets, curly braces, or pipes
    text = text.replace('[[', '').replace(']]', '').replace('{{', '').replace('}}', '')
    text = text.replace('[', '').replace(']', '').replace('{', '').replace('}', '').replace('|', '')
    
    # 5. Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # 6. Remove any field markers like "| role =" that leaked in
    text = re.sub(r'(?i)\s*(role|batting|bowling)\s*=\s*', '', text)
    
    # 7. Clean up newlines and extra spaces
    text = text.replace('\n', ' ').replace('\r', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    
    if not text or text.lower() == 'n/a' or text == '':
        return "N/A"
    
    # 8. Ensure first letter is capitalized
    return text[0].upper() + text[1:]
