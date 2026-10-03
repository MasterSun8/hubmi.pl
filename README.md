<img src="assets/hubmipl.png" alt="" width="400">
# hubmi.pl — platforma innowacji społecznych dla ROPS Kraków

## 1. Cel projektu

Gotowe rozwiązania społeczne już istnieją, ale mieszkańcy, organizacje i urzędnicy często o nich nie wiedzą. Platforma ma połączyć zgłoszony problem z istniejącym rozwiązaniem, pomóc zaplanować jego wdrożenie i zbierać dane o niezaspokojonych potrzebach.

Jeśli odpowiedniego rozwiązania nie ma, system zapisuje problem lub pomysł. Dzięki temu ROPS i gminy mogą zobaczyć, czego brakuje, gdzie problem narasta i jakie inicjatywy warto rozwijać.

**Analogia:** platforma działa jak bank z chatbotem. Użytkownik opisuje sytuację, asystent dopasowuje ją do dostępnego „produktu”, a pracownik na zapleczu widzi uporządkowane zgłoszenia. Tutaj produktem jest innowacja społeczna, metoda działania lub istniejąca forma wsparcia.

Dokument łączy pierwotne ustalenia MVP z późniejszymi odpowiedziami mentorki. Opisuje zamierzony produkt i propozycje realizacji; nie potwierdza, że funkcje są już zaimplementowane.

## 2. Problem i odbiorcy

### Jakie problemy chcemy rozwiązać?

- Brak wiedzy o istniejących innowacjach i sposobach pomocy.
- Rozproszenie rozwiązań po wielu stronach, raportach i materiałach.
- Trudność we wdrażaniu rozwiązań w małych gminach i niewielkich zespołach.
- Brak wspólnego obrazu potrzeb zgłaszanych przez mieszkańców, fundacje i inne podmioty.
- Późne wykrywanie problemów, które dotyczą coraz większej grupy ludzi.
- Zbieranie pomysłów na kartkach i sticky notes zamiast w trwałej, przeszukiwalnej bazie.

### Dla kogo jest platforma?

| Odbiorca | Potrzeba |
| --- | --- |
| Mieszkańcy i osoby w potrzebie | Prosto opisać sytuację i znaleźć pomoc lub pasujące rozwiązanie. |
| Seniorzy i ich opiekunowie | Zgłosić problem bez przechodzenia przez skomplikowany formularz. |
| Osoby z niepełnosprawnościami | Korzystać z dostępnego interfejsu i znaleźć rozwiązania odpowiadające ich potrzebom. |
| Fundacje, NGO i organizacje opiekuńcze | Znaleźć metody pomocy oraz zgłaszać potrzeby podopiecznych. |
| Urzędnicy w gminach, także małych | Dowiedzieć się, co można wdrożyć przy ograniczonym zespole i zasobach. |
| ROPS Kraków | Analizować zgłoszenia, rozwijać bazę wiedzy i wychwytywać trendy. |
| Autorzy innowacji | Udostępniać rozwiązania i umożliwiać kontakt zainteresowanym. |
| Osoby prywatne, firmy i inne podmioty | Zgłaszać problemy, które mogą potwierdzać szerszą potrzebę społeczną. |

Rynek docelowy obejmuje instytucje publiczne oraz organizacje pracujące z seniorami i osobami w potrzebie. Nie ustalono jeszcze modelu finansowania ani sprzedaży.

### Przykładowe sytuacje

- W gminie jest 30 osób starszych, które nie mają pomocy ani regularnych posiłków. Pracownik opisuje sytuację, otrzymuje propozycje rozwiązań i plan działania dostosowany do zespołu.
- Organizacja zauważa wzrost liczby młodych osób w kryzysie bezdomności. Platforma pomaga szukać rozwiązań również dla grup, które nie pasują do standardowych schematów pomocy.
- Mieszkaniec oraz firma niezależnie zgłaszają ten sam rodzaj problemu. System łączy te sygnały w temat i pokazuje, że potrzeba może być szersza.
- Autor ma pomysł na nową inicjatywę. Zapisuje go teraz, aby można było do niego wrócić podczas kolejnego naboru.

## 3. Priorytet: demonstracja wykonalności

ROPS zależy na **Proof of Concept**: działającym demie pokazującym, że taki asystent jest możliwy, oraz wyjaśnieniu, jak powinien działać docelowo.

**Najbliższy priorytet to działający czat z RAG na bazie rozwiązań.** Reszta produktu powinna powstawać wokół tego fundamentu.

