# Innowacyjna Małopolska — design

Źródło: [innowacyjna.malopolska.pl](https://innowacyjna.malopolska.pl/pl). Wartości odczytane ze strony i CSS; przybliżenia oznaczono.

## 1. Overview
Jasna, przestronna strona z bardzo cienkimi, dużymi nagłówkami. Charakter budują magenta, geometryczny znak „M”, zdjęcia wydarzeń i okrągłe przyciski przecięte poziomą linią.

## 2. Colors
| Rola | Kolor |
|---|---|
| Primary / accent | `#C32882` — nagłówki, linki, aktywne elementy |
| Secondary | `#526AAE` — niebieski |
| Background | `#F5F5F5` |
| Surface | `#FEFEFE`; dropdowny `#FFFFFF` |
| Text | `#1C1C1C` |
| Muted / border | `#9A9A9A` |
| Success | `#9DBF4F`; komunikat zapisu ma jednak tło magenta |
| Warning | `#EDC033` (szacunkowo jako rola; kolor występuje w gradiencie) |
| Error | `#F05A56` |

Gradient marki: `linear-gradient(125deg, #C32882, #C32882, #526AAE, #6BB6E9, #9DBF4F, #EDC033, #EDC033)`. Używany w stopce i rozwiniętym menu mobilnym. Nie potwierdzono zwykłego dark mode; CSS zawiera tryb wysokiego kontrastu: tło `#000000`, tekst i obramowania `#F7FF00`.

## 3. Typography
Font: `Roboto, sans-serif`; dostępne wagi `100, 200, 400, 500, 700`.

| Element | Rozmiar / line-height | Waga |
|---|---|---|
| Duży nagłówek sekcji | desktop `56/64px`, mobile `32/40px`, tablet `40/48px`, ≥1600px `80/90px` | 100 |
| h1–h6, bazowe style | `32/40`, `28.8/36.8`, `32/42`, `28/38`, `24/34`, `20/30px` | 400 |
| Tytuł karty | `20/30px` | 200 |
| Body | `16/26px` | 400 |
| Caption / metadane | `12/22px` | 400–600 zależnie od elementu |
| Etykieta sekcji | `16/26px`, uppercase, tracking `1.6px` | 500 |
| Tekst CTA | `16/20px`, uppercase, tracking `1.6px` | 500 |

Stosuj duże nagłówki według ich klasy wizualnej, nie samego poziomu h1–h6.

## 4. Spacing & Layout
- Siatka płynna: desktop 12 kolumn, tablet 8, telefon 4. Zewnętrzny kontener `max-width: 100vw`, bez stałego limitu w px.
- Desktop: szerokość obszaru 12 kolumn `87.656vw`, gutter około `2.344vw`. Przy 1280px treść zaczyna się około `79px` od krawędzi.
- Breakpointy CSS: `660px`, `1024px`, `1600px`. Przy szerokości 1280px strona nadal pokazuje hamburger; dokładnego progu przełączenia menu nie ustalono.
- Odstępy: `10, 20, 30, 35, 40, 60, 120px`; typowa sekcja ma `60px` paddingu u góry i dołu. Baza rytmu około `10px` (szacunkowo).
- Hero: tekst po lewej, większe zdjęcie po prawej. Przy 1280px zdjęcie około `738 × 443px`, od `x=463px`, `y=140px`. Na telefonie i tablecie zdjęcie nad tekstem.
- Sekcje mają małą etykietę w lewej kolumnie i duży nagłówek oraz treść po prawej. Kolejność: hero → opis → wydarzenia → kalendarium → wideo → wyszukiwarka → Kosmos / Wodór → projekty → newsletter → stopka.

## 5. Shape & Depth
- Zdjęcia i karty: ostre narożniki, `border-radius: 0`, bez cienia.
- Inputy: radius `20px`, border `1px solid #9A9A9A`.
- Koła CTA: średnica `70px` desktop / `40px` mobile, kontur `1px`.
- Dropdown: `box-shadow: 0 9px 35px -6px rgba(14,31,53,.36)`.
- Nakładka cookies: biel z `opacity: .5`; przyciemnienie stopki: czerń z `opacity: .25`. Bez charakterystycznego blur.

## 6. Components
- **CTA:** przezroczyste tło; po lewej obrys koła i linia wychodząca z jego środka w prawo, potem napis z odstępem `20px`. SVG desktop `105 × 70px`, mobile `60 × 40px`. Hover linków i przezroczystych CTA zmienia kolor na secondary `#526AAE`. Pełne przyciski magenta zmieniają tło na secondary; pozostałe przyciski są przyciemniane bez zmniejszania opacity. Efekty dotyczą aktywnych kontrolek na urządzeniach z myszką. Osobnego wyglądu active nie ustalono. Disabled strzałek slidera: `opacity: .4`, brak interakcji; przyciski kwadratowe `.2`.
- **Input / textarea:** input wysokości `40px`, padding `0 20px`, tekst `16px`, tło przezroczyste. Textarea `90px`, padding `7px 20px`, tekst `16/24px`. Błąd: obrys `1px #F05A56`, komunikat `12/26px`. Focus klawiatury: ciągły obrys `2px solid #1C1C1C`, offset `3px`; w trybie wysokiego kontrastu używa koloru tekstu. Hover inputów: obramowanie magenta; disabled bez efektu hover.
- **Checkbox:** okrąg `40 × 40px`; zaznaczony magenta z białym znakiem `20 × 20px`. Tekst zgody uppercase `14/18px`.
- **Karta wydarzenia:** zdjęcie około `3:2`, tytuł pod nim z odstępem `10px`. Bez panelu tła, cienia i ramki. Przy 1280px karta około `354px`, odstęp około `30px`; lista przewijana poziomo.
- **Kalendarium:** wiersze z linią dolną `1px #9A9A9A`, padding `20px 0`; data magenta `56/64px`, waga 100. Hover rozszerza dekoracyjną linię do `100%`.
- **Nawigacja:** logo po lewej, ikony szukania i hamburgera po prawej. Menu desktop uppercase `16px`, waga 500; aktywny link magenta. Dropdown biały, padding `20px`. Menu mobilne: gradient marki, linki `16/20px`, padding `14px 60px 14px 20px`.
- **Badge:** metadane tekstowe `12/22px`, uppercase, waga 600, tracking `.05em`; wyróżniona etykieta magenta z białym tekstem, bez zaokrąglenia.
- **Cookies / panel ustawień:** dolny panel na całą szerokość, tło `#1C1C1C`, biały tekst. Ustawienia: padding `30px`, treść `max-width: 600px`. Toggle `44 × 24px`, uchwyt magenta `18px`; przesunięcie zaznaczonego `20px`. Innego ogólnego modala nie potwierdzono.

## 7. Iconography & Imagery
Ikony głównie liniowe SVG: cienkie kontury około `1px`, proste strzałki, lupa i hamburger. Ikony społecznościowe wypełnione, umieszczone w okręgach. Zdjęcia dokumentalne i biznesowe w naturalnych kolorach, kadrowane do prostokątów. Charakterystyczny motyw: łamany znak „M” jako cienki kontur magenta/szary przy hero oraz maska zdjęć Kosmos / Wodór. Logotypy projektów w siatce z cienkimi separatorami.

## 8. Motion
- Kolor przycisku: `350ms ease-out`.
- Kolor tekstu karty: `750ms cubic-bezier(.5,0,.2,1)`.
- Formularze i toggle cookies: `500ms ease`.
- Gradient stopki i menu: `15000ms ease infinite`; rozmiar tła odpowiednio `200vw` i `300vw`.
- Dekoracyjny obrys koła: `15000ms linear infinite`.
- Strona odsłania treści podczas przewijania; czasu animacji odsłaniania i slidera nie ustalono. Do rekonstrukcji przyjąć `600ms cubic-bezier(.5,0,.2,1)` (szacunkowo).

## 9. Do / Don't
1. Zachowuj dużo pustej przestrzeni i asymetrię tekst–zdjęcie.
2. Duże nagłówki ustawiaj wagą 100; nie zamieniaj ich na bold.
3. Używaj magenty jako głównego akcentu; gradientu w stopce i menu.
4. Odtwarzaj CTA jako koło + linię + napis, nie pełną kolorową kapsułę.
5. Pozostaw prostokątne zdjęcia i płaskie karty; nie dodawaj cieni wszędzie.
6. Zachowuj znak „M” i cienkie separatory jako motywy marki.
7. Uppercase stosuj do etykiet i nawigacji, a zwykłą pisownię do treści i dużych nagłówków.

## Design Tokens
```css
:root {
  --color-primary: #c32882;
  --color-secondary: #526aae;
  --color-accent: #c32882;
  --color-background: #f5f5f5;
  --color-surface: #fefefe;
  --color-text: #1c1c1c;
  --color-muted: #9a9a9a;
  --color-border: #9a9a9a;
  --color-success: #9dbf4f;
  --color-warning: #edc033; /* rola szacunkowo */
  --color-error: #f05a56;
  --gradient-brand: linear-gradient(125deg, #c32882, #c32882, #526aae, #6bb6e9, #9dbf4f, #edc033, #edc033);
  --font-family: Roboto, sans-serif;
  --font-body: 16px;
  --line-body: 26px;
  --font-display: 56px;
  --line-display: 64px;
  --weight-display: 100;
  --tracking-label: .1em;
  --space-small: 10px;
  --space-medium: 20px;
  --space-large: 40px;
  --space-section: 60px;
  --space-section-large: 120px;
  --container-max: 100vw;
  --grid-content: 87.656vw;
  --grid-gap: 2.344vw;
  --radius-card: 0px;
  --radius-input: 20px;
  --border-width: 1px;
  --input-height: 40px;
  --cta-circle: 70px;
  --shadow-dropdown: 0 9px 35px -6px rgba(14,31,53,.36);
  --duration-button: 350ms;
  --duration-form: 500ms;
  --duration-card: 750ms;
  --duration-gradient: 15000ms;
  --ease-brand: cubic-bezier(.5,0,.2,1);
}
@media (max-width: 659px) {
  :root { --font-display: 32px; --line-display: 40px; --cta-circle: 40px; }
}
@media (min-width: 660px) and (max-width: 1023px) {
  :root { --font-display: 40px; --line-display: 48px; --cta-circle: 40px; }
}
@media (min-width: 1600px) {
  :root { --font-display: 80px; --line-display: 90px; }
}
body.wcag-contrast-high {
  --color-background: #000000;
  --color-surface: #000000;
  --color-text: #f7ff00;
  --color-border: #f7ff00;
  --color-primary: #f7ff00;
}
```
