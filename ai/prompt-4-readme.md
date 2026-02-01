You are an experienced programmer whose task is to create a README.md file for a GitHub project. Your goal is to create a comprehensive, well-organized README file that follows best practices and contains all relevant information from the provided project files.

Here are the project files to analyze:

<prd>
# Product Requirements Document (PRD) - FiszkiAI (POC)

## 1. Product Overview

### 1.1 Cel produktu
FiszkiAI to webowa aplikacja, która automatyzuje tworzenie fiszek do nauki języka angielskiego dla polskojęzycznych użytkowników. Użytkownik wkleja zestaw zdań, a system generuje odpowiadające im fiszki (zdanie po angielsku + tłumaczenie na polski). Następnie użytkownik może fiszki przeglądać, filtrować, edytować i usuwać. Fiszki są przechowywane na koncie użytkownika.

### 1.2 Zakres POC
POC ma udowodnić, że:
- użytkownik jest w stanie w kilka minut wygenerować większość fiszek bez potrzeby edycji,
- jakość generacji jest wystarczająca w typowych zdaniach użytkownika,
- podstawowe zarządzanie fiszkami (lista, edycja, usuwanie) działa stabilnie.

### 1.3 Założenia
- Tylko język polski i angielski.
- Jedna fiszka odpowiada jednemu zdaniu wejściowemu (1:1).
- Jedna orientacja nauki: przód fiszki to EN zdanie, tył to PL tłumaczenie.
- Web-only.
- Mała skala (dziesiątki–setki użytkowników).
- Autoryzacja i baza danych w oparciu o gotowy dostawca (Supabase).

### 1.4 Definicje
- Zdanie wejściowe: jedna linia tekstu w polu wejściowym.
- Fiszka: rekord z polami sentence_en i translation_pl.
- Fiszka z AI: fiszka z flagą source=ai.
- Edycja (POC): każdorazowe kliknięcie Zapisz w edycji fiszki, niezależnie od zakresu zmian.

## 2. User Problem

### 2.1 Problem
Manualne tworzenie wysokiej jakości fiszek do nauki języka jest czasochłonne. Użytkownik chce szybko zamienić swoje zdania na zestaw fiszek, które w większości są od razu poprawne.

### 2.2 Docelowy użytkownik (POC)
Samodzielny uczeń (PL), uczący się angielskiego, który:
- ma własne zdania (z notatek, kursu, pracy),
- chce je szybko przerobić na fiszki,
- akceptuje drobną edycję tylko wybranych fiszek.

### 2.3 Kluczowy przepływ wartości
Wklejam zdania -> Generuję fiszki -> Szybko poprawiam wyjątki -> Zapisuję i wracam do listy.

## 3. Functional Requirements

### 3.1 Wymagania funkcjonalne (FR)
FR-001 Autoryzacja użytkownika
- System umożliwia rejestrację i logowanie użytkownika przy użyciu gotowego mechanizmu (email+hasło lub magic link).

FR-002 Sesja użytkownika
- System utrzymuje sesję po odświeżeniu strony i umożliwia wylogowanie.

FR-003 Widok generowania fiszek
- System udostępnia stronę z polem tekstowym (textarea), gdzie każda linia to jedno zdanie.

FR-004 Walidacja wejścia
- System wymusza:
  - 5–30 niepustych linii na sesję generowania,
  - maksymalnie 200 znaków na linię.
- System ignoruje puste linie.
- System może opcjonalnie usuwać duplikaty (jeśli włączone, duplikaty są informowane użytkownikowi).

FR-005 Generowanie fiszek przez AI
- System generuje dla każdej linii dokładnie jedną fiszkę:
  - sentence_en: zdanie po angielsku,
  - translation_pl: tłumaczenie na polski.
- System oznacza rekordy flagą source=ai.

FR-006 Mapowanie 1:1 linia -> fiszka
- System gwarantuje zachowanie kolejności i jednoznaczne mapowanie (np. indeks linii wejściowej przechowywany wewnętrznie dla wyników w sesji).

FR-007 Obsługa stanu generowania
- System pokazuje stan generuję podczas wywołania AI.
- System blokuje ponowną wysyłkę w trakcie generacji.

FR-008 Obsługa błędów generowania i retry
- System w przypadku błędu pokazuje czytelny komunikat.
- System umożliwia ponowienie próby.
- Jeśli wygenerowano część fiszek, system pokazuje to co powstało oraz informuje o zakresie niepowodzenia.

