import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// TypeORM DataSource Configuration
const AppDataSource = new DataSource({
  type: "postgres", // Change to your DB type (e.g., mysql, sqlite)
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "social4sports",
  entities: ["src/entities/*.ts"], // Adjust paths based on your setup
  synchronize: true, // Set to false in production
  logging: true,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Social4Sports API Running 🚀");
});

const PORT = process.env.PORT || 3000;

// Initialize Database & Start Server
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ Database connection error:", err));