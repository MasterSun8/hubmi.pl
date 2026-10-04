# hubmi.pl

**Platforma innowacji społecznych dla Małopolski**

hubmi.pl pomaga mieszkańcom opisać problem, znaleźć adekwatne rozwiązanie społeczne
albo zgłosić własny pomysł. Konwersacyjny asystent AI porządkuje opis sytuacji,
dopytuje o najważniejsze informacje i korzysta z bazy sprawdzonych innowacji.
Zespół instytucji może następnie obsługiwać zgłoszenia, analizować potrzeby
regionalne i rozwijać inicjatywy w jednym panelu.

> Projekt demonstracyjny przygotowany dla Regionalnego Ośrodka Polityki Społecznej
> w Krakowie.

## Co działa dziś

### Dla mieszkańców

- **Zgłoś problem** — rozmowa z asystentem prowadząca od swobodnego opisu
  sytuacji do uporządkowanego zgłoszenia.
- **Zaoferuj pomoc** — ścieżka dla osób i organizacji, które chcą podzielić się
  rozwiązaniem, doświadczeniem lub zasobami.
- **Inteligentne dopasowanie** — wyszukiwanie podobnych, opublikowanych
  innowacji z wykorzystaniem embeddings i wyszukiwania wektorowego.
- **Kreator pomysłu** — karta pomysłu, kanwa innowacji i możliwość przygotowania
  wniosku o dofinansowanie.
- **Bez logowania** — użytkownik może przejść przez demonstrację bez zakładania
  konta i bez ekranu logowania.

### Dla instytucji

Panel `/admin` obejmuje:

- statystyki i podsumowanie zgłoszeń,
- listę zgłoszeń z filtrowaniem oraz widokiem szczegółów,
- bibliotekę inicjatyw i ich statusy publikacji,
- nabory oraz powiązane wnioski,
- mapę potrzeb społecznych dla Małopolski,
- raporty i trendy.

Panel jest celowo dostępny bez logowania w wersji demonstracyjnej.

### Dostępność

Interfejs został przygotowany z myślą o WCAG 2.1 AA. Wspólna belka
dostępności pozwala zmienić rozmiar tekstu (A, A+, A++) oraz włączyć
wysoki kontrast. Ustawienia są zapamiętywane w przeglądarce.

## Najważniejsze przepływy

### Zgłoszenie problemu

1. Mieszkaniec opisuje sytuację własnymi słowami.
2. Asystent zadaje pytania doprecyzowujące.
3. System wyszukuje pasujące rozwiązania w bazie innowacji.
4. Użytkownik potwierdza podsumowanie i przekazuje zgłoszenie do obsługi.

### Oferta pomocy i pomysł

1. Użytkownik opisuje rozwiązanie lub zasób, który chce zaoferować.
2. Asystent pomaga uporządkować pomysł.
3. Dane trafiają do kanwy innowacji.
4. Na podstawie kanwy można przygotować i wysłać wniosek o dofinansowanie.

## Galerie widoków

Zrzuty wykonano lokalnie z działającej aplikacji na `http://localhost:3000`.

| Widok | Zrzut |
| --- | --- |
| Strona główna / ścieżka rozmowy | [home.png](docs/screenshots/home.png) |
| Zgłoszenie problemu | [problem.png](docs/screenshots/problem.png) |
| Oferta pomocy | [offer.png](docs/screenshots/offer.png) |
| Kanwa innowacji | [canvas.png](docs/screenshots/canvas.png) |
| Wniosek o dofinansowanie | [application.png](docs/screenshots/application.png) |
| Panel instytucji | [admin.png](docs/screenshots/admin.png) |
| Zgłoszenia | [submissions.png](docs/screenshots/submissions.png) |
| Inicjatywy | [innovations.png](docs/screenshots/innovations.png) |
| Nabory | [calls.png](docs/screenshots/calls.png) |
| Mapa potrzeb | [needs-map.png](docs/screenshots/needs-map.png) |
| Raporty i trendy | [reports.png](docs/screenshots/reports.png) |

## Trasy

### Publiczne

| Trasa | Przeznaczenie |
| --- | --- |
| `/` | Strona startowa i wybór ścieżki |
| `/zglos-problem` | Rozmowa o problemie |
| `/zaoferuj-pomoc` | Rozmowa o ofercie pomocy |
| `/zaoferuj-pomoc/kanwa` | Kanwa innowacji |
| `/zaoferuj-pomoc/wniosek` | Wniosek o dofinansowanie |
| `/innowacje/[id]` | Szczegóły opublikowanej innowacji |

