// Background script dla FUTBIN Helper v2
chrome.action.onClicked.addListener(async (tab) => {
  // Sprawdź czy sidePanel API jest dostępne
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Błąd otwierania sidepanel:', error);
      // Fallback - użyj popup
      chrome.action.setPopup({ popup: 'popup.html' });
    }
  } else {
    // Brak wsparcia dla sidePanel - użyj popup
    console.log('SidePanel API niedostępne, używam popup');
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});

// Inicjalizacja przy instalacji
chrome.runtime.onInstalled.addListener(() => {
  // Sprawdź czy sidePanel jest dostępne
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    try {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      console.log('Nie można ustawić sidepanel behavior:', error);
      // Ustaw popup jako fallback
      chrome.action.setPopup({ popup: 'popup.html' });
    }
  } else {
    // Ustaw popup jako domyślny
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});

// Słownik kart - nazwa karty -> część URL
const cardDictionary = {
  "Xabi Alonso": "18792/xabi-alonso",
  // Dodaj więcej graczy tutaj w formacie:
  // "Nazwa Gracza": "id/nazwa-url"
};

// Funkcja do wyszukiwania gracza w słowniku (case-insensitive)
function findPlayerInDictionary(playerName) {
  // Dokładne dopasowanie
  if (cardDictionary[playerName]) {
    return cardDictionary[playerName];
  }

  // Wyszukiwanie case-insensitive
  const lowerPlayerName = playerName.toLowerCase();
  for (const [key, value] of Object.entries(cardDictionary)) {
    if (key.toLowerCase() === lowerPlayerName) {
      return value;
    }
  }

  // Wyszukiwanie częściowe (zawiera)
  for (const [key, value] of Object.entries(cardDictionary)) {
    if (key.toLowerCase().includes(lowerPlayerName) || lowerPlayerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

// Funkcja do pobierania danych z Futbin - uproszczona wersja
async function fetchFutbinData(cardUrlPart) {
  const url = `https://www.futbin.com/26/sales/${cardUrlPart}?platform=pc`;
  console.log('🌐 Pobieranie danych z:', url);

  // Timeout dla całej operacji (30 sekund)
  return await Promise.race([
    performFetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout - operacja trwała zbyt długo (30s)')), 30000)
    )
  ]);
}

// Funkcja wykonująca faktyczne pobieranie
async function performFetch(url) {
  try {
    // Spróbuj bezpośredniego fetch (może zadziałać w niektórych przypadkach)
    console.log('🔄 Próbuję bezpośredniego fetch...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (response.ok) {
      const html = await response.text();
      console.log('✅ Pobrano HTML, długość:', html.length);

      // Parsuj HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Analiza danych
      const result = analyzeHtmlContent(doc);
      console.log('📊 Wyniki analizy:', result);

      return { success: true, ...result };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

  } catch (fetchError) {
    console.log('❌ Bezpośredni fetch nie zadziałał:', fetchError.message);
    console.log('🔄 Próbuję przez kartę w tle...');

    // Fallback - użyj karty w tle
    return await fetchViaBackgroundTab(url);
  }
}

// Funkcja do pobierania przez kartę w tle (fallback)
async function fetchViaBackgroundTab(url) {
  let tab = null;

  try {
    // Stwórz kartę w tle
    tab = await chrome.tabs.create({
      url: url,
      active: false
    });

    console.log('📋 Utworzono kartę Futbin:', tab.id);

    // Poczekaj na załadowanie z dłuższym timeoutem
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout - strona nie załadowała się w 15 sekund'));
      }, 15000);

      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeoutId);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    console.log('✅ Strona załadowana, sprawdzam czy karta nadal istnieje...');

    // Sprawdź czy karta nadal istnieje
    try {
      const tabInfo = await chrome.tabs.get(tab.id);
      console.log('📋 Karta istnieje:', tabInfo.url);
    } catch (error) {
      throw new Error('Karta została zamknięta podczas ładowania');
    }

    console.log('⏳ Czekam 5 sekund na pełne załadowanie...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Sprawdź czy możemy w ogóle wstrzyknąć skrypt
    console.log('🔍 Sprawdzam czy możemy wstrzyknąć skrypt na Futbin...');

    let results;
    try {
      // Sprawdź uprawnienia do karty
      const tabInfo = await chrome.tabs.get(tab.id);
      console.log('📋 Info o karcie:', {
        url: tabInfo.url,
        status: tabInfo.status,
        title: tabInfo.title
      });

      // Spróbuj wstrzyknąć bardzo prosty skrypt z timeoutem
      console.log('💉 Próbuję wstrzyknąć prosty skrypt z timeoutem...');

      await Promise.race([
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Bardzo prosty test - tylko console.log
            console.log('🧪 Test executeScript działa na Futbin!');
            return 'OK';
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout alert - 3 sekundy')), 3000)
        )
      ]);

      console.log('✅ Prosty skrypt wykonany - executeScript działa');

      // Teraz spróbuj pobrać podstawowe dane
      console.log('📄 Próbuję pobrać podstawowe dane...');

      results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          };
        }
      });

      console.log('📊 Podstawowe dane:', results[0].result);

      // Spróbuj pobrać HTML w kawałkach
      console.log('📄 Próbuję pobrać HTML...');

      const htmlResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          try {
            const html = document.documentElement.outerHTML;
            return {
              success: true,
              htmlLength: html.length,
              htmlSample: html.substring(0, 2000), // Pierwsze 2000 znaków
              hasTable: !!document.querySelector('table'),
              hasSvg: !!document.querySelector('svg'),
              bodyText: document.body ? document.body.textContent.substring(0, 300) : 'brak body',
              html: html // Pełny HTML
            };
          } catch (error) {
            return {
              success: false,
              error: error.message
            };
          }
        }
      });

      const htmlData = htmlResults[0].result;
      console.log('📄 HTML dane:', htmlData);

      if (!htmlData.success) {
        throw new Error(`Błąd pobierania HTML: ${htmlData.error}`);
      }

      // Ustaw results dla dalszego przetwarzania
      results = [{
        result: {
          url: results[0].result.url,
          title: results[0].result.title,
          readyState: results[0].result.readyState,
          html: htmlData.html,
          htmlLength: htmlData.htmlLength,
          hasTable: htmlData.hasTable,
          hasSvg: htmlData.hasSvg,
          bodyText: htmlData.bodyText
        }
      }];

    } catch (error) {
      console.error('❌ Błąd wstrzykiwania skryptu:', error);

      // Jeśli executeScript nie działa, spróbuj alternatywnego podejścia
      console.log('🔄 executeScript nie działa, próbuję alternatywnego podejścia...');

      try {
        // Spróbuj użyć debugger API do pobrania HTML
        console.log('🐛 Próbuję debugger API...');

        // Włącz debugger dla karty
        await chrome.debugger.attach({ tabId: tab.id }, '1.3');

        // Pobierz HTML przez debugger
        const result = await chrome.debugger.sendCommand(
          { tabId: tab.id },
          'Runtime.evaluate',
          { expression: 'document.documentElement.outerHTML' }
        );

        if (result.result && result.result.value) {
          console.log('✅ HTML pobrany przez debugger API, długość:', result.result.value.length);

          // Pobierz aktualne info o karcie
          const currentTabInfo = await chrome.tabs.get(tab.id);

          // Ustaw results dla dalszego przetwarzania
          results = [{
            result: {
              url: currentTabInfo.url,
              title: currentTabInfo.title,
              readyState: 'complete',
              html: result.result.value,
              htmlLength: result.result.value.length,
              debuggerUsed: true
            }
          }];

          // NIE wyłączaj debugger jeszcze - będziemy go potrzebować do analizy
        } else {
          // Wyłącz debugger jeśli nie udało się pobrać HTML
          await chrome.debugger.detach({ tabId: tab.id });
          throw new Error('Debugger API nie zwróciło HTML');
        }

      } catch (debuggerError) {
        console.error('❌ Debugger API też nie działa:', debuggerError);

        // Sprawdź czy to problem z uprawnieniami
        if (error.message.includes('Cannot access')) {
          throw new Error('Brak uprawnień do strony Futbin - sprawdź manifest.json');
        } else if (error.message.includes('No tab with id')) {
          throw new Error('Karta została zamknięta');
        } else {
          throw new Error(`Ani executeScript ani debugger API nie działają. executeScript: ${error.message}, debugger: ${debuggerError.message}`);
        }
      }
    }

    console.log('📊 Wyniki executeScript:', results);

    if (!results || !results[0] || !results[0].result) {
      throw new Error('Nie otrzymano wyników z executeScript');
    }

    const { html, url: resultUrl, title, readyState } = results[0].result;
    console.log('📄 Pobrano HTML z karty:');
    console.log('  - Długość HTML:', html?.length || 0);
    console.log('  - URL:', resultUrl);
    console.log('  - Tytuł:', title);
    console.log('  - Stan:', readyState);

    if (!html || html.length < 1000) {
      throw new Error(`HTML zbyt krótki (${html?.length || 0} znaków) - strona może nie być załadowana`);
    }

    // Parsuj HTML w kontekście karty (gdzie jest dostępny DOM)
    console.log('🔍 Analizuję HTML w kontekście karty...');

    let analysisResult;
    try {
      // Użyj debugger API do analizy HTML
      const analysisCommand = await chrome.debugger.sendCommand(
        { tabId: tab.id },
        'Runtime.evaluate',
        {
          returnByValue: true,
          expression: `
            (function() {
              try {
                console.log('🔍 Analizuję dane sprzedaży jak w working example...');
                
                // Pobierz dane sprzedaży z tabeli - sprawdź różne selektory
                console.log('🔍 Sprawdzam różne selektory tabeli...');
                
                const allTables = document.querySelectorAll('table');
                console.log('📊 Wszystkich tabel:', allTables.length);
                
                const allTbodies = document.querySelectorAll('tbody');
                console.log('📊 Wszystkich tbody:', allTbodies.length);
                
                const allTrs = document.querySelectorAll('tr');
                console.log('📊 Wszystkich tr:', allTrs.length);
                
                // Spróbuj konkretnego selektora XPath
                console.log('🎯 Próbuję konkretnego selektora XPath...');
                
                // Funkcja do konwersji XPath na CSS selector
                function xpathToElement(xpath) {
                  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                  return result.singleNodeValue;
                }
                
                // Spróbuj konkretnego CSS selektora z Futbin
                console.log('🎯 Próbuję konkretnego CSS selektora...');
                const cssSelector = 'body > div.widthControl.mainPagePadding > div.playersalesoverviewpage.medium-column > div.grid-auto-300 > div.sales-main-content.full-width > div.auctions-table-box.medium-column.text-nowrap.full-width-mobile-box > div.auctions-table-wrapper.custom-scrollbar > table > tbody';
                let targetTbody = document.querySelector(cssSelector);
                console.log('🎯 CSS tbody znaleziony:', !!targetTbody);
                
                let rows = [];
                if (targetTbody) {
                  rows = targetTbody.querySelectorAll('tr');
                  console.log('🎯 CSS tbody tr:', rows.length);
                }
                
                // Fallback - spróbuj XPath
                if (rows.length === 0) {
                  console.log('🎯 Próbuję XPath jako fallback...');
                  const xpathSelector = '/html/body/div[1]/div[1]/div[5]/div[1]/div[2]/div[2]/table/tbody';
                  const result = document.evaluate(xpathSelector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                  targetTbody = result.singleNodeValue;
                  console.log('🎯 XPath tbody znaleziony:', !!targetTbody);
                  
                  if (targetTbody) {
                    rows = targetTbody.querySelectorAll('tr');
                    console.log('🎯 XPath tbody tr:', rows.length);
                  }
                }
                
                // Fallback - spróbuj różnych selektorów CSS
                if (rows.length === 0) {
                  rows = document.querySelectorAll('table tbody tr');
                  console.log('📊 table tbody tr:', rows.length);
                }
                
                if (rows.length === 0) {
                  rows = document.querySelectorAll('tbody tr');
                  console.log('📊 tbody tr:', rows.length);
                }
                
                if (rows.length === 0) {
                  rows = document.querySelectorAll('table tr');
                  console.log('📊 table tr:', rows.length);
                }
                
                if (rows.length === 0) {
                  rows = document.querySelectorAll('tr');
                  console.log('📊 tr (wszystkie):', rows.length);
                }
                
                console.log('📊 Używam wierszy:', rows.length);
                
                const sales = [];
                
                const bidSales = [];
                const buyNowSales = [];
                let processedRows = 0;
                
                rows.forEach((row, index) => {
                  if (index < 5) { // Log pierwszych 5 wierszy dla debugowania
                    console.log('Wiersz', index, ':', row.cells.length, 'komórek');
                    // Pokaż wszystkie komórki dla pierwszych wierszy
                    for (let i = 0; i < row.cells.length && i < 8; i++) {
                      console.log('  - Komórka', i + ':', row.cells[i]?.textContent?.trim());
                    }
                  }
                  
                  // Zgodnie z README: 6 kolumn w tabeli
                  if (row.cells.length >= 6) {
                    processedRows++;
                    
                    // Kolumna 0: data (pierwsza kolumna)
                    const timeText = row.cells[0]?.textContent?.trim();
                    
                    // Kolumna 1: cena sprzedaży (druga kolumna, indeks 1)
                    const priceText = row.cells[1]?.textContent?.trim();
                    
                    // Kolumna 5: typ oferty (ostatnia kolumna, indeks 5)
                    const typeText = row.cells[5]?.textContent?.trim();
                    
                    if (index < 10) {
                      console.log('Parsowanie wiersza', index, '- priceText:', '"' + priceText + '"', 'typeText:', '"' + typeText + '"', 'timeText:', '"' + timeText + '"');
                    }
                    
                    if (priceText && /[0-9]/.test(priceText)) {
                      // Usuń wszystko oprócz cyfr i przecinków, potem usuń przecinki (separator tysięcy)
                      const cleanPrice = priceText.replace(/[^0-9,]/g, '').replace(/,/g, '');
                      const price = parseInt(cleanPrice, 10);
                      
                      if (index < 10) {
                        console.log('  - cleanPrice:', '"' + cleanPrice + '"', 'price:', price);
                      }
                      
                      if (!isNaN(price) && price > 0) {
                        const saleData = {
                          price: price,
                          timeText: timeText,
                          type: typeText
                        };
                        
                        // Rozdziel na Bid i Buy Now na podstawie typu
                        // Pusta wartość = nie sprzedano, "Bid" = licytacja, "Buy Now" = kup teraz
                        if (index < 10) {
                          console.log('  - Typ oferty:', '"' + typeText + '"', 'Cena:', price);
                        }
                        
                        if (typeText === 'Bid') {
                          bidSales.push(saleData);
                        } else if (typeText === 'Buy Now') {
                          buyNowSales.push(saleData);
                        } else if (typeText === '' || typeText === null || typeText === undefined) {
                          // Pusta wartość = nie sprzedano - pomijamy
                          if (index < 10) {
                            console.log('  - Nie sprzedano (pusta wartość)');
                          }
                        } else {
                          // Log nieznanych typów
                          if (index < 10) {
                            console.log('  - Nieznany typ oferty:', '"' + typeText + '"');
                          }
                        }
                        
                        // Dodaj do ogólnej listy tylko sprzedane (nie puste)
                        if (typeText === 'Bid' || typeText === 'Buy Now') {
                          sales.push({
                            soldFor: price,
                            timeText: timeText,
                            type: typeText
                          });
                        }
                      }
                    }
                  } else if (index < 5) {
                    console.log('Wiersz', index, 'ma za mało kolumn:', row.cells.length, '(wymagane: 6)');
                  }
                });
                
                console.log('📊 Przetworzono wierszy:', processedRows, 'z', rows.length);
                console.log('📊 Znaleziono sprzedaży:', sales.length);
                console.log('📊 Bid sprzedaży:', bidSales.length);
                console.log('📊 Buy Now sprzedaży:', buyNowSales.length);
                
                // Pokaż przykłady znalezionych typów
                if (sales.length > 0) {
                  const uniqueTypes = [...new Set(sales.map(s => s.type))];
                  console.log('📊 Unikalne typy ofert:', uniqueTypes);
                }
                
                // Oblicz średnią dla każdej kategorii
                function calculateAverage(data) {
                  const prices = data.map(item => item.price);
                  const count = prices.length;
                  const sum = prices.reduce((acc, val) => acc + val, 0);
                  const average = count > 0 ? Math.round(sum / count) : null;
                  return { average, count };
                }
                
                const bidResult = calculateAverage(bidSales);
                const buyNowResult = calculateAverage(buyNowSales);
                const overallResult = calculateAverage(sales.map(s => ({ price: s.soldFor })));
                
                console.log('📊 Bid - Średnia:', bidResult.average, 'Liczba:', bidResult.count);
                console.log('📊 Buy Now - Średnia:', buyNowResult.average, 'Liczba:', buyNowResult.count);
                console.log('📊 Ogółem - Średnia:', overallResult.average, 'Liczba:', overallResult.count);
                
                // Sprawdź SVG wykres - użyj selektora z README
                console.log('📊 Szukam SVG wykresu...');
                
                // Selektor z README (może się zmieniać ID)
                let chartPath = document.querySelector('path.highcharts-graph');
                console.log('📊 Znaleziono path.highcharts-graph:', !!chartPath);
                
                if (!chartPath) {
                  // Spróbuj bardziej ogólnego selektora dla highcharts
                  const alternativeSelectors = [
                    'g.highcharts-series path.highcharts-graph',
                    'g.highcharts-areaspline-series path.highcharts-graph',
                    'svg g.highcharts-series-group path.highcharts-graph',
                    'path[class*="highcharts-graph"]',
                    'svg path[d*="M"]'
                  ];
                  
                  for (const selector of alternativeSelectors) {
                    chartPath = document.querySelector(selector);
                    if (chartPath) {
                      console.log('📊 Znaleziono wykres przez:', selector);
                      break;
                    }
                  }
                }
                
                let svgAnalysis = null;
                if (chartPath) {
                  const pathData = chartPath.getAttribute('d');
                  console.log('📐 Path data (pierwsze 100 znaków):', pathData ? pathData.substring(0, 100) : 'brak');
                  console.log('📐 Klasa path:', chartPath.className.baseVal || chartPath.className);
                  
                  if (pathData) {
                    // Wyciągnij liczby z path (współrzędne Y mogą reprezentować ceny)
                    const numbers = pathData.match(/[0-9.]+/g);
                    console.log('📐 Znaleziono liczb w path:', numbers ? numbers.length : 0);
                    
                    if (numbers && numbers.length > 4) {
                      const yCoords = [];
                      // Weź co drugą liczbę jako współrzędną Y
                      for (let i = 1; i < numbers.length; i += 2) {
                        const y = parseFloat(numbers[i]);
                        if (!isNaN(y)) yCoords.push(y);
                      }
                      
                      console.log('📐 Współrzędne Y:', yCoords.slice(0, 10)); // Pierwsze 10 dla debugowania
                      
                      if (yCoords.length > 0) {
                        const average = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;
                        svgAnalysis = {
                          average: Math.round(average),
                          dataPoints: yCoords.length,
                          pathClass: chartPath.className.baseVal || chartPath.className,
                          rawData: yCoords // Dodaj surowe dane do rysowania wykresu
                        };
                        console.log('📊 SVG analiza:', svgAnalysis);
                        console.log('📊 Surowe dane Y (pierwsze 10):', yCoords.slice(0, 10));
                      }
                    }
                  }
                } else {
                  console.log('❌ Nie znaleziono żadnego path wykresu');
                }
                
                return {
                  success: true,
                  tableAnalysis: {
                    bid: {
                      average: bidResult.average,
                      count: bidResult.count
                    },
                    buyNow: {
                      average: buyNowResult.average,
                      count: buyNowResult.count
                    },
                    overall: {
                      average: overallResult.average,
                      count: overallResult.count
                    },
                    rawSales: sales.slice(0, 5) // Pierwsze 5 dla debugowania
                  },
                  svgAnalysis: svgAnalysis,
                  debug: {
                    totalRows: rows.length,
                    totalSvgPaths: document.querySelectorAll('svg path[d]').length,
                    foundChartPath: !!chartPath,
                    chartPathClass: chartPath ? (chartPath.className.baseVal || chartPath.className) : null,
                    bidSales: bidSales.length,
                    buyNowSales: buyNowSales.length,
                    url: window.location.href,
                    title: document.title
                  }
                };
                
              } catch (error) {
                console.error('❌ Błąd w analizie:', error);
                return {
                  success: false,
                  error: error.message,
                  stack: error.stack
                };
              }
            })()
          `
        }
      );

      console.log('📊 Raw analysisCommand:', analysisCommand);

      if (analysisCommand.result) {
        if (analysisCommand.result.value) {
          analysisResult = analysisCommand.result.value;
          console.log('📊 Wynik analizy HTML:', analysisResult);
        } else if (analysisCommand.result.exceptionDetails) {
          console.error('❌ Błąd w JavaScript analizy:', analysisCommand.result.exceptionDetails);
          throw new Error(`JavaScript error: ${analysisCommand.result.exceptionDetails.text}`);
        } else {
          console.error('❌ Brak value w result:', analysisCommand.result);
          throw new Error('Analiza HTML nie zwróciła value');
        }
      } else {
        console.error('❌ Brak result w analysisCommand:', analysisCommand);
        throw new Error('Analiza HTML nie zwróciła result');
      }

    } catch (analysisError) {
      console.error('❌ Błąd analizy HTML:', analysisError);
      analysisResult = {
        svgAnalysis: null,
        tableAnalysis: null,
        debug: { error: analysisError.message }
      };
    }

    // Wyłącz debugger i zamknij kartę po analizie
    if (tab?.id) {
      try {
        // Wyłącz debugger
        await chrome.debugger.detach({ tabId: tab.id });
        console.log('✅ Debugger odłączony');

        // Zamknij kartę
        await chrome.tabs.remove(tab.id);
        console.log('✅ Karta zamknięta po analizie');
      } catch (e) {
        console.error('Błąd zamykania karty/debugger:', e);
      }
    }

    return { success: true, ...analysisResult };

  } catch (error) {
    console.error('❌ Błąd pobierania przez kartę:', error);

    if (tab?.id) {
      try {
        // Wyłącz debugger jeśli był włączony
        try {
          await chrome.debugger.detach({ tabId: tab.id });
        } catch (debuggerError) {
          // Debugger może już być wyłączony
        }

        await chrome.tabs.remove(tab.id);
      } catch (e) {
        console.error('Błąd zamykania karty:', e);
      }
    }

    return { success: false, error: error.message };
  }
}

