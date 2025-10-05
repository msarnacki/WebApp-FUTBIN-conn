// Content script dla FIFA WebApp
console.log('🚀 FUTBIN Helper v2 - Content script załadowany');
console.log('📍 URL strony:', window.location.href);
console.log('📄 Tytuł strony:', document.title);
console.log('⏰ Czas załadowania:', new Date().toLocaleTimeString());

// Funkcja do pobierania wszystkich graczy - zgodnie z README: znajdź wszystkie znaczniki o klasie "name main-view"
function getAllPlayers() {
  console.log('🔍 Szukam wszystkich graczy przez klasę "name main-view"...');
  console.log('📍 URL strony:', window.location.href);
  console.log('📄 Tytuł strony:', document.title);
  
  const players = [];
  
  // Zgodnie z README: znajdź wszystkie znaczniki o klasie "name main-view"
  const nameElements = document.querySelectorAll('.name.main-view');
  console.log(`🎯 Znaleziono ${nameElements.length} elementów z klasą "name main-view"`);
  
  nameElements.forEach((nameElement, index) => {
    const playerName = nameElement.textContent.trim();
    console.log(`📝 Element ${index}: "${playerName}"`);
    
    if (playerName && playerName.length > 1) {
      // Spróbuj znaleźć dodatkowe informacje w rodzicu
      const parentElement = nameElement.closest('[id^="tns2-item"]') || nameElement.closest('.ut-item') || nameElement.parentElement;
      
      let rating = null;
      let position = null;
      
      if (parentElement) {
        const ratingElement = parentElement.querySelector('.rating');
        if (ratingElement) {
          rating = ratingElement.textContent.trim();
        }
        
        const positionElement = parentElement.querySelector('.position');
        if (positionElement) {
          position = positionElement.textContent.trim();
        }
        
        console.log(`📊 Dodatkowe info dla "${playerName}": rating=${rating}, position=${position}`);
      }
      
      const playerInfo = {
        name: playerName,
        rating: rating,
        position: position,
        elementIndex: index,
        uniqueName: `${playerName} (${index})`
      };
      
      players.push(playerInfo);
      console.log(`✅ Dodano gracza:`, playerInfo);
    } else {
      console.log(`❌ Pusty lub zbyt krótki tekst w elemencie ${index}`);
    }
  });
  
  // Jeśli nie znaleziono przez główny selektor, spróbuj alternatywnych
  if (players.length === 0) {
    console.log('🔄 Nie znaleziono przez .name.main-view, próbuję alternatywnych selektorów...');
    
    const alternativeSelectors = [
      '.name', // Bez main-view
      '[class*="name"]', // Zawiera "name"
      '.ut-item-player-name', // EA Sports
      '[class*="player-name"]' // Zawiera "player-name"
    ];
    
    for (const selector of alternativeSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`🔍 Selektor "${selector}" znalazł ${elements.length} elementów`);
      
      if (elements.length > 0) {
        elements.forEach((element, index) => {
          const text = element.textContent.trim();
          if (text && text.length > 1 && text.length < 50) {
            console.log(`📝 ${selector}[${index}]: "${text}"`);
            players.push({
              name: text,
              elementIndex: index,
              foundBy: selector,
              uniqueName: `${text} (${selector}-${index})`
            });
          }
        });
        break; // Użyj pierwszego działającego selektora
      }
    }
  }
  
  console.log(`🎯 KOŃCOWY WYNIK: Znaleziono ${players.length} graczy:`, players);
  return players;
}

// Funkcja do pobierania nazwy karty (zachowana dla kompatybilności)
function getCardName() {
  console.log('🔍 Szukam nazwy aktywnej karty...');
  
  // Spróbuj znaleźć aktywną kartę (może być różne ID)
  const selectors = [
    "#tns2-item2 > div > div.name.main-view",
    "#tns2-item1 > div > div.name.main-view", 
    "#tns2-item0 > div > div.name.main-view",
    ".name.main-view"
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      const cardName = element.textContent.trim();
      console.log('✅ Znaleziono aktywną kartę:', cardName);
      return cardName;
    }
  }
  
  console.log('❌ Nie znaleziono aktywnej karty');
  return null;
}

// Nasłuchiwanie wiadomości z sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Otrzymano wiadomość:', request);
  
  if (request.action === 'test') {
    console.log('🧪 Test content script');
    sendResponse({ 
      status: 'ok', 
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    });
  } else if (request.action === 'getCardName') {
    const cardName = getCardName();
    console.log('📤 Wysyłam odpowiedź z nazwą karty:', cardName);
    sendResponse({ cardName: cardName });
  } else if (request.action === 'getAllPlayers') {
    const players = getAllPlayers();
    console.log('📤 Wysyłam listę graczy:', players);
    sendResponse({ players: players });
  }
  
  return true; // Ważne dla asynchronicznych odpowiedzi
});

// Automatyczne sprawdzanie wyłączone - karta wykrywana na żądanie