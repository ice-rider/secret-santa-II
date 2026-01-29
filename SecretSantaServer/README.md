# Secret Santa Server

Backend сервер для приложения Secret Santa, реализованный на ASP.NET Core с использованием C# и PostgreSQL.

## 📋 Описание

Сервер обеспечивает аутентификацию пользователей, управление играми в Тайного Санту, распределение ролей участников и реальное время обновления статусов игры через SignalR.

## 🛠️ Технологии

- **Фреймворк**: ASP.NET Core (v9.0)
- **Язык программирования**: C#
- **База данных**: PostgreSQL
- **ORM**: Entity Framework Core
- **Реальное время**: SignalR
- **Аутентификация**: JWT Bearer токены
- **Хеширование**: BCrypt.Net-Next
- **Именование таблиц**: EFCore.NamingConventions

## 📁 Структура проекта

```
SecretSantaServer/
├── Migrations/                 # Миграции Entity Framework
├── Properties/                 # Свойства проекта
├── src/
│   ├── Attributes/             # Атрибуты для валидации и авторизации
│   │   └── AuthorizeAttribute.cs
│   ├── Controllers/            # Контроллеры API
│   │   ├── AuthController.cs   # Контроллер аутентификации
│   │   ├── GameController.cs   # Контроллер управления играми
│   │   ├── OAuthController.cs  # Контроллер OAuth аутентификации
│   │   └── UserController.cs   # Контроллер управления пользователями
│   ├── Data/                   # Классы работы с данными
│   │   ├── ApplicationDbContext.cs  # Контекст базы данных
│   │   └── IDbContext.cs            # Интерфейс контекста базы данных
│   ├── DTOs/                   # Объекты передачи данных
│   │   ├── CreateGameRequest.cs     # Запрос на создание игры
│   │   ├── EmailLoginRequest.cs     # Запрос на вход по email
│   │   ├── EmailRegisterRequest.cs  # Запрос на регистрацию по email
│   │   ├── EventDto.cs              # DTO события
│   │   ├── GameDto.cs               # DTO игры
│   │   ├── GameMemberDto.cs         # DTO участника игры
│   │   ├── Result.cs                # Обертка результата операции
│   │   ├── UpdateGameRequest.cs     # Запрос на обновление игры
│   │   ├── UserAndTokensDto.cs      # DTO пользователя и токенов
│   │   ├── UserDto.cs               # DTO пользователя
│   │   ├── UserProfileDto.cs        # DTO профиля пользователя
│   │   └── WishLetterDto.cs         # DTO письма с пожеланиями
│   ├── Enums/                  # Перечисления
│   │   ├── GameStatus.cs       # Статусы игры
│   │   ├── OAuthProvider.cs    # Провайдеры OAuth
│   │   └── Role.cs             # Роли пользователей
│   ├── Hubs/                   # SignalR хабы
│   │   └── GameHub.cs          # Хаб управления играми
│   ├── Models/                 # Модели доменной области
│   │   ├── Assignment.cs       # Назначение (кто дарит кому)
│   │   ├── Game.cs             # Модель игры
│   │   ├── GameMember.cs       # Модель участника игры
│   │   ├── RefreshToken.cs     # Модель токена обновления
│   │   ├── User.cs             # Модель пользователя
│   │   └── UserCredentials.cs  # Модель учетных данных пользователя
│   ├── Providers/              # Провайдеры
│   │   └── JwtProvider.cs      # Провайдер JWT токенов
│   ├── Services/               # Бизнес-логика
│   │   ├── AssignmentService.cs   # Сервис назначений
│   │   ├── AuthService.cs         # Сервис аутентификации
│   │   ├── GameService.cs         # Сервис игр
│   │   ├── OAuthService.cs        # Сервис OAuth
│   │   └── UserService.cs         # Сервис пользователей
│   │   ├── IAssignmentService.cs  # Интерфейс сервиса назначений
│   │   ├── IAuthService.cs        # Интерфейс сервиса аутентификации
│   │   ├── IGameService.cs        # Интерфейс сервиса игр
│   │   ├── IOAuthService.cs       # Интерфейс сервиса OAuth
│   │   └── IUserService.cs        # Интерфейс сервиса пользователей
│   ├── Utils/                  # Вспомогательные утилиты
│   │   ├── CryptoUtils.cs      # Утилиты шифрования
│   │   ├── EmailValidator.cs   # Утилита валидации email
│   │   └── PasswordValidator.cs # Утилита валидации пароля
│   └── Program.cs              # Точка входа приложения
├── appsettings.json            # Конфигурация приложения
├── appsettings.Development.json # Конфигурация для разработки
├── SecretSantaServer.csproj    # Файл проекта
└── Dockerfile                  # Docker конфигурация
```

