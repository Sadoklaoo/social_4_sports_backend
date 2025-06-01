# 🏓 Social4Sports Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)  
![Express.js](https://img.shields.io/badge/Express.js-4.x-black?logo=express)  
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb)  
![Socket.io](https://img.shields.io/badge/Socket.io-WebSockets-lightgrey?logo=socket.io)  
![JWT](https://img.shields.io/badge/JWT-Auth-blue?logo=jsonwebtokens)  
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-brightgreen?logo=swagger)  
![License](https://img.shields.io/badge/license-MIT-brightgreen)

Social4Sports is a social sports platform that connects players based on skill level and location. This repository contains the backend API built using Node.js, Express.js, MongoDB, and Socket.io for real-time communication.

## 🚀 Features

✅ **User Authentication** (JWT-based)  
✅ **Profile Management** (Skill level, preferred playtime, location)  
✅ **Player Matchmaking** (Find opponents by skill & proximity)  
✅ **Friend System** (Add/remove friends, manage requests)  
✅ **Real-time Messaging** (WebSockets via Socket.io)  
✅ **Real-time Notifications** (Socket.io events for instant updates)  
✅ **Match Scheduling & Tracking** (Schedule, confirm, reschedule, cancel, history)  
✅ **Review & Rating System** (Post-match feedback)

## 🏗️ Tech Stack

- **Backend**: Node.js & Express.js  
- **Database**: MongoDB & Mongoose ODM  
- **Authentication**: JWT (JSON Web Tokens)  
- **Real-time**: Socket.io (WebSockets)  
- **API Docs**: Swagger (OpenAPI) via swagger-jsdoc & swagger-ui-express

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
PORT=3000
MONGODB_URI=mongodb://<user>:<pass>@localhost:27017/social4sports?authSource=admin
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 4️⃣ Start MongoDB via Docker (optional)
```sh
docker compose up -d mongo
```

### 5️⃣ Start the Server
```sh
npm start
```
or with **nodemon** for live reloading:
```sh
npm run dev
```

## 📡 API Endpoints

This document lists all available API endpoints for the Social4Sports Backend.

---

## 🛡️ Auth

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/api/auth/signup` | Register a new user     |
| POST   | `/api/auth/login`  | Login and receive a JWT |

---

## 👤 Users

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | `/api/users`     | Create a new user      |
| GET    | `/api/users/:id` | Get user profile by ID |
| PUT    | `/api/users/:id` | Update user profile    |
| DELETE | `/api/users/:id` | Delete user by ID      |

---

## 🏓 Matches

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| POST   | `/api/matches`                | Schedule a new match                |
| GET    | `/api/matches/upcoming`       | Retrieve upcoming matches           |
| PUT    | `/api/matches/:id/confirm`    | Confirm an incoming match           |
| PUT    | `/api/matches/:id/reschedule` | Reschedule a match (initiator only) |
| DELETE | `/api/matches/:id`            | Cancel a match                      |
| GET    | `/api/matches/history`        | Retrieve completed match history    |

---

## 🔔 Notifications

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| GET    | `/api/notifications`             | List all notifications            |
| PATCH  | `/api/notifications/:id/read`    | Mark a notification as read       |
| DELETE | `/api/notifications/:id`         | Delete a notification             |

---

## 🔍 Example Request

```bash
curl -X POST   http://localhost:3000/api/auth/login   -H 'Content-Type: application/json'   -d '{ "email": "alice@example.com", "password": "secret123" }'
```

## 🔗 Authentication

All protected endpoints require a Bearer JWT in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

## 🛠️ Contributing

👥 **Want to contribute?** Follow these steps:  
1. Fork this repository  
2. Create a new branch: `git checkout -b feature-branch`  
3. Commit your changes: `git commit -m "Added a new feature"`  
4. Push to the branch: `git push origin feature-branch`  
5. Open a Pull Request  

## 🐝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