// Funkcja do analizy HTML content
function analyzeHtmlContent(doc) {
  console.log('🔍 Analizuję HTML content...');

  // Sprawdź podstawowe informacje o dokumencie
  const allTables = doc.querySelectorAll('table');
  const allSvgs = doc.querySelectorAll('svg');
  const allPaths = doc.querySelectorAll('path');

  console.log('📊 Elementy w dokumencie:');
  console.log('  - Tabele:', allTables.length);
  console.log('  - SVG:', allSvgs.length);
  console.log('  - Paths:', allPaths.length);

  // Wypisz pierwsze kilka tabel i SVG dla debugowania
  allTables.forEach((table, i) => {
    if (i < 3) {
      console.log(`  - Tabela ${i}:`, table.className, 'wierszy:', table.rows?.length || 0);
    }
  });

  allSvgs.forEach((svg, i) => {
    if (i < 3) {
      console.log(`  - SVG ${i}:`, svg.className, 'paths:', svg.querySelectorAll('path').length);
    }
  });

  // Szukaj różnych selektorów SVG
  const svgSelectors = [
    'path.highcharts-graph',
    '.highcharts-graph',
    'path[class*="highcharts"]',
    'svg path[d*="M"]',
    'svg path' // Bardziej ogólny selektor
  ];

  let svgPath = null;
  for (const selector of svgSelectors) {
    const elements = doc.querySelectorAll(selector);
    console.log(`🔍 Selektor "${selector}" znalazł ${elements.length} elementów`);

    if (elements.length > 0) {
      svgPath = elements[0]; // Weź pierwszy
      console.log('✅ Znaleziono SVG przez:', selector);
      console.log('📐 Path data:', svgPath.getAttribute('d')?.substring(0, 100) + '...');
      break;
    }
  }

  // Szukaj tabeli
  const tableSelectors = [
    'table tbody',
    '.auctions-table-wrapper tbody',
    '.sales-main-content tbody',
    'tbody' // Bardziej ogólny selektor
  ];

  let tableBody = null;
  for (const selector of tableSelectors) {
    const elements = doc.querySelectorAll(selector);
    console.log(`🔍 Selektor "${selector}" znalazł ${elements.length} elementów`);

    for (const element of elements) {
      if (element.children.length > 0) {
        tableBody = element;
        console.log('✅ Znaleziono tabelę przez:', selector, 'wierszy:', tableBody.children.length);
        break;
      }
    }
    if (tableBody) break;
  }

  // Analiza SVG
  let svgAnalysis = null;
  if (svgPath) {
    const pathData = svgPath.getAttribute('d');
    if (pathData) {
      console.log('📐 Analizuję path data...');
      const yCoords = [];
      const matches = pathData.match(/[\d.]+/g);

      if (matches) {
        for (let i = 1; i < matches.length; i += 2) {
          const y = parseFloat(matches[i]);
          if (!isNaN(y)) yCoords.push(y);
        }
      }

      if (yCoords.length > 0) {
        const average = yCoords.reduce((a, b) => a + b, 0) / yCoords.length;
        svgAnalysis = {
          average: Math.round(average),
          dataPoints: yCoords.length
        };
        console.log('📊 SVG analiza:', svgAnalysis);
      }
    }
  }

  // Analiza tabeli
  let tableAnalysis = null;
  if (tableBody) {
    console.log('📋 Analizuję tabelę...');
    const rows = tableBody.querySelectorAll('tr');
    const bidSales = [];
    const buyNowSales = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const priceText = cells[1].textContent.trim().replace(/,/g, '');
        const price = parseInt(priceText);
        const typeCell = cells[5].textContent.trim();

        if (!isNaN(price) && price > 0) {
          if (typeCell === 'Bid') {
            bidSales.push(price);
          } else if (typeCell === 'Buy Now') {
            buyNowSales.push(price);
          }
        }
      }
    });

    const calculateAverage = (prices) => {
      if (prices.length === 0) return null;
      return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    };

    tableAnalysis = {
      bid: {
        average: calculateAverage(bidSales),
        count: bidSales.length
      },
      buyNow: {
        average: calculateAverage(buyNowSales),
        count: buyNowSales.length
      }
    };

    console.log('📊 Tabela analiza:', tableAnalysis);
  }

  return {
    svgAnalysis,
    tableAnalysis,
    debug: {
      foundSvg: !!svgPath,
      foundTable: !!tableBody,
      tableRows: tableBody ? tableBody.children.length : 0
    }
  };
}





// Nasłuchiwanie wiadomości z content script i sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCardDictionary') {
    sendResponse({ dictionary: cardDictionary });
  } else if (request.action === 'analyzeFutbinData') {
    const { cardName } = request;
    const cardUrlPart = findPlayerInDictionary(cardName);

    if (!cardUrlPart) {
      sendResponse({
        success: false,
        error: `Gracz "${cardName}" nie został znaleziony w słowniku. Dostępni gracze: ${Object.keys(cardDictionary).join(', ')}`
      });
      return;
    }

    console.log(`🎯 Znaleziono gracza "${cardName}" w słowniku: ${cardUrlPart}`);

    fetchFutbinData(cardUrlPart).then(result => {
      if (!result.success) {
        sendResponse(result);
        return;
      }

      sendResponse({
        success: true,
        cardName: cardName,
        svgAnalysis: result.svgAnalysis,
        tableAnalysis: result.tableAnalysis
      });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });

    return true; // Asynchroniczna odpowiedź
  }
});