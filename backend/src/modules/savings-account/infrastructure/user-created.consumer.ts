import { EventSubscriber } from "../../../shared/infrastructure/messaging/event-subscriber";
import { SavingsAccountService } from "../application/savings-account.service";
import { TypeOrmSavingsAccountRepository } from "./typeorm-savings-account.repository";

const EXCHANGE = "user.events";
const QUEUE = "savings.user_creation.queue";
const ROUTING_KEY = "user.created";

export class UserCreatedConsumer {
    private readonly subscriber: EventSubscriber;
    private readonly savingsAccountService: SavingsAccountService;

    constructor() {
        this.subscriber = new EventSubscriber();
        const repository = new TypeOrmSavingsAccountRepository();
        this.savingsAccountService = new SavingsAccountService(repository);
    }

    async start(): Promise<void> {
        await this.subscriber.subscribe(
            EXCHANGE,
            QUEUE,
            ROUTING_KEY,
            async (payload: { userId: string; email: string; nombre: string; apellido: string }) => {
                console.log(`[UserCreatedConsumer] Processing UserCreated event for user: ${payload.userId}`);
                await this.savingsAccountService.createForUser(payload.userId);
                console.log(`[UserCreatedConsumer] Savings account created for user: ${payload.email}`);
            }
        );
    }
}
