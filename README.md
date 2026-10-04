<div align="center">
  <br />
  <h1>hubmi.pl</h1>
  <p><b>Mały krok. Wspólna zmiana. Razem możemy więcej.</b></p>
  <p><i>Platforma Innowacji Społecznych dla Małopolski</i></p>

  <a href="#"><img src="https://img.shields.io/badge/Status-Demo_Proof_of_Concept-FF6B6B?style=for-the-badge" alt="Status: Proof of Concept" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Partner-ROPS_Kraków-0077B6?style=for-the-badge" alt="ROPS Kraków" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Silnik-AI_Assistant_%2B_RAG-7209B7?style=for-the-badge" alt="AI + RAG" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Dostępność-WCAG_Friendly-43AA8B?style=for-the-badge" alt="WCAG Friendly" /></a>
</div>

<br />

> 💡 **hubmi.pl** łączy realne potrzeby mieszkańców Małopolski z gotowymi rozwiązaniami i pomysłami społecznymi za pomocą konwersacyjnego asystenta AI oraz inteligentnego wyszukiwania w bazie wiedzy (RAG).

---

## 🎯 Problem i Rozwiązanie

<div align="center">

| ❌ Wyzwania (Problem) | ✅ Rozwiązanie (Hubmi.pl) |
|:---|:---|
| **Rozproszona wiedza:** Gotowe innowacje społeczne istnieją, ale są trudne do znalezienia. | **Jedno miejsce:** Centralna baza innowacji społecznych dla całego regionu. |
| **Brak wsparcia dla gmin:** Małe gminy nie wiedzą, jakie gotowe programy mogą wdrożyć. | **Asystent Konwersacyjny:** Zamiana skomplikowanych formularzy na prosty czat w języku naturalnym. |
| **Barierowe formularze:** Tradycyjne urzędowe wnioski zniechęcają mieszkańców. | **Wyszukiwanie RAG:** Inteligentne dopasowywanie pomocy na podstawie opisu sytuacji. |

</div>

---

## ✨ Kluczowe Funkcje

- 💬 **Konwersacyjny Asystent AI (RAG):** Prowadzi użytkownika krok po kroku od swobodnego opisu problemu do konkretnego zgłoszenia bez konieczności wypełniania skomplikowanych pól.
- 🛤️ **Dwie Dedykowane Ścieżki:**
  - **Zgłoś problem:** Dla mieszkańców potrzebujących wsparcia dla siebie lub bliskich (np. pomoc dla seniorów, opieka, transport).
  - **Zaoferuj pomoc:** Dla organizacji i osób prywatnych chcących podzielić się pomysłem, doświadczeniem lub zasobami.
- 📚 **Inteligentne Rekomendacje:** System wyszukuje w bazie i sugeruje zweryfikowane inicjatywy społeczne pasujące do kontekstu rozmowy.
- 🗺️ **Panel dla Instytucji i Mapa Potrzeb:** Wizualizacja zgłoszeń na interaktywnej heatmapie Małopolski, ułatwiająca jednostkom samorządowym identyfikację obszarów o najwyższej koncentracji problemów.
- ♿ **Standard Dostępności (A11y):** Projekt stworzony z myślą o seniorach – zmiana rozmiaru tekstu (A / A+ / A++) i tryb wysokiego kontrastu dostępne jednym kliknięciem.

---

## 🔄 Jak to działa? (Workflow)
[1. Opis sytuacji] ➔ [2. Dopytanie przez AI] ➔ [3. Dopasowanie RAG] ➔ [4. Przekazanie do systemu]


1. **Opis sytuacji:** Użytkownik pisze własnymi słowami w jednym polu tekstowym (np. *"Mam 76 lat, jestem po operacji biodra i mam problem z obiadami"*).
2. **Doprecyzowanie:** Asystent zadaje krótkie pytania pomocnicze, aby doprecyzować zakres potrzebnej pomocy.
3. **Dopasowanie z Bazy (RAG):** System wyświetla proste karty z gotowymi rozwiązaniami znajdującymi się w bazie (np. *"Posiłek z dostawą do domu"*).
4. **Przekazanie Zgłoszenia:** Po podaniu podstawowego kontaktu (e-mail lub telefon) cała historia rozmowy wraz z kontekstem trafia do dalszej obsługi przez właściwe instytucje.

---

## 📸 Ekran i Interfejs

<div align="center">

| Ścieżki Działania | Czat z Asystentem |
|:---:|:---:|
| <img src="docs/screenshots/main_page.png" width="400" alt="Strona Główna" /><br /><sub>*Wybór ścieżki i opcje dostępności*</sub> | <img src="docs/screenshots/chat_flow.png" width="400" alt="Czat Asystenta" /><br /><sub>*Prosty dialog z doprecyzowaniem potrzeb*</sub> |

| Sugestia z Bazy Wiedzy | Mapa Potrzeb Społecznych |
|:---:|:---:|
| <img src="docs/screenshots/rag_suggestion.png" width="400" alt="Sugestia RAG" /><br /><sub>*Karta innowacji z bazy wiedzy*</sub> | <img src="docs/screenshots/analytics_map.png" width="400" alt="Panel Instytucji" /><br /><sub>*Heatmapa koncentracji zgłoszeń w Małopolsce*</sub> |

</div>

---

## 🛠️ Architektura i Technologie

- **AI & RAG:** Retrieval-Augmented Generation pozwalający asystentowi na udzielanie odpowiedzi i rekomendacji wyłącznie w oparciu o zweryfikowaną bazę innowacji społecznych.
- **Frontend / UX:** Interfejs zoptymalizowany pod kątem wytycznych **WCAG / A11y** (wysoki kontrast, skalowanie czcionek, zapamiętywanie ustawień).
- **Analityka & GIS:** Silnik mapowy z geowizualizacją i agregacją danych (heatmapa zgłoszeń wg powiatów i gmin).

---

## 🚀 Plany Rozwoju (Roadmap)

- [x] **01. Czat z RAG:** Działający asystent konwersacyjny spięty ze sprawdzoną bazą rozwiązań.
- [ ] **02. Panel Zgłoszeń:** Rozbudowany panel administratora z historią rozmów, kategoryzacją i priorytetyzacją zgłoszeń.
- [ ] **03. Rozszerzenie Bazy:** Dalsze zasilanie systemu nowymi innowacjami społecznymi z całego regionu.

---

## 🏛️ Partnerzy i Inicjatorzy

Projekt realizowany z myślą o rozwoju innowacji społecznych w regionie Małopolski:
* **ROPS Kraków** (Regionalny Ośrodek Polityki Społecznej w Krakowie)
* **Województwo Małopolskie**

---

<div align="center">
  <sub><b>hubmi.pl</b> — Platforma Innowacji Społecznych dla Małopolski</sub>
</div>
