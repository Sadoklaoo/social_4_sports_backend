# 🏓 Social4Sports Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js) 
![Express.js](https://img.shields.io/badge/Express.js-4.x-black?logo=express) 
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7.x-red?logo=redis)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

Social4Sports is a social sports platform that connects players based on skill level and location. This repository contains the backend API built using Node.js, Express.js, MongoDB, and Redis.

## 🚀 Features

✅ **User Authentication** (JWT-based authentication)  
✅ **Profile Management** (Skill level, preferred playtime, location)  
✅ **Player Matchmaking** (Find opponents based on skill & location)  
✅ **Friend System** (Add/remove friends, manage friend requests)  
✅ **Real-time Messaging** (WebSockets for instant communication)  
✅ **Match Tracking & Ranking** (Store match results, update ranking)  
✅ **Review & Rating System** (Post-match feedback for fair play)  

## 🏗️ Tech Stack

- **Backend Framework**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)  
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Sequelize ORM](https://sequelize.org/)  
- **Authentication**: JWT (JSON Web Token)  
- **Real-time Communication**: WebSockets ([Socket.io](https://socket.io/))  
- **Caching & Queues**: [Redis](https://redis.io/) for caching & job queuing  
- **API Docs**: [Swagger (OpenAPI)]([https://swagger.io/specification/]) with  [Swagger JSdoc] ([https://www.npmjs.com/package/swagger-jsdoc)] & [Swagger UI Express]([https://www.npmjs.com/package/swagger-ui-express]).

## 📌 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/sadoklaoo/social_4_sports_backend.git
cd social4sports-backend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/social4sports
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

### 4️⃣ Run Database Migrations
```sh
npx sequelize-cli db:migrate
```

### 5️⃣ Start the Server
```sh
npm start
```
or with **nodemon** for live reloading:
```sh
npm run dev
```

## 🛡️ API Endpoints

| Method | Endpoint                 | Description                |
|--------|--------------------------|----------------------------|
| POST   | `/api/auth/signup`       | Register a new user        |
| POST   | `/api/auth/login`        | Login & get JWT token      |
| GET    | `/api/users/:id`         | Get user profile           |
| PUT    | `/api/users/:id`         | Update user profile        |
| GET    | `/api/players/search`    | Search for players         |
| POST   | `/api/friends/add`       | Send friend request        |
| GET    | `/api/matches/history`   | Get match history          |

## 🛠️ Contributing

👥 **Want to contribute?** Follow these steps:  
1. Fork this repository  
2. Create a new branch: `git checkout -b feature-branch`  
3. Commit your changes: `git commit -m "Added a new feature"`  
4. Push to the branch: `git push origin feature-branch`  
5. Open a Pull Request  

## 🐝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