FR-009 Walidacja jakości minimalna (must-fix)
- Po generacji system sprawdza:
  - czy liczba fiszek równa jest liczbie niepustych linii,
  - czy każde sentence_en i translation_pl jest niepuste.
- W przypadku naruszeń system oznacza problem i blokuje zapis problematycznych rekordów lub wymusza poprawę przed finalnym zapisaniem (minimalnie: komunikat i możliwość edycji).

FR-010 Zapisywanie fiszek do konta
- System zapisuje wygenerowane fiszki na koncie użytkownika w domyślnym zbiorze Moje fiszki.

FR-011 Lista fiszek
- System udostępnia widok listy wszystkich fiszek użytkownika (domyślny zbiór).

FR-012 Filtrowanie/wyszukiwanie
- System umożliwia filtrowanie listy po tekście w EN lub PL (client-side lub server-side, zależnie od skali).

FR-013 Edycja fiszki
- System umożliwia edycję pól sentence_en i translation_pl.
- Najprostsza implementacja: modal edycji z dwoma polami i przyciskiem Zapisz.

FR-014 Usuwanie fiszki
- System umożliwia usunięcie fiszki z listy.

FR-015 Usuwanie konta i danych
- System umożliwia użytkownikowi usunięcie konta oraz wszystkich danych (fiszki) w aplikacji.

FR-016 Limity i rate limiting
- System posiada limit dzienny generowania (np. 100 zdań na użytkownika na dobę) i rate limiting na endpoint generowania.
- Po przekroczeniu limitu system pokazuje komunikat i blokuje generowanie.

FR-017 Telemetria metryk POC
- System zapisuje minimalne zdarzenia i liczniki:
  - liczba wygenerowanych fiszek (source=ai),
  - liczba edytowanych fiszek (kliknięcie Zapisz),
  - (opcjonalnie) liczba usuniętych fiszek,
  - czas odpowiedzi generacji oraz błędy generacji.

### 3.2 Wymagania niefunkcjonalne (NFR)
NFR-001 Wydajność generacji
- SLO: generacja do 20 sekund dla 30 zdań w typowych warunkach.

NFR-002 Bezpieczeństwo
- Dostęp do fiszek tylko dla zalogowanego właściciela.
- Podstawowe zabezpieczenia: ochrona endpointów, poprawne reguły dostępu w bazie (row-level security lub analogicznie).

NFR-003 Prywatność i zgodność
- Minimalizacja danych w telemetrii.
- Możliwość usunięcia danych użytkownika.

NFR-004 Dostępność i UX
- Czytelne stany: pusty stan listy, ładowanie, błąd, brak wyników filtrowania.

NFR-005 Koszty
- Limity wejścia i limity dzienne kontrolują koszty wywołań AI.

## 4. Product Boundaries

### 4.1 W zakresie POC
- Generowanie fiszek PL-EN na podstawie zdań (linia po linii).
- Konto użytkownika i przechowywanie fiszek.
- Lista fiszek z filtrowaniem.
- Edycja i usuwanie fiszek.
- Podstawowa telemetria dla metryk sukcesu.
- Limity i rate limiting.
- Web-only.

### 4.2 Poza zakresem POC (out of scope)
- Własny zaawansowany algorytm powtórek (np. SuperMemo, Anki).
- Import z plików (PDF, DOCX itp.).
- Współdzielenie zestawów między użytkownikami.
- Integracje z innymi platformami edukacyjnymi.
- Aplikacje mobilne.
- Wielozestawowość, tagi, poziomy trudności, audio, IPA.
- Historia zmian fiszek.

### 4.3 Otwarte decyzje do kolejnego etapu
- Czy drobne poprawki (literówki) mają liczyć się jako edycja w metrykach (obecnie: tak).
- Standard tłumaczenia: bardziej naturalne vs bardziej dosłowne (brak sformalizowania).
- Retencja danych telemetrii i zakres logowanych eventów.
- Czy przechowywać oryginalny input zdań per sesja (obecnie nie wymagane, ale może pomóc w diagnostyce).

## 5. User Stories

US-001 Rejestracja konta
- Description: Jako nowy użytkownik chcę założyć konto, aby zapisywać i przechowywać moje fiszki.
- Acceptance Criteria:
  - Użytkownik może utworzyć konto przy użyciu email+hasło lub magic link (zgodnie z wybranym dostawcą).
  - Po udanej rejestracji użytkownik jest zalogowany lub otrzymuje jasną instrukcję kolejnych kroków.

