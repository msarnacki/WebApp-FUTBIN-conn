// Sidepanel script dla FUTBIN Helper v2
document.addEventListener('DOMContentLoaded', function () {
    const refreshPlayersBtn = document.getElementById('refreshPlayersBtn');
    const playersListContainer = document.getElementById('playersList');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const errorSection = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');

    let currentPlayers = [];
    let uniquePlayers = [];

    // Funkcja do aktualizacji listy graczy
    function updatePlayersList(players) {
        currentPlayers = players;

        // Stwórz mapę unikalnych graczy (po nazwie)
        const uniquePlayersMap = new Map();

        players.forEach(player => {
            const playerName = player.name;
            if (!uniquePlayersMap.has(playerName)) {
                uniquePlayersMap.set(playerName, {
                    ...player,
                    displayName: player.uniqueName || player.name
                });
            }
        });

        // Konwertuj mapę na tablicę
        uniquePlayers = Array.from(uniquePlayersMap.values());

        console.log('🎯 Unikalni gracze:', uniquePlayers);

        if (uniquePlayers.length === 0) {
            playersListContainer.innerHTML = '<div class="no-players">Nie znaleziono graczy. Upewnij się, że jesteś na stronie FIFA WebApp.</div>';
            return;
        }

        let html = `<div class="unique-players-info">Znaleziono ${uniquePlayers.length} unikalnych graczy</div>`;

        uniquePlayers.forEach((player, index) => {
            const displayInfo = [];
            if (player.rating) displayInfo.push(`${player.rating} OVR`);
            if (player.position) displayInfo.push(player.position);
            if (player.chemStyleName) displayInfo.push(player.chemStyleName);

            const subtitle = displayInfo.length > 0 ? displayInfo.join(' • ') : '';

            html += `
                <div class="player-item">
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        ${subtitle ? `<div class="player-details">${subtitle}</div>` : ''}
                    </div>
                    <button class="player-analyze-btn" data-player-name="${player.name}" data-index="${index}">
                        Analizuj
                    </button>
                </div>
            `;
        });

        playersListContainer.innerHTML = html;

        // Dodaj event listenery do przycisków
        const analyzeButtons = playersListContainer.querySelectorAll('.player-analyze-btn');
        analyzeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerName = e.target.getAttribute('data-player-name');
                analyzePlayerData(playerName, e.target);
            });
        });
    }

    // Funkcja do ukrywania wszystkich sekcji wyników
    function hideAllSections() {
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';
    }

    // Funkcja do pokazania błędu
    function showError(message) {
        hideAllSections();
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }

    // Funkcja do pokazania wyników
    function showResults(data) {
        hideAllSections();

        // Aktualizuj dane wykresu
        if (data.svgAnalysis) {
            document.getElementById('chartAverage').textContent =
                data.svgAnalysis.average ? `${data.svgAnalysis.average.toLocaleString()} coins` : 'Brak danych';

            // Stwórz prosty wykres SVG
            createSimpleChart(data.svgAnalysis);
        } else {
            document.getElementById('chartAverage').textContent = 'Brak danych';
        }

        // Aktualizuj dane sprzedaży
        if (data.tableAnalysis && data.tableAnalysis.bid && data.tableAnalysis.buyNow) {
            // Nowy format z podziałem na Bid i Buy Now
            const { bid, buyNow } = data.tableAnalysis;

            // Dane licytacji (Bid)
            document.getElementById('bidAverage').textContent =
                bid.average ? `${bid.average.toLocaleString()} coins` : 'Brak danych';
            document.getElementById('bidCount').textContent = bid.count || '0';

            // Dane "kup teraz" (Buy Now)
            document.getElementById('buyNowAverage').textContent =
                buyNow.average ? `${buyNow.average.toLocaleString()} coins` : 'Brak danych';
            document.getElementById('buyNowCount').textContent = buyNow.count || '0';

            console.log('📊 Wyświetlono dane:', {
                bid: { average: bid.average, count: bid.count },
                buyNow: { average: buyNow.average, count: buyNow.count }
            });
        } else {
            // Brak danych tabeli
            document.getElementById('bidAverage').textContent = 'Brak danych';
            document.getElementById('bidCount').textContent = '0';
            document.getElementById('buyNowAverage').textContent = 'Brak danych';
            document.getElementById('buyNowCount').textContent = '0';

            console.log('❌ Brak danych tableAnalysis lub bid/buyNow');
        }

        resultsSection.style.display = 'block';
    }

    // Funkcja do tworzenia wykresu SVG z rzeczywistych danych
    function createSimpleChart(svgData) {
        const chartContainer = document.getElementById('chartSvg');

        if (!svgData || (!svgData.average && !svgData.rawData)) {
            chartContainer.innerHTML = '<span>Brak danych wykresu</span>';
            return;
        }

        // Stwórz wykres
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '120');
        svg.setAttribute('viewBox', '0 0 400 120');

        // Tło
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '400');
        bg.setAttribute('height', '120');
        bg.setAttribute('fill', '#f8f9fa');
        bg.setAttribute('stroke', '#ddd');
        svg.appendChild(bg);

        // Jeśli mamy surowe dane z wykresu, narysuj linię
        if (svgData.rawData && svgData.rawData.length > 1) {
            const data = svgData.rawData;
            const minValue = Math.min(...data);
            const maxValue = Math.max(...data);
            const range = maxValue - minValue || 1;
            
            // Skaluj dane do wykresu
            const chartWidth = 360;
            const chartHeight = 80;
            const offsetX = 20;
            const offsetY = 10;
            
            let pathData = '';
            
            data.forEach((value, index) => {
                const x = offsetX + (index / (data.length - 1)) * chartWidth;
                const y = offsetY + chartHeight - ((value - minValue) / range) * chartHeight;
                
                if (index === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            });
            
            // Narysuj linię wykresu
            const chartLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            chartLine.setAttribute('d', pathData);
            chartLine.setAttribute('stroke', '#3498db');
            chartLine.setAttribute('stroke-width', '2');
            chartLine.setAttribute('fill', 'none');
            svg.appendChild(chartLine);
            
            // Dodaj punkty
            data.forEach((value, index) => {
                const x = offsetX + (index / (data.length - 1)) * chartWidth;
                const y = offsetY + chartHeight - ((value - minValue) / range) * chartHeight;
                
                const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                point.setAttribute('cx', x);
                point.setAttribute('cy', y);
                point.setAttribute('r', '2');
                point.setAttribute('fill', '#e74c3c');
                svg.appendChild(point);
            });
            
            // Etykiety min/max
            const minText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            minText.setAttribute('x', '5');
            minText.setAttribute('y', offsetY + chartHeight + 5);
            minText.setAttribute('font-size', '10');
            minText.setAttribute('fill', '#666');
            minText.textContent = minValue.toLocaleString();
            svg.appendChild(minText);
            
            const maxText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            maxText.setAttribute('x', '5');
            maxText.setAttribute('y', offsetY + 5);
            maxText.setAttribute('font-size', '10');
            maxText.setAttribute('fill', '#666');
            maxText.textContent = maxValue.toLocaleString();
            svg.appendChild(maxText);
            
        } else {
            // Fallback - prosty wykres z średnią
            const avgLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            avgLine.setAttribute('x1', '20');
            avgLine.setAttribute('y1', '60');
            avgLine.setAttribute('x2', '380');
            avgLine.setAttribute('y2', '60');
            avgLine.setAttribute('stroke', '#3498db');
            avgLine.setAttribute('stroke-width', '3');
            avgLine.setAttribute('stroke-dasharray', '5,5');
            svg.appendChild(avgLine);
        }

        // Tekst z informacjami
        const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        infoText.setAttribute('x', '200');
        infoText.setAttribute('y', '110');
        infoText.setAttribute('text-anchor', 'middle');
        infoText.setAttribute('fill', '#2c3e50');
        infoText.setAttribute('font-size', '12');
        infoText.setAttribute('font-weight', 'bold');
        
        if (svgData.average) {
            infoText.textContent = `Średnia z wykresu: ${svgData.average.toLocaleString()} | Punkty: ${svgData.dataPoints || 0}`;
        } else {
            infoText.textContent = `Punkty danych: ${svgData.dataPoints || 0}`;
        }
        
        svg.appendChild(infoText);

        chartContainer.innerHTML = '';
        chartContainer.appendChild(svg);
    }

    // Funkcja do analizy danych gracza
    async function analyzePlayerData(playerName, buttonElement) {
        console.log('🔍 Analizuję gracza:', playerName);

        // Wyłącz przycisk i zmień tekst
        buttonElement.disabled = true;
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Analizuję...';

        hideAllSections();
        loadingSection.style.display = 'block';

        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'analyzeFutbinData',
                    cardName: playerName
                }, resolve);
            });

            if (response.success) {
                showResults(response);
            } else {
                showError(response.error || 'Nieznany błąd podczas analizy danych');
            }
        } catch (error) {
            showError(`Błąd komunikacji: ${error.message}`);
        } finally {
            // Przywróć przycisk
            buttonElement.disabled = false;
            buttonElement.textContent = originalText;
        }
    }

    // Funkcja do pobierania listy graczy
    async function fetchPlayers() {
        console.log('🔍 Sidepanel: Pobieranie listy graczy...');

        // Wyłącz przycisk podczas ładowania
        refreshPlayersBtn.disabled = true;
        refreshPlayersBtn.textContent = 'Pobieranie...';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('📋 Aktywna karta:', tab.url);
            console.log('📋 ID karty:', tab.id);

            if (!tab.url.includes('ea.com')) {
                console.log('❌ Nie jesteś na stronie EA');
                updatePlayersList([]);
                return;
            }

            // Test połączenia z content script i ewentualne wstrzyknięcie
            console.log('🧪 Testuję połączenie z content script...');
            try {
                const testResponse = await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tab.id, { action: 'test' }, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    });
                });
                console.log('✅ Content script odpowiada:', testResponse);
            } catch (testError) {
                console.log('❌ Content script nie odpowiada, próbuję wstrzyknąć:', testError.message);

                // Spróbuj wstrzyknąć content script
                const injected = await injectContentScript(tab.id);
                if (!injected) {
                    playersListContainer.innerHTML = `
                        <div class="no-players">
                            ❌ Nie można załadować content script<br><br>
                            <strong>Rozwiązania:</strong><br>
                            1. Sprawdź czy jesteś na stronie ea.com<br>
                            2. Odśwież stronę FIFA WebApp (F5)<br>
                            3. Przeładuj wtyczkę w chrome://extensions/<br><br>
                            <small>Błąd: ${testError.message}</small>
                        </div>
                    `;
                    return;
                }

                // Poczekaj na załadowanie i spróbuj ponownie
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    const retryResponse = await new Promise((resolve, reject) => {
                        chrome.tabs.sendMessage(tab.id, { action: 'test' }, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError.message));
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    console.log('✅ Content script działa po wstrzyknięciu:', retryResponse);
                } catch (retryError) {
                    playersListContainer.innerHTML = `
                        <div class="no-players">
                            ❌ Content script nie działa nawet po wstrzyknięciu<br><br>
                            <small>Błąd: ${retryError.message}</small>
                        </div>
                    `;
                    return;
                }
            }

            console.log('📤 Wysyłam wiadomość do content script...');

            // Dodaj timeout do wiadomości
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout - content script nie odpowiada'));
                }, 5000);

                chrome.tabs.sendMessage(tab.id, { action: 'getAllPlayers' }, (response) => {
                    clearTimeout(timeout);
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });

            console.log('📨 Otrzymano odpowiedź:', response);
            if (response && response.players) {
                updatePlayersList(response.players);
            } else {
                console.log('❌ Brak graczy w odpowiedzi');
                showError('Nie znaleziono graczy. Sprawdź czy jesteś na właściwej stronie FIFA WebApp.');
                updatePlayersList([]);
            }
        } catch (error) {
            console.error('❌ Błąd pobierania listy graczy:', error);

            if (error.message.includes('Timeout')) {
                showError('Content script nie odpowiada. Spróbuj odświeżyć stronę FIFA WebApp.');
            } else if (error.message.includes('Could not establish connection')) {
                showError('Content script nie jest załadowany. Odśwież stronę FIFA WebApp.');
            } else {
                showError(`Błąd komunikacji: ${error.message}`);
            }

            updatePlayersList([]);
        } finally {
            // Przywróć przycisk
            refreshPlayersBtn.disabled = false;
            refreshPlayersBtn.textContent = 'Odśwież listę graczy';
        }
    }

    // Funkcja do wstrzykiwania content script programowo
    async function injectContentScript(tabId) {
        try {
            console.log('💉 Wstrzykuję content script programowo...');

            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });

            console.log('✅ Content script wstrzyknięty');
            return true;
        } catch (error) {
            console.error('❌ Nie można wstrzyknąć content script:', error);
            return false;
        }
    }



    // Funkcja testowa Futbin - działa zawsze, nawet bez FIFA WebApp
    async function testFutbin() {
        console.log('🧪 Test Futbin dla Xabi Alonso...');

        hideAllSections();
        loadingSection.style.display = 'block';

        try {
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout - test Futbin trwał zbyt długo (30s)'));
                }, 30000);

                chrome.runtime.sendMessage({
                    action: 'analyzeFutbinData',
                    cardName: 'Xabi Alonso'
                }, (response) => {
                    clearTimeout(timeout);
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });

            console.log('📊 Odpowiedź z Futbin test:', response);

            if (response.success) {
                showResults(response);
            } else {
                showError(response.error || 'Nieznany błąd podczas testu Futbin');
            }
        } catch (error) {
            console.error('❌ Błąd testu Futbin:', error);
            showError(`Błąd testu Futbin: ${error.message}`);
        }
    }

    // Event listenery
    refreshPlayersBtn.addEventListener('click', fetchPlayers);

    const testFutbinBtn = document.getElementById('testFutbinBtn');
    if (testFutbinBtn) {
        testFutbinBtn.addEventListener('click', testFutbin);
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            fetchPlayers();
        });
    }

    // Inicjalizacja interfejsu
    updatePlayersList([]);
});