import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";

export const Producer = {
    mail : async (data) => {
        const channel = getChannel();
        channel.publish(EXCHANGE.MAIL.exchange, EXCHANGE.MAIL.bindingKey, Buffer.from(JSON.stringify(data)));
    },
    seatExpiration : async (data, delayMs) => {
        const channel = getChannel();
        channel.publish(
            EXCHANGE.SEAT_EXPIRATION.exchange, 
            EXCHANGE.SEAT_EXPIRATION.bindingKey, 
            Buffer.from(JSON.stringify(data)),
            { headers: { "x-delay": delayMs } }
        );
    }
}