US-002 Logowanie
- Description: Jako użytkownik chcę się zalogować, aby uzyskać dostęp do moich fiszek.
- Acceptance Criteria:
  - Użytkownik może się zalogować poprawnymi danymi.
  - Przy błędnych danych pojawia się komunikat o błędzie bez ujawniania szczegółów bezpieczeństwa.

US-003 Wylogowanie
- Description: Jako użytkownik chcę się wylogować, aby zakończyć sesję.
- Acceptance Criteria:
  - Użytkownik może się wylogować z dowolnego widoku.
  - Po wylogowaniu widoki danych wymagają ponownego logowania.

US-004 Utrzymanie sesji
- Description: Jako użytkownik chcę pozostać zalogowany po odświeżeniu strony, aby nie tracić czasu.
- Acceptance Criteria:
  - Po odświeżeniu strony użytkownik pozostaje zalogowany do czasu wylogowania lub wygaśnięcia sesji.

US-005 Wejście do ekranu generowania
- Description: Jako użytkownik chcę zobaczyć ekran wklejenia zdań, aby rozpocząć generowanie fiszek.
- Acceptance Criteria:
  - Ekran zawiera textarea oraz przycisk Generuj.
  - Widok informuje, że każda linia to jedno zdanie oraz pokazuje limit 5–30 zdań.

US-006 Walidacja liczby zdań
- Description: Jako użytkownik chcę wiedzieć, czy wkleiłem poprawną liczbę zdań, aby uniknąć błędów generacji.
- Acceptance Criteria:
  - Dla mniej niż 5 niepustych linii przycisk Generuj jest nieaktywny lub pojawia się komunikat.
  - Dla więcej niż 30 niepustych linii system blokuje generowanie i pokazuje komunikat.

US-007 Walidacja długości linii
- Description: Jako użytkownik chcę być ostrzeżony, gdy zdanie jest za długie, aby zmieścić się w limitach.
- Acceptance Criteria:
  - Jeśli jakakolwiek linia przekracza 200 znaków, system blokuje generowanie i wskazuje problem.
  - Użytkownik może poprawić linie i ponowić próbę.

US-008 Obsługa pustych linii
- Description: Jako użytkownik chcę, aby puste linie były ignorowane, aby nie psuły wyników.
- Acceptance Criteria:
  - Puste linie nie są liczone do limitu 5–30 i nie generują fiszek.
  - Użytkownik widzi informację, że puste linie zostaną pominięte.

US-009 Opcjonalne usuwanie duplikatów
- Description: Jako użytkownik chcę opcjonalnie usuwać duplikaty zdań, aby nie tworzyć powtarzających się fiszek.
- Acceptance Criteria:
  - Jeśli funkcja jest włączona, system usuwa duplikaty przed generacją.
  - System informuje, ile duplikatów usunięto.

US-010 Generowanie fiszek
- Description: Jako użytkownik chcę wygenerować fiszki z moich zdań, aby oszczędzić czas.
- Acceptance Criteria:
  - Po kliknięciu Generuj system wywołuje AI i generuje dokładnie po jednej fiszce na niepustą linię.
  - Każda fiszka ma wypełnione sentence_en i translation_pl.
  - Fiszki są oznaczone jako source=ai.

US-011 Stan ładowania podczas generowania
- Description: Jako użytkownik chcę widzieć, że generowanie trwa, aby wiedzieć co się dzieje.
- Acceptance Criteria:
  - Podczas generowania widoczny jest stan generuję.
  - Przycisk Generuj jest zablokowany w trakcie generowania.

US-012 Sukces generowania i podgląd wyników
- Description: Jako użytkownik chcę zobaczyć wygenerowane fiszki, aby je szybko ocenić.
- Acceptance Criteria:
  - Po generacji użytkownik widzi listę nowo wygenerowanych fiszek.
  - Lista pokazuje pary EN i PL dla każdej fiszki.

US-013 Minimalna walidacja jakości po generacji
- Description: Jako użytkownik chcę, aby system wykrył oczywiste błędy techniczne, zanim zapiszę fiszki.
- Acceptance Criteria:
  - System weryfikuje liczbę fiszek względem liczby niepustych linii.
  - System weryfikuje, że pola EN i PL nie są puste.
  - W razie problemu użytkownik widzi komunikat i może przejść do edycji.

US-014 Zapisanie wygenerowanych fiszek
- Description: Jako użytkownik chcę zapisać wygenerowane fiszki na moim koncie, aby wrócić do nich później.
- Acceptance Criteria:
  - Po zapisie fiszki są dostępne w Moje fiszki.
  - Po odświeżeniu strony fiszki pozostają zapisane.

