# Kreator pomysłów: jak to działa (moduł III)

Ścieżka „Zaoferuj pomoc” prowadzi od luźnego pomysłu do złożonego wniosku o dofinansowanie.
Mieszkaniec nigdzie się nie loguje: jego pomysł jest przypisany do karty przeglądarki
(identyfikator rozmowy w `sessionStorage`), a wszystko zapisuje się w bazie przy tej rozmowie.

```
Rozmowa z asystentem ──► Kanwa innowacji ──► Przekazanie pomysłu ──► Wniosek w naborze
  (fiszka na żywo)         (9 pól + kontakt)     (zgłoszenie do ROPS)     (tylko gdy nabór trwa)
```

---

## Strona mieszkańca

### Krok 1. Rozmowa — `/zaoferuj-pomoc`

1. Na stronie głównej kliknij **„Zaoferuj pomoc”**.
2. Opisz pomysł jednym, dwoma zdaniami, np.
   *„Chcę zorganizować klub sąsiedzki dla samotnych seniorów w Słomnikach. Mamy salę w domu
   kultury, były trzy próbne spotkania po 8 osób.”*
3. Asystent dopytuje (kto, gdzie, jakie zasoby, na jakim etapie jest pomysł) i podsuwa
   podobne, sprawdzone innowacje z biblioteki ROPS.
4. Po prawej **„Twoja fiszka”** uzupełnia się sama po każdej odpowiedzi asystenta:
   nazwa, krótki opis, istota pomysłu, dla kogo i etap realizacji
   (pasek: Pomysł → Prototyp → Testy w małej skali → Działa).
   Po odświeżeniu strony fiszka wczytuje się z bazy (AI liczy ją ponownie tylko, gdy w rozmowie
   przybędzie wiadomości).
5. Kliknij **„Rozpisz pomysł na kanwie →”** pod fiszką albo **„Przejdź do kanwy”** w kolumnie
   „Gotowe do przekazania?”.

### Krok 2. Kanwa innowacji — `/zaoferuj-pomoc/kanwa`

1. Przy pierwszym wejściu asystent sam wypełnia kanwę tym, co padło w rozmowie
   (napis „Asystent uzupełnia puste pola…”, kilka sekund).
2. Kanwa ma 9 pól: Problem, Odbiorcy, Rozwiązanie, Zmiana, Zasoby, Partnerzy,
   Koszty i finansowanie, Miary sukcesu, Ryzyka. Pod każdym jest pytanie pomocnicze.
3. Każde pole można poprawić albo napisać od nowa; puste uzupełnić samemu.
   Zmiany zapisują się same („Zapisano” obok przycisków).
4. **„Uzupełnij puste pola z rozmowy”** — gdy w rozmowie padło coś nowego. AI wypełnia
   tylko puste pola, nigdy nie nadpisuje tego, co wpisał człowiek.
5. **„Pobierz PDF”** — otwiera drukowanie; wybierz „Zapisz jako PDF” (A4 poziomo).
6. **„← Wróć do rozmowy”** — można wracać do czatu i kanwy dowolnie.

### Krok 3. Przekazanie pomysłu — na dole kanwy

1. Pod kanwą jest sekcja **„Gotowe do przekazania?”** z trzema kartami:
   **Miejscowość lub gmina** (wymagana) oraz **E-mail** lub **Telefon** (wystarczy jedno).
2. Kliknij **„Przekaż pomysł”**. Brakujące lub błędne dane podświetlą się na czerwono.
3. Pojawia się **„Pomysł przekazany”**. Do ROPS trafia zgłoszenie z rozmową, fiszką i kanwą.
   Kanwę wciąż można poprawiać — admin widzi aktualną wersję.

### Krok 4. Wniosek w naborze — `/zaoferuj-pomoc/wniosek`

Ten krok jest dostępny **tylko po przekazaniu pomysłu i tylko gdy trwa jakiś nabór**
(ROPS zakłada nabory w panelu, patrz niżej).

1. Pod „Pomysł przekazany” pojawia się ramka **„Trwa nabór · do … · do … zł”** z nazwą naboru.
   Kliknij **„Przygotuj wniosek”**.
