# offer — фронтенд

Веб-интерфейс платформы рекламных интеграций.

**Заказчик** публикует объявление: описание задачи, ставку за 1000 просмотров и
выделенный бюджет. **Криатор** берёт объявление в работу — снимает ролик и
прикрепляет на него ссылку. По мере набора просмотров бюджет объявления
«съедается», и на карточке видна шкала: сколько выделено, сколько потрачено,
сколько осталось.

Все суммы в API — целые числа **в копейках**. В рубли они переводятся только на
экране (`src/shared/money.js`), чтобы не терять копейки на округлениях float.

## Стек

- React 18 + Vite 5
- react-router-dom 6 (BrowserRouter, SPA)
- axios через сгенерированный клиент `src/shared/api/api.gen.ts`
- jwt-decode — роль и имя достаём прямо из токена
- react-hot-toast — уведомления
- CSS-модули (`*.module.css`), без UI-библиотек
- pnpm

## Запуск

```bash
pnpm install
cp .env.example .env.development   # при необходимости поправить адрес бэка
pnpm dev
```

Дев-сервер поднимается на `http://localhost:3000` и слушает `0.0.0.0`
(доступен из докера и с телефона в той же сети).

Бэкенд по умолчанию ожидается на `http://localhost:8090` — см.
`/Users/user/IdeaProjects/traffic-markering-back`.

## Переменные окружения

| Переменная | Значение по умолчанию | Зачем |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8090` | Базовый адрес бэкенда |

Образец — в `.env.example`. Реальные `.env*` в `.gitignore`.
В продовой сборке значение зашивается в бандл на этапе `docker build`
(`--build-arg VITE_API_URL=...`), потому что Vite подставляет `import.meta.env`
во время сборки, а не в рантайме.

## Маршруты

| Путь | Экран | Кто видит |
|---|---|---|
| `/` | `Board` — публичная доска объявлений | все |
| `/campaigns/:publicId` | `CampaignPage` — карточка объявления и форма отклика | все |
| `/login` | `Login` | все |
| `/register` | `Register` | все |
| `/app` | `AppHome` — приветствие и быстрые ссылки | авторизованные |
| `/app/campaigns` | `CustomerCampaigns` — мои объявления | CUSTOMER, ADMIN |
| `/app/campaigns/:campaignId` | `CampaignEditor` (`new` — создание, uuid — правка + отклики) | CUSTOMER, ADMIN |
| `/app/applications` | `CreatorApplications` — мои отклики | CREATOR, ADMIN |
| `/app/profile` | `Profile` — профиль по роли | авторизованные |
| `*` | `NotFound` | — |

Всё под `/app` завёрнуто в `AppLayout`: он проверяет живой токен
(`apiClient.hasLiveToken()`), а доступ к разделу — по карте ролей из
`src/permissions.js`. Эта карта должна совпадать с матчерами `WebSecurityConfig`
на бэке: расхождение даст либо 403 на экране, либо пункт меню, ведущий в ошибку.

## Авторизация

JWT лежит в `localStorage` под ключом `jwt_authentication`. Токен подставляется
в заголовок `Authorization: Bearer ...` через `securityWorker` клиента API.
Response-интерцептор в `src/apiClient.jsx` при 401/403 в зоне `/app` и протухшем
токене уводит на `/login?from=...`; валидный токен без нужной роли на логин не
бросает — иначе получилась бы петля.

## API-клиент

`src/shared/api/api.gen.ts` — клиент в формате `swagger-typescript-api`.
В отличие от anyforms он **закоммичен в репозиторий**, чтобы проект собирался
сразу после клона и в Docker не требовался живой бэкенд.

Перегенерировать с работающего бэка:

```bash
pnpm run dev-api      # с http://localhost:8090
VITE_API_URL=https://api.example.ru pnpm run api
```

После генерации сверьте имена методов: страницы зовут их напрямую
(`apiClient.api.boardCampaigns()`, `apiClient.api.myCampaigns()` и т.д.),
и переименование ручки на бэке сломает вызовы.

### Какой метод в какую ручку ходит

Имена методов springdoc берёт из имён методов контроллеров, поэтому таблица —
это же и карта бэкенда. `secure` = запрос уходит с `Authorization: Bearer`.

| Метод клиента | HTTP | Путь | Токен |
|---|---|---|---|
| `register(data)` | POST | `/api/auth/register` | — |
| `login(data)` | POST | `/api/auth/login` | — |
| `me()` | GET | `/api/auth/me` | secure |
| `boardCampaigns()` | GET | `/api/public/campaigns` | — |
| `boardCampaign(publicId)` | GET | `/api/public/campaigns/{publicId}` | — |
| `publicCreator(userId)` | GET | `/api/public/creators/{userId}` | — |
| `myCampaigns()` | GET | `/api/campaigns` | secure |
| `createCampaign(data)` | POST | `/api/campaigns` | secure |
| `getCampaign(id)` | GET | `/api/campaigns/{id}` | secure |
| `updateCampaign(id, data)` | PUT | `/api/campaigns/{id}` | secure |
| `updateCampaignStatus(id, data)` | PATCH | `/api/campaigns/{id}/status` | secure |
| `deleteCampaign(id)` | DELETE | `/api/campaigns/{id}` | secure |
| `campaignApplications(id)` | GET | `/api/campaigns/{id}/applications` | secure |
| `apply(data)` | POST | `/api/applications` | secure |
| `myApplications()` | GET | `/api/applications/my` | secure |
| `updateApplicationStatus(id, data)` | PATCH | `/api/applications/{id}/status` | secure |
| `deleteApplication(id)` | DELETE | `/api/applications/{id}` | secure |
| `getCreatorProfile()` | GET | `/api/profile/creator` | secure |
| `updateCreatorProfile(data)` | PUT | `/api/profile/creator` | secure |
| `getCustomerProfile()` | GET | `/api/profile/customer` | secure |
| `updateCustomerProfile(data)` | PUT | `/api/profile/customer` | secure |
| `updateViews(id, data)` | PATCH | `/api/tech/applications/{id}/views` | secure |

`updateViews` генератор кладёт в клиент вместе с остальными ручками из схемы, но из
браузера её никто не зовёт: она закрыта ролью `SERVICE` и предназначена внешнему
анализатору просмотров.

Все суммы в запросах и ответах — `Long` в копейках, все даты — строки ISO-8601.

## Структура

```
src/
  index.jsx              точка входа: BrowserRouter + Toaster
  index.css              reset, фирменный шрифт Vasted (fallback Unbounded/Manrope) и CSS-переменные брендбука
  App.jsx                маршруты, нормализация пути, title/description/robots
  apiClient.jsx          axios-клиент, JWT, интерцепторы
  config.jsx             адрес бэкенда
  permissions.js         роль → доступные секции кабинета
  shared/
    api/api.gen.ts       сгенерированный клиент и типы DTO
    money.js             копейки ↔ рубли, форматирование просмотров
    dictionaries.js      русские подписи к enum'ам, даты, authHeaders
  components/            экраны, у каждого свой *.module.css
