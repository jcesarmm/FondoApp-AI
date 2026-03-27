import { getChannel } from "./rabbitmq-connection";

const DLX_SUFFIX = ".dlx";
const DLQ_SUFFIX = ".dlq";

export class EventSubscriber {
    async subscribe(
        exchange: string,
        queue: string,
        routingKey: string,
        handler: (payload: any) => Promise<void>
    ): Promise<void> {
        const channel = await getChannel();

        // Assert main exchange
        await channel.assertExchange(exchange, "topic", { durable: true });

        // Dead Letter Exchange & Queue for failed messages
        const dlxName = `${exchange}${DLX_SUFFIX}`;
        const dlqName = `${queue}${DLQ_SUFFIX}`;
        await channel.assertExchange(dlxName, "topic", { durable: true });
        await channel.assertQueue(dlqName, { durable: true });
        await channel.bindQueue(dlqName, dlxName, "#");

        // Assert main queue with DLX configuration
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": dlxName,
                "x-dead-letter-routing-key": routingKey,
            },
        });

        await channel.bindQueue(queue, exchange, routingKey);

        // Prefetch 1 message at a time for fair dispatch
        await channel.prefetch(1);

        console.log(`[EventSubscriber] Listening on queue "${queue}" (exchange: ${exchange}, key: ${routingKey})`);

        channel.consume(queue, async (msg) => {
            if (!msg) return;

            const retryCount = (msg.properties.headers?.["x-retry-count"] as number) || 0;
            const MAX_RETRIES = 3;

            try {
                const payload = JSON.parse(msg.content.toString());
                console.log(`[EventSubscriber] Received message on "${queue}":`, JSON.stringify(payload));
                await handler(payload);
                channel.ack(msg);
            } catch (error: any) {
                console.error(`[EventSubscriber] Error processing message on "${queue}":`, error.message);

                if (retryCount < MAX_RETRIES) {
                    // Re-publish with incremented retry count
                    console.log(`[EventSubscriber] Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
                    channel.publish(exchange, routingKey, msg.content, {
                        persistent: true,
                        headers: { "x-retry-count": retryCount + 1 },
                    });
                    channel.ack(msg);
                } else {
                    // Send to DLQ
                    console.error(`[EventSubscriber] Max retries reached. Sending to DLQ: ${dlqName}`);
                    channel.nack(msg, false, false);
                }
            }
        });
    }
}
