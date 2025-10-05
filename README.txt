Design Document do wtyczki chrome wspierającej handel w FIFA WebApp

Działanie:
- użytkownik sam loguje się do web app - tam chodzi w rynek i wyszukuje karty które chce kupić
- wtyczka pozwala użytkownikowi nacisnąć guzik, który pobierze nazwę karty z kodu źródłowego strony
- przy pomocy skryptu i słownika ustali pod jakim URL kryją się między innymi dane ofert (słownik będzie zawierał nazwę karty oraz część url, która będzie musiała być wklejona w resztę linku)
- skrypt wywoła tę stronę, poczeka na załadowanie danych AJAX, wybierze dane z odpowiednich znaczników, wyliczy co trzeba i pokaże w panelu wtyczki wynik.

przykładowy URL: https://www.futbin.com/26/sales/18792/xabi-alonso?platform=pc
Przykładowa nazwa kartu: Xabi Alonso
Przykładowa część url: 18792/xabi-alonso

karty są w karuzeli, ale każda z kart znajduje się w znaczniku określonym jako class="name main-view", ale mają inne ścieżki, znajdź po prostu wszystkie znaczniki o tej klasie i wyłuskaj ich teksty - to będą nazwy kart
selector na web app w którym znajduje się nazwa karty: #tns2-item2 > div > div.name.main-view
selector js na web app w którym znajduje sie nazwa karty: document.querySelector("#tns2-item2 > div > div.name.main-view")
full xpath: /html/body/main/section/section/div[2]/div/div/section[2]/div/div/div[1]/div/div[2]/div/div/div[3]/div/div[4]

selector wykresu z danymi (SVG) w futbin: #highcharts-brz3i5s-0 > svg > g.highcharts-series-group > g.highcharts-series.highcharts-series-0.highcharts-areaspline-series.highcharts-color-0 > path.highcharts-graph
selector js wykresu z danymi (SVG) w futbin: document.querySelector("#highcharts-brz3i5s-0 > svg > g.highcharts-series-group > g.highcharts-series.highcharts-series-0.highcharts-areaspline-series.highcharts-color-0 > path.highcharts-graph")
full xpath: /html/body/div[1]/div[1]/div[5]/div[1]/div[1]/div[1]/div/svg/g[4]/g[1]/path[2]

przykładowe dane z SVG: d: path("M 7.9902 188.125 C 7.9902 188.125 9.25878 154.531 10.1045 154.531 C 12.7322 154.531 14.046 162.78 16.6736 181.406 C 17.0033 183.743 17.1681 206.938 17.4977 206.938 C 17.6053 206.938 17.6591 204.547 17.7667 201.563 C 17.7947 200.785 17.8088 198.069 17.8368 197.531 C 18.145 191.619 18.2991 189.846 18.6073 185.438 C 18.75 183.396 18.8213 181.406 18.964 181.406 C 20.0334 181.406 20.5681 185.526 21.6374 188.125 C 21.7842 188.482 21.8576 188.797 22.0044 188.797 C 22.3142 188.797 22.4691 177.375 22.7789 177.375 C 26.4105 177.375 28.2263 179.185 31.8579 188.125 C 32.0473 188.591 32.142 200.891 32.3314 200.891 C 34.3046 200.891 35.2912 190.813 37.2644 189.469 C 39.4209 188.125 40.4991 189.469 42.6556 188.125 C 44.3876 186.781 45.2536 181.406 46.9857 181.406 C 47.0272 181.406 47.0479 181.406 47.0894 181.406 C 48.7801 181.406 49.6255 200.891 51.3163 200.891 C 51.4136 200.891 51.4623 183.644 51.5596 181.406 C 53.4494 137.957 54.3943 86.6719 56.284 86.6719 C 56.5061 86.6719 56.6171 105.301 56.8391 108.844 C 57.9814 127.07 58.5525 134.01 59.6948 141.094 C 61.7161 153.629 62.7268 157.891 64.7481 157.891 C 65.2222 157.891 65.4593 149.156 65.9335 149.156 C 65.9692 149.156 65.9871 152.385 66.0229 152.516 C 68.8685 162.867 70.2913 162.644 73.1369 175.359 C 73.1782 175.544 73.1988 184.766 73.2401 184.766 C 75.0876 184.766 76.0114 107.5 77.859 107.5 C 81.3689 107.5 83.1238 180.063 86.6337 181.406 C 87.5614 182.75 88.0253 182.75 88.9531 182.75 C 89.0523 182.75 89.1019 147.141 89.201 134.375 C 92.4109 121.609 94.0158 121.609 97.2257 121.609 …

Z tych danych masz wyliczyć średnią i ją pokazać, dodatkowo utwórz z tego mały element SVg i pokaż go w panelu wtyczki.

selector tabeli z danymi: body > div.widthControl.mainPagePadding > div.playersalesoverviewpage.medium-column > div.grid-auto-300 > div.sales-main-content.full-width > div.auctions-table-box.medium-column.text-nowrap.full-width-mobile-box > div.auctions-table-wrapper.custom-scrollbar > table > tbody
selector js tabeli z danymi: document.querySelector("body > div.widthControl.mainPagePadding > div.playersalesoverviewpage.medium-column > div.grid-auto-300 > div.sales-main-content.full-width > div.auctions-table-box.medium-column.text-nowrap.full-width-mobile-box > div.auctions-table-wrapper.custom-scrollbar > table > tbody")
full xpath: /html/body/div[1]/div[1]/div[5]/div[1]/div[2]/div[2]/table/tbody

wiersz w tabeli z danymi:
<tr>
   <td>
       <div class="xxs-row align-center"><i class="fa fa-times-circle negative-color"></i><span class="sales-date-time">Oct 4, 9:31 PM</span></div>
    </td>
    <td>217,000</td>
   <td>0</td>
  <td>0</td>
 <td>0</td>
<td class="text-center"></td>
</tr>

pierwsza kolumna zawiera datę - załóż że dotyczy aktualnego roku mimo że nie jest to napisane
cena sprzedaży jest w trzeciej kolumnie, 
w ostatniej jest informacja o typie oferty - pusta wartość = nie sprzedano, Bid = sprzedano na licytacji, Buy Now = sprzedano "kup teraz"

z tych danych masz wyliczyć średnią dla każdego z typów - licytacji i kup teraz, a w panelu wtyczki po nacisnieciu guzika wyswietlic te inforacje razem z liczba ofert których ta srednia dotyczy.

Wtyczka ma być w panelu, a nie zakotwiczona w samej stronie.
przygotuj manifest króry uwzględni icony png w 3 rozmiarach