Demo powinno pokazać następujący ciąg:

1. Użytkownik opisuje rzeczywisty problem w jednym polu.
2. Asystent rozpoznaje potrzebę i dopytuje o istotne braki.
3. System wyszukuje istniejące rozwiązania i pokazuje ich źródła.
4. Użytkownik otwiera kartę rozwiązania i może skontaktować się z autorem.
5. Asystent proponuje, jak wdrożyć wybrane rozwiązanie przy dostępnych zasobach.
6. Po uzupełnieniu wymaganych danych użytkownik wysyła zgłoszenie.
7. Administrator widzi zgłoszenie, historię rozmowy, kategorię i proponowany priorytet.

Na potrzeby dema można zacząć od ograniczonej, sprawdzonej bazy. Pełny import około 17 tys. rekordów jest planem dotyczącym danych, a nie potwierdzonym stanem gotowej bazy.

## 4. Frontend mieszkańca — jeden czat, dwa przepływy

Frontend w MVP jest wyłącznie webowy. Nie planujemy osobnej aplikacji mobilnej.

Interfejs ma przypominać ChatGPT: jedno pole do wpisania problemu, pomysłu, dwóch zdań albo całego raportu. Użytkownik nie musi znać nazw modułów ani samodzielnie wybierać właściwej kategorii.

Mentorka zaakceptowała połączenie zakładek „kreator problemów” i „zgłoś pomysł” w jeden czat.

### Przepływ A: „Potrzebuję pomocy”

Obejmuje identyfikację problemu, dopasowanie istniejących rozwiązań i dostęp do ich autorów — funkcje opisane wcześniej jako moduły 1, 2 i 4.

1. Użytkownik opisuje sytuację własnymi słowami.
2. Bot dopytuje, kogo dotyczy problem, jaka jest jego skala i czego potrzeba.
3. RAG wyszukuje pasujące rozwiązania w bazie.
4. Bot przedstawia listę propozycji z krótkim uzasadnieniem dopasowania.
5. Użytkownik może obejrzeć szczegóły, przejść do kontaktu lub zapytać o wdrożenie.
6. Bot zbiera brakujące dane do zgłoszenia.
7. Użytkownik zatwierdza wysłanie; do panelu trafia zgłoszenie wraz z całą historią rozmowy.

Jeżeli baza nie zawiera odpowiedniego rozwiązania, asystent powinien powiedzieć to wprost i umożliwić zapisanie potrzeby. Nie powinien wymyślać istniejących programów ani danych kontaktowych.

### Przepływ B: „Mam pomysł”

Obejmuje kreator pomysłów — moduł 3.

1. Użytkownik opisuje inicjatywę.
2. Bot pomaga doprecyzować problem, odbiorców, sposób działania i potrzebne zasoby.
3. Pomysł trafia do uporządkowanej bazy wraz z historią rozmowy i danymi autora.
4. Instytucja może wrócić do niego przy kolejnym naborze.

Według przekazanych ustaleń nabór odbywa się raz na trzy lata. Platforma ma umożliwić gromadzenie pomysłów między naborami. Zapisanie pomysłu nie oznacza złożenia formalnego wniosku ani przyznania finansowania.

### Dane użytkownika i wysłanie zgłoszenia

Przed wysłaniem system wymusza **lokalizację zamieszkania oraz kontakt**. Lokalizacja nie jest ustalana na podstawie urządzenia.

| Pole | Ustalenie |
| --- | --- |
| Lokalizacja zamieszkania | Wymagana przed wysłaniem; dokładność, np. miejscowość lub gmina, pozostaje do ustalenia. |
| E-mail | Osobne pole formularza; nie może być zgadywany przez model. |
| Telefon | Osobne pole formularza; nie może być zgadywany przez model. |
| Imię i nazwisko | Wskazane jako dane dla administratora do dalszego kontaktu. |
| Wiek | Wskazany w odpowiedziach mentorki; zakres i obowiązkowość wymagają doprecyzowania. |
| Grupa społeczna | Możliwa do zebrania, opcjonalnie według późniejszych ustaleń. |

Wymagany jest kontakt, ale nie ustalono, czy użytkownik musi podać oba kanały, czy wystarczy e-mail albo telefon. Nie ustalono także, czy potrzebny jest pełny adres zamieszkania.

