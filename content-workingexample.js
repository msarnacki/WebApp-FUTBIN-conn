(function () {
  function addButtonAboveTable() {
    if (document.querySelector('#futbinDataButton')) return;

    const table = document.querySelector('table');
    if (!table) return;

    const container = document.createElement('div');
    container.id = "futbinDataContainer";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-start";
    container.style.marginBottom = "10px";

    const button = document.createElement('button');
    button.id = "futbinDataButton";
    button.textContent = 'Pobierz dane sprzedaży';
    button.style.padding = '8px 12px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";

    const resultDiv = document.createElement('div');
    resultDiv.id = "futbinDataResults";
    resultDiv.style.fontSize = '14px';
    resultDiv.style.color = '#fff';
    resultDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    resultDiv.style.padding = '5px 10px';
    resultDiv.style.borderRadius = '5px';
    resultDiv.style.display = 'none';
    resultDiv.style.marginTop = '5px';

    container.appendChild(button);
    container.appendChild(resultDiv);

    table.parentNode.insertBefore(container, table);

    button.addEventListener('click', async () => {
      resultDiv.style.display = 'block';
      resultDiv.textContent = "Ładowanie danych...";

      const now = new Date(); // lokalny czas startu
      console.log("Aktualny czas lokalny:", now);

      const sales = await fetchSalesData();

      if (sales.length > 0) {
        console.log("Najnowszy czas z tabeli:", sales[0].time);
      }

      const { average, count } = calculateAverage(sales);
      const { average: avgHour, count: countHour } = calculateLastHourAverage(sales, now);

      resultDiv.innerHTML = `
        Średnia cena: ${average.toLocaleString()} | Liczba transakcji: ${count} <br>
        Średnia ostatniej godziny: ${avgHour.toLocaleString()} | Liczba transakcji: ${countHour}
      `;
    });
  }

  async function fetchSalesData() {
    const rows = document.querySelectorAll('table tbody tr');
    const sales = [];

    rows.forEach(row => {
      const timeText = row.cells[0]?.textContent.trim(); // czas w pierwszej kolumnie
      const soldForText = row.cells[2]?.textContent.trim(); // cena w trzeciej kolumnie

      if (soldForText && soldForText !== '0' && timeText) {
        const soldFor = parseInt(soldForText.replace(/\D/g, ''), 10);
        if (!isNaN(soldFor)) {
          sales.push({
            soldFor,
            time: parseTimeAgo(timeText)
          });
        }
      }
    });

    return sales;
  }

  function parseTimeAgo(timeText) {
    try {
      const now = new Date();
      const year = now.getFullYear(); // bieżący rok

      // Dodajemy rok, aby uniknąć błędu z 2001 rokiem
      const dateWithYear = `${timeText}, ${year}`;
      const parsedDate = new Date(dateWithYear);

      if (isNaN(parsedDate)) {
        console.error("Błąd parsowania daty:", timeText, dateWithYear);
        return new Date();
      }

      // Dodajemy 1 godzinę
      parsedDate.setHours(parsedDate.getHours() + 1);

      return parsedDate;
    } catch (e) {
      console.error("Błąd parsowania czasu:", timeText, e);
      return new Date();
    }
  }

  function calculateAverage(data) {
    const prices = data.map(item => item.soldFor);
    const count = prices.length;
    const sum = prices.reduce((acc, val) => acc + val, 0);
    const average = count > 0 ? sum / count : 0;
    return { average, count };
  }

  function calculateLastHourAverage(data, now) {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    console.log("Czas 1h temu:", oneHourAgo);

    const recent = data.filter(item => {
      const isRecent = item.time >= oneHourAgo;
      if (isRecent) console.log("Pasuje:", item.time, item.soldFor);
      return isRecent;
    });

    const prices = recent.map(item => item.soldFor);
    const count = prices.length;
    const sum = prices.reduce((acc, val) => acc + val, 0);
    const average = count > 0 ? sum / count : 0;

    console.log("Średnia ostatniej godziny:", average, "| Liczba:", count);
    return { average, count };
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('table tbody tr')) {
      addButtonAboveTable();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
