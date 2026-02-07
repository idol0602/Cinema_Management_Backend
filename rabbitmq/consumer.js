import { EXCHANGE } from "./exchange.js";
import { getChannel } from "../config/rabbitmq.js";
import { handleSendMail } from "../utils/mail.js";
import { handleSeatExpiration } from "../repositories/show_time_seats.repo.js";
import { deleteCacheByPattern } from "../redis/cache.js";

export const Consumer = {

    ready : async () => {
        await Consumer.mail();
        await Consumer.seatExpiration();
        await Consumer.deleteCache();
    },

    mail : async () => {
        const channel = getChannel();
        channel.consume(EXCHANGE.MAIL.queue, async (msg) => {
            const {type, payload} = JSON.parse(msg.content.toString());
            await handleSendMail(type, payload);
            channel.ack(msg);
        })
    },

    seatExpiration : async () => {
        const channel = getChannel();
        channel.consume(EXCHANGE.SEAT_EXPIRATION.queue, async (msg) => {
            const { showTimeSeatId, userId } = JSON.parse(msg.content.toString());
            console.log(`[Consumer] Processing seat expiration for seat ${showTimeSeatId}, user ${userId}`);
            await handleSeatExpiration(showTimeSeatId, userId);
            channel.ack(msg);
        })
    },

    deleteCache : async () => {
        const channel = getChannel();
        channel.consume(EXCHANGE.DELETE_CACHE.queue, async (msg) => {
            const { pattern } = JSON.parse(msg.content.toString());
            const deleted = await deleteCacheByPattern(pattern);
            console.log(`[Consumer] Deleted ${deleted} cache keys matching: ${pattern}`);
            channel.ack(msg);
        })
    }
}