Bot może pytać o kontekst w rozmowie, natomiast dane kontaktowe powinny pochodzić z jawnych pól formularza. Przed wysłaniem użytkownik powinien widzieć podsumowanie i móc poprawić dane.

### Dostępność

Prostota obsługi jest częścią założenia produktu: osoba starsza ma móc zgłosić problem w jednym polu, a asystent pomaga uzupełnić resztę.

Proponowane wymagania interfejsu to czytelne teksty, wyraźne przyciski, obsługa klawiaturą, etykiety pól oraz zgodność z czytnikami ekranu. W notatkach pojawił się przykład istniejących funkcji dostępności umożliwiających osobom niewidomym sterowanie statkami; to przykład wykorzystania już opracowanych rozwiązań, nie funkcja tej platformy.

## 5. Karty rozwiązań i kontakt z ROPS

### Karta rozwiązania — moduł 4

Karta zawiera:

- nazwę i opis rozwiązania;
- problem oraz grupę odbiorców, którym rozwiązanie może pomóc;
- zdjęcia, jeżeli są dostępne w źródle;
- źródło i odnośnik do oryginalnych materiałów;
- autora lub organizację odpowiedzialną;
- przycisk „Skontaktuj się z autorem”, korzystający z dostępnych danych kontaktowych.

W MVP funkcja „testera innowacji” sprowadza się do poznania rozwiązania i kontaktu z autorem. Zapisy do testów i obsługa testowania mogą pojawić się w przyszłości. Oceny i komentarze nie są potwierdzonym wymaganiem MVP.

### Komunikacja z ROPS — moduł 5

W MVP bot sugeruje kontakt telefoniczny z ROPS w godzinach dyżuru. Numer i godziny muszą pochodzić z konfiguracji lub zweryfikowanego źródła; nie zostały podane w ustaleniach.

Czat na żywo z mentorami pozostaje poza MVP.

## 6. Middleman innowacji — rekomendacja wdrożenia

Mentorka potwierdziła, że moduł 7 ma rekomendować **jak zrealizować innowację**, również w małej gminie i małym zespole. To kluczowy element docelowego produktu: znalezienie rozwiązania ma prowadzić do praktycznego działania.

Asystent powinien uwzględniać:

- zgłoszony problem i grupę odbiorców;
- skalę potrzeby, np. liczbę osób wymagających pomocy;
- dostępny zespół, czas i zasoby;
- lokalny kontekst oraz możliwych partnerów;
- wymagania i ograniczenia wybranego rozwiązania opisane w materiałach źródłowych.

Proponowany wynik to krótki plan: od czego zacząć, jakie role są potrzebne, co można zrobić w pilotażu, czego brakuje i z kim się skontaktować.

**Przykład:** „Mamy trzy osoby w zespole i 30 seniorów bez regularnych posiłków”. System wyszukuje pasujące rozwiązanie, a następnie proponuje podział zadań, mały pilotaż i listę informacji do uzgodnienia z autorem.

Plan nie może udawać potwierdzonej wykonalności, jeśli nie znamy kosztów, dostępności partnerów albo wymagań rozwiązania. Asystent powinien oddzielać informacje ze źródeł od własnych propozycji i założeń.

Pierwotna lista MVP nie rozpisywała tego modułu. Po odpowiedzi mentorki rekomendacja wdrożenia powinna być pokazana w PoC; rozbudowany moduł planowania można rozwijać później. Dokładny zakres pierwszej wersji pozostaje do ustalenia.

## 7. Panel instytucji — „Grażynka”

Panel jest zapleczem dla ROPS i instytucji. Ma przypominać listę w Przetargi AI: zgłoszenia, filtry, sortowanie i szybki dostęp do szczegółów.

### Obsługa zgłoszeń

AI porządkuje treść rozmowy i proponuje pola do bazy:

- opis problemu lub pomysłu;
- kategorię i grupę odbiorców;
- lokalizację oraz skalę problemu, jeżeli je podano;
- dane kontaktowe przepisane z formularza;
- AI Score z uzasadnieniem;
- powiązania z podobnymi zgłoszeniami i znalezionymi rozwiązaniami.

Administrator widzi pełną historię czatu, nie tylko streszczenie AI. Powinien móc zweryfikować i poprawić klasyfikację.

Lista zgłoszeń ma umożliwiać filtrowanie i sortowanie po AI Score. Proponowane dodatkowe filtry to lokalizacja, kategoria, grupa społeczna, typ zgłoszenia, data i status obsługi.

### AI Score — priorytet do obsługi

