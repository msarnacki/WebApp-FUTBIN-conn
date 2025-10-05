#!/usr/bin/env python3
"""
Skrypt do pobierania listy graczy z Futbin
Pobiera strony 1-5 i wyciąga nazwy graczy oraz linki
"""

import requests
from bs4 import BeautifulSoup
import csv
import time
import re

def get_players_from_page(page_num):
    """Pobiera graczy z jednej strony Futbin"""
    url = f"https://www.futbin.com/players?page={page_num}&version=icons"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print(f"Pobieranie strony {page_num}...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Znajdź tabelę z graczami
        tbody = soup.select_one("#content-container > div.extra-columns-wrapper.relative > div.players-table-wrapper.custom-scrollbar.overflow-x > table > tbody")
        
        if not tbody:
            print(f"  ❌ Nie znaleziono tabeli na stronie {page_num}")
            return []
        
        # Znajdź wszystkie linki do graczy
        player_links = tbody.find_all('a', class_='table-player-name')
        
        players = []
        for link in player_links:
            try:
                # Wyciągnij nazwę gracza
                player_name = link.get_text(strip=True)
                
                # Wyciągnij href i przekształć na format ID/nazwa
                href = link.get('href', '')
                # href wygląda jak "/26/player/18695/cruyff"
                # chcemy "18695/cruyff"
                
                match = re.search(r'/26/player/(\d+)/([^/]+)', href)
                if match:
                    player_id = match.group(1)
                    player_slug = match.group(2)
                    player_url = f"{player_id}/{player_slug}"
                    
                    players.append({
                        'name': player_name,
                        'url': player_url,
                        'full_href': href
                    })
                    
            except Exception as e:
                print(f"  ⚠️ Błąd przetwarzania gracza: {e}")
                continue
        
        print(f"  ✅ Znaleziono {len(players)} graczy na stronie {page_num}")
        return players
        
    except requests.RequestException as e:
        print(f"  ❌ Błąd pobierania strony {page_num}: {e}")
        return []
    except Exception as e:
        print(f"  ❌ Nieoczekiwany błąd na stronie {page_num}: {e}")
        return []

def main():
    """Główna funkcja skryptu"""
    print("🚀 Rozpoczynam pobieranie graczy z Futbin...")
    
    all_players = []
    
    # Pobierz strony 1-5
    for page in range(1, 6):
        players = get_players_from_page(page)
        all_players.extend(players)
        
        # Pauza między requestami żeby nie przeciążać serwera
        if page < 5:
            time.sleep(2)
    
    print(f"\n📊 Łącznie znaleziono {len(all_players)} graczy")
    
    if not all_players:
        print("❌ Nie znaleziono żadnych graczy!")
        return
    
    # Zapisz do CSV
    csv_filename = 'futbin_players.csv'
    
    try:
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['name', 'url', 'full_href']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Nagłówki
            writer.writeheader()
            
            # Dane graczy
            for player in all_players:
                writer.writerow(player)
        
        print(f"✅ Zapisano dane do pliku: {csv_filename}")
        
        # Pokaż przykłady
        print(f"\n📋 Pierwsze 5 graczy:")
        for i, player in enumerate(all_players[:5]):
            print(f"  {i+1}. {player['name']} -> {player['url']}")
        
        if len(all_players) > 5:
            print(f"  ... i {len(all_players) - 5} więcej")
            
    except Exception as e:
        print(f"❌ Błąd zapisywania do CSV: {e}")

if __name__ == "__main__":
    main()