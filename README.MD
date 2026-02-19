Projekt symulujący pracę biblioteki online


Backend: Node.js + Express
Frontend: HTML, CSS, JS
Baza danych: PostgreSQL
Funkcjonalności: rejestracja oraz logowanie użytkowników, CRUD książek oraz egzemplarzy, wyszukiwarka, autoryzacja poprzez tokeny JWT


Uruchomienie:
1.W database/database.sql znajduje się DDL do tworzenia bazy danych
2.W database/book_insert.sql jest plik z DML zawierający przykładowe książki oraz tworzacy ich kopie oraz uzytkownikow z danymi testowymi
3.Nastepnie trzeba przerobic .env_example na .env i uzupełnić danymi(połączenie z bazą oraz seed do cryptowania)
4.Nastepnie w glownym katalogu:
npm install; //tworzy katalog node_modules i pobiera je
npm start;

Testowe dane:
-admin login:'a' password:'a'
-user login:'u' password:'u'