ROPS nie narzucił skali ani kryteriów. Zespół ma swobodę zaproponowania własnego sposobu oceny.

**Propozycja do PoC, nie zatwierdzona skala ROPS:** oceniać pilność, skalę problemu, brak dostępnego wsparcia i powtarzalność niezależnych zgłoszeń. Wynik powinien mieć krótkie uzasadnienie oraz informację o brakujących danych.

| Kryterium | Przykład informacji wpływającej na priorytet |
| --- | --- |
| Pilność | Ludzie obecnie nie mają posiłków lub potrzebnej opieki. |
| Skala | Problem dotyczy większej liczby osób lub rosnącej grupy. |
| Luka we wsparciu | W okolicy brakuje dostępnej formy pomocy. |
| Powtarzalność | Ten sam temat zgłaszają niezależnie różne osoby i organizacje. |

Nie ustalono wag, progów ani formatu wyniku. Score ma pomagać porządkować kolejkę, a administrator powinien móc zmienić priorytet. Niski poziom szczegółowości zgłoszenia nie jest dowodem małej potrzeby pomocy.

## 8. Agregacja problemów, mapa i wczesne ostrzeganie

### Co oznaczają partnerstwa międzysektorowe w tym projekcie?

Późniejsza odpowiedź mentorki doprecyzowała, że istotne jest **łączenie sygnałów o tym samym problemie**, także gdy pochodzą od różnych typów podmiotów.

Przykład: osoba prywatna zgłasza problem X, a później firma lub NGO opisuje podobny problem. System agreguje zgłoszenia i pokazuje, że temat może być bardziej palący.

To wymaganie należy odróżnić od komunikacji firma↔firma, która pozostaje poza MVP.

Proponowany sposób działania:

1. Wykryć podobne tematy z uwzględnieniem lokalizacji i grupy odbiorców.
2. Połączyć je w grupę problemów, zachowując oryginalne zgłoszenia.
3. Pokazać liczbę sygnałów, deklarowaną liczbę osób i zmianę w czasie.
4. Pozwolić administratorowi poprawić błędne połączenie lub rozdzielenie.

Liczba zgłoszeń nie jest automatycznie liczbą osób dotkniętych problemem. Kilka organizacji może opisywać tę samą grupę, dlatego nie należy bez sprawdzenia sumować deklarowanych liczb.

### Mapa wyzwań i „kondycja Małopolski”

Według odpowiedzi mentorki dane do mapy wyzwań mają pochodzić ze scrapowania strony ROPS. Zgłoszenia użytkowników stanowią dodatkowy strumień danych do mapy problemów i trendów.

Mapa ma pomagać zobaczyć, w jakim rejonie dany problem jest silny lub narasta. Funkcja wczesnego ostrzegania polega na zauważaniu powtarzających się potrzeb, zanim staną się dużym kryzysem.

Dokładne strony, zestawy danych, częstotliwość odświeżania i progi alertów pozostają do ustalenia. Mapa powinna rozróżniać dane ze źródeł ROPS i sygnały ze zgłoszeń. Sama liczba zgłoszeń nie daje pełnego obrazu sytuacji społecznej regionu.

## 9. Baza wiedzy i RAG

RAG działa jak bibliotekarz: najpierw znajduje odpowiednie materiały, a potem asystent na ich podstawie odpowiada. Model nie musi znać wszystkich innowacji z pamięci.

Platforma potrzebuje dwóch logicznych zasobów:

| Zasób | Zawartość | Zastosowanie |
| --- | --- | --- |
| Baza rozwiązań | Opisy innowacji, odbiorcy, autorzy, kontakt, zdjęcia i materiały wdrożeniowe. | Dopasowanie rozwiązania do problemu i pomoc we wdrożeniu. |
| Zasobnik wiedzy ROPS | Materiały edukacyjne, raporty i inne udostępnione materiały. | Wsparcie pracy instytucji i odpowiedzi oparte na dokumentach. |

Edycja bazy wiedzy przez administratora jest częścią MVP — moduł 6. Proponowany zakres obejmuje dodawanie, poprawianie i wycofywanie treści oraz aktualizację ich indeksu wyszukiwania.

### Przepływ wyszukiwania

1. Rozmowa pozwala opisać potrzebę i jej kontekst.
2. System wyszukuje podobne treści w bazie, wykorzystując embeddingi i dostępne metadane.
3. Wybrane materiały trafiają do modelu jako kontekst.
4. Asystent pokazuje propozycje i uzasadnia ich dopasowanie.
5. Użytkownik może sprawdzić źródło lub otworzyć kartę rozwiązania.

