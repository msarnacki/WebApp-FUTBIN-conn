# FUTBIN Helper v2 - Instrukcja instalacji i użytkowania

## Instalacja

### 1. Przygotowanie ikon
- Stwórz 3 ikony PNG w folderze `icons/`:
  - `icon16.png` (16x16px)
  - `icon32.png` (32x32px) 
  - `icon48.png` (48x48px)

### 2. Instalacja wtyczki w Chrome
1. Otwórz Chrome i przejdź do `chrome://extensions/`
2. Włącz "Tryb dewelopera" (Developer mode) w prawym górnym rogu
3. Kliknij "Załaduj rozpakowane" (Load unpacked)
4. Wybierz folder z wtyczką (ten folder zawierający `manifest.json`)
5. Wtyczka zostanie zainstalowana i pojawi się w pasku narzędzi

### 3. Konfiguracja sidepanel
1. Kliknij prawym przyciskiem na ikonę wtyczki
2. Wybierz "Otwórz panel boczny" lub kliknij lewym przyciskiem na ikonę

## Użytkowanie

### Krok 1: Logowanie do FIFA WebApp
1. Przejdź na stronę EA FIFA WebApp
2. Zaloguj się na swoje konto
3. Przejdź do sekcji "Transfer Market"

### Krok 2: Wyszukiwanie karty
1. Wyszukaj kartę "Xabi Alonso" (lub inną z słownika)
2. Kliknij na kartę aby wyświetlić jej szczegóły
3. Upewnij się, że nazwa karty jest widoczna w selektorze: `#tns2-item2 > div > div.name.main-view`

### Krok 3: Analiza danych
1. Otwórz sidepanel wtyczki (kliknij ikonę wtyczki)
2. Sprawdź czy nazwa karty została wykryta
3. Kliknij przycisk "Analizuj dane"
4. Poczekaj na pobranie i analizę danych z Futbin

### Krok 4: Interpretacja wyników
Wtyczka wyświetli:
- **Wykres cenowy**: średnią cenę z danych SVG
- **Licytacje (Bid)**: średnią cenę i liczbę sprzedanych kart przez licytację
- **Kup teraz (Buy Now)**: średnią cenę i liczbę sprzedanych kart przez "kup teraz"

## Rozwiązywanie problemów

### Nie wykrywa nazwy karty
- Sprawdź czy jesteś na właściwej stronie FIFA WebApp
- Upewnij się, że karta jest załadowana i widoczna
- Odśwież stronę i spróbuj ponownie

### Błąd pobierania danych z Futbin
- Sprawdź połączenie internetowe
- Upewnij się, że Futbin.com jest dostępny
- Sprawdź czy karta istnieje w słowniku (obecnie tylko "Xabi Alonso")

### Wtyczka nie działa
- Sprawdź czy wtyczka jest włączona w `chrome://extensions/`
- Sprawdź konsolę deweloperską (F12) pod kątem błędów
- Przeładuj wtyczkę w ustawieniach rozszerzeń

## Dodawanie nowych kart

Aby dodać nowe karty do słownika:
1. Otwórz plik `background.js`
2. Znajdź obiekt `cardDictionary`
3. Dodaj nową kartę w formacie:
   ```javascript
   "Nazwa Karty": "id/nazwa-url"
   ```
4. Przeładuj wtyczkę w Chrome

Przykład URL Futbin: `https://www.futbin.com/26/sales/18792/xabi-alonso?platform=pc`
- ID karty: `18792`
- Nazwa URL: `xabi-alonso`
- Część słownika: `"18792/xabi-alonso"`

## Struktura plików

```
FUTBIN helper v2/
├── manifest.json          # Manifest wtyczki
├── background.js          # Service worker
├── content.js            # Content script dla FIFA WebApp
├── sidepanel.html        # HTML sidepanel
├── sidepanel.css         # Style sidepanel
├── sidepanel.js          # JavaScript sidepanel
├── icons/                # Folder z ikonami
│   ├── icon16.png
│   ├── icon32.png
│   └── icon48.png
├── INSTRUKCJA.md         # Ten plik
└── README.txt            # Oryginalna dokumentacja
```