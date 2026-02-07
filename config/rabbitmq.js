import amqp from "amqplib";
import { EXCHANGE } from "../rabbitmq/exchange.js";
import { Consumer } from "../rabbitmq/consumer.js";

let channel = null;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await setup();  // Wait for queues to be declared
        await Consumer.ready();  // Then start consumers
        console.log("RabbitMQ connected");
    } catch (error) {
        console.error("RabbitMQ connection error", error);
    }
}

const setup = async () => {
    for(let [_,value] of Object.entries(EXCHANGE)) {
        await channel.assertExchange(value.exchange, value.type, {
            durable: true,
            ...(value.arguments && { arguments: value.arguments }),
        });
        await channel.assertQueue(value.queue, {durable: true})
        await channel.bindQueue(value.queue, value.exchange, value.bindingKey)
    }
}

export const getChannel = () => channel;