Odpowiedzi powinny wskazywać źródła. Brak wyników powinien prowadzić do zapisania niezaspokojonej potrzeby lub dalszych pytań, a nie do wymyślania rozwiązania.

## 10. Backend i dane

### Ustalona baza technologiczna

- **Supabase** jako zaplecze danych.
- **PostgreSQL z pgvector** do przechowywania danych i wyszukiwania wektorowego.
- Embeddingi przechowywane w bazie, aby nie liczyć ich ponownie przy każdym zapytaniu.
- Zapis czatów, pełnych historii rozmów i metadanych zgłoszeń.

Proponowana zasada aktualizacji: embedding przeliczać po zmianie treści lub zmianie modelu embeddingowego. Model językowy, model embeddingów i framework frontendu nie zostały jeszcze wybrane.

### Import rozwiązań

Mikołaj odpowiada za scrapowanie stron z rozwiązaniami i ujednolicenie około 17 tys. rekordów do wspólnego schematu.

Mentorka potwierdziła możliwość scrapowania wskazanych stron. Pełna lista źródeł nie została przekazana w tych notatkach.

Proponowany wspólny rekord rozwiązania obejmuje:

- identyfikator, nazwę i opis;
- kategorię problemu i grupy odbiorców;
- autora lub organizację oraz dostępny kontakt;
- źródłowy URL i datę pobrania;
- zdjęcia lub odnośniki do nich;
- informacje o wdrożeniu i wymaganych zasobach, jeśli są dostępne;
- tekst do indeksowania, embedding i metadane importu.

Puste pola mają pozostać oznaczone jako brak danych. Przy imporcie trzeba wykrywać duplikaty i zachować pochodzenie informacji.

### Proponowany model danych

To schemat koncepcyjny, nie gotowa migracja bazy.

| Obiekt | Co przechowuje |
| --- | --- |
| Rozmowa i wiadomości | Pełną historię czatu oraz czas i rolę autora wiadomości. |
| Zgłoszenie | Typ, podsumowanie, kategorię, lokalizację, skalę, status, AI Score i powiązanie z rozmową. |
| Dane zgłaszającego | Jawnie podane dane kontaktowe oraz uzgodnione dane dodatkowe. |
| Rozwiązanie | Ujednolicony rekord innowacji i jego źródło. |
| Dokument i fragmenty wiedzy | Materiały ROPS, tekst do wyszukiwania i embeddingi. |
| Grupa problemów | Powiązane zgłoszenia dotyczące podobnej potrzeby. |
| Rekomendacja wdrożenia | Proponowane kroki, założenia, braki danych i wykorzystane rozwiązania. |

## 11. Hosting, skalowanie i dane osobowe

Nie ma narzuconej technologii ani wskazanego konkretnego modelu AI. Serwery mają być dobrane do wybranego rozwiązania; w rozmowie pojawiły się serwery dzierżawione i kolokowane.

Nie ustalono parametrów sprzętu, sposobu uruchomienia Supabase, lokalizacji serwerów ani wymogu on-premise. Wybór zależy m.in. od tego, czy model będzie działał lokalnie, czy przez API, oraz od liczby jednoczesnych rozmów. Platforma ma mieć możliwość późniejszego skalowania.

Na etapie PoC uzgodniono, że szczegółowa analiza RODO nie jest priorytetem. Nie oznacza to rozstrzygnięcia wymagań dla wdrożenia produkcyjnego. Do demonstracji proponowane są dane przykładowe, a przed uruchomieniem dla realnych użytkowników trzeba ustalić zasady dostępu, przechowywania i przetwarzania danych.

## 12. Zakres i kolejność realizacji

