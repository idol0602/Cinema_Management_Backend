export const RATE_LIMIT_ACTION = {
    // ============ AUTH ROUTES ============
    LOGIN: {
        action: "login",
        capacity: 5,
        refillRate: 0.1, // 1 request / 10s - Prevent brute force
    },
    REGISTER: {
        action: "register",
        capacity: 3,
        refillRate: 0.017, // 1 request / 60s - Prevent account spam
    },
    FORGOT_PASSWORD: {
        action: "forgot_password",
        capacity: 3,
        refillRate: 0.033, // 1 request / 30s - Prevent email spam
    },
    RESET_PASSWORD: {
        action: "reset_password",
        capacity: 5,
        refillRate: 0.1, // 1 request / 10s
    },

    // ============ ORDER ROUTES ============
    CREATE_PAYMENT_URL: {
        action: "create_payment_url",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    CREATE_ORDER: {
        action: "create_order",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    PROCESS_ORDER: {
        action: "process_order",
        capacity: 5,
        refillRate: 0.2, // 1 request / 5s - Payment processing protection
    },

    // ============ SEAT HOLD ROUTES ============
    HOLD_SEAT: {
        action: "hold_seat",
        capacity: 10,
        refillRate: 0.33, // 1 request / 3s
    },
    CANCEL_HOLD_SEAT: {
        action: "cancel_hold_seat",
        capacity: 20,
        refillRate: 1, // 1 request / 1s - Allow quick cancellations
    },

    // ============ CHATBOT ROUTE ============
    CHATBOT: {
        action: "chatbot",
        capacity: 20,
        refillRate: 0.5, // 1 request / 2s - AI token cost management
    },

    // ============ CONTENT CREATION - HIGH RATE (Admin operations) ============
    CREATE_MOVIE: {
        action: "create_movie",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    UPDATE_MOVIE: {
        action: "update_movie",
        capacity: 20,
        refillRate: 1, // 1 request / 1s
    },
    DELETE_MOVIE: {
        action: "delete_movie",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    CREATE_COMBO: {
        action: "create_combo",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    UPDATE_COMBO: {
        action: "update_combo",
        capacity: 20,
        refillRate: 1, // 1 request / 1s
    },
    DELETE_COMBO: {
        action: "delete_combo",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    CREATE_MENU_ITEM: {
        action: "create_menu_item",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },
    UPDATE_MENU_ITEM: {
        action: "update_menu_item",
        capacity: 20,
        refillRate: 1, // 1 request / 1s
    },
    DELETE_MENU_ITEM: {
        action: "delete_menu_item",
        capacity: 10,
        refillRate: 0.5, // 1 request / 2s
    },

    // ============ USER MANAGEMENT ============
    CREATE_USER: {
        action: "create_user",
        capacity: 5,
        refillRate: 0.2, // 1 request / 5s
    },
    UPDATE_USER: {
        action: "update_user",
        capacity: 20,
        refillRate: 1, // 1 request / 1s
    },
    DELETE_USER: {
        action: "delete_user",
        capacity: 5,
        refillRate: 0.2, // 1 request / 5s
    },

    // ============ STATISTICS ============
    STATISTICS: {
        action: "statistics",
        capacity: 30,
        refillRate: 1, // 1 request / 1s - Report generation
    },

    // ============ EVENTS ============
    CREATE_EVENT: {
        action: "create_event",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_EVENT: {
        action: "update_event",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_EVENT: {
        action: "delete_event",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ DISCOUNTS ============
    CREATE_DISCOUNT: {
        action: "create_discount",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_DISCOUNT: {
        action: "update_discount",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_DISCOUNT: {
        action: "delete_discount",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ POSTS ============
    CREATE_POST: {
        action: "create_post",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_POST: {
        action: "update_post",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_POST: {
        action: "delete_post",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ SHOWTIMES ============
    CREATE_SHOWTIME: {
        action: "create_showtime",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_SHOWTIME: {
        action: "update_showtime",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_SHOWTIME: {
        action: "delete_showtime",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ ROOMS ============
    CREATE_ROOM: {
        action: "create_room",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_ROOM: {
        action: "update_room",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_ROOM: {
        action: "delete_room",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ TICKETS ============
    CREATE_TICKET: {
        action: "create_ticket",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_TICKET: {
        action: "update_ticket",
        capacity: 20,
        refillRate: 1,
    },

    // ============ SLIDES ============
    CREATE_SLIDE: {
        action: "create_slide",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_SLIDE: {
        action: "update_slide",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_SLIDE: {
        action: "delete_slide",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ ACTIONS (SYSTEM) ============
    CREATE_ACTION: {
        action: "create_action",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_ACTION: {
        action: "update_action",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_ACTION: {
        action: "delete_action",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ ROLES ============
    CREATE_ROLE: {
        action: "create_role",
        capacity: 5,
        refillRate: 0.2,
    },
    UPDATE_ROLE: {
        action: "update_role",
        capacity: 10,
        refillRate: 0.5,
    },
    DELETE_ROLE: {
        action: "delete_role",
        capacity: 5,
        refillRate: 0.2,
    },

    // ============ SEATS ============
    CREATE_SEAT: {
        action: "create_seat",
        capacity: 20,
        refillRate: 1,
    },
    UPDATE_SEAT: {
        action: "update_seat",
        capacity: 30,
        refillRate: 2,
    },
    DELETE_SEAT: {
        action: "delete_seat",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ SEAT TYPES ============
    CREATE_SEAT_TYPE: {
        action: "create_seat_type",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_SEAT_TYPE: {
        action: "update_seat_type",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_SEAT_TYPE: {
        action: "delete_seat_type",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ FORMATS ============
    CREATE_FORMAT: {
        action: "create_format",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_FORMAT: {
        action: "update_format",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_FORMAT: {
        action: "delete_format",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ MOVIE TYPES ============
    CREATE_MOVIE_TYPE: {
        action: "create_movie_type",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_MOVIE_TYPE: {
        action: "update_movie_type",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_MOVIE_TYPE: {
        action: "delete_movie_type",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ EVENT TYPES ============
    CREATE_EVENT_TYPE: {
        action: "create_event_type",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_EVENT_TYPE: {
        action: "update_event_type",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_EVENT_TYPE: {
        action: "delete_event_type",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ TICKET PRICES ============
    CREATE_TICKET_PRICE: {
        action: "create_ticket_price",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_TICKET_PRICE: {
        action: "update_ticket_price",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_TICKET_PRICE: {
        action: "delete_ticket_price",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ AUTHORIZATIONS ============
    CREATE_AUTHORIZE: {
        action: "create_authorize",
        capacity: 10,
        refillRate: 0.5,
    },
    UPDATE_AUTHORIZE: {
        action: "update_authorize",
        capacity: 20,
        refillRate: 1,
    },
    DELETE_AUTHORIZE: {
        action: "delete_authorize",
        capacity: 10,
        refillRate: 0.5,
    },

    // ============ COMMENTS ============
    CREATE_COMMENT: {
        action: "create_comment",
        capacity: 20,
        refillRate: 0.5, // Allow more comments
    },

    // ============ RATINGS ============
    CREATE_RATE: {
        action: "create_rate",
        capacity: 10,
        refillRate: 0.2, // 1 rating / 5s
    },
    UPDATE_RATE: {
        action: "update_rate",
        capacity: 10,
        refillRate: 0.2,
    },
}