US-015 Błąd generowania i komunikat
- Description: Jako użytkownik chcę otrzymać jasny komunikat, gdy generowanie się nie uda, aby wiedzieć co zrobić.
- Acceptance Criteria:
  - W przypadku błędu system pokazuje komunikat i nie usuwa wpisanego tekstu.
  - Użytkownik może ponowić próbę.

US-016 Częściowy wynik generowania
- Description: Jako użytkownik chcę zachować to, co zostało wygenerowane, nawet jeśli część się nie udała.
- Acceptance Criteria:
  - Jeśli system posiada częściowe wyniki, prezentuje je użytkownikowi.
  - System informuje, dla ilu zdań nie udało się wygenerować fiszek.

US-017 Ponowienie generowania
- Description: Jako użytkownik chcę ponowić generowanie po błędzie, aby dokończyć proces.
- Acceptance Criteria:
  - Użytkownik może kliknąć Ponów i system podejmuje próbę ponownie.
  - Ponowienie nie powoduje duplikacji zapisanych fiszek bez ostrzeżenia (np. dotyczy tylko bieżącej sesji).

US-018 Lista fiszek użytkownika
- Description: Jako użytkownik chcę zobaczyć listę wszystkich moich fiszek, aby nimi zarządzać.
- Acceptance Criteria:
  - Lista pokazuje wszystkie fiszki użytkownika.
  - Dla braku fiszek widoczny jest pusty stan z zachętą do generowania.

US-019 Filtrowanie listy
- Description: Jako użytkownik chcę filtrować fiszki po tekście, aby szybko znaleźć interesujące pozycje.
- Acceptance Criteria:
  - Pole wyszukiwania filtruje po dopasowaniu w sentence_en lub translation_pl.
  - Gdy brak wyników, system pokazuje pusty stan filtrowania.

US-020 Edycja fiszki
- Description: Jako użytkownik chcę edytować fiszkę, aby poprawić błędne tłumaczenie lub zdanie.
- Acceptance Criteria:
  - Użytkownik może otworzyć edycję fiszki (np. modal).
  - Użytkownik może zmienić sentence_en i translation_pl.
  - Kliknięcie Zapisz aktualizuje fiszkę na liście.

US-021 Zapis edycji i metryka edycji
- Description: Jako właściciel produktu chcę mierzyć, czy fiszki wymagają edycji, aby ocenić jakość AI.
- Acceptance Criteria:
  - Kliknięcie Zapisz rejestruje zdarzenie edycji.
  - System inkrementuje licznik edytowanych fiszek (dla source=ai, jeśli dotyczy).

US-022 Usunięcie fiszki
- Description: Jako użytkownik chcę usunąć fiszkę, aby pozbyć się niepotrzebnych lub błędnych wpisów.
- Acceptance Criteria:
  - Użytkownik może usunąć fiszkę z listy.
  - Po usunięciu fiszka nie pojawia się ponownie po odświeżeniu.

US-023 Ochrona danych użytkownika
- Description: Jako użytkownik chcę mieć pewność, że inni nie zobaczą moich fiszek.
- Acceptance Criteria:
  - Niezalogowany użytkownik nie ma dostępu do listy fiszek.
  - Zalogowany użytkownik widzi tylko swoje fiszki.

US-024 Limit dzienny generowania
- Description: Jako właściciel produktu chcę ograniczyć liczbę generowanych zdań, aby kontrolować koszty.
- Acceptance Criteria:
  - Po przekroczeniu limitu dziennego system blokuje generowanie.
  - System pokazuje komunikat o przekroczeniu limitu.

US-025 Rate limiting na żądania generowania
- Description: Jako właściciel produktu chcę ograniczyć zbyt częste wywołania generowania, aby chronić system.
- Acceptance Criteria:
  - Zbyt częste żądania skutkują komunikatem o ograniczeniu.
  - Użytkownik dostaje instrukcję, kiedy może spróbować ponownie.

US-026 Usunięcie konta i danych
- Description: Jako użytkownik chcę usunąć konto i wszystkie dane, aby mieć kontrolę nad prywatnością.
- Acceptance Criteria:
  - Użytkownik może zainicjować usunięcie konta.
  - Po usunięciu konto jest niedostępne, a fiszki nie są dostępne po ponownym logowaniu.
  - Użytkownik otrzymuje potwierdzenie zakończenia operacji.