2. U góry widać nabór: nazwę, termin, kwotę i rozwijane **„Jak będzie oceniany wniosek”**.
3. Asystent pisze wniosek (ok. 10 sekund) — **każda sekcja naboru osobno**
   (np. Opis problemu, Grupa docelowa, Działania, Budżet, Harmonogram, Rezultaty),
   na podstawie kanwy i rozmowy, pod kryteria tego naboru i w limicie kwoty.
4. Czego AI nie wie, oznacza jako **`[uzupełnij: …]`**, np. `[uzupełnij: kwota]`.
   Uzupełnij te miejsca i popraw resztę. Szkic zapisuje się sam.
5. **„Uzupełnij puste sekcje z kanwy”** — ponowne pisanie pustych sekcji (bez nadpisywania).
6. **„Pobierz PDF”** — wydruk wniosku.
7. **„Złóż wniosek”** — po złożeniu wniosku nie da się zmienić; pojawia się
   „Wniosek złożony” z datą.

Inny nabór = inne sekcje i kryteria, więc z tej samej kanwy powstaje inny wniosek.
Gdy żaden nabór nie trwa, ramki na kanwie nie ma, a `/zaoferuj-pomoc/wniosek` mówi
„Teraz nie trwa żaden nabór”.

---

## Panel instytucji (ROPS) — `/admin`

### Nabory — `/admin/nabory`

1. **„Nowy nabór”** otwiera formularz: nazwa, krótki opis, daty **Od** i **Do**,
   maksymalna kwota, **sekcje wniosku** (startowo 6 typowych; można zmieniać nazwy,
   pytania pomocnicze, usuwać i dodawać) oraz **kryteria oceny**.
2. Nabór jest widoczny dla mieszkańców **od dnia „Od” do dnia „Do” włącznie**
   (czas polski). Gdy trwa kilka, autor widzi ten, który kończy się najwcześniej.
3. Lista naborów: status (Trwa / Zaplanowany / Zakończony), termin, kwota, sekcje
   i liczba złożonych wniosków. Kliknij kartę, by wejść w nabór.

### Szczegóły naboru — `/admin/nabory/[id]`

- Parametry naboru i kryteria.
- **„Złożone wnioski”**: każdy wniosek rozwija się do pełnej treści sekcji
  („Pokaż wniosek”), z linkiem **„Zobacz pomysł, kanwę i rozmowę”**.
  Szkiców (niezłożonych) admin nie widzi.

### Gdzie jeszcze widać pomysły

- **Inicjatywy → zakładka „Pomysły”**: fiszki z istotą, etapem (pasek), „Dla kogo”, „Gdzie”,
  **„Kanwa: 7 z 9 pól”** i **„Wniosek: złożony w naborze”**. Filtr **„Etap”**
  (np. „testy w małej skali” = pomysły sprawdzone w mikroskali).
- **Zgłoszenia**: przy pomyśle etap, np. „Zaoferuj pomoc (testy w małej skali)”.
- **Szczegóły zgłoszenia**: Podsumowanie (z istotą i etapem), **Kanwa innowacji**,
  **Wnioski w naborach**, kontakt, mapa, cała rozmowa.

---

## Demo dla jury (ok. 1 minuty)

Przygotowanie: w `/admin/nabory` musi trwać nabór (dziś jest
„Małopolskie Mikrogranty Społeczne 2026”, 1.10–30.11.2026). Po czyszczeniu bazy załóż go
ponownie przez „Nowy nabór”.

1. `/zaoferuj-pomoc` → wpisz pomysł o klubie seniorów (wyżej) → fiszka wypełnia się na żywo.
2. „Przejdź do kanwy” → AI wypełnia kanwę → popraw jedno pole.
3. Na dole: Słomniki, `test@example.com` → „Przekaż pomysł”.
4. „Przygotuj wniosek” → AI pisze sekcje naboru → uzupełnij Budżet → „Złóż wniosek”.
5. `/admin/nabory` → nabór → „Pokaż wniosek” → „Zobacz pomysł, kanwę i rozmowę”.

## Ograniczenia prototypu

- Pomysł jest przypisany do karty przeglądarki; w nowej karcie autor zaczyna od zera
  (brak logowania z założenia — jury nie chce się logować).
- Pola kanwy są nasze; po otrzymaniu kanwy ROPS z HackYeah podmienić je w `types/canvas.ts`.
- Kanwa i wniosek mają osobne wywołania AI (koszt OpenAI na pomysł rośnie — ująć w kosztach utrzymania).