| Element | Ustalony kierunek |
| --- | --- |
| Jeden czat: problem lub pomysł | MVP; połączenie zakładek zaakceptowane. |
| Dopasowanie rozwiązań przez RAG | Pierwszy priorytet i fundament PoC. |
| Dopytywanie i zapis pełnej rozmowy | MVP. |
| Lokalizacja i kontakt przed wysłaniem | MVP; szczegóły wymaganych pól do ustalenia. |
| Karty rozwiązań i kontakt z autorem | MVP. |
| Telefoniczny kontakt z ROPS | MVP, po uzupełnieniu numeru i godzin dyżuru. |
| Lista zgłoszeń, filtry i AI Score | MVP; kryteria ustala zespół. |
| Mapa problemów i trendów | W zakresie MVP; źródła i szczegóły do doprecyzowania. |
| Zasobnik wiedzy ROPS i edycja przez admina | MVP. |
| Rekomendacje wdrożenia, middleman | Potwierdzony kierunek; podstawowy przykład w PoC, zakres dalszej wersji do ustalenia. |
| Agregowanie podobnych zgłoszeń | Potwierdzone wymaganie; szczegóły realizacji do ustalenia. |
| Generator wniosków grantowych | Poza MVP, tylko slajd „przyszłość projektu”. |
| Komunikacja firma↔firma | Poza MVP. |
| Czat na żywo z mentorami | Poza MVP. |
| Zapisy do testów i obsługa testowania innowacji | Możliwy przyszły rozwój. |

### Proponowana kolejność prac

1. **Fundament:** wspólny schemat rozwiązania, próbka danych, import i wyszukiwanie RAG.
2. **Demo mieszkańca:** czat, pytania uzupełniające, propozycje i karty rozwiązań.
3. **Praktyczne wdrożenie:** podstawowa rekomendacja dla małego zespołu, oparta na znalezionym rozwiązaniu.
4. **Zgłoszenie:** formularz danych, podsumowanie i zapis historii rozmowy.
5. **Panel:** lista, szczegóły, filtry i wyjaśniony AI Score.
6. **Szerszy obraz:** agregacja tematów, mapa i trendy.
7. **Wiedza instytucji:** materiały ROPS oraz ich edycja i indeksowanie.

Ta kolejność jest propozycją organizacji prac, nie dodatkowym zobowiązaniem co do terminu.

## 13. Co zostało rozstrzygnięte, a co jeszcze ustalić?

### Odpowiedzi mentorki uwzględnione w dokumencie

- AI Score: kryteria ustalamy samodzielnie.
- Middleman: ma rekomendować, jak zrealizować innowację przy dostępnych zasobach.
- Partnerstwa: chodzi o agregację podobnych problemów zgłaszanych przez różne podmioty.
- Tester: testowanie można uwzględnić w przyszłości; MVP daje kontakt z autorem.
- Mapa wyzwań: źródłem mają być dane ze scrapowania strony ROPS.
- Zakładki: można połączyć problem i pomysł w jeden czat.
- Dane: kontakt, wiek i ewentualnie grupa społeczna; wspomniano też imię i nazwisko.
- Źródła: potwierdzono możliwość scrapowania; lista stron nadal wymaga zebrania.
- Technologia: dobór infrastruktury do rozwiązania, bez narzuconego modelu AI.

### Otwarte decyzje

- Pełna lista źródeł rozwiązań, materiałów ROPS i danych do mapy.
- Wagi, progi i sposób prezentacji AI Score.
- Obowiązkowość imienia, nazwiska i wieku; wymagany kanał kontaktu.
- Dokładność lokalizacji oraz zakres danych o grupie społecznej.
- Numer telefonu i godziny dyżuru ROPS.
- Zakres rekomendacji wdrożenia w pierwszej wersji.
- Sposób grupowania zgłoszeń i korekty błędnych dopasowań.
- Model AI, model embeddingów, framework i sposób hostowania.
- Parametry serwerów oraz ewentualne wymagania dotyczące ich lokalizacji.
- Role administratorów i zasady obsługi zgłoszeń.
- Mierniki jakości wyszukiwania oraz oczekiwany czas odpowiedzi.

## 14. Proponowane kryteria udanego PoC

- Mieszkaniec potrafi rozpocząć rozmowę bez wyboru kategorii i złożonego formularza.
- Dla przygotowanych scenariuszy system znajduje istniejące rozwiązania i podaje ich źródła.
- Gdy brakuje rozwiązania lub danych, asystent jasno to komunikuje.
- Dane kontaktowe pochodzą z formularza, a wysłanie wymaga lokalizacji i kontaktu.
- Panel pokazuje zgłoszenie razem z pełną historią rozmowy.
- AI Score ma uzasadnienie, które administrator może ocenić.
- Przykład małej gminy pokazuje praktyczne kroki wdrożenia i jawne założenia.
- Podobne zgłoszenia od różnych podmiotów można zobaczyć jako wspólny problem.

PoC ma przede wszystkim udowodnić, że z jednego opisu potrzeby można przejść do istniejącego rozwiązania i konkretnego następnego kroku.