### Panel instytucji

| Trasa | Przeznaczenie |
| --- | --- |
| `/admin` | Statystyki i nawigacja panelu |
| `/admin/zgloszenia` | Lista zgłoszeń |
| `/admin/zgloszenia/[id]` | Szczegóły zgłoszenia i dopasowania |
| `/admin/inicjatywy` | Biblioteka inicjatyw |
| `/admin/inicjatywy/[id]` | Szczegóły inicjatywy |
| `/admin/nabory` | Lista naborów |
| `/admin/nabory/[id]` | Szczegóły naboru |
| `/admin/mapa-potrzeb` | Regionalna mapa potrzeb |
| `/admin/raporty` | Raporty i trendy |

## Stack technologiczny

- **Next.js 16.3.8** z App Routerem i React 19,
- **TypeScript**,
- **Tailwind CSS v4**,
- **Drizzle ORM** i PostgreSQL z rozszerzeniem pgvector,
- **OpenAI Responses API** do rozmów i enrichmentu zgłoszeń,
- **Embeddings** `text-embedding-3-small` do wyszukiwania podobnych innowacji,
- **Zod** do walidacji danych wejściowych,
- **react-markdown** do renderowania wiadomości asystenta,
- **Motion** do animacji interfejsu.

## Wymagania

- Node.js zgodny z lokalną wersją projektu,
- pnpm `12.8.1`,
- dostęp do PostgreSQL z pgvector,
- klucze i konfiguracja OpenAI zapisane lokalnie w `.env`.

## Uruchomienie

```bash
pnpm install
pnpm dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

Przed uruchomieniem sprawdź `.env.example` i uzupełnij lokalny `.env`.
Nie umieszczaj wartości sekretów w repozytorium.

## Przydatne polecenia

```bash
pnpm dev                 # serwer developerski
pnpm build               # build produkcyjny
pnpm start               # uruchomienie zbudowanej aplikacji
pnpm typecheck           # sprawdzenie typów
pnpm lint                # lintowanie
pnpm seed                # import innowacji wraz z embeddings
pnpm embed:solutions     # uzupełnienie brakujących embeddings
pnpm enrich:submissions  # wzbogacenie zgłoszeń przez AI
```

## Konfiguracja danych i AI

Rozmowy są obsługiwane przez `/api/chat`, który zwraca strumień SSE.
Po stronie serwera asystent korzysta z promptów w `lib/server/ai/prompts/`
oraz wyszukiwania RAG w `lib/server/ai/rag/`.

Najważniejsze endpointy obejmują:

- `/api/chat` i `/api/conversations/[id]`,
- `/api/submissions` oraz `/api/submissions/[id]`,
- `/api/submissions/[id]/matches`,
- `/api/solutions` oraz `/api/solutions/[id]`,
- `/api/regional-statistics`,
- `/api/groups`,
- `/api/grant-calls` oraz `/api/grant-calls/[id]`,
- endpointy kanwy i wniosku dla `/api/conversations/[id]`.

## Struktura projektu

```text
app/                 trasy App Routera i komponenty ekranów
app/api/             cienkie route handlers API
lib/server/          dostęp do danych, AI, chat i matchmaking
server/db/           schemat Drizzle, migracje i seed
shared/components/   komponenty współdzielone, w tym accessibility bar
app/data/             dane źródłowe i przykładowe
docs/                dokumentacja przepływów i screenshoty
```

`page.tsx` zawiera szkielet strony, a komponenty specyficzne dla danej trasy
znajdują się w odpowiadającym jej katalogu `components/`. Dostęp do bazy
i logikę serwerową należy utrzymywać poza komponentami klienckimi.

## Stan projektu

Hubmi jest działającym prototypem demonstracyjnym. Najważniejsze ścieżki
zgłaszania problemu, oferowania pomocy, dopasowania innowacji i obsługi
administracyjnej są dostępne. Dalszy rozwój może objąć między innymi testowanie
innowacji, komunikację zwrotną z autorem zgłoszenia oraz rekomendacje wdrożenia
rozwiązania w konkretnej gminie.