```

### CSS-переменные

Объявлены в `:root` в `src/index.css` и используются модулями:

`--color-ink`, `--color-ink-soft`, `--color-muted`, `--color-page`,
`--color-surface`, `--color-border`, `--color-field-border`, `--color-track`,
`--color-danger`, `--color-success`, `--card-radius`, `--field-radius`,
`--pill-radius`, `--card-shadow`, `--focus-ring`, `--page-max-width`.

## Визуальный язык

- фон страницы `#e5e5e5`, карточки белые, радиус `22px`,
  тень `0 10px 24px rgba(0, 0, 0, 0.08)`, рамка `1px solid rgba(17, 17, 17, 0.08)`
- заголовки — `font-weight: 800`, строчными (`text-transform: lowercase`)
- инпуты — радиус `14px`, в фокусе чёрная рамка и мягкое кольцо
- основная кнопка — чёрная «таблетка», вторичная — контурная, опасная — `#b3261e`
- контейнер страницы — `max-width: 1100px`, на десктопе поля по 50px
- сетка карточек — `repeat(auto-fill, minmax(min(300px, 100%), 1fr))`

## Адаптивность

Отдельной мобильной вёрстки нет — сетки резиновые, и на телефоне они схлопываются
в одну колонку сами. `min(300px, 100%)` в `minmax` обязателен: без него на экранах
уже 324px колонка в 300px не влезает в контейнер с полями по 12px и вся страница
уезжает в горизонтальный скролл.

Отдельные брейкпоинты нужны только там, где резины не хватает:

| Брейкпоинт | Где | Что делает |
|---|---|---|
| `min-width: 769px` | все страницы | поля контейнера 12px → 50px |
| `max-width: 768px` | `index.css` | `font-size: 16px` у полей ввода — iOS Safari иначе зумит страницу при фокусе |
| `max-width: 900px` | `AppLayout` | сайдбар прячется, вместо него бургер и drawer |
| `max-width: 900px` | `CampaignPage` | две колонки (описание + блок отклика) → одна |
| `max-width: 600px` | `Board` | шапка доски из строки в столбец |
| `max-width: 520px` | `AppLayout` | шапка ужимается под самые узкие экраны |

## Сборка и деплой

```bash
pnpm build      # dist/
pnpm preview
```

`Dockerfile` собирает бандл в `node:20-alpine` и отдаёт его nginx'ом
(`nginx.conf` разворачивает любой путь в `index.html` — это SPA).
`pnpm-lock.yaml` лежит в репозитории, поэтому образ ставит зависимости с
`--frozen-lockfile` — версии в сборке ровно те же, что и локально.

`.github/workflows/deploy.yml` на пуш в `main` собирает образ и пушит в
`ghcr.io/yanisderbikov/traffic-markering-front` (теги `latest` и короткий sha).
Адрес бэка берётся из переменной репозитория `VITE_API_URL`.

## Демо-логины

Бэкенд на чистой базе накатывает демо-данные (миграция `V2__seed_demo.sql`):

| Логин | Пароль | Роль |
|---|---|---|
| `demo-customer@traffic.ru` | `demo1234` | заказчик |
| `demo-creator@traffic.ru` | `demo1234` | криатор |
