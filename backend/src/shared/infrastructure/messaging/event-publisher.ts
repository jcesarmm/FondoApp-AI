import { getChannel } from "./rabbitmq-connection";

export class EventPublisher {
    async publish(exchange: string, routingKey: string, payload: object): Promise<void> {
        const channel = await getChannel();

        await channel.assertExchange(exchange, "topic", { durable: true });

        const message = Buffer.from(JSON.stringify(payload));
        channel.publish(exchange, routingKey, message, {
            persistent: true,
            contentType: "application/json",
            timestamp: Date.now(),
        });

        console.log(`[EventPublisher] Published to ${exchange}/${routingKey}:`, JSON.stringify(payload));
    }
}
