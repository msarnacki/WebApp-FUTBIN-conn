# WebApp-FUTBIN-conn

Rozszerzenie Chrome wspierające handel w FIFA WebApp poprzez analizę danych cenowych z Futbin.com.
Stworzone z pomocą Kiro - Vibecoded

## Opis

WebApp-FUTBIN-conn to wtyczka Chrome, która automatycznie pobiera i analizuje dane cenowe kart FIFA z serwisu Futbin. Wtyczka integruje się z FIFA WebApp i pozwala na szybką analizę średnich cen sprzedaży dla wybranych graczy.

## Funkcjonalności

- **Automatyczne wykrywanie graczy** - wtyczka skanuje stronę FIFA WebApp i wykrywa dostępnych graczy
- **Analiza danych Futbin** - pobiera dane sprzedaży z Futbin.com i oblicza średnie ceny
- **Podział na typy sprzedaży**:
  - Licytacje (Bid) - średnia cena i liczba sprzedanych kart przez licytację
  - Kup teraz (Buy Now) - średnia cena i liczba sprzedanych kart przez "kup teraz"
- **Wizualizacja danych** - prosty wykres SVG z danymi cenowymi
- **Panel boczny** - wszystkie funkcje dostępne w wygodnym panelu bocznym Chrome

## Instalacja

### Wymagania
- Google Chrome (wersja 88+)
- Dostęp do FIFA WebApp (ea.com)

### Kroki instalacji

1. **Pobierz projekt**
   ```
   git clone [URL_REPOZYTORIUM]
   cd futbin-helper-v2
   ```

2. **Przygotuj ikony** (opcjonalne)
   - Umieść ikony PNG w folderze `icons/`:
     - `icon16.png` (16x16px)
     - `icon32.png` (32x32px) 
     - `icon48.png` (48x48px)

3. **Zainstaluj w Chrome**
   - Otwórz Chrome i przejdź do `chrome://extensions/`
   - Włącz "Tryb dewelopera" w prawym górnym rogu
   - Kliknij "Załaduj rozpakowane"
   - Wybierz folder z projektem
   - Wtyczka zostanie zainstalowana

## Użytkowanie

### Krok 1: Przygotowanie
1. Zaloguj się do FIFA WebApp (ea.com)
2. Przejdź do sekcji Transfer Market
3. Wyszukaj interesujące Cię karty

### Krok 2: Analiza
1. Kliknij ikonę FUTBIN Helper v2 w pasku narzędzi Chrome
2. Otwórz panel boczny wtyczki
3. Kliknij "Odśwież listę graczy" aby wykryć dostępnych graczy
4. Wybierz gracza i kliknij "Analizuj"

### Krok 3: Interpretacja wyników
Wtyczka wyświetli:
- **Wykres cenowy** - wizualizacja trendów cenowych
- **Dane licytacji** - średnia cena i liczba sprzedanych kart przez licytację
- **Dane "kup teraz"** - średnia cena i liczba sprzedanych kart przez natychmiastowy zakup

## Struktura projektu

```
futbin-helper-v2/
├── manifest.json          # Manifest rozszerzenia Chrome
├── background.js          # Service worker (logika główna)
├── content.js            # Content script (integracja z FIFA WebApp)
├── sidepanel.html        # Interface panelu bocznego
├── sidepanel.css         # Style panelu bocznego
├── sidepanel.js          # Logika panelu bocznego
├── popup.html            # Fallback popup (dla starszych wersji Chrome)
├── icons/                # Ikony rozszerzenia
│   ├── icon16.png
│   ├── icon32.png
│   └── icon48.png
├── INSTRUKCJA.md         # Szczegółowa instrukcja (PL)
└── README.txt            # Ten plik
```

## Konfiguracja

### Dodawanie nowych graczy

Aby dodać nowych graczy do słownika:

1. Otwórz plik `background.js`
2. Znajdź obiekt `cardDictionary`
3. Dodaj nową kartę w formacie:
   ```javascript
   "Nazwa Gracza": "id/nazwa-url"
   ```

Przykład:
```javascript
const cardDictionary = {
  "Xabi Alonso": "18792/xabi-alonso",
  "Lionel Messi": "158023/lionel-messi"
};
```

### Format URL Futbin
URL Futbin ma format: `https://www.futbin.com/26/sales/{id}/{nazwa}?platform=pc`

Gdzie:
- `{id}` - numeryczne ID gracza w Futbin
- `{nazwa}` - nazwa gracza w formacie URL (małe litery, myślniki zamiast spacji)

## Rozwiązywanie problemów

### Wtyczka nie wykrywa graczy
- Sprawdź czy jesteś na stronie ea.com
- Odśwież stronę FIFA WebApp (F5)
- Upewnij się, że gracze są widoczni na stronie

### Błąd pobierania danych z Futbin
- Sprawdź połączenie internetowe
- Upewnij się, że Futbin.com jest dostępny
- Sprawdź czy gracz istnieje w słowniku

### Wtyczka nie działa
- Sprawdź czy wtyczka jest włączona w `chrome://extensions/`
- Przeładuj wtyczkę w ustawieniach rozszerzeń
- Sprawdź konsolę deweloperską (F12) pod kątem błędów

## Uprawnienia

Wtyczka wymaga następujących uprawnień:
- `activeTab` - dostęp do aktywnej karty
- `storage` - przechowywanie ustawień
- `scripting` - wstrzykiwanie skryptów
- `sidePanel` - panel boczny
- `tabs` - zarządzanie kartami
- `debugger` - zaawansowane pobieranie danych

Domeny:
- `https://www.ea.com/*` - FIFA WebApp
- `https://www.futbin.com/*` - dane cenowe

## Technologie

- **JavaScript ES6+** - logika aplikacji
- **Chrome Extensions API v3** - integracja z przeglądarką
- **HTML5/CSS3** - interface użytkownika
- **SVG** - wizualizacja wykresów

## Licencja

Projekt dostępny na licencji MIT.

## Autor

FUTBIN Helper v2 - rozszerzenie Chrome dla społeczności FIFA

## Wsparcie

W przypadku problemów:
1. Sprawdź sekcję "Rozwiązywanie problemów"
2. Sprawdź konsolę deweloperską (F12)
3. Przeładuj wtyczkę w chrome://extensions/

---

**Uwaga**: Wtyczka jest niezależnym projektem i nie jest oficjalnie powiązana z EA Sports ani Futbin.com.