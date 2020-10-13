### Login, Register API
Szyfrownaie haseł po stronie serwera, pliki cookies, autoryzacja użytkownika po stronie serwera
Użyte biblioteki i silniki: ejs, cookie-session, express, mysql2, colors, bcryptjs
`npm install`
`node index.js`
Uruchomi się na: __localhost:3001__
Wszystkie ustawienia bazy zmienia się w database.js

### Plik Wsadowy do bazy:
```mysql
CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;
```
