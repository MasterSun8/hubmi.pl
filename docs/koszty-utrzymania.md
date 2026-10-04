# Koszt utrzymania hubmi.pl

Szacunek miesięczny dla ROPS Kraków. Ceny z 4 października 2026 r., kurs 1 USD ≈ 3,70 zł, kwoty netto.

## W skrócie

| Scenariusz | Rozmów z asystentem / mies. | AI | Serwery | Opieka techniczna | Razem / mies. |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pilotaż w kilku gminach | 500 | ~20 zł | ~100 zł | ~300 zł | **~420 zł** |
| Cała Małopolska | 5 000 | ~160 zł | ~300 zł | ~600 zł | **~1 060 zł** |
| Kampania, szczyt zainteresowania | 20 000 | ~620 zł | ~450 zł | ~600 zł | **~1 670 zł** |

Dla scenariusza „cała Małopolska” to ok. **13 tys. zł rocznie**. AI jest najmniejszą pozycją: jedna rozmowa
mieszkańca kosztuje ok. **3 grosze** razem z zapasem. Największy koszt to czas osoby, która dba o system.

## AI: skąd 3 grosze za rozmowę

Model `gpt-6-luna`: 0,10 USD za 1 mln tokenów wejściowych, 0,50 USD za 1 mln wyjściowych. Embeddingi
`text-embedding-3-small`: 0,02 USD za 1 mln tokenów.

Na danych testowych rozmowa ma średnio 3,2 wiadomości mieszkańca (ok. 90 znaków każda), a odpowiedź
asystenta ma ok. 390 znaków. Do wyliczeń przyjęliśmy 4 tury rozmowy, 2 wyszukiwania w bazie innowacji
i ok. 3 znaki polskiego tekstu na token.

| Krok | Wywołania modelu | Tokeny wej. / wyj. | Koszt |
| --- | ---: | ---: | ---: |
| Rozmowa z asystentem (z wyszukiwaniem w bazie 115 innowacji) | 6 | 16 000 / 2 000 | 0,0026 USD |
| Opracowanie zgłoszenia: podsumowanie, kategoria, poziom ryzyka, embedding | 2 + embedding | 3 600 / 1 000 | 0,0009 USD |
| Tylko ścieżka „Zaoferuj pomoc”: karta pomysłu, kanwa, wniosek o grant | 6 | 8 500 / 5 100 | 0,0034 USD |

- Zgłoszenie problemu kosztuje 0,0035 USD, a pomysł z wnioskiem 0,0069 USD.
- Przy proporcji 80% problemów i 20% pomysłów średnia wynosi 0,0042 USD, czyli ok. 1,5 grosza.
- W tabeli „W skrócie” liczymy **podwójnie** na dłuższe rozmowy i ponowienia, stąd ok. 3 grosze.
- Raport AI w panelu instytucji to pojedyncze grosze za sztukę.
- Przeliczenie embeddingów całej bazy innowacji kosztuje poniżej 1 grosza.

## Serwery

Wartości to typowe ceny rynkowe w centrach danych w UE, a nie wyceny konkretnych ofert:

- **Pilotaż:** jeden serwer VPS (4 vCPU, 8 GB) z aplikacją i bazą Postgres + pgvector. Do tego kopie
  zapasowe i domena: ok. 100 zł.
- **Region:** serwer aplikacji ok. 100 zł, zarządzana baza Postgres z pgvector ok. 170 zł, kopie zapasowe
  i domena ok. 30 zł.
- **Szczyt:** większy serwer aplikacji i baza.

Jeśli system stanie na infrastrukturze Urzędu Marszałkowskiego, ta pozycja spada prawie do zera.

Bez opłat działają mapy OpenStreetMap, certyfikat SSL (Let's Encrypt) i panel instytucji, który nie ma
licencji na stanowisko. Publiczny serwer geokodowania Nominatim ma limit 1 zapytania na sekundę. Przy
dużym ruchu wyniki trzeba buforować albo postawić własną instancję, co mieści się w kosztach serwera.

## Opieka techniczna

Przyjęliśmy 2–4 godziny miesięcznie po ok. 150 zł/h. W tym czasie mieszczą się aktualizacje bezpieczeństwa
i zależności, monitoring, kopie zapasowe oraz import nowych innowacji z biblioteki ROPS. Nie wliczamy czasu
pracowników ROPS na rozpatrywanie zgłoszeń, bo to praca merytoryczna, a nie koszt systemu.

## Jak trzymamy koszty w ryzach

- **Twardy limit budżetu** w projekcie OpenAI: rachunek nie przekroczy kwoty ustalonej przez ROPS.
- **Wyniki AI zapisujemy w bazie.** Karta pomysłu liczy się od nowa tylko po nowej wiadomości, a
  podsumowanie i ocena ryzyka raz na zgłoszenie. Odświeżenie strony nic nie kosztuje.
- **Wyniki wyszukiwania nie przechodzą do kolejnych tur rozmowy,** więc koszt tury nie rośnie z każdym
  wyszukiwaniem.
- **Model zmienia jedna zmienna środowiskowa** (`OPENAI_MODEL`), więc przy zmianie cen dostawcy łatwo
  przejść na inny model.
- W tabelach nie wliczyliśmy rabatu za buforowanie stałej części promptu (0,01 USD zamiast 0,10 USD za
  1 mln tokenów), więc realny koszt AI będzie niższy.
