# hubmi.pl — Małopolski Hub Innowacji Społecznych

Mieszkaniec opisuje problem albo pomysł zwykłymi słowami, a asystent AI zamienia to w uporządkowane
zgłoszenie i od razu podpowiada sprawdzone innowacje z biblioteki ROPS. Instytucja dostaje gotowe
zgłoszenia z oceną ryzyka, dopasowaniami i mapą potrzeb regionu.

Prototyp przygotowany na HackYeah dla **Regionalnego Ośrodka Polityki Społecznej w Krakowie**.

![Strona główna: dwie ścieżki — „Zgłoś problem” i „Zaoferuj pomoc”](docs/screenshots/home.png)

## Demo w minutę

Nigdzie nie trzeba się logować, również do panelu instytucji.

1. **`/zglos-problem`**: napisz jedno zdanie o problemie, np. *„Sąsiad z demencją od trzech dni nie
   otwiera drzwi”*. Asystent dopyta o szczegóły, pokaże pasujące innowacje i przygotuje zgłoszenie.
2. **`/zaoferuj-pomoc`**: opisz pomysł. Obok rozmowy wypełnia się fiszka pomysłu. Potem przejdź
   do kanwy innowacji i wniosku o dofinansowanie, który pisze AI.
3. **`/admin`**: zobacz, jak to samo zgłoszenie wygląda po stronie instytucji: podsumowanie AI,
   kategoria, poziom ryzyka, lokalizacja na mapie i trzy najbliższe innowacje.

## Jak to działa

```text
 Mieszkaniec                         hubmi.pl                                Instytucja (ROPS)
 ───────────                         ────────                                ─────────────────
 „Zgłoś problem”    ──► czat AI (SSE) ──► RAG po bibliotece innowacji ──►  Zgłoszenia + ryzyko
 „Zaoferuj pomoc”   ──► fiszka ──► kanwa ──► wniosek w naborze        ──►  Inicjatywy i nabory
                               │
                               └─► enrichment: tytuł, podsumowanie, kategoria,
                                   grupa docelowa, embedding ──► dopasowania ──►  Mapa potrzeb, raporty
```

- **Rozmowa**: OpenAI Responses API, odpowiedzi strumieniowane przez SSE. Asystent ma dwa tryby:
  problem i oferta pomocy. W trakcie rozmowy szuka podobnych rozwiązań w bazie innowacji ROPS.
- **Enrichment**: każde zgłoszenie dostaje od AI tytuł, podsumowanie, jedną z 14 kategorii, grupę
  docelową, poziom ryzyka i embedding.
- **Matchmaking**: dla każdego zgłoszenia system wybiera 3 najbliższe *opublikowane* innowacje
  Te same pary liczą się w obie strony, więc licznik
  „pasuje do N zgłoszeń” przy innowacji zgadza się z dopasowaniami w zgłoszeniach.
- **Dostępność**: WCAG 2.1 AA. Belka dostępności pozwala powiększyć tekst (A / A+ / A++) i włączyć
  wysoki kontrast; ustawienia zostają zapamiętane w przeglądarce.

## Widoki

### Dla mieszkańców

| | |
| --- | --- |
| ![Rozmowa o problemie](docs/screenshots/problem.png) | ![Start rozmowy o ofercie pomocy](docs/screenshots/offer.png) |
| **Zgłoś problem**: rozmowa kończy się zgłoszeniem, które mieszkaniec potwierdza. Przy zagrożeniu życia asystent najpierw kieruje pod 112. | **Zaoferuj pomoc**: rozmowa o pomyśle, z fiszką uzupełnianą na bieżąco. |
| ![Kanwa innowacji społecznej](docs/screenshots/canvas.png) | ![Wniosek o dofinansowanie](docs/screenshots/application.png) |
| **Kanwa innowacji**: 9 pól wstępnie wypełnionych z rozmowy, zapis automatyczny, eksport do PDF. | **Wniosek o dofinansowanie**: AI pisze go z kanwy pod sekcje i kryteria konkretnego naboru. |
| ![Szczegóły innowacji](docs/screenshots/innovation.png) | |
| **Strona innowacji**: opis, grupa docelowa, materiały do wdrożenia, komentarze i zapis na testera. | |

### Panel instytucji (`/admin`)

