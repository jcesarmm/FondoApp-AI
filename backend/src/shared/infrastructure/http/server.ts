import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { AppDataSource } from "../persistence/data-source";
import { connectRabbitMQ } from "../messaging/rabbitmq-connection";
import { createUserRouter } from "../../../modules/users/infrastructure/user.routes";
import { createAuthRouter } from "../../../modules/users/infrastructure/auth.routes";
import { UserCreatedConsumer } from "../../../modules/savings-account/infrastructure/user-created.consumer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});

async function startServer() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected successfully");

        // Initialize RabbitMQ
        await connectRabbitMQ();

        // Start event consumers
        const userCreatedConsumer = new UserCreatedConsumer();
        await userCreatedConsumer.start();

        // Mount routes — auth is public, users require JWT
        app.use("/api/auth", createAuthRouter());
        app.use("/api/users", createUserRouter());

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();
