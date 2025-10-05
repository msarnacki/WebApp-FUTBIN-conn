#!/usr/bin/env python3
"""
Prosty skrypt do pobierania graczy z Futbin - tylko nazwa i URL
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import re

def scrape_futbin():
    """Pobiera graczy ze stron 1-5 Futbin"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    all_players = []
    
    for page in range(1, 6):
        url = f"https://www.futbin.com/players?page={page}&version=icons"
        print(f"Strona {page}...")
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Znajdź tabelę
            tbody = soup.select_one("#content-container > div.extra-columns-wrapper.relative > div.players-table-wrapper.custom-scrollbar.overflow-x > table > tbody")
            
            if tbody:
                # Znajdź linki graczy
                links = tbody.find_all('a', class_='table-player-name')
                
                for link in links:
                    name = link.get_text(strip=True)
                    href = link.get('href', '')
                    
                    # Przekształć "/26/player/18695/cruyff" na "18695/cruyff"
                    match = re.search(r'/26/player/(\d+)/([^/]+)', href)
                    if match:
                        url_part = f"{match.group(1)}/{match.group(2)}"
                        all_players.append([name, url_part])
                
                print(f"  Znaleziono {len(links)} graczy")
            
            time.sleep(1)  # Pauza
            
        except Exception as e:
            print(f"  Błąd: {e}")
    
    # Zapisz do CSV
    with open('players.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Nazwa', 'URL'])  # Nagłówki
        writer.writerows(all_players)
    
    print(f"\nZapisano {len(all_players)} graczy do players.csv")
    
    # Pokaż przykłady
    for i, (name, url) in enumerate(all_players[:5]):
        print(f"{name}, {url}")

if __name__ == "__main__":
    scrape_futbin()