# Secret Santa Server

Backend сервер для приложения Secret Santa, реализованный на ASP.NET Core.

## 📋 Описание

Сервер обеспечивает аутентификацию пользователей, управление играми в Тайного Санту, распределение ролей участников и реальное время обновления статусов игры через SignalR.

## 🛠️ Технологии

- **Фреймворк**: ASP.NET Core (v10.0)
- **Язык программирования**: C#
- **База данных**: PostgreSQL
- **ORM**: Entity Framework Core
- **Кеширование**: Redis
- **Реальное время**: SignalR
- **Трассировка**: OpenTelemetry + Zipkin
- **Аутентификация**: JWT Bearer
- **Хеширование**: BCrypt.Net-Next
- **Именование таблиц**: EFCore.NamingConventions

## 📁 Структура проекта

```
src
├── Attributes
│   ├── EmailValidateAttribute.cs
│   └── NoWhiteSpace.cs
├── Controllers
│   ├── AuthController.cs
│   ├── GameController.cs
│   ├── OAuthController.cs
│   └── UserController.cs
├── Data
│   ├── ApplicationDbContext.cs
│   ├── ICacheRepository.cs
│   ├── IDbContext.cs
│   └── RedisCacheRepository.cs
├── DTOs
│   ├── CreateGameRequest.cs
│   ├── EmailLoginRequest.cs
│   ├── EmailRegisterRequest.cs
│   ├── EventDto.cs
│   ├── GameDto.cs
│   ├── GameMemberDto.cs
│   ├── Result.cs
│   ├── UpdateGameRequest.cs
│   ├── UserAndAccessTokenDto.cs
│   ├── UserAuthInfoDto.cs
│   ├── UserDto.cs
│   ├── UserProfileDto.cs
│   ├── UserTokenInfo.cs
│   └── WishLetterDto.cs
├── Enums
│   ├── GameStatus.cs
│   ├── OAuthProvider.cs
│   └── Role.cs
├── Hubs
│   └── GameHub.cs
├── Models
│   ├── Assignment.cs
│   ├── Game.cs
│   ├── GameMember.cs
│   ├── UserCredentials.cs
│   └── User.cs
├── Program.cs
├── Providers
│   ├── GithubOAuthClient.cs
│   ├── GoogleOAuthClient.cs
│   └── IOAuthClient.cs
├── Services
│   ├── AssignmentService.cs
│   ├── AuthService.cs
│   ├── GameService.cs
│   ├── IAssignmentService.cs
│   ├── IAuthService.cs
│   ├── IGameService.cs
│   ├── IOAuthService.cs
│   ├── IUserService.cs
│   ├── OAuthService.cs
│   └── UserService.cs
└── Utils
    ├── IAccessTokenGenerator.cs
    ├── JwtAccessTokenGenerator.cs
    └── RefreshTokenGenerator.cs


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