| | |
| --- | --- |
| ![Lista zgłoszeń](docs/screenshots/submissions.png) | ![Szczegóły zgłoszenia](docs/screenshots/submission-details.png) |
| **Zgłoszenia**: liczniki, wyszukiwarka, filtry i sortowanie po ryzyku. | **Szczegóły zgłoszenia**: podsumowanie AI, status, ryzyko z uzasadnieniem, mapa i dopasowane innowacje. |
| ![Biblioteka inicjatyw](docs/screenshots/innovations.png) | ![Nabory](docs/screenshots/calls.png) |
| **Inicjatywy**: 115 innowacji ROPS i pomysły mieszkańców, publikowanie i wycofywanie, liczba dopasowań. | **Nabory**: ogłaszanie naborów na dofinansowanie i przegląd złożonych wniosków. |
| ![Mapa potrzeb społecznych](docs/screenshots/needs-map.png) | ![Raporty i trendy](docs/screenshots/reports.png) |
| **Mapa potrzeb**: 149 wskaźników Obserwatorium ROPS w 22 powiatach Małopolski. | **Raporty i trendy**: zgłoszenia mieszkańców na tle wskaźników i synteza AI dla wybranego powiatu. |

## Uruchomienie lokalne

Wymagania: Node.js 20.9+, pnpm 12.8.1 (wersja przypięta w `packageManager`) i PostgreSQL z rozszerzeniem
[pgvector](https://github.com/pgvector/pgvector).

```bash
pnpm install
# utwórz .env ze zmiennymi z tabeli niżej
pnpm db:migrate          # schemat bazy i rozszerzenie pgvector
pnpm seed                # biblioteka innowacji ROPS wraz z embeddingami
pnpm dev                 # http://localhost:3000
```

| Zmienna | Opis |
| --- | --- |
| `DATABASE_URL` | Połączenie z PostgreSQL (z pgvector) |
| `OPENAI_API_KEY` | Klucz OpenAI |
| `OPENAI_MODEL` | Model czatu, enrichmentu i raportów (`OPENAI_CHAT_MODEL` nadpisuje go tylko dla czatu) |
| `OPENAI_EMBEDDING_MODEL` | Model embeddingów, np. `text-embedding-3-small` |
| `OPENAI_EMBEDDING_DIMENSIONS` | Opcjonalnie; domyślnie `1536`, musi zgadzać się ze schematem bazy |
| `OPENAI_TIMEOUT_MS` | Opcjonalnie; domyślnie `30000` |

Nie commituj `.env`.

### Polecenia

```bash
pnpm dev                 # serwer deweloperski
pnpm build && pnpm start # build produkcyjny
pnpm typecheck && pnpm lint
pnpm db:generate         # nowa migracja po zmianie server/db/schema.ts
pnpm db:migrate          # zastosowanie migracji
pnpm seed                # ponowny import biblioteki innowacji (z embeddingami)
pnpm embed:solutions     # uzupełnienie brakujących lub nieaktualnych embeddingów
pnpm enrich:submissions  # ponowny enrichment zgłoszeń przez AI
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Drizzle ORM ·
PostgreSQL + pgvector · OpenAI (Responses API, `text-embedding-3-small`) · Zod · OpenStreetMap +
Nominatim (mapa lokalizacji, bez klucza API).

## Struktura

```text
app/                     trasy (UI po polsku)
  zglos-problem/         czat „Zgłoś problem”
  zaoferuj-pomoc/        czat „Zaoferuj pomoc” → kanwa/ → wniosek/
  innowacje/[id]/        publiczna strona innowacji
  admin/                 panel instytucji: zgloszenia, inicjatywy, nabory, mapa-potrzeb, raporty
  api/                   cienkie route handlers: walidacja zod → lib/server
lib/server/              dostęp do danych, AI (czat, RAG, enrichment, raporty), matchmaking
server/db/               schemat Drizzle, migracje, seed
shared/components/       komponenty współdzielone (czat, belka dostępności, markdown, animacje)
docs/                    opis kreatora pomysłów, zrzuty ekranu
```

Szczegółowy przebieg ścieżki „Zaoferuj pomoc” (fiszka → kanwa → przekazanie → wniosek) opisuje
[`docs/kreator-pomyslow.md`](docs/kreator-pomyslow.md).

## Zespół

- Piotr_Wittig[**Schoji**]
- Karol_Wroński[**karol-wronski-dev**]
- Mikołaj_Mołodecki[**MiniowaPM**]
- Paweł_Dutkiewicz[**DudeQ7**]
- Scarlet_Dorożalska[**MasterSun8**]