US-027 Telemetria generowania
- Description: Jako właściciel produktu chcę mierzyć wykorzystanie generowania i jakość, aby ocenić sukces POC.
- Acceptance Criteria:
  - System zapisuje liczbę wygenerowanych fiszek oraz czas odpowiedzi.
  - System zapisuje informacje o błędach generacji (bez treści wrażliwej, jeśli to możliwe).

US-028 Telemetria usunięć (opcjonalnie)
- Description: Jako właściciel produktu chcę wiedzieć, ile fiszek jest usuwanych, aby wykrywać problemy jakości.
- Acceptance Criteria:
  - Usunięcie fiszki rejestruje zdarzenie usunięcia.

## 6. Success Metrics

### 6.1 Kryteria sukcesu (produktowe)
SM-001 Jakość generacji (proxy)
- Cel: co najmniej 75 procent fiszek wygenerowanych przez AI nie jest edytowana przez użytkownika.
- Pomiar: 1 - (liczba fiszek edytowanych / liczba fiszek wygenerowanych), liczonych w obrębie fiszek source=ai.

SM-002 Adopcja generacji AI
- Cel: użytkownicy tworzą co najmniej 75 procent fiszek z wykorzystaniem AI.
- Pomiar: liczba fiszek z source=ai / liczba wszystkich fiszek utworzonych.

### 6.2 Metryki operacyjne i jakościowe
SM-003 Czas generacji
- Cel: mediana czasu generacji <= 20 s dla paczki 30 zdań.
- Pomiar: czas od kliknięcia Generuj do otrzymania wyników.

SM-004 Stabilność generowania
- Cel: niski odsetek błędów (np. < 5 procent sesji generowania kończy się błędem).
- Pomiar: liczba sesji z błędem / liczba sesji generowania.

SM-005 Retencja POC (opcjonalnie)
- Cel: użytkownik wraca do aplikacji w ciągu 7 dni.
- Pomiar: odsetek użytkowników aktywnych w dniu 7 po rejestracji (jeśli telemetria to obejmuje).

### 6.3 Instrumentacja (minimum do wdrożenia w POC)
- Event: generate_requested (liczba linii, timestamp)
- Event: generate_succeeded (liczba fiszek, czas trwania)
- Event: generate_failed (typ błędu)
- Event: card_edited (source, timestamp)
- Event: card_deleted (opcjonalnie)
- Event: limit_reached (dzienny lub rate limit)

### 6.4 Checklist po PRD
- Każda user story jest testowalna: tak, acceptance criteria są sformułowane jako weryfikowalne warunki.
- Acceptance criteria są jasne i specyficzne: tak, opisują stany UI, blokady, wyniki i trwałość danych.
- Jest wystarczająco user stories do zbudowania działającej aplikacji: tak, pokrywają auth, generację, walidacje, listę, filtr, edycję, usuwanie, błędy, limity, prywatność, telemetrię.
- Wymagania auth i autoryzacji są uwzględnione: tak (US-001, US-002, US-003, US-004, US-023).

</prd>

<tech_stack>
Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:
- Github Actions do tworzenia pipeline’ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
</tech_stack>

<dependencies>
@package.json
@.nvmrc
</dependencies>

Your task is to create a README.md file with the following structure:

1. Project name
2. Project description
3. Tech stack
4. Getting started locally
5. Available scripts
6. Project scope
7. Project status
8. License

Instructions:
1. Carefully read all provided project files.
2. Extract appropriate information for each README section.
3. Organize information into the specified structure.
4. Ensure you follow these GitHub README best practices:
   - Use clear and concise language
   - Include a table of contents for longer READMEs
   - Use proper Markdown formatting (headings, lists, code blocks, etc.).
   - Include clear instructions for setting up and running the project.
   - Include badges where relevant (e.g., build status, version, license).
   - Link to additional documentation if available
5. Carefully verify that you have included all relevant information from the input files.

Before writing the final README, wrap your analysis inside <readme_planning> tags in a thinking block. In this section:
- List key information from each input file separately (PRD, tech stack, dependencies).
- Create a brief outline for each README section.
- Note any missing information that might be needed for a comprehensive README.

This process will help ensure an accurate and well-organized README.

After conducting your analysis, provide the complete README.md content in Markdown format.

Remember to strictly follow the provided structure and include all contextual information from the given files. Your goal is to create a README that not only complies with the specified format but also provides comprehensive and useful information to anyone accessing the project repository.

The final output should be solely the creation of a README.md file in the project root, in Markdown format in English, and should not duplicate or repeat any work done in the readme_planning section.