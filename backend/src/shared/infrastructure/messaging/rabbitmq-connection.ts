import * as amqplib from "amqplib";

let connection: amqplib.ChannelModel | null = null;
let channel: amqplib.Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://fondoApp:[RABBITMQ_PASSWORD]@localhost:5672";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectRabbitMQ(): Promise<amqplib.Channel> {
    if (channel) return channel;

    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            connection = await amqplib.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            connection.on("error", (err: Error) => {
                console.error("RabbitMQ connection error:", err.message);
                channel = null;
                connection = null;
            });

            connection.on("close", () => {
                console.warn("RabbitMQ connection closed. Will reconnect on next usage.");
                channel = null;
                connection = null;
            });

            console.log("RabbitMQ connected successfully");
            return channel;
        } catch (error: any) {
            retries++;
            console.error(`RabbitMQ connection attempt ${retries}/${MAX_RETRIES} failed: ${error.message}`);
            if (retries >= MAX_RETRIES) throw error;
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
    }

    throw new Error("Failed to connect to RabbitMQ");
}

export async function getChannel(): Promise<amqplib.Channel> {
    if (!channel) {
        return connectRabbitMQ();
    }
    return channel;
}

export async function closeRabbitMQ(): Promise<void> {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } finally {
        channel = null;
        connection = null;
    }
}
