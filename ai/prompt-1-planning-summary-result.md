<conversation_summary>
<decisions>
1. Docelowy POC/MVP rozwiązuje problem: manualne tworzenie wysokiej jakości fiszek jest czasochłonne; celem jest automatyzacja generowania fiszek przez AI.
2. Zakres językowy jest stały: fiszki wyłącznie polsko-angielskie.
3. Dane wejściowe do generacji: jedno pole tekstowe (textarea), gdzie każda linia to jedno zdanie.
4. Limity wejścia dla POC: 5–30 zdań na sesję; do 200 znaków na linię; walidacja pustych linii; (opcjonalnie) usuwanie duplikatów.
5. Model fiszki w POC: tylko dwa pola — `sentence_en` (zdanie po angielsku) i `translation_pl` (tłumaczenie po polsku); brak IPA/audio/tagów/poziomów.
6. Jedna orientacja fiszki: przód = EN zdanie, tył = PL tłumaczenie; brak przełączników trybu.
7. Walidacja jakości minimalna: każda linia wejścia generuje dokładnie jedną fiszkę; oba pola niepuste; krytyczne błędy to: złe znaczenie, brak tłumaczenia, pomieszanie zdań.
8. Edycja i usuwanie: prosta edycja fiszek w UI (najprościej modal z dwoma polami i „Zapisz”); brak historii zmian; możliwość usunięcia fiszki.
9. Organizacja treści: jeden domyślny „zestaw” na użytkownika („Moje fiszki”); brak wielozestawowości w POC; proste wyszukiwanie/filtr po tekście EN/PL na liście.
10. Konta użytkowników: minimalny, gotowy auth (Supabase/Firebase) — email+hasło lub magic link; możliwość usunięcia konta i danych (RODO) jako prosty mechanizm.
11. Metryki POC: 
   - „fiszka z AI” = `source=ai`
   - „edytowana” = kliknięcie „Zapisz” po edycji (jakakolwiek zmiana)
   - zbierane liczniki: liczba wygenerowanych oraz liczba edytowanych fiszek.
12. Ograniczenia operacyjne: mała skala (dziesiątki–setki użytkowników), SLO generacji do ~20s dla 30 zdań, limit dzienny (np. max 100 zdań/użytkownik/dzień), rate limiting.
13. Platforma: web-only (bez aplikacji mobilnych w POC).
14. Zespół i implementacja: minimalnie 1 fullstack lub 1 FE + 1 BE; prosty prompt/AI; UI pokazuje stan „generuję…” oraz obsługę błędów (ponów/przynajmniej pokaż to, co się wygenerowało).
</decisions>

<matched_recommendations>
1. Zawężenie do jednej persony i jednego głównego flow (wklejam → generuję → poprawiam → zapisuję) — potwierdzone decyzją o jednej personie i prostym POC flow.
2. Ustalenie limitów wejścia + walidacje (5–30 linii, 200 znaków, puste linie, opcjonalne duplikaty) — przyjęte wprost.
3. Minimalny, spójny schemat danych fiszki (EN + PL) — przyjęte, bez dodatkowych pól.
4. Brak przełączników kierunku nauki (jeden tryb EN→PL) — przyjęte.
5. Kryteria jakości + walidacje „must-fix” (1:1 linia→fiszka, pola niepuste, krytyczne błędy) — przyjęte.
6. Prosty mechanizm edycji (modal/inline + zapis, bez historii) — przyjęte; rekomendacja modal jako najprostsza implementacja.
7. Organizacja w jeden domyślny zestaw + proste wyszukiwanie po tekście — przyjęte.
8. Jasne definicje metryk (edytowana = zapis; AI = source flag) i minimalne liczniki — przyjęte.
9. Użycie gotowego auth (Supabase/Firebase) zamiast budowania własnego — przyjęte.
10. Wprowadzenie SLO, limitów i rate limiting + UX „generuję…” + obsługa błędów — przyjęte.
</matched_recommendations>

<prd_planning_summary>
a) Main functional requirements of the product
- AI generuje fiszki PL-EN na podstawie zestawu zdań podanych przez użytkownika.
- Wejście: textarea; każda linia = jedno zdanie; limit 5–30 zdań/sesję, max 200 znaków/linia; walidacja pustych linii; opcjonalne usuwanie duplikatów.
- Każda fiszka zawiera dokładnie: `sentence_en` + `translation_pl` (bez dodatkowych atrybutów).
- UI do przeglądania listy fiszek, filtrowania po tekście EN/PL, edycji (najprościej modal) i usuwania fiszek.
- Prosty system kont użytkowników (gotowy auth) do przechowywania fiszek; web-only.
- Operacyjnie: rate limiting i limity dzienne (np. 100 zdań/dzień/użytkownik), feedback w UI „generuję…”, obsługa błędów i retry.

b) Key user stories and usage paths
1) Rejestracja/logowanie
   - Użytkownik zakłada konto (email+hasło lub magic link) i loguje się.
2) Generowanie fiszek
   - Użytkownik wkleja 5–30 zdań (linia po linii) → klika „Generuj” → widzi stan ładowania → otrzymuje listę fiszek (EN + PL).
3) Weryfikacja i poprawki
   - Użytkownik przegląda wygenerowane fiszki → edytuje wybrane (modal, zapis) → usuwa błędne.
4) Zarządzanie i wyszukiwanie
   - Użytkownik wraca do listy „Moje fiszki” → filtruje po słowie/frazie → edytuje/usuwа.
5) Prywatność i konto
   - Użytkownik może usunąć konto i wszystkie dane.

c) Important success criteria and ways to measure them
- Kryteria sukcesu z opisu projektu:
  - ≥75% fiszek wygenerowanych przez AI nie jest później edytowana.
  - ≥75% wszystkich tworzonych fiszek powstaje z użyciem AI.
- Pomiar w POC:
  - `source=ai` dla fiszek wygenerowanych.
  - „edytowana” = kliknięcie „Zapisz” na fiszce.
  - Minimalne metryki do logowania:
    - liczba wygenerowanych fiszek (AI)
    - liczba edytowanych fiszek (spośród AI)
    - (opcjonalnie) liczba fiszek usuniętych oraz liczba sesji generowania.
- SLO/UX:
  - czas generacji do ~20 s dla 30 zdań; monitorowanie czasu odpowiedzi i błędów.

d) Any unresolved issues or areas requiring further clarification
- POC przyjął uproszczone definicje metryk (edytowana = zapis). W kolejnej fazie warto doprecyzować, czy „drobne poprawki” mają liczyć się jako edycja (np. literówki).
- Nie ustalono dokładnie promptu/strategii AI: czy tłumaczenie ma być dosłowne czy naturalne, oraz jak radzić sobie z niejednoznacznością zdań.
- Brak decyzji o przechowywaniu „oryginalnej linii wejścia” i mapowaniu (debug/traceability) — istotne przy zgłoszeniach błędów.
- Nie doprecyzowano polityki retencji/logowania danych (co przechowujemy do analityki vs. prywatność).
</prd_planning_summary>

<unresolved_issues>
1. Dokładna definicja „edycji” w metrykach (czy literówki liczą się jako edycja; ewentualny próg zmian).
2. Szczegóły promptu i standardu tłumaczenia (naturalność vs dosłowność) oraz zasady dla zdań niepoprawnych/niepełnych.
3. Decyzja o przechowywaniu wejściowych zdań i mechanizmie mapowania linia→fiszka (dla diagnostyki i jakości).
4. Zakres telemetryki/analityki vs wymagania prywatności (jakie eventy logujemy, jak długo, minimalizacja danych).
</unresolved_issues>
</conversation_summary>