## 🚀 Запуск приложения

### Предварительные требования

- .NET SDK 9.0 или выше
- PostgreSQL сервер
- (Опционально) Docker и Docker Compose

### Локальный запуск

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd SecretSantaServer/SecretSantaServer
   ```

2. **Установите зависимости:**
   ```bash
   dotnet restore
   ```

3. **Настройте переменные окружения:**
   
   Создайте или обновите файл `appsettings.json` или используйте `appsettings.Development.json` с необходимыми параметрами подключения к базе данных и OAuth провайдерам.

4. **Выполните миграции базы данных:**
   ```bash
   dotnet ef database update
   ```

5. **Запустите приложение:**
   ```bash
   dotnet run
   ```

Приложение будет доступно по адресу `http://localhost:8080` (по умолчанию).

### Запуск в Docker

1. **Соберите и запустите контейнер:**
   ```bash
   docker build -t secret-santa-backend .
   docker run -p 8080:8080 secret-santa-backend
   ```

## 🌐 API Эндпоинты

### Authentication (api/auth)
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `POST /api/auth/refresh` - Обновление токенов
- `POST /api/auth/logout` - Выход из системы

### OAuth (api/oauth)
- `GET /api/oauth/google` - Вход через Google OAuth
- `GET /api/oauth/github` - Вход через GitHub OAuth
- `GET /api/oauth/google/callback` - Обработка обратного вызова Google OAuth
- `GET /api/oauth/github/callback` - Обработка обратного вызова GitHub OAuth

### Games (api/games)
- `GET /api/games/{id}` - Получить конкретную игру
- `POST /api/games` - Создать новую игру
- `PUT /api/games/{gameId}` - Обновить игру
- `POST /api/games/{gameId}/start` - Начать игру
- `POST /api/games/{gameId}/cancel` - Отменить игру
- `POST /api/games/{gameId}/finish` - Завершить игру
- `POST /api/games/{gameCode}/join` - Присоединиться к игре по коду
- `PUT /api/games/{gameId}/members/me` - Изменить письмо с пожеланиями
- `GET /api/games/{gameId}/my-wish` - Получить свое письмо с пожеланиями
- `GET /api/games/{gameId}/participant/wish` - Получить письмо с пожеланиями участника
- `POST /api/games/{gameId}/exit` - Покинуть игру
- `DELETE /api/games/{gameId}/members/{memberId}` - Удалить участника из игры

### Users (api/users)
- `GET /api/users/me/games` - Получить игры текущего пользователя

## 🔒 Безопасность

- Все API защищены JWT токенами
- Реализована система обновления токенов с помощью Refresh токенов
- Пароли хешируются с использованием BCrypt
- Валидация входных данных на уровне контроллеров и моделей

## 🔄 SignalR Hubs

- `/hubs/game` - Хаб для обновления статусов игры в реальном времени
  - `GameStatus` - Обновление статуса игры
  - `UserJoin` - Уведомление о присоединении пользователя
  - `UserExit` - Уведомление о выходе пользователя

## 🧪 Тестирование

Для запуска тестов выполните:
```bash
dotnet test
```

## 📦 Сборка для продакшена

```bash
dotnet publish -c Release -o ./publish
```

## ⚙️ Конфигурация

Основные параметры конфигурации находятся в файле `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5432;Database=secret_santa;Username=user;Password=password"
  },
  "Jwt": {
    "Issuer": "secret-santa",
    "Audience": "secret-santa",
    "Key": "your-secret-key-here"
  },
  "OAuth": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Github": {
      "ClientId": "your-github-client-id",
      "ClientSecret": "your-github-client-secret"
    }
  },
  "Frontend": {
    "Url": "http://localhost:3000",
    "AuthCallback": "http://localhost:3000/auth/callback",
    "GameStatusUpdatedMethod": "GameStatus",
    "UserJoinMethod": "UserJoin",
    "UserExitMethod": "UserExit"
  }
}
```
