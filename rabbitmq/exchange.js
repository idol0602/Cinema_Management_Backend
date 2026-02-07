export const EXCHANGE = {
    MAIL : {
        exchange : "mail_exchange",
        queue : "mail_queue",
        type : "direct",
        bindingKey : "mail_binding_key",
    },
    HOLD_SEAT : {
        exchange : "hold_seat_exchange",
        queue : "hold_seat_queue",
        type : "direct",
        bindingKey : "hold_seat_binding_key",
    },
    SEAT_EXPIRATION : {
        exchange : "seat_expiration_exchange",
        queue : "seat_expiration_queue",
        type : "x-delayed-message",
        bindingKey : "seat_expiration_key",
        arguments : { "x-delayed-type": "direct" },
    },
    DELETE_CACHE : {
        exchange : "delete_cache_exchange",
        queue : "delete_cache_queue",
        type : "direct",
        bindingKey : "delete_cache_binding_key",
    }
}