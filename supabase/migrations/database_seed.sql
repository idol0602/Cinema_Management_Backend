-- =============================================
-- CINEMA MANAGEMENT SYSTEM - DATABASE SEED DATA
-- =============================================

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM combo_item_in_tickets;
DELETE FROM menu_item_in_tickets;
DELETE FROM tickets;
DELETE FROM orders;
DELETE FROM ticket_prices;
DELETE FROM show_time_seats;
DELETE FROM show_times;
DELETE FROM seats;
DELETE FROM seat_types;
DELETE FROM rooms;
DELETE FROM formats;
DELETE FROM combo_movies;
DELETE FROM combo_events;
DELETE FROM combo_items;
DELETE FROM combos;
DELETE FROM menu_items;
DELETE FROM slides;
DELETE FROM posts;
DELETE FROM comments;
DELETE FROM rates;
DELETE FROM movie_movie_types;
DELETE FROM movies;
DELETE FROM movie_types;
DELETE FROM discounts;
DELETE FROM events;
DELETE FROM event_types;
DELETE FROM authorizes;
DELETE FROM actions;
DELETE FROM roles;
DELETE FROM users;

-- =============================================
-- 1. ROLES
-- =============================================
INSERT INTO roles (id, name, created_at, is_active) VALUES
('ROLE001', 'Admin', NOW(), TRUE),
('ROLE002', 'Manager', NOW(), TRUE),
('ROLE003', 'Staff', NOW(), TRUE),
('ROLE004', 'Customer', NOW(), TRUE);

-- =============================================
-- 2. USERS
-- =============================================
INSERT INTO users (id, name, email, phone, role, password, is_online, last_seen, created_at, is_active) VALUES
('USR001', 'Nguyễn Văn Admin', 'admin@cinema.com', '0901234567', 'ROLE001', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW(), NOW(), TRUE),
('USR002', 'Trần Thị Manager', 'manager@cinema.com', '0901234568', 'ROLE002', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW(), NOW(), TRUE),
('USR003', 'Lê Văn Staff', 'staff@cinema.com', '0901234569', 'ROLE003', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', TRUE, NOW(), NOW(), TRUE),
('USR004', 'Phạm Thị Lan', 'lan.pham@gmail.com', '0912345678', 'ROLE004', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 days', TRUE),
('USR005', 'Hoàng Văn Nam', 'nam.hoang@gmail.com', '0923456789', 'ROLE004', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '60 days', TRUE),
('USR006', 'Vũ Thị Hương', 'huong.vu@gmail.com', '0934567890', 'ROLE004', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', TRUE, NOW(), NOW() - INTERVAL '10 days', TRUE),
('USR007', 'Đặng Văn Tuấn', 'tuan.dang@gmail.com', '0945678901', 'ROLE004', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '5 days', TRUE),
('USR008', 'Bùi Thị Mai', 'mai.bui@gmail.com', '0956789012', 'ROLE004', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '15 days', TRUE);

-- =============================================
-- 3. ACTIONS
-- =============================================
INSERT INTO actions (id, name, path, method, created_at, is_active) VALUES
-- Discount Routes
('action_discount_list_paginate', 'Xem danh sách giảm giá (phân trang)', '/discounts', 'GET', NOW(), true),
('action_discount_list_all', 'Xem tất cả giảm giá', '/discounts/all', 'GET', NOW(), true),
('action_discount_view', 'Xem chi tiết giảm giá', '/discounts/:id', 'GET', NOW(), true),
('action_discount_create', 'Tạo giảm giá', '/discounts', 'POST', NOW(), true),
('action_discount_update', 'Cập nhật giảm giá', '/discounts/:id', 'PUT', NOW(), true),
('action_discount_delete', 'Xóa giảm giá', '/discounts/:id', 'DELETE', NOW(), true),
-- Post Routes
('action_post_list_paginate', 'Xem danh sách bài viết (phân trang)', '/posts', 'GET', NOW(), true),
('action_post_list_all', 'Xem tất cả bài viết', '/posts/all', 'GET', NOW(), true),
('action_post_view', 'Xem chi tiết bài viết', '/posts/:id', 'GET', NOW(), true),
('action_post_create', 'Tạo bài viết', '/posts', 'POST', NOW(), true),
('action_post_update', 'Cập nhật bài viết', '/posts/:id', 'PUT', NOW(), true),
('action_post_delete', 'Xóa bài viết', '/posts/:id', 'DELETE', NOW(), true),
-- Slide Routes
('action_slide_list_paginate', 'Xem danh sách slide (phân trang)', '/slides', 'GET', NOW(), true),
('action_slide_list_all', 'Xem tất cả slide', '/slides/all', 'GET', NOW(), true),
('action_slide_view', 'Xem chi tiết slide', '/slides/:id', 'GET', NOW(), true),
('action_slide_create', 'Tạo slide', '/slides', 'POST', NOW(), true),
('action_slide_update', 'Cập nhật slide', '/slides/:id', 'PUT', NOW(), true),
('action_slide_delete', 'Xóa slide', '/slides/:id', 'DELETE', NOW(), true),
-- User Routes
('action_user_list_paginate', 'Xem danh sách người dùng (phân trang)', '/users', 'GET', NOW(), true),
('action_user_list_all', 'Xem tất cả người dùng', '/users/all', 'GET', NOW(), true),
('action_user_view', 'Xem chi tiết người dùng', '/users/:id', 'GET', NOW(), true),
('action_user_heartbeat', 'Gửi heartbeat', '/users/heartbeat/:id', 'POST', NOW(), true),
('action_user_create', 'Tạo người dùng', '/users', 'POST', NOW(), true),
('action_user_online', 'Đánh dấu người dùng online', '/users/online/:id', 'PUT', NOW(), true),
('action_user_offline', 'Đánh dấu người dùng offline', '/users/offline/:id', 'PUT', NOW(), true),
('action_user_update', 'Cập nhật người dùng', '/users/:id', 'PUT', NOW(), true),
('action_user_delete', 'Xóa người dùng', '/users/:id', 'DELETE', NOW(), true),
-- Agent Routes
('action_agent_chat', 'Chat với SQL Agent', '/agent', 'POST', NOW(), true),
-- Role Routes
('action_role_list_paginate', 'Xem danh sách vai trò (phân trang)', '/roles', 'GET', NOW(), true),
('action_role_list_all', 'Xem tất cả vai trò', '/roles/all', 'GET', NOW(), true),
('action_role_view', 'Xem chi tiết vai trò', '/roles/:id', 'GET', NOW(), true),
('action_role_create', 'Tạo vai trò', '/roles', 'POST', NOW(), true),
('action_role_update', 'Cập nhật vai trò', '/roles/:id', 'PUT', NOW(), true),
('action_role_delete', 'Xóa vai trò', '/roles/:id', 'DELETE', NOW(), true),
-- Action Routes
('action_action_list_paginate', 'Xem danh sách hành động (phân trang)', '/actions', 'GET', NOW(), true),
('action_action_list_all', 'Xem tất cả hành động', '/actions/all', 'GET', NOW(), true),
('action_action_view', 'Xem chi tiết hành động', '/actions/:id', 'GET', NOW(), true),
('action_action_create', 'Tạo hành động', '/actions', 'POST', NOW(), true),
('action_action_update', 'Cập nhật hành động', '/actions/:id', 'PUT', NOW(), true),
('action_action_delete', 'Xóa hành động', '/actions/:id', 'DELETE', NOW(), true),
-- Authorize Routes
('action_authorize_list_paginate', 'Xem danh sách phân quyền (phân trang)', '/authorizes', 'GET', NOW(), true),
('action_authorize_list_all', 'Xem tất cả phân quyền', '/authorizes/all', 'GET', NOW(), true),
('action_authorize_view', 'Xem chi tiết phân quyền', '/authorizes/:id', 'GET', NOW(), true),
('action_authorize_by_role', 'Xem phân quyền theo vai trò', '/authorizes/role/:roleId', 'GET', NOW(), true),
('action_authorize_create', 'Tạo phân quyền', '/authorizes', 'POST', NOW(), true),
('action_authorize_update', 'Cập nhật phân quyền', '/authorizes/:id', 'PUT', NOW(), true),
('action_authorize_delete', 'Xóa phân quyền', '/authorizes/:id', 'DELETE', NOW(), true),
-- Movie Routes
('action_movie_get_by_name', 'Tìm phim theo tên', '/movies/name', 'GET', NOW(), true),
('action_movie_list_paginate', 'Xem danh sách phim (phân trang)', '/movies', 'GET', NOW(), true),
('action_movie_list_all', 'Xem tất cả phim', '/movies/all', 'GET', NOW(), true),
('action_movie_view', 'Xem chi tiết phim', '/movies/:id', 'GET', NOW(), true),
('action_movie_create', 'Tạo phim', '/movies', 'POST', NOW(), true),
('action_movie_import', 'Import phim từ Excel', '/movies/import', 'POST', NOW(), true),
('action_movie_update', 'Cập nhật phim', '/movies/:id', 'PUT', NOW(), true),
('action_movie_delete', 'Xóa phim', '/movies/:id', 'DELETE', NOW(), true),
-- Movie Type Routes
('action_movie_type_list_paginate', 'Xem danh sách loại phim (phân trang)', '/movie-types', 'GET', NOW(), true),
('action_movie_type_list_all', 'Xem tất cả loại phim', '/movie-types/all', 'GET', NOW(), true),
('action_movie_type_view', 'Xem chi tiết loại phim', '/movie-types/:id', 'GET', NOW(), true),
('action_movie_type_create', 'Tạo loại phim', '/movie-types', 'POST', NOW(), true),
('action_movie_type_update', 'Cập nhật loại phim', '/movie-types/:id', 'PUT', NOW(), true),
('action_movie_type_delete', 'Xóa loại phim', '/movie-types/:id', 'DELETE', NOW(), true),
-- Ticket Price Routes
('action_ticket_price_list_paginate', 'Xem danh sách giá vé (phân trang)', '/ticket-prices', 'GET', NOW(), true),
('action_ticket_price_list_all', 'Xem tất cả giá vé', '/ticket-prices/all', 'GET', NOW(), true),
('action_ticket_price_view', 'Xem chi tiết giá vé', '/ticket-prices/:id', 'GET', NOW(), true),
('action_ticket_price_create', 'Tạo giá vé', '/ticket-prices', 'POST', NOW(), true),
('action_ticket_price_update', 'Cập nhật giá vé', '/ticket-prices/:id', 'PUT', NOW(), true),
('action_ticket_price_delete', 'Xóa giá vé', '/ticket-prices/:id', 'DELETE', NOW(), true),
-- Show Time Routes
('action_showtime_by_rooms_dates', 'Tìm suất chiếu theo phòng và ngày', '/show-times/rooms-and-date', 'GET', NOW(), true),
('action_showtime_by_room', 'Tìm suất chiếu theo phòng', '/show-times/room/:id', 'GET', NOW(), true),
('action_showtime_list_paginate', 'Xem danh sách suất chiếu (phân trang)', '/show-times', 'GET', NOW(), true),
('action_showtime_list_all', 'Xem tất cả suất chiếu', '/show-times/all', 'GET', NOW(), true),
('action_showtime_view', 'Xem chi tiết suất chiếu', '/show-times/:id', 'GET', NOW(), true),
('action_showtime_bulk_create', 'Tạo nhiều suất chiếu', '/show-times/bulk-create', 'POST', NOW(), true),
('action_showtime_create', 'Tạo suất chiếu', '/show-times', 'POST', NOW(), true),
('action_showtime_update', 'Cập nhật suất chiếu', '/show-times/:id', 'PUT', NOW(), true),
('action_showtime_delete', 'Xóa suất chiếu', '/show-times/:id', 'DELETE', NOW(), true),
-- Room Routes
('action_room_list_paginate', 'Xem danh sách phòng chiếu (phân trang)', '/rooms', 'GET', NOW(), true),
('action_room_list_all', 'Xem tất cả phòng chiếu', '/rooms/all', 'GET', NOW(), true),
('action_room_view', 'Xem chi tiết phòng chiếu', '/rooms/:id', 'GET', NOW(), true),
('action_room_create', 'Tạo phòng chiếu', '/rooms', 'POST', NOW(), true),
('action_room_update', 'Cập nhật phòng chiếu', '/rooms/:id', 'PUT', NOW(), true),
('action_room_delete', 'Xóa phòng chiếu', '/rooms/:id', 'DELETE', NOW(), true),
-- Seat Routes
('action_seat_by_room', 'Tìm ghế theo phòng', '/seats/room/:id', 'GET', NOW(), true),
('action_seat_view', 'Xem chi tiết ghế', '/seats/:id', 'GET', NOW(), true),
('action_seat_list_all', 'Xem tất cả ghế', '/seats/all', 'GET', NOW(), true),
('action_seat_list_paginate', 'Xem danh sách ghế (phân trang)', '/seats', 'GET', NOW(), true),
('action_seat_create', 'Tạo ghế', '/seats', 'POST', NOW(), true),
('action_seat_import', 'Import ghế từ Excel', '/seats/import', 'POST', NOW(), true),
('action_seat_update', 'Cập nhật ghế', '/seats/:id', 'PUT', NOW(), true),
('action_seat_delete', 'Xóa ghế', '/seats/:id', 'DELETE', NOW(), true),
-- Seat Type Routes
('action_seat_type_list_paginate', 'Xem danh sách loại ghế (phân trang)', '/seat-types', 'GET', NOW(), true),
('action_seat_type_list_all', 'Xem tất cả loại ghế', '/seat-types/all', 'GET', NOW(), true),
('action_seat_type_view', 'Xem chi tiết loại ghế', '/seat-types/:id', 'GET', NOW(), true),
('action_seat_type_create', 'Tạo loại ghế', '/seat-types', 'POST', NOW(), true),
('action_seat_type_update', 'Cập nhật loại ghế', '/seat-types/:id', 'PUT', NOW(), true),
('action_seat_type_delete', 'Xóa loại ghế', '/seat-types/:id', 'DELETE', NOW(), true),
-- Format Routes
('action_format_list_paginate', 'Xem danh sách định dạng (phân trang)', '/formats', 'GET', NOW(), true),
('action_format_list_all', 'Xem tất cả định dạng', '/formats/all', 'GET', NOW(), true),
('action_format_view', 'Xem chi tiết định dạng', '/formats/:id', 'GET', NOW(), true),
('action_format_create', 'Tạo định dạng', '/formats', 'POST', NOW(), true),
('action_format_update', 'Cập nhật định dạng', '/formats/:id', 'PUT', NOW(), true),
('action_format_delete', 'Xóa định dạng', '/formats/:id', 'DELETE', NOW(), true),
-- Combo Routes
('action_combo_list_paginate', 'Xem danh sách combo (phân trang)', '/combos', 'GET', NOW(), true),
('action_combo_list_all', 'Xem tất cả combo', '/combos/all', 'GET', NOW(), true),
('action_combo_view', 'Xem chi tiết combo', '/combos/:id', 'GET', NOW(), true),
('action_combo_create', 'Tạo combo', '/combos', 'POST', NOW(), true),
('action_combo_update', 'Cập nhật combo', '/combos/:id', 'PUT', NOW(), true),
('action_combo_delete', 'Xóa combo', '/combos/:id', 'DELETE', NOW(), true),
-- Combo Item Routes
('action_combo_item_list_paginate', 'Xem danh sách mặt hàng combo (phân trang)', '/combo-items', 'GET', NOW(), true),
('action_combo_item_list_all', 'Xem tất cả mặt hàng combo', '/combo-items/all', 'GET', NOW(), true),
('action_combo_item_view', 'Xem chi tiết mặt hàng combo', '/combo-items/:id', 'GET', NOW(), true),
('action_combo_item_create', 'Tạo mặt hàng combo', '/combo-items', 'POST', NOW(), true),
('action_combo_item_update', 'Cập nhật mặt hàng combo', '/combo-items/:id', 'PUT', NOW(), true),
('action_combo_item_delete', 'Xóa mặt hàng combo', '/combo-items/:id', 'DELETE', NOW(), true),
-- Combo Movie Routes
('action_combo_movie_list_paginate', 'Xem danh sách phim combo (phân trang)', '/combo-movies', 'GET', NOW(), true),
('action_combo_movie_list_all', 'Xem tất cả phim combo', '/combo-movies/all', 'GET', NOW(), true),
('action_combo_movie_view', 'Xem chi tiết phim combo', '/combo-movies/:id', 'GET', NOW(), true),
('action_combo_movie_create', 'Tạo phim combo', '/combo-movies', 'POST', NOW(), true),
('action_combo_movie_update', 'Cập nhật phim combo', '/combo-movies/:id', 'PUT', NOW(), true),
('action_combo_movie_delete', 'Xóa phim combo', '/combo-movies/:id', 'DELETE', NOW(), true),
-- Combo Event Routes
('action_combo_event_list_paginate', 'Xem danh sách sự kiện combo (phân trang)', '/combos-events', 'GET', NOW(), true),
('action_combo_event_list_all', 'Xem tất cả sự kiện combo', '/combos-events/all', 'GET', NOW(), true),
('action_combo_event_view', 'Xem chi tiết sự kiện combo', '/combos-events/:id', 'GET', NOW(), true),
('action_combo_event_create', 'Tạo sự kiện combo', '/combos-events', 'POST', NOW(), true),
('action_combo_event_update', 'Cập nhật sự kiện combo', '/combos-events/:id', 'PUT', NOW(), true),
('action_combo_event_delete', 'Xóa sự kiện combo', '/combos-events/:id', 'DELETE', NOW(), true),
-- Menu Item Routes
('action_menu_item_list_paginate', 'Xem danh sách mặt hàng (phân trang)', '/menu-items', 'GET', NOW(), true),
('action_menu_item_list_all', 'Xem tất cả mặt hàng', '/menu-items/all', 'GET', NOW(), true),
('action_menu_item_view', 'Xem chi tiết mặt hàng', '/menu-items/:id', 'GET', NOW(), true),
('action_menu_item_create', 'Tạo mặt hàng', '/menu-items', 'POST', NOW(), true),
('action_menu_item_update', 'Cập nhật mặt hàng', '/menu-items/:id', 'PUT', NOW(), true),
('action_menu_item_delete', 'Xóa mặt hàng', '/menu-items/:id', 'DELETE', NOW(), true),
-- Event Routes
('action_event_list_paginate', 'Xem danh sách sự kiện (phân trang)', '/events', 'GET', NOW(), true),
('action_event_list_all', 'Xem tất cả sự kiện', '/events/all', 'GET', NOW(), true),
('action_event_view', 'Xem chi tiết sự kiện', '/events/:id', 'GET', NOW(), true),
('action_event_create', 'Tạo sự kiện', '/events', 'POST', NOW(), true),
('action_event_update', 'Cập nhật sự kiện', '/events/:id', 'PUT', NOW(), true),
('action_event_delete', 'Xóa sự kiện', '/events/:id', 'DELETE', NOW(), true),
-- Event Type Routes
('action_event_type_list_paginate', 'Xem danh sách loại sự kiện (phân trang)', '/event-types', 'GET', NOW(), true),
('action_event_type_list_all', 'Xem tất cả loại sự kiện', '/event-types/all', 'GET', NOW(), true),
('action_event_type_view', 'Xem chi tiết loại sự kiện', '/event-types/:id', 'GET', NOW(), true),
('action_event_type_create', 'Tạo loại sự kiện', '/event-types', 'POST', NOW(), true),
('action_event_type_update', 'Cập nhật loại sự kiện', '/event-types/:id', 'PUT', NOW(), true),
('action_event_type_delete', 'Xóa loại sự kiện', '/event-types/:id', 'DELETE', NOW(), true),
-- Order Routes
('action_order_list_paginate', 'Xem danh sách đơn hàng (phân trang)', '/orders', 'GET', NOW(), true),
('action_order_list_all', 'Xem tất cả đơn hàng', '/orders/all', 'GET', NOW(), true),
('action_order_view', 'Xem chi tiết đơn hàng', '/orders/:id', 'GET', NOW(), true),
('action_order_create', 'Tạo đơn hàng', '/orders', 'POST', NOW(), true),
('action_order_update', 'Cập nhật đơn hàng', '/orders/:id', 'PUT', NOW(), true),
-- Ticket Routes
('action_ticket_list_paginate', 'Xem danh sách vé (phân trang)', '/tickets', 'GET', NOW(), true),
('action_ticket_list_all', 'Xem tất cả vé', '/tickets/all', 'GET', NOW(), true),
('action_ticket_view', 'Xem chi tiết vé', '/tickets/:id', 'GET', NOW(), true),
('action_ticket_create', 'Tạo vé', '/tickets', 'POST', NOW(), true),
('action_ticket_update', 'Cập nhật vé', '/tickets/:id', 'PUT', NOW(), true),
-- Show Time Seat Routes
('action_showtime_seat_list_paginate', 'Xem danh sách ghế suất chiếu (phân trang)', '/show-time-seats', 'GET', NOW(), true),
('action_showtime_seat_list_all', 'Xem tất cả ghế suất chiếu', '/show-time-seats/all', 'GET', NOW(), true),
('action_showtime_seat_view', 'Xem chi tiết ghế suất chiếu', '/show-time-seats/:id', 'GET', NOW(), true),
('action_showtime_seat_status', 'Xem trạng thái ghế suất chiếu', '/show-time-seats/status/:id', 'GET', NOW(), true),
('action_showtime_seat_create', 'Tạo ghế suất chiếu', '/show-time-seats', 'POST', NOW(), true),
('action_showtime_seat_update', 'Cập nhật ghế suất chiếu', '/show-time-seats/:id', 'PUT', NOW(), true),
('action_showtime_seat_delete', 'Xóa ghế suất chiếu', '/show-time-seats/:id', 'DELETE', NOW(), true),
-- Menu Item In Ticket Routes
('action_menu_item_in_ticket_list_paginate', 'Xem danh sách mặt hàng trong vé (phân trang)', '/menu-item-in-tickets', 'GET', NOW(), true),
('action_menu_item_in_ticket_list_all', 'Xem tất cả mặt hàng trong vé', '/menu-item-in-tickets/all', 'GET', NOW(), true),
('action_menu_item_in_ticket_view', 'Xem chi tiết mặt hàng trong vé', '/menu-item-in-tickets/:id', 'GET', NOW(), true),
('action_menu_item_in_ticket_create', 'Tạo mặt hàng trong vé', '/menu-item-in-tickets', 'POST', NOW(), true),
('action_menu_item_in_ticket_update', 'Cập nhật mặt hàng trong vé', '/menu-item-in-tickets/:id', 'PUT', NOW(), true),
('action_menu_item_in_ticket_delete', 'Xóa mặt hàng trong vé', '/menu-item-in-tickets/:id', 'DELETE', NOW(), true),
-- Combo Item In Ticket Routes
('action_combo_item_in_ticket_list_paginate', 'Xem danh sách combo trong vé (phân trang)', '/combo-item-in-tickets', 'GET', NOW(), true),
('action_combo_item_in_ticket_list_all', 'Xem tất cả combo trong vé', '/combo-item-in-tickets/all', 'GET', NOW(), true),
('action_combo_item_in_ticket_view', 'Xem chi tiết combo trong vé', '/combo-item-in-tickets/:id', 'GET', NOW(), true),
('action_combo_item_in_ticket_create', 'Tạo combo trong vé', '/combo-item-in-tickets', 'POST', NOW(), true),
('action_combo_item_in_ticket_update', 'Cập nhật combo trong vé', '/combo-item-in-tickets/:id', 'PUT', NOW(), true),
('action_combo_item_in_ticket_delete', 'Xóa combo trong vé', '/combo-item-in-tickets/:id', 'DELETE', NOW(), true);

-- =============================================
-- 4. AUTHORIZES (Admin has all permissions)
-- =============================================
-- Admin permissions (all actions)
INSERT INTO authorizes (id, role_id, action_id)
SELECT 'AUTH_ADMIN_' || id, 'ROLE001', id FROM actions;

-- Manager permissions (view all, manage movies/showtimes/orders)
INSERT INTO authorizes (id, role_id, action_id) VALUES
('AUTH_MGR_001', 'ROLE002', 'action_movie_list_paginate'),
('AUTH_MGR_002', 'ROLE002', 'action_movie_list_all'),
('AUTH_MGR_003', 'ROLE002', 'action_movie_view'),
('AUTH_MGR_004', 'ROLE002', 'action_movie_update'),
('AUTH_MGR_005', 'ROLE002', 'action_showtime_list_paginate'),
('AUTH_MGR_006', 'ROLE002', 'action_showtime_list_all'),
('AUTH_MGR_007', 'ROLE002', 'action_showtime_view'),
('AUTH_MGR_008', 'ROLE002', 'action_showtime_create'),
('AUTH_MGR_009', 'ROLE002', 'action_showtime_update'),
('AUTH_MGR_010', 'ROLE002', 'action_order_list_paginate'),
('AUTH_MGR_011', 'ROLE002', 'action_order_list_all'),
('AUTH_MGR_012', 'ROLE002', 'action_order_view');

-- Staff permissions (view movies/showtimes, create orders)
INSERT INTO authorizes (id, role_id, action_id) VALUES
('AUTH_STAFF_001', 'ROLE003', 'action_movie_list_paginate'),
('AUTH_STAFF_002', 'ROLE003', 'action_movie_list_all'),
('AUTH_STAFF_003', 'ROLE003', 'action_movie_view'),
('AUTH_STAFF_004', 'ROLE003', 'action_showtime_list_paginate'),
('AUTH_STAFF_005', 'ROLE003', 'action_showtime_list_all'),
('AUTH_STAFF_006', 'ROLE003', 'action_showtime_view'),
('AUTH_STAFF_007', 'ROLE003', 'action_order_create'),
('AUTH_STAFF_008', 'ROLE003', 'action_order_view'),
('AUTH_STAFF_009', 'ROLE003', 'action_ticket_create'),
('AUTH_STAFF_010', 'ROLE003', 'action_ticket_view');

-- Customer permissions (view movies, create orders)
INSERT INTO authorizes (id, role_id, action_id) VALUES
('AUTH_CUST_001', 'ROLE004', 'action_movie_list_paginate'),
('AUTH_CUST_002', 'ROLE004', 'action_movie_list_all'),
('AUTH_CUST_003', 'ROLE004', 'action_movie_view'),
('AUTH_CUST_004', 'ROLE004', 'action_showtime_list_paginate'),
('AUTH_CUST_005', 'ROLE004', 'action_showtime_list_all'),
('AUTH_CUST_006', 'ROLE004', 'action_showtime_view'),
('AUTH_CUST_007', 'ROLE004', 'action_order_create');

-- =============================================
-- 5. MOVIE TYPES
-- =============================================
INSERT INTO movie_types (id, type, created_at, is_active) VALUES
('MT001', 'Hành động', NOW(), TRUE),
('MT002', 'Tâm lý', NOW(), TRUE),
('MT003', 'Hài', NOW(), TRUE),
('MT004', 'Kinh dị', NOW(), TRUE),
('MT005', 'Khoa học viễn tưởng', NOW(), TRUE),
('MT006', 'Lãng mạn', NOW(), TRUE),
('MT007', 'Giật gân', NOW(), TRUE),
('MT008', 'Hoạt hình', NOW(), TRUE);

-- =============================================
-- 6. MOVIES (From movies.sql with enhancements)
-- =============================================
INSERT INTO movies (id, title, director, country, description, release_date, duration, rating, image, thumbnail, trailer, is_active, created_at) VALUES
('MV001', 'Cửu Long Mang Đao Khử Bạch Mã', '高成岗', 'China', 'Trần Thập Tam là cựu binh quân Lũng Hữu năm xưa, nay là một nông phu bị tàn tật chân phải. Để trả món nợ mười lăm lạng bạc mà gia đình đang nợ một phú hào địa phương, anh buộc phải nhận nhiệm vụ từ kẻ bất lương Trương Vị giao phó: áp giải hiệp đạo giang hồ Tô Hoán đến Bạch Mã Quan. Hành trình áp giải đầy rẫy hiểm nguy, nhiều thế lực liên tiếp rình rập, tìm cách cướp người. Trần Thập Tam dựa vào võ nghệ và mưu lược tích lũy trong những năm chinh chiến, lần lượt ứng biến, hóa giải từng đợt tập kích. Cuối cùng, trong trận chiến kéo dài đến giây phút sau cùng, chính tinh thần hiệp nghĩa giữ chữ tín nặng ngàn vàng của Trần Thập Tam đã khiến thủ lĩnh trùm cướp Tô Hoán kinh sợ, tự nguyện cúi đầu chịu trói.', '2025-12-25', 120, 5.0, 'https://img.ophim.live/uploads/movies/cuu-long-mang-dao-khu-bach-ma-poster.jpg', 'https://img.ophim.live/uploads/movies/cuu-long-mang-dao-khu-bach-ma-thumb.jpg', '', TRUE, NOW()),
('MV002', 'Chọn Chồng Nơi Chín Suối', 'David Freyne', 'Ireland', 'Trong thế giới bên kia, nơi các linh hồn chỉ có một tuần để quyết định nơi họ sẽ sống đời đời, Joan phải đối mặt với lựa chọn không thể: người đàn ông đã cùng cô đi hết cuộc đời, hay mối tình đầu chết trẻ — người đã chờ đợi cô suốt hàng thập kỷ.', '2025-12-25', 114, 7.086, 'https://img.ophim.live/uploads/movies/chon-chong-noi-chin-suoi-poster.jpg', 'https://img.ophim.live/uploads/movies/chon-chong-noi-chin-suoi-thumb.jpg', 'https://www.youtube.com/watch?v=irXTps1REHU', TRUE, NOW()),
('MV003', 'Lằn Ranh Đỏ', 'Travis Mills', 'USA', 'Merrick Beckford phải hộ tống một xe vật tư y tế bị tấn công bởi người Apache. Anh hợp tác với ba kẻ bất hợp pháp để vượt qua vùng đất chết, nhưng khi nhóm vô tình giết một trinh sát Apache, họ trở thành mục tiêu săn đuổi và phải chiến đấu để sống sót.', '2025-12-25', 125, 5.1, 'https://img.ophim.live/uploads/movies/lan-ranh-do-poster.jpg', 'https://img.ophim.live/uploads/movies/lan-ranh-do-thumb.jpg', 'https://www.youtube.com/watch?v=ATWWvQjibks', TRUE, NOW()),
('MV004', 'Merv', 'Jessica Swale', 'UK', 'Sau khi Anna và Russ chia tay, chú chó Merv trở nên buồn bã. Cả hai buộc phải cùng chăm sóc Merv, và trong chuyến đi Florida, khi Merv dần hồi phục, mối quan hệ giữa họ cũng bắt đầu nhen nhóm trở lại.', '2025-12-25', 105, 5.871, 'https://img.ophim.live/uploads/movies/merv-poster.jpg', 'https://img.ophim.live/uploads/movies/merv-thumb.jpg', 'https://www.youtube.com/watch?v=YsQXu_9-7qA', TRUE, NOW()),
('MV005', 'Trận Chiến Cuối Cùng', 'Рустам Мосафир', 'Russia', 'Người Scythia, từng là những chiến binh kiêu hãnh, đã biến mất. Một số ít hậu duệ của họ đã trở thành những sát thủ đánh thuê tàn nhẫn, "Những con sói của Ares." Lutobor, là một người lính với một nhiệm vụ khó khăn trong tầm tay. Anh ta tham gia vào các cuộc xung đột giữa các giai thoại và bắt đầu một cuộc hành trình nguy hiểm để cứu gia đình của mình.', '2025-12-24', 105, 5.807, 'https://img.ophim.live/uploads/movies/tran-chien-cuoi-cung-poster.jpg', 'https://img.ophim.live/uploads/movies/tran-chien-cuoi-cung-thumb.jpg', 'https://www.youtube.com/watch?v=RwDvvWRWmjU', TRUE, NOW()),
('MV006', 'The Way Home', '이정향', 'South Korea', 'This is the story of a 7-year-old boy, Sang-woo, born and raised in the big city, and his mute grandmother, who has spent her whole life in a small rural village.', '2025-12-24', 86, 7.965, 'https://img.ophim.live/uploads/movies/the-way-home-poster.jpg', 'https://img.ophim.live/uploads/movies/the-way-home-thumb.jpg', 'https://www.youtube.com/watch?v=x36wqfOh7tE', TRUE, NOW()),
('MV007', 'Last Shift', 'Ronjay Mendiola', 'Philippines', 'Là những nhân viên tổng đài, Joel và Romar đã tìm thấy nhau và trở thành cộng sự. Nhưng, cùng lúc cuộc khủng hoảng ngày càng trầm trọng, Joel phải đưa ra một quyết định, gạt bỏ những ước mơ mà cả hai từng ấp ủ.', '2025-12-24', 95, 6.5, 'https://img.ophim.live/uploads/movies/last-shift-2024-poster.jpg', 'https://img.ophim.live/uploads/movies/last-shift-2024-thumb.jpg', '', TRUE, NOW()),
('MV008', 'Năm Đêm Kinh Hoàng 2', 'Emma Tammi', 'USA', 'Một năm sau cơn ác mộng siêu nhiên tại tiệm Pizza Freddy Fazbear, những câu chuyện xoay quanh sự kiện ấy đã bị bóp méo thành một huyền thoại kỳ quặc tại địa phương, truyền cảm hứng cho lễ hội Fazfest đầu tiên của thị trấn. Không hề biết sự thật bị che giấu, Abby lén trốn ra ngoài để gặp lại Freddy, Bonnie, Chica và Foxy — khởi đầu cho chuỗi sự kiện kinh hoàng, hé lộ bí mật đen tối về nguồn gốc thật sự của Freddy''s, và đánh thức một nỗi kinh hoàng bị chôn vùi suốt hàng thập kỷ.', '2025-12-03', 104, 7.25, 'https://img.ophim.live/uploads/movies/nam-dem-kinh-hoang-2-poster.jpg', 'https://img.ophim.live/uploads/movies/nam-dem-kinh-hoang-2-thumb.jpg', 'https://www.youtube.com/watch?v=dSDpoobO6yM', TRUE, NOW()),
('MV009', 'Tạm biệt June', 'Kate Winslet', 'UK', 'Helen Mirren đóng chính trong vai người mẹ ốm yếu nhưng sắc sảo, tự mình sắp đặt màn từ biệt cuối. Đây là bộ phim đầu tay cảm động của Kate Winslet trong vai trò đạo diễn.', '2025-12-24', 114, 6.0, 'https://img.ophim.live/uploads/movies/tam-biet-june-poster.jpg', 'https://img.ophim.live/uploads/movies/tam-biet-june-thumb.jpg', 'https://www.youtube.com/watch?v=vIDoYSWCuzQ', TRUE, NOW()),
('MV010', 'Giải pháp Alabama', 'Andrew Jarecki, Charlotte Kaufman', 'USA', 'Incarcerated men defy the odds to expose a cover-up in one of America''s deadliest prison systems.', '2025-12-24', 117, 5.692, 'https://img.ophim.live/uploads/movies/giai-phap-alabama-poster.jpg', 'https://img.ophim.live/uploads/movies/giai-phap-alabama-thumb.jpg', 'https://www.youtube.com/watch?v=xRNND_uve8I', TRUE, NOW()),
('MV011', 'Avatar 3: Lửa và Tro Tàn', 'James Cameron', 'USA', 'Sau cuộc chiến tàn khốc với RDA và nỗi mất mát to lớn khi đứa con trai cả hy sinh, Jake Sully và Neytiri phải đối mặt với một mối đe dọa mới trên Pandora: tộc Tro Tàn — một nhóm Na''vi hung bạo và khát khao quyền lực, do thủ lĩnh tàn nhẫn Varang dẫn dắt.', '2025-07-29', 180, 7.1, 'https://img.ophim.live/uploads/movies/avatar-3-lua-va-tro-tan-poster.jpg', 'https://img.ophim.live/uploads/movies/avatar-3-lua-va-tro-tan-thumb.jpg', 'https://www.youtube.com/watch?v=nb_fFj_0rq8', TRUE, NOW()),
('MV012', 'Năm Đêm Kinh Hoàng', 'Emma Tammi', 'USA', 'Một nhân viên bảo vệ ca đêm mới làm việc tại tiệm pizza Freddy Fazbear sắp khám phá ra rằng làm việc ca đêm tại Freddy không dễ như bạn nghĩ.', '2024-10-27', 110, 7.8, 'https://img.ophim.live/uploads/movies/nam-dem-kinh-hoang-poster.jpg', 'https://img.ophim.live/uploads/movies/nam-dem-kinh-hoang-thumb.jpg', 'https://www.youtube.com/watch?v=0VH9WCFV6XQ', TRUE, NOW()),
('MV013', 'Trường Dạ Vĩnh Ninh', 'Unknown', 'China', 'Cảnh sát Ngụy Tư luôn canh cánh trong lòng về vụ án nữ sinh đại học bị sát hại cách đây 15 năm mà anh chưa thể phá giải. Giờ đây, em gái của nạn nhân năm xưa thi đỗ vào chính ngôi trường mà chị mình từng học, với hy vọng tìm thấy manh mối năm đó.', '2025-12-21', 110, 6.5, 'https://img.ophim.live/uploads/movies/truong-da-vinh-ninh-poster.jpg', 'https://img.ophim.live/uploads/movies/truong-da-vinh-ninh-thumb.jpg', '', TRUE, NOW()),
('MV014', 'Đầu Đảng Giang Hồ: Kề Vai Chiến Đấu', 'Jui-Chih Chiang, 姚宏易', 'Taiwan', 'Khi bố anh khơi mào cuộc chiến địa bàn dữ dội giữa các băng đảng đối thủ cả cũ lẫn mới, người đàn ông nọ cố gắng thâu tóm thế giới tội phạm ngầm đẫm máu của Đài Loan.', '2025-12-21', 135, 7.0, 'https://img.ophim.live/uploads/movies/dau-dang-giang-ho-ke-vai-chien-dau-poster.jpg', 'https://img.ophim.live/uploads/movies/dau-dang-giang-ho-ke-vai-chien-dau-thumb.jpg', '', TRUE, NOW()),
('MV015', 'Ám Sát Tiểu Thuyết Gia 2', '路阳', 'China', 'Nhà văn Lộ Khổng Văn, đang ở thời điểm khó khăn nhất trong cuộc đời, bị cuốn hút bởi một cám dỗ lớn, dẫn ông và các nhân vật trong cuốn sách của ông vào một cuộc khủng hoảng không thể đảo ngược.', '2025-12-17', 144, 5.125, 'https://img.ophim.live/uploads/movies/am-sat-tieu-thuyet-gia-2-poster.jpg', 'https://img.ophim.live/uploads/movies/am-sat-tieu-thuyet-gia-2-thumb.jpg', 'https://www.youtube.com/watch?v=2wBKP64qEv0', TRUE, NOW()),
('MV016', 'Mèo Rừng', 'James Nunn', 'UK', 'Một cựu đội đặc nhiệm bí mật buộc phải tái hợp trong phi vụ cuối cùng mang tính sống còn – một vụ cướp táo bạo nhằm giải cứu con gái 8 tuổi của chỉ huy cũ.', '2025-12-20', 99, 6.24, 'https://img.ophim.live/uploads/movies/meo-rung-2025-poster.jpg', 'https://img.ophim.live/uploads/movies/meo-rung-2025-thumb.jpg', 'https://www.youtube.com/watch?v=noU-vKiA9ts', TRUE, NOW()),
('MV017', 'Đậu nành', 'Rohit Shetty', 'India', 'Phó cảnh sát trưởng Veer Sooryavanshi, người đứng đầu Đội Chống Khủng bố ở Ấn Độ, đang cố gắng triệt phá một tổ chức khủng bố mà ông ta có mối thù từ trước.', '2025-12-20', 145, 5.8, 'https://img.ophim.live/uploads/movies/dau-nanh-poster.jpg', 'https://img.ophim.live/uploads/movies/dau-nanh-thumb.jpg', '', TRUE, NOW()),
('MV018', 'Chàng Lính', 'Viktoria Fanasiutina', 'Russia', 'Một cậu bé mồ côi 6 tuổi trở thành anh hùng trẻ tuổi nhất của Liên Xô trong Thế chiến II sau khi gia nhập một trung đoàn Hồng quân.', '2025-12-20', 86, 6.9, 'https://img.ophim.live/uploads/movies/chang-linh-poster.jpg', 'https://img.ophim.live/uploads/movies/chang-linh-thumb.jpg', '', TRUE, NOW()),
('MV019', 'Avatar 3: Lửa và Tro Tàn', 'James Cameron', 'USA', 'Sau cuộc chiến tàn khốc với RDA và nỗi mất mát to lớn khi đứa con trai cả hy sinh, Jake Sully và Neytiri phải đối mặt với một mối đe dọa mới trên Pandora: tộc Tro Tàn.', '2025-07-29', 180, 7.1, 'https://img.ophim.live/uploads/movies/avatar-3-lua-va-tro-tan-poster.jpg', 'https://img.ophim.live/uploads/movies/avatar-3-lua-va-tro-tan-thumb.jpg', 'https://www.youtube.com/watch?v=nb_fFj_0rq8', TRUE, NOW()),
('MV020', 'Bí Ẩn Dưới Hồ', 'Joel Anderson', 'Australia', 'After 16-year-old Alice Palmer drowns at a local dam, her family experiences a series of strange, inexplicable events centered in and around their home.', '2025-12-19', 87, 6.166, 'https://img.ophim.live/uploads/movies/bi-an-duoi-ho-poster.jpg', 'https://img.ophim.live/uploads/movies/bi-an-duoi-ho-thumb.jpg', 'https://www.youtube.com/watch?v=4n8WNQ9kOac', TRUE, NOW()),
('MV021', 'Ultraman Geed: Kết Nối Ước Nguyện', '坂本浩一', 'Japan', 'Trí tuệ nhân tạo khổng lồ Gilbaris đang cố gắng tiêu diệt mọi dạng sống có trí tuệ trong toàn vũ trụ. Ultraman Geed đối mặt với số phận nghiệt ngã trước một kẻ thù hùng mạnh.', '2025-12-19', 73, 7.1, 'https://img.ophim.live/uploads/movies/ultraman-geed-ket-noi-uoc-nguyen-poster.jpg', 'https://img.ophim.live/uploads/movies/ultraman-geed-ket-noi-uoc-nguyen-thumb.jpg', 'https://www.youtube.com/watch?v=JZ-lmYSXWE4', TRUE, NOW()),
('MV022', 'Danh Tính Ảo Tưởng', 'Kurtis David Harder', 'France', 'Tại vùng nông thôn thơ mộng của miền Nam nước Pháp, sự ám ảnh rùng rợn của một phụ nữ trẻ với tội ác giết người và đánh cắp danh tính đã đẩy cuộc sống của cô vào vòng xoáy hỗn loạn.', '2025-12-19', 110, 6.8, 'https://img.ophim.live/uploads/movies/danh-tinh-ao-tuong-poster.jpg', 'https://img.ophim.live/uploads/movies/danh-tinh-ao-tuong-thumb.jpg', 'https://www.youtube.com/watch?v=YdXy8yqd908', TRUE, NOW()),
('MV023', 'Cô Hầu Gái', 'Paul Feig', 'USA', 'Để trốn tránh quá khứ, Millie nhận công việc làm người giúp việc ở cùng nhà cho cặp vợ chồng giàu có Nina và Andrew Winchester. Nhưng điều bắt đầu như một công việc mơ ước nhanh chóng biến thành một thứ nguy hiểm hơn nhiều.', '2025-12-19', 131, 8.5, 'https://img.ophim.live/uploads/movies/co-hau-gai-2025-poster.jpg', 'https://img.ophim.live/uploads/movies/co-hau-gai-2025-thumb.jpg', 'https://www.youtube.com/watch?v=48CtX6OgU3s', TRUE, NOW()),
('MV024', '10 Điệu Nhảy', '大友啓史', 'Japan', 'Takeuchi Ryoma và Machida Keita vào vai hai vũ công cùng theo đuổi giải Vô địch khiêu vũ tiêu chuẩn 10 Dance, và màn hợp tác của họ đã thổi bùng chuyện tình khó cưỡng.', '2025-12-18', 126, 7.5, 'https://img.ophim.live/uploads/movies/10dance-poster.jpg', 'https://img.ophim.live/uploads/movies/10dance-thumb.jpg', 'https://www.youtube.com/watch?v=4iZZGBMlFbc', TRUE, NOW()),
('MV025', 'Đại Hồng Thủy', '김병우', 'South Korea', 'Khi trận lụt thảm khốc ập đến với loài người, người mẹ tuyệt vọng nọ nhận ra rằng những con sóng không chỉ mang theo hiểm nguy mà còn ẩn giấu bí mật có thể xoay chuyển tình thế.', '2025-12-19', 106, 7.8, 'https://img.ophim.live/uploads/movies/dai-hong-thuy-poster.jpg', 'https://img.ophim.live/uploads/movies/dai-hong-thuy-thumb.jpg', 'https://www.youtube.com/watch?v=SYF0MxHVAR0', TRUE, NOW()),
('MV026', 'Bốn Mùa Yêu', 'Tiffany Paulsen', 'USA', 'Câu chuyện về Remi, một cô gái có kế hoạch rõ ràng cho tương lai, và Barnes, chàng trai phóng khoáng, sống hết mình cho hiện tại. Cuộc gặp gỡ giữa họ diễn ra trong bốn ngày quan trọng của năm.', '2025-07-31', 97, 7.355, 'https://img.ophim.live/uploads/movies/winter-spring-summer-or-fall-poster.jpg', 'https://img.ophim.live/uploads/movies/winter-spring-summer-or-fall-thumb.jpg', 'https://www.youtube.com/watch?v=84-KAOf4OPM', TRUE, NOW()),
('MV027', 'Già Gân Báo Thù 2', 'Jalmari Helander', 'Finland', 'Trở về ngôi nhà nơi gia đình mình bị sát hại dã man trong chiến tranh, "người đàn ông không chịu chết" quyết tâm xây dựng lại ở một nơi an toàn để tưởng nhớ gia đình.', '2025-11-10', 89, 8.0, 'https://img.ophim.live/uploads/movies/gia-gan-bao-thu-2-poster.jpg', 'https://img.ophim.live/uploads/movies/gia-gan-bao-thu-2-thumb.jpg', 'https://www.youtube.com/watch?v=VmStqCXIgio', TRUE, NOW()),
('MV028', 'Phi Vụ Thế Kỷ 3: Thoắt Ẩn Thoắt Hiện', 'Ruben Fleischer', 'USA', 'Bốn Kỵ Sĩ nguyên bản tái hợp với thế hệ ảo thuật gia mới để đối đầu với nữ thừa kế kim cương quyền lực Veronika Vanderberg.', '2025-11-17', 112, 6.526, 'https://img.ophim.live/uploads/movies/phi-vu-the-ky-3-thoat-an-thoat-hien-poster.jpg', 'https://img.ophim.live/uploads/movies/phi-vu-the-ky-3-thoat-an-thoat-hien-thumb.jpg', 'https://www.youtube.com/watch?v=-E3lMRx7HRQ', TRUE, NOW()),
('MV029', 'Kẻ đâm lén: Đánh thức người chết', 'Rian Johnson', 'USA', 'Thám tử Benoit Blanc bắt tay với vị linh mục trẻ nhiệt huyết để điều tra một tội ác hoàn toàn bất khả thi tại nhà thờ ở thị trấn nhỏ có quá khứ đen tối.', '2025-12-12', 145, 7.6, 'https://img.ophim.live/uploads/movies/ke-dam-len-danh-thuc-nguoi-chet-poster.jpg', 'https://img.ophim.live/uploads/movies/ke-dam-len-danh-thuc-nguoi-chet-thumb.jpg', 'https://www.youtube.com/watch?v=0hc8yz5-d5Y', TRUE, NOW()),
('MV030', 'Trốn Chạy Tử Thần', 'Edgar Wright', 'USA', 'Trong bối cảnh xã hội tương lai gần, Trốn Chạy Tử Thần là chương trình truyền hình ăn khách nhất, một cuộc thi sinh tồn khốc liệt nơi các thí sinh phải trốn chạy suốt 30 ngày khỏi sự truy đuổi của các sát thủ chuyên nghiệp.', '2025-12-11', 133, 6.8, 'https://img.ophim.live/uploads/movies/tron-chay-tu-than-2025-poster.jpg', 'https://img.ophim.live/uploads/movies/tron-chay-tu-than-2025-thumb.jpg', 'https://www.youtube.com/watch?v=KD18ddeFuyM', TRUE, NOW()),
('MV031', 'Dinh Thự Downton: Hồi Kết Huy Hoàng', 'Simon Curtis', 'UK', 'Khi Mary rơi vào tâm điểm của một vụ bê bối gây chấn động dư luận và gia đình đối mặt với khủng hoảng tài chính, cả dinh thự Crawley phải gồng mình trước nguy cơ mất danh dự.', '2025-11-27', 123, 7.262, 'https://img.ophim.live/uploads/movies/dinh-thu-downton-hoi-ket-huy-hoang-poster.jpg', 'https://img.ophim.live/uploads/movies/dinh-thu-downton-hoi-ket-huy-hoang-thumb.jpg', 'https://www.youtube.com/watch?v=hFzH1AWxgIM', TRUE, NOW()),
('MV032', 'Mỏ Dầu Của Sarah', 'Cyrus Nowrasteh', 'USA', 'Sarah Rector, một cô bé người Mỹ gốc Phi sinh ra ở Lãnh thổ người da đỏ Oklahoma vào đầu những năm 1900, tin rằng có dầu mỏ dưới mảnh đất cằn cỗi được cấp cho mình.', '2025-12-13', 103, 6.969, 'https://img.ophim.live/uploads/movies/mo-dau-cua-sarah-poster.jpg', 'https://img.ophim.live/uploads/movies/mo-dau-cua-sarah-thumb.jpg', 'https://www.youtube.com/watch?v=lcEOKJm_aLY', TRUE, NOW()),
('MV033', 'Em Sẽ Khử Anh', 'Lynne Ramsay', 'USA', 'Jennifer Lawrence vào vai Grace, một người mẹ trẻ rơi vào trầm cảm sau sinh và rối loạn lưỡng cực, khi hôn nhân cùng Robert Pattinson dần biến thành địa ngục.', '2025-12-09', 119, 6.9, 'https://img.ophim.live/uploads/movies/em-se-khu-anh-poster.jpg', 'https://img.ophim.live/uploads/movies/em-se-khu-anh-thumb.jpg', 'https://www.youtube.com/watch?v=2jzXHW6Qe70', TRUE, NOW()),
('MV034', 'Chuyến tàu băng giá', 'Bong Joon-ho', 'South Korea', 'Những cư dân Trái Đất còn sống sót phải ở yên trên một con tàu chạy vòng quanh địa cầu, và một cuộc cách mạng nổ ra giữa các toa được phân chia theo tầng lớp xã hội.', '2022-02-25', 126, 6.909, 'https://img.ophim.live/uploads/movies/chuyen-tau-bang-gia-poster.jpg', 'https://img.ophim.live/uploads/movies/chuyen-tau-bang-gia-thumb.jpg', '', TRUE, NOW()),
('MV035', 'Lạc Trong Hào Quang', 'Ernest Prakasa', 'Indonesia', 'Ngay khi giành được vai diễn danh giá, nam diễn viên nổi tiếng nọ bỗng mất đi khả năng diễn xuất một cách bí ẩn, mở ra hành trình tự khám phá bản thân giữa áp lực dư luận.', '2025-12-11', 114, 6.8, 'https://img.ophim.live/uploads/movies/lac-trong-hao-quang-poster.jpg', 'https://img.ophim.live/uploads/movies/lac-trong-hao-quang-thumb.jpg', '', TRUE, NOW());

-- =============================================
-- 6B. MOVIE_MOVIE_TYPES (Many-to-Many Relationships)
-- =============================================
INSERT INTO movie_movie_types (id, movie_id, movie_type_id) VALUES
-- MV001: Action + Thriller
('MMT001', 'MV001', 'MT001'),
('MMT002', 'MV001', 'MT007'),
-- MV002: Drama + Romance
('MMT003', 'MV002', 'MT002'),
('MMT004', 'MV002', 'MT006'),
-- MV003: Action
('MMT005', 'MV003', 'MT001'),
-- MV004: Drama + Romance + Comedy
('MMT006', 'MV004', 'MT002'),
('MMT007', 'MV004', 'MT006'),
('MMT008', 'MV004', 'MT003'),
-- MV005: Action + Thriller
('MMT009', 'MV005', 'MT001'),
('MMT010', 'MV005', 'MT007'),
-- MV006: Drama
('MMT011', 'MV006', 'MT002'),
-- MV007: Drama
('MMT012', 'MV007', 'MT002'),
-- MV008: Horror + Thriller
('MMT013', 'MV008', 'MT004'),
('MMT014', 'MV008', 'MT007'),
-- MV009: Drama
('MMT015', 'MV009', 'MT002'),
-- MV010: Drama
('MMT016', 'MV010', 'MT002'),
-- MV011: Action + Science Fiction
('MMT017', 'MV011', 'MT001'),
('MMT018', 'MV011', 'MT005'),
-- MV012: Horror + Thriller
('MMT019', 'MV012', 'MT004'),
('MMT020', 'MV012', 'MT007'),
-- MV013: Thriller
('MMT021', 'MV013', 'MT007'),
-- MV014: Action + Thriller
('MMT022', 'MV014', 'MT001'),
('MMT023', 'MV014', 'MT007'),
-- MV015: Thriller + Drama
('MMT024', 'MV015', 'MT007'),
('MMT025', 'MV015', 'MT002'),
-- MV016: Action + Thriller
('MMT026', 'MV016', 'MT001'),
('MMT027', 'MV016', 'MT007'),
-- MV017: Action
('MMT028', 'MV017', 'MT001'),
-- MV018: Drama
('MMT029', 'MV018', 'MT002'),
-- MV019: Science Fiction + Action
('MMT030', 'MV019', 'MT005'),
('MMT031', 'MV019', 'MT001'),
-- MV020: Horror + Thriller
('MMT032', 'MV020', 'MT004'),
('MMT033', 'MV020', 'MT007'),
-- MV021: Science Fiction + Action
('MMT034', 'MV021', 'MT005'),
('MMT035', 'MV021', 'MT001'),
-- MV022: Thriller + Horror
('MMT036', 'MV022', 'MT007'),
('MMT037', 'MV022', 'MT004'),
-- MV023: Thriller
('MMT038', 'MV023', 'MT007'),
-- MV024: Romance + Drama
('MMT039', 'MV024', 'MT006'),
('MMT040', 'MV024', 'MT002'),
-- MV025: Thriller + Drama
('MMT041', 'MV025', 'MT007'),
('MMT042', 'MV025', 'MT002'),
-- MV026: Romance + Comedy
('MMT043', 'MV026', 'MT006'),
('MMT044', 'MV026', 'MT003'),
-- MV027: Action + Thriller
('MMT045', 'MV027', 'MT001'),
('MMT046', 'MV027', 'MT007'),
-- MV028: Thriller
('MMT047', 'MV028', 'MT007'),
-- MV029: Thriller
('MMT048', 'MV029', 'MT007'),
-- MV030: Science Fiction + Action + Thriller
('MMT049', 'MV030', 'MT005'),
('MMT050', 'MV030', 'MT001'),
('MMT051', 'MV030', 'MT007'),
-- MV031: Drama
('MMT052', 'MV031', 'MT002'),
-- MV032: Drama
('MMT053', 'MV032', 'MT002'),
-- MV033: Thriller + Drama
('MMT054', 'MV033', 'MT007'),
('MMT055', 'MV033', 'MT002'),
-- MV034: Science Fiction + Action + Thriller
('MMT056', 'MV034', 'MT005'),
('MMT057', 'MV034', 'MT001'),
('MMT058', 'MV034', 'MT007'),
-- MV035: Drama + Comedy
('MMT059', 'MV035', 'MT002'),
('MMT060', 'MV035', 'MT003');

-- =============================================
-- 7. RATES
-- =============================================
INSERT INTO rates (id, movie_id, user_id, stars, created_at) VALUES
('RATE001', 'MV001', 'USR004', 5, NOW() - INTERVAL '2 days'),
('RATE002', 'MV002', 'USR004', 4, NOW() - INTERVAL '1 day'),
('RATE003', 'MV002', 'USR005', 3, NOW() - INTERVAL '3 hours'),
('RATE004', 'MV003', 'USR006', 2, NOW() - INTERVAL '5 hours'),
('RATE005', 'MV008', 'USR007', 1, NOW() - INTERVAL '1 day'),
('RATE006', 'MV008', 'USR008', 5, NOW() - INTERVAL '2 days'),
('RATE007', 'MV011', 'USR004', 4, NOW() - INTERVAL '1 hour'),
('RATE008', 'MV012', 'USR005', 3, NOW() - INTERVAL '3 days');

-- =============================================
-- 8. COMMENTS
-- =============================================
INSERT INTO comments (id, user_id, movie_id, content, created_at, is_active) VALUES
('CMT001', 'USR004', 'MV002', 'Bộ phim rất cảm động, diễn xuất tuyệt vời!', NOW() - INTERVAL '1 day', TRUE),
('CMT002', 'USR005', 'MV002', 'Câu chuyện hay nhưng hơi dài dòng', NOW() - INTERVAL '2 hours', TRUE),
('CMT003', 'USR006', 'MV008', 'Phim kinh dị hay nhất năm! Tôi đã sợ tới khóc', NOW() - INTERVAL '1 day', TRUE),
('CMT004', 'USR007', 'MV008', 'Phần 2 hay hơn phần 1 nhiều', NOW() - INTERVAL '3 hours', TRUE),
('CMT005', 'USR008', 'MV011', 'Đợi phim này lâu lắm rồi, không thất vọng!', NOW() - INTERVAL '30 minutes', TRUE),
('CMT006', 'USR004', 'MV012', 'Bộ phim kinh điển của dòng phim kinh dị', NOW() - INTERVAL '2 days', TRUE);

-- =============================================
-- 9. POSTS
-- =============================================
INSERT INTO posts (id, title, content, image, user_id, created_at, is_active) VALUES
('POST001', 'Top 10 phim hay nhất tháng 12/2025', 'Chúng tôi xin giới thiệu danh sách 10 bộ phim được đánh giá cao nhất trong tháng 12...', 'https://example.com/posts/top-10-movies.jpg', 'USR002', NOW() - INTERVAL '5 days', TRUE),
('POST002', 'Sự kiện khuyến mãi mùa lễ hội', 'Nhân dịp lễ Giáng sinh và năm mới, rạp chiếu phim áp dụng chương trình giảm giá 20%...', 'https://example.com/posts/promotion.jpg', 'USR002', NOW() - INTERVAL '3 days', TRUE),
('POST003', 'Hậu trường phim Avatar 3', 'Hé lộ những cảnh quay hậu trường đầy thú vị của bộ phim bom tấn Avatar 3...', 'https://example.com/posts/avatar-behind.jpg', 'USR001', NOW() - INTERVAL '1 day', TRUE),
('POST004', 'Khai trương phòng chiếu IMAX mới', 'Chúng tôi tự hào giới thiệu phòng chiếu IMAX hiện đại nhất khu vực...', 'https://example.com/posts/imax-room.jpg', 'USR002', NOW() - INTERVAL '7 days', TRUE);

-- =============================================
-- 10. SLIDES
-- =============================================
INSERT INTO slides (id, image, trailer, title, content, is_active, created_at) VALUES
('SLIDE001', 'https://example.com/slides/avatar3-slide.jpg', 'https://www.youtube.com/watch?v=nb_fFj_0rq8', 'Avatar 3: Lửa và Tro Tàn', 'Khám phá thế giới Pandora mới với những bí ẩn chưa từng có', TRUE, NOW()),
('SLIDE002', 'https://example.com/slides/fnaf2-slide.jpg', 'https://www.youtube.com/watch?v=dSDpoobO6yM', 'Năm Đêm Kinh Hoàng 2', 'Trở lại với Freddy và những cơn ác mộng mới', TRUE, NOW()),
('SLIDE003', 'https://example.com/slides/promotion-slide.jpg', '', 'Giảm giá 20% mùa lễ hội', 'Đặt vé ngay để nhận ưu đãi đặc biệt', TRUE, NOW()),
('SLIDE004', 'https://example.com/slides/combo-slide.jpg', '', 'Combo bắp nước siêu tiết kiệm', 'Chỉ từ 99.000đ cho combo gia đình', TRUE, NOW());

-- =============================================
-- 11. MENU ITEMS
-- =============================================
INSERT INTO menu_items (id, name, description, price, item_type, image, num_instock, is_active, created_at) VALUES
('MENU001', 'Bắp rang bơ (L)', 'Bắp rang bơ size lớn', 50000, 'FOOD', 'https://example.com/menu/popcorn-l.jpg', 100, TRUE, NOW()),
('MENU002', 'Bắp rang bơ (M)', 'Bắp rang bơ size vừa', 40000, 'FOOD', 'https://example.com/menu/popcorn-m.jpg', 150, TRUE, NOW()),
('MENU003', 'Bắp rang bơ (S)', 'Bắp rang bơ size nhỏ', 30000, 'FOOD', 'https://example.com/menu/popcorn-s.jpg', 200, TRUE, NOW()),
('MENU004', 'Coca Cola (L)', 'Nước ngọt Coca Cola size lớn', 35000, 'DRINK', 'https://example.com/menu/coke-l.jpg', 200, TRUE, NOW()),
('MENU005', 'Coca Cola (M)', 'Nước ngọt Coca Cola size vừa', 30000, 'DRINK', 'https://example.com/menu/coke-m.jpg', 250, TRUE, NOW()),
('MENU006', 'Pepsi (L)', 'Nước ngọt Pepsi size lớn', 35000, 'DRINK', 'https://example.com/menu/pepsi-l.jpg', 180, TRUE, NOW()),
('MENU007', 'Pepsi (M)', 'Nước ngọt Pepsi size vừa', 30000, 'DRINK', 'https://example.com/menu/pepsi-m.jpg', 220, TRUE, NOW()),
('MENU008', 'Nước khoáng', 'Nước khoáng Aquafina', 15000, 'DRINK', 'https://example.com/menu/water.jpg', 300, TRUE, NOW()),
('MENU009', 'Hot Dog', 'Xúc xích kẹp bánh mì', 45000, 'FOOD', 'https://example.com/menu/hotdog.jpg', 80, TRUE, NOW()),
('MENU010', 'Nachos', 'Nachos phô mai', 55000, 'FOOD', 'https://example.com/menu/nachos.jpg', 60, TRUE, NOW()),
('MENU011', 'Móc khóa phim', 'Móc khóa nhân vật phim', 50000, 'GIFT', 'https://example.com/menu/keychain.jpg', 100, TRUE, NOW()),
('MENU012', 'Áo thun phim', 'Áo thun in hình poster phim', 250000, 'GIFT', 'https://example.com/menu/tshirt.jpg', 50, TRUE, NOW());

-- =============================================
-- 12. COMBOS
-- =============================================
-- is_event_combo = TRUE if combo has combo_events (COMBO003->EVT001, COMBO004->EVT001+EVT004, COMBO005->EVT003)
INSERT INTO combos (id, name, description, total_price, image, is_event_combo, is_active, created_at) VALUES
('COMBO001', 'Combo Solo', '1 Bắp (M) + 1 Nước (M)', 65000, 'https://example.com/combos/combo-solo.jpg', FALSE, TRUE, NOW()),
('COMBO002', 'Combo Couple', '2 Bắp (M) + 2 Nước (M)', 125000, 'https://example.com/combos/combo-couple.jpg', FALSE, TRUE, NOW()),
('COMBO003', 'Combo Family', '2 Bắp (L) + 4 Nước (M)', 220000, 'https://example.com/combos/combo-family.jpg', TRUE, TRUE, NOW()),
('COMBO004', 'Combo VIP', '2 Bắp (L) + 2 Nước (L) + 2 Hot Dog', 280000, 'https://example.com/combos/combo-vip.jpg', TRUE, TRUE, NOW()),
('COMBO005', 'Combo Student', '1 Bắp (S) + 1 Nước (M)', 55000, 'https://example.com/combos/combo-student.jpg', TRUE, TRUE, NOW());

-- =============================================
-- 13. COMBO ITEMS
-- =============================================
INSERT INTO combo_items (id, combo_id, menu_item_id, quantity, unit_price, is_active) VALUES
-- Combo Solo
('CI001', 'COMBO001', 'MENU002', 1, 40000, TRUE),
('CI002', 'COMBO001', 'MENU005', 1, 30000, TRUE),
-- Combo Couple
('CI003', 'COMBO002', 'MENU002', 2, 40000, TRUE),
('CI004', 'COMBO002', 'MENU005', 2, 30000, TRUE),
-- Combo Family
('CI005', 'COMBO003', 'MENU001', 2, 50000, TRUE),
('CI006', 'COMBO003', 'MENU005', 4, 30000, TRUE),
-- Combo VIP
('CI007', 'COMBO004', 'MENU001', 2, 50000, TRUE),
('CI008', 'COMBO004', 'MENU004', 2, 35000, TRUE),
('CI009', 'COMBO004', 'MENU009', 2, 45000, TRUE),
-- Combo Student
('CI010', 'COMBO005', 'MENU003', 1, 30000, TRUE),
('CI011', 'COMBO005', 'MENU005', 1, 30000, TRUE);

-- =============================================
-- 14. COMBO MOVIES
-- =============================================
INSERT INTO combo_movies (id, combo_id, movie_id) VALUES
('CM001', 'COMBO001', 'MV008'),
('CM002', 'COMBO001', 'MV012'),
('CM003', 'COMBO002', 'MV011'),
('CM004', 'COMBO003', 'MV011'),
('CM005', 'COMBO004', 'MV011'),
('CM006', 'COMBO005', 'MV002');

-- =============================================
-- 15. EVENT TYPES
-- =============================================
INSERT INTO event_types (id, name, created_at, is_active) VALUES
('EVTYPE001', 'Holiday', NOW(), TRUE),
('EVTYPE002', 'Student', NOW(), TRUE),
('EVTYPE003', 'Member', NOW(), TRUE),
('EVTYPE004', 'Special', NOW(), TRUE);

-- =============================================
-- 16. EVENTS
-- =============================================
-- is_in_combo = TRUE if event has combo_events (EVT001->COMBO003+COMBO004, EVT003->COMBO005, EVT004->COMBO004)
INSERT INTO events (id, name, description, start_date, end_date, image, event_type_id, only_at_counter, is_in_combo, created_at, is_active) VALUES
('EVT001', 'Giáng sinh vui vẻ', 'Khuyến mãi đặc biệt mùa Giáng sinh', '2025-12-20', '2025-12-26', 'https://example.com/events/christmas.jpg', 'EVTYPE001', FALSE, TRUE, NOW(), TRUE),
('EVT002', 'Năm mới rực rỡ', 'Chào đón năm mới 2026', '2025-12-28', '2026-01-05', 'https://example.com/events/newyear.jpg', 'EVTYPE001', FALSE, FALSE, NOW(), TRUE),
('EVT003', 'Sinh viên tiết kiệm', 'Ưu đãi dành cho sinh viên', '2025-11-01', '2026-02-28', 'https://example.com/events/student.jpg', 'EVTYPE002', TRUE, TRUE, NOW(), TRUE),
('EVT004', 'Thành viên VIP', 'Đặc quyền cho thành viên thân thiết', '2025-01-01', '2025-12-31', 'https://example.com/events/vip.jpg', 'EVTYPE003', FALSE, TRUE, NOW(), TRUE);

-- =============================================
-- 17. COMBO EVENTS
-- =============================================
INSERT INTO combo_events (id, combo_id, event_id) VALUES
('CE001', 'COMBO003', 'EVT001'),
('CE002', 'COMBO004', 'EVT001'),
('CE003', 'COMBO005', 'EVT003'),
('CE004', 'COMBO004', 'EVT004');

-- =============================================
-- 18. DISCOUNTS
-- =============================================
INSERT INTO discounts (id, event_id, name, description, discount_percent, valid_from, valid_to, is_active, created_at) VALUES
('DISC001', 'EVT001', 'Giảm 20% Giáng sinh', 'Giảm 20% cho tất cả vé xem phim', 20, '2025-12-20', '2025-12-26', TRUE, NOW()),
('DISC002', 'EVT002', 'Giảm 15% Tết Dương lịch', 'Giảm 15% cho tất cả đơn hàng', 15, '2025-12-28', '2026-01-05', TRUE, NOW()),
('DISC003', 'EVT003', 'Giảm 25% Sinh viên', 'Giảm 25% cho sinh viên có thẻ', 25, '2025-11-01', '2026-02-28', TRUE, NOW()),
('DISC004', 'EVT004', 'Giảm 30% VIP', 'Giảm 30% cho thành viên VIP', 30, '2025-01-01', '2025-12-31', TRUE, NOW());

-- =============================================
-- 19. FORMATS
-- =============================================
INSERT INTO formats (id, name, created_at, is_active) VALUES
('FMT001', '2D', NOW(), TRUE),
('FMT002', '3D', NOW(), TRUE),
('FMT003', 'IMAX', NOW(), TRUE);

-- =============================================
-- 20. SEAT TYPES
-- =============================================
INSERT INTO seat_types (id, name, created_at, is_active) VALUES
('ST001', 'STANDARD', NOW(), TRUE),
('ST002', 'VIP', NOW(), TRUE),
('ST003', 'COUPLE', NOW(), TRUE);

-- =============================================
-- 21. TICKET PRICES
-- =============================================
INSERT INTO ticket_prices (id, format_id, seat_type_id, day_type, price, created_at, is_active) VALUES
-- 2D Weekday prices
('TP001', 'FMT001', 'ST001', 'WEEKDAY', 70000, NOW(), TRUE),
('TP002', 'FMT001', 'ST002', 'WEEKDAY', 90000, NOW(), TRUE),
('TP003', 'FMT001', 'ST003', 'WEEKDAY', 160000, NOW(), TRUE),
-- 2D Weekend prices
('TP004', 'FMT001', 'ST001', 'WEEKEND', 90000, NOW(), TRUE),
('TP005', 'FMT001', 'ST002', 'WEEKEND', 110000, NOW(), TRUE),
('TP006', 'FMT001', 'ST003', 'WEEKEND', 200000, NOW(), TRUE),
-- 3D Weekday prices
('TP007', 'FMT002', 'ST001', 'WEEKDAY', 90000, NOW(), TRUE),
('TP008', 'FMT002', 'ST002', 'WEEKDAY', 110000, NOW(), TRUE),
('TP009', 'FMT002', 'ST003', 'WEEKDAY', 200000, NOW(), TRUE),
-- 3D Weekend prices
('TP010', 'FMT002', 'ST001', 'WEEKEND', 110000, NOW(), TRUE),
('TP011', 'FMT002', 'ST002', 'WEEKEND', 130000, NOW(), TRUE),
('TP012', 'FMT002', 'ST003', 'WEEKEND', 240000, NOW(), TRUE),
-- IMAX Weekday prices
('TP013', 'FMT003', 'ST001', 'WEEKDAY', 120000, NOW(), TRUE),
('TP014', 'FMT003', 'ST002', 'WEEKDAY', 150000, NOW(), TRUE),
('TP015', 'FMT003', 'ST003', 'WEEKDAY', 280000, NOW(), TRUE),
-- IMAX Weekend prices
('TP016', 'FMT003', 'ST001', 'WEEKEND', 140000, NOW(), TRUE),
('TP017', 'FMT003', 'ST002', 'WEEKEND', 170000, NOW(), TRUE),
('TP018', 'FMT003', 'ST003', 'WEEKEND', 320000, NOW(), TRUE);

-- =============================================
-- 22. ROOMS
-- =============================================
INSERT INTO rooms (id, format_id, name, location, created_at, is_active) VALUES
('ROOM001', 'FMT001', 'Phòng 1', 'Tầng 2', NOW(), TRUE),
('ROOM002', 'FMT001', 'Phòng 2', 'Tầng 2', NOW(), TRUE),
('ROOM003', 'FMT002', 'Phòng 3', 'Tầng 3', NOW(), TRUE),
('ROOM004', 'FMT002', 'Phòng 4', 'Tầng 3', NOW(), TRUE),
('ROOM005', 'FMT003', 'Phòng IMAX', 'Tầng 4', NOW(), TRUE);

-- =============================================
-- 23. SEATS
-- =============================================
-- Room 1 (2D) - 80 seats (8 rows x 10 seats)
INSERT INTO seats (id, room_id, seat_number, type, created_at, is_active) VALUES
-- Row A (Standard)
('SEAT001', 'ROOM001', 'A1', 'ST001', NOW(), TRUE),
('SEAT002', 'ROOM001', 'A2', 'ST001', NOW(), TRUE),
('SEAT003', 'ROOM001', 'A3', 'ST001', NOW(), TRUE),
('SEAT004', 'ROOM001', 'A4', 'ST001', NOW(), TRUE),
('SEAT005', 'ROOM001', 'A5', 'ST001', NOW(), TRUE),
('SEAT006', 'ROOM001', 'A6', 'ST001', NOW(), TRUE),
('SEAT007', 'ROOM001', 'A7', 'ST001', NOW(), TRUE),
('SEAT008', 'ROOM001', 'A8', 'ST001', NOW(), TRUE),
('SEAT009', 'ROOM001', 'A9', 'ST001', NOW(), TRUE),
('SEAT010', 'ROOM001', 'A10', 'ST001', NOW(), TRUE),
-- Row B (Standard)
('SEAT011', 'ROOM001', 'B1', 'ST001', NOW(), TRUE),
('SEAT012', 'ROOM001', 'B2', 'ST001', NOW(), TRUE),
('SEAT013', 'ROOM001', 'B3', 'ST001', NOW(), TRUE),
('SEAT014', 'ROOM001', 'B4', 'ST001', NOW(), TRUE),
('SEAT015', 'ROOM001', 'B5', 'ST001', NOW(), TRUE),
('SEAT016', 'ROOM001', 'B6', 'ST001', NOW(), TRUE),
('SEAT017', 'ROOM001', 'B7', 'ST001', NOW(), TRUE),
('SEAT018', 'ROOM001', 'B8', 'ST001', NOW(), TRUE),
('SEAT019', 'ROOM001', 'B9', 'ST001', NOW(), TRUE),
('SEAT020', 'ROOM001', 'B10', 'ST001', NOW(), TRUE),
-- Row C (VIP)
('SEAT021', 'ROOM001', 'C1', 'ST002', NOW(), TRUE),
('SEAT022', 'ROOM001', 'C2', 'ST002', NOW(), TRUE),
('SEAT023', 'ROOM001', 'C3', 'ST002', NOW(), TRUE),
('SEAT024', 'ROOM001', 'C4', 'ST002', NOW(), TRUE),
('SEAT025', 'ROOM001', 'C5', 'ST002', NOW(), TRUE),
('SEAT026', 'ROOM001', 'C6', 'ST002', NOW(), TRUE),
('SEAT027', 'ROOM001', 'C7', 'ST002', NOW(), TRUE),
('SEAT028', 'ROOM001', 'C8', 'ST002', NOW(), TRUE),
('SEAT029', 'ROOM001', 'C9', 'ST002', NOW(), TRUE),
('SEAT030', 'ROOM001', 'C10', 'ST002', NOW(), TRUE),
-- Row D (VIP)
('SEAT031', 'ROOM001', 'D1', 'ST002', NOW(), TRUE),
('SEAT032', 'ROOM001', 'D2', 'ST002', NOW(), TRUE),
('SEAT033', 'ROOM001', 'D3', 'ST002', NOW(), TRUE),
('SEAT034', 'ROOM001', 'D4', 'ST002', NOW(), TRUE),
('SEAT035', 'ROOM001', 'D5', 'ST002', NOW(), TRUE),
('SEAT036', 'ROOM001', 'D6', 'ST002', NOW(), TRUE),
('SEAT037', 'ROOM001', 'D7', 'ST002', NOW(), TRUE),
('SEAT038', 'ROOM001', 'D8', 'ST002', NOW(), TRUE),
('SEAT039', 'ROOM001', 'D9', 'ST002', NOW(), TRUE),
('SEAT040', 'ROOM001', 'D10', 'ST002', NOW(), TRUE),
-- Row E (Standard with couple seats in middle)
('SEAT041', 'ROOM001', 'E1', 'ST001', NOW(), TRUE),
('SEAT042', 'ROOM001', 'E2', 'ST001', NOW(), TRUE),
('SEAT043', 'ROOM001', 'E3', 'ST001', NOW(), TRUE),
('SEAT044', 'ROOM001', 'E4', 'ST001', NOW(), TRUE),
('SEAT045', 'ROOM001', 'E5', 'ST003', NOW(), TRUE),
('SEAT046', 'ROOM001', 'E6', 'ST003', NOW(), TRUE),
('SEAT047', 'ROOM001', 'E7', 'ST001', NOW(), TRUE),
('SEAT048', 'ROOM001', 'E8', 'ST001', NOW(), TRUE),
('SEAT049', 'ROOM001', 'E9', 'ST001', NOW(), TRUE),
('SEAT050', 'ROOM001', 'E10', 'ST001', NOW(), TRUE),
-- Row F (Standard with couple seats in middle)
('SEAT051', 'ROOM001', 'F1', 'ST001', NOW(), TRUE),
('SEAT052', 'ROOM001', 'F2', 'ST001', NOW(), TRUE),
('SEAT053', 'ROOM001', 'F3', 'ST001', NOW(), TRUE),
('SEAT054', 'ROOM001', 'F4', 'ST001', NOW(), TRUE),
('SEAT055', 'ROOM001', 'F5', 'ST003', NOW(), TRUE),
('SEAT056', 'ROOM001', 'F6', 'ST003', NOW(), TRUE),
('SEAT057', 'ROOM001', 'F7', 'ST001', NOW(), TRUE),
('SEAT058', 'ROOM001', 'F8', 'ST001', NOW(), TRUE),
('SEAT059', 'ROOM001', 'F9', 'ST001', NOW(), TRUE),
('SEAT060', 'ROOM001', 'F10', 'ST001', NOW(), TRUE),
-- Row G (Standard)
('SEAT061', 'ROOM001', 'G1', 'ST001', NOW(), TRUE),
('SEAT062', 'ROOM001', 'G2', 'ST001', NOW(), TRUE),
('SEAT063', 'ROOM001', 'G3', 'ST001', NOW(), TRUE),
('SEAT064', 'ROOM001', 'G4', 'ST001', NOW(), TRUE),
('SEAT065', 'ROOM001', 'G5', 'ST001', NOW(), TRUE),
('SEAT066', 'ROOM001', 'G6', 'ST001', NOW(), TRUE),
('SEAT067', 'ROOM001', 'G7', 'ST001', NOW(), TRUE),
('SEAT068', 'ROOM001', 'G8', 'ST001', NOW(), TRUE),
('SEAT069', 'ROOM001', 'G9', 'ST001', NOW(), TRUE),
('SEAT070', 'ROOM001', 'G10', 'ST001', NOW(), TRUE),
-- Row H (Standard)
('SEAT071', 'ROOM001', 'H1', 'ST001', NOW(), TRUE),
('SEAT072', 'ROOM001', 'H2', 'ST001', NOW(), TRUE),
('SEAT073', 'ROOM001', 'H3', 'ST001', NOW(), TRUE),
('SEAT074', 'ROOM001', 'H4', 'ST001', NOW(), TRUE),
('SEAT075', 'ROOM001', 'H5', 'ST001', NOW(), TRUE),
('SEAT076', 'ROOM001', 'H6', 'ST001', NOW(), TRUE),
('SEAT077', 'ROOM001', 'H7', 'ST001', NOW(), TRUE),
('SEAT078', 'ROOM001', 'H8', 'ST001', NOW(), TRUE),
('SEAT079', 'ROOM001', 'H9', 'ST001', NOW(), TRUE),
('SEAT080', 'ROOM001', 'H10', 'ST001', NOW(), TRUE);

-- Room 2 (2D) - 60 seats (6 rows x 10 seats)
INSERT INTO seats (id, room_id, seat_number, type, created_at, is_active) VALUES
-- Row A (Standard)
('SEAT101', 'ROOM002', 'A1', 'ST001', NOW(), TRUE),
('SEAT102', 'ROOM002', 'A2', 'ST001', NOW(), TRUE),
('SEAT103', 'ROOM002', 'A3', 'ST001', NOW(), TRUE),
('SEAT104', 'ROOM002', 'A4', 'ST001', NOW(), TRUE),
('SEAT105', 'ROOM002', 'A5', 'ST001', NOW(), TRUE),
('SEAT106', 'ROOM002', 'A6', 'ST001', NOW(), TRUE),
('SEAT107', 'ROOM002', 'A7', 'ST001', NOW(), TRUE),
('SEAT108', 'ROOM002', 'A8', 'ST001', NOW(), TRUE),
('SEAT109', 'ROOM002', 'A9', 'ST001', NOW(), TRUE),
('SEAT110', 'ROOM002', 'A10', 'ST001', NOW(), TRUE),
-- Row B (Standard)
('SEAT111', 'ROOM002', 'B1', 'ST001', NOW(), TRUE),
('SEAT112', 'ROOM002', 'B2', 'ST001', NOW(), TRUE),
('SEAT113', 'ROOM002', 'B3', 'ST001', NOW(), TRUE),
('SEAT114', 'ROOM002', 'B4', 'ST001', NOW(), TRUE),
('SEAT115', 'ROOM002', 'B5', 'ST001', NOW(), TRUE),
('SEAT116', 'ROOM002', 'B6', 'ST001', NOW(), TRUE),
('SEAT117', 'ROOM002', 'B7', 'ST001', NOW(), TRUE),
('SEAT118', 'ROOM002', 'B8', 'ST001', NOW(), TRUE),
('SEAT119', 'ROOM002', 'B9', 'ST001', NOW(), TRUE),
('SEAT120', 'ROOM002', 'B10', 'ST001', NOW(), TRUE),
-- Row C (VIP)
('SEAT121', 'ROOM002', 'C1', 'ST002', NOW(), TRUE),
('SEAT122', 'ROOM002', 'C2', 'ST002', NOW(), TRUE),
('SEAT123', 'ROOM002', 'C3', 'ST002', NOW(), TRUE),
('SEAT124', 'ROOM002', 'C4', 'ST002', NOW(), TRUE),
('SEAT125', 'ROOM002', 'C5', 'ST002', NOW(), TRUE),
('SEAT126', 'ROOM002', 'C6', 'ST002', NOW(), TRUE),
('SEAT127', 'ROOM002', 'C7', 'ST002', NOW(), TRUE),
('SEAT128', 'ROOM002', 'C8', 'ST002', NOW(), TRUE),
('SEAT129', 'ROOM002', 'C9', 'ST002', NOW(), TRUE),
('SEAT130', 'ROOM002', 'C10', 'ST002', NOW(), TRUE),
-- Row D (VIP)
('SEAT131', 'ROOM002', 'D1', 'ST002', NOW(), TRUE),
('SEAT132', 'ROOM002', 'D2', 'ST002', NOW(), TRUE),
('SEAT133', 'ROOM002', 'D3', 'ST002', NOW(), TRUE),
('SEAT134', 'ROOM002', 'D4', 'ST002', NOW(), TRUE),
('SEAT135', 'ROOM002', 'D5', 'ST002', NOW(), TRUE),
('SEAT136', 'ROOM002', 'D6', 'ST002', NOW(), TRUE),
('SEAT137', 'ROOM002', 'D7', 'ST002', NOW(), TRUE),
('SEAT138', 'ROOM002', 'D8', 'ST002', NOW(), TRUE),
('SEAT139', 'ROOM002', 'D9', 'ST002', NOW(), TRUE),
('SEAT140', 'ROOM002', 'D10', 'ST002', NOW(), TRUE),
-- Row E (Standard with couple seats)
('SEAT141', 'ROOM002', 'E1', 'ST001', NOW(), TRUE),
('SEAT142', 'ROOM002', 'E2', 'ST001', NOW(), TRUE),
('SEAT143', 'ROOM002', 'E3', 'ST001', NOW(), TRUE),
('SEAT144', 'ROOM002', 'E4', 'ST001', NOW(), TRUE),
('SEAT145', 'ROOM002', 'E5', 'ST003', NOW(), TRUE),
('SEAT146', 'ROOM002', 'E6', 'ST003', NOW(), TRUE),
('SEAT147', 'ROOM002', 'E7', 'ST001', NOW(), TRUE),
('SEAT148', 'ROOM002', 'E8', 'ST001', NOW(), TRUE),
('SEAT149', 'ROOM002', 'E9', 'ST001', NOW(), TRUE),
('SEAT150', 'ROOM002', 'E10', 'ST001', NOW(), TRUE),
-- Row F (Standard)
('SEAT151', 'ROOM002', 'F1', 'ST001', NOW(), TRUE),
('SEAT152', 'ROOM002', 'F2', 'ST001', NOW(), TRUE),
('SEAT153', 'ROOM002', 'F3', 'ST001', NOW(), TRUE),
('SEAT154', 'ROOM002', 'F4', 'ST001', NOW(), TRUE),
('SEAT155', 'ROOM002', 'F5', 'ST001', NOW(), TRUE),
('SEAT156', 'ROOM002', 'F6', 'ST001', NOW(), TRUE),
('SEAT157', 'ROOM002', 'F7', 'ST001', NOW(), TRUE),
('SEAT158', 'ROOM002', 'F8', 'ST001', NOW(), TRUE),
('SEAT159', 'ROOM002', 'F9', 'ST001', NOW(), TRUE),
('SEAT160', 'ROOM002', 'F10', 'ST001', NOW(), TRUE);

-- Room 3 (3D) - 70 seats (7 rows x 10 seats)
INSERT INTO seats (id, room_id, seat_number, type, created_at, is_active) VALUES
-- Row A-G for Room 3 (Standard and VIP mix)
('SEAT201', 'ROOM003', 'A1', 'ST001', NOW(), TRUE),
('SEAT202', 'ROOM003', 'A2', 'ST001', NOW(), TRUE),
('SEAT203', 'ROOM003', 'A3', 'ST001', NOW(), TRUE),
('SEAT204', 'ROOM003', 'A4', 'ST001', NOW(), TRUE),
('SEAT205', 'ROOM003', 'A5', 'ST001', NOW(), TRUE),
('SEAT206', 'ROOM003', 'A6', 'ST001', NOW(), TRUE),
('SEAT207', 'ROOM003', 'A7', 'ST001', NOW(), TRUE),
('SEAT208', 'ROOM003', 'A8', 'ST001', NOW(), TRUE),
('SEAT209', 'ROOM003', 'A9', 'ST001', NOW(), TRUE),
('SEAT210', 'ROOM003', 'A10', 'ST001', NOW(), TRUE),
-- Row B
('SEAT211', 'ROOM003', 'B1', 'ST001', NOW(), TRUE),
('SEAT212', 'ROOM003', 'B2', 'ST001', NOW(), TRUE),
('SEAT213', 'ROOM003', 'B3', 'ST001', NOW(), TRUE),
('SEAT214', 'ROOM003', 'B4', 'ST001', NOW(), TRUE),
('SEAT215', 'ROOM003', 'B5', 'ST001', NOW(), TRUE),
('SEAT216', 'ROOM003', 'B6', 'ST001', NOW(), TRUE),
('SEAT217', 'ROOM003', 'B7', 'ST001', NOW(), TRUE),
('SEAT218', 'ROOM003', 'B8', 'ST001', NOW(), TRUE),
('SEAT219', 'ROOM003', 'B9', 'ST001', NOW(), TRUE),
('SEAT220', 'ROOM003', 'B10', 'ST001', NOW(), TRUE),
-- Row C (VIP)
('SEAT221', 'ROOM003', 'C1', 'ST002', NOW(), TRUE),
('SEAT222', 'ROOM003', 'C2', 'ST002', NOW(), TRUE),
('SEAT223', 'ROOM003', 'C3', 'ST002', NOW(), TRUE),
('SEAT224', 'ROOM003', 'C4', 'ST002', NOW(), TRUE),
('SEAT225', 'ROOM003', 'C5', 'ST002', NOW(), TRUE),
('SEAT226', 'ROOM003', 'C6', 'ST002', NOW(), TRUE),
('SEAT227', 'ROOM003', 'C7', 'ST002', NOW(), TRUE),
('SEAT228', 'ROOM003', 'C8', 'ST002', NOW(), TRUE),
('SEAT229', 'ROOM003', 'C9', 'ST002', NOW(), TRUE),
('SEAT230', 'ROOM003', 'C10', 'ST002', NOW(), TRUE),
-- Row D (VIP)
('SEAT231', 'ROOM003', 'D1', 'ST002', NOW(), TRUE),
('SEAT232', 'ROOM003', 'D2', 'ST002', NOW(), TRUE),
('SEAT233', 'ROOM003', 'D3', 'ST002', NOW(), TRUE),
('SEAT234', 'ROOM003', 'D4', 'ST002', NOW(), TRUE),
('SEAT235', 'ROOM003', 'D5', 'ST002', NOW(), TRUE),
('SEAT236', 'ROOM003', 'D6', 'ST002', NOW(), TRUE),
('SEAT237', 'ROOM003', 'D7', 'ST002', NOW(), TRUE),
('SEAT238', 'ROOM003', 'D8', 'ST002', NOW(), TRUE),
('SEAT239', 'ROOM003', 'D9', 'ST002', NOW(), TRUE),
('SEAT240', 'ROOM003', 'D10', 'ST002', NOW(), TRUE),
-- Row E (Standard with couple seats)
('SEAT241', 'ROOM003', 'E1', 'ST001', NOW(), TRUE),
('SEAT242', 'ROOM003', 'E2', 'ST001', NOW(), TRUE),
('SEAT243', 'ROOM003', 'E3', 'ST001', NOW(), TRUE),
('SEAT244', 'ROOM003', 'E4', 'ST001', NOW(), TRUE),
('SEAT245', 'ROOM003', 'E5', 'ST003', NOW(), TRUE),
('SEAT246', 'ROOM003', 'E6', 'ST003', NOW(), TRUE),
('SEAT247', 'ROOM003', 'E7', 'ST001', NOW(), TRUE),
('SEAT248', 'ROOM003', 'E8', 'ST001', NOW(), TRUE),
('SEAT249', 'ROOM003', 'E9', 'ST001', NOW(), TRUE),
('SEAT250', 'ROOM003', 'E10', 'ST001', NOW(), TRUE),
-- Row F
('SEAT251', 'ROOM003', 'F1', 'ST001', NOW(), TRUE),
('SEAT252', 'ROOM003', 'F2', 'ST001', NOW(), TRUE),
('SEAT253', 'ROOM003', 'F3', 'ST001', NOW(), TRUE),
('SEAT254', 'ROOM003', 'F4', 'ST001', NOW(), TRUE),
('SEAT255', 'ROOM003', 'F5', 'ST001', NOW(), TRUE),
('SEAT256', 'ROOM003', 'F6', 'ST001', NOW(), TRUE),
('SEAT257', 'ROOM003', 'F7', 'ST001', NOW(), TRUE),
('SEAT258', 'ROOM003', 'F8', 'ST001', NOW(), TRUE),
('SEAT259', 'ROOM003', 'F9', 'ST001', NOW(), TRUE),
('SEAT260', 'ROOM003', 'F10', 'ST001', NOW(), TRUE),
-- Row G
('SEAT261', 'ROOM003', 'G1', 'ST001', NOW(), TRUE),
('SEAT262', 'ROOM003', 'G2', 'ST001', NOW(), TRUE),
('SEAT263', 'ROOM003', 'G3', 'ST001', NOW(), TRUE),
('SEAT264', 'ROOM003', 'G4', 'ST001', NOW(), TRUE),
('SEAT265', 'ROOM003', 'G5', 'ST001', NOW(), TRUE),
('SEAT266', 'ROOM003', 'G6', 'ST001', NOW(), TRUE),
('SEAT267', 'ROOM003', 'G7', 'ST001', NOW(), TRUE),
('SEAT268', 'ROOM003', 'G8', 'ST001', NOW(), TRUE),
('SEAT269', 'ROOM003', 'G9', 'ST001', NOW(), TRUE),
('SEAT270', 'ROOM003', 'G10', 'ST001', NOW(), TRUE);

-- Room 4 (3D) - 70 seats (7 rows x 10 seats)
INSERT INTO seats (id, room_id, seat_number, type, created_at, is_active) VALUES
('SEAT301', 'ROOM004', 'A1', 'ST001', NOW(), TRUE),
('SEAT302', 'ROOM004', 'A2', 'ST001', NOW(), TRUE),
('SEAT303', 'ROOM004', 'A3', 'ST001', NOW(), TRUE),
('SEAT304', 'ROOM004', 'A4', 'ST001', NOW(), TRUE),
('SEAT305', 'ROOM004', 'A5', 'ST001', NOW(), TRUE),
('SEAT306', 'ROOM004', 'A6', 'ST001', NOW(), TRUE),
('SEAT307', 'ROOM004', 'A7', 'ST001', NOW(), TRUE),
('SEAT308', 'ROOM004', 'A8', 'ST001', NOW(), TRUE),
('SEAT309', 'ROOM004', 'A9', 'ST001', NOW(), TRUE),
('SEAT310', 'ROOM004', 'A10', 'ST001', NOW(), TRUE),
-- Additional rows B-G with similar pattern (abbreviated)
('SEAT311', 'ROOM004', 'B1', 'ST001', NOW(), TRUE),
('SEAT321', 'ROOM004', 'C1', 'ST002', NOW(), TRUE),
('SEAT331', 'ROOM004', 'D1', 'ST002', NOW(), TRUE),
('SEAT341', 'ROOM004', 'E1', 'ST001', NOW(), TRUE),
('SEAT351', 'ROOM004', 'F1', 'ST001', NOW(), TRUE),
('SEAT361', 'ROOM004', 'G1', 'ST001', NOW(), TRUE);

-- Room 5 (IMAX) - 100 seats (10 rows x 10 seats)  
INSERT INTO seats (id, room_id, seat_number, type, created_at, is_active) VALUES
('SEAT401', 'ROOM005', 'A1', 'ST001', NOW(), TRUE),
('SEAT402', 'ROOM005', 'A2', 'ST001', NOW(), TRUE),
('SEAT403', 'ROOM005', 'A3', 'ST001', NOW(), TRUE),
('SEAT404', 'ROOM005', 'A4', 'ST001', NOW(), TRUE),
('SEAT405', 'ROOM005', 'A5', 'ST001', NOW(), TRUE),
('SEAT406', 'ROOM005', 'A6', 'ST001', NOW(), TRUE),
('SEAT407', 'ROOM005', 'A7', 'ST001', NOW(), TRUE),
('SEAT408', 'ROOM005', 'A8', 'ST001', NOW(), TRUE),
('SEAT409', 'ROOM005', 'A9', 'ST001', NOW(), TRUE),
('SEAT410', 'ROOM005', 'A10', 'ST001', NOW(), TRUE),
-- Rows B-J with VIP and COUPLE seats in premium rows
('SEAT411', 'ROOM005', 'B1', 'ST001', NOW(), TRUE),
('SEAT421', 'ROOM005', 'C1', 'ST001', NOW(), TRUE),
('SEAT431', 'ROOM005', 'D1', 'ST002', NOW(), TRUE),
('SEAT441', 'ROOM005', 'E1', 'ST002', NOW(), TRUE),
('SEAT451', 'ROOM005', 'F1', 'ST002', NOW(), TRUE),
('SEAT461', 'ROOM005', 'G1', 'ST001', NOW(), TRUE),
('SEAT471', 'ROOM005', 'H1', 'ST001', NOW(), TRUE),
('SEAT481', 'ROOM005', 'I1', 'ST001', NOW(), TRUE),
('SEAT491', 'ROOM005', 'J1', 'ST001', NOW(), TRUE);

-- =============================================
-- 24. SHOW TIMES
-- =============================================
INSERT INTO show_times (id, movie_id, room_id, start_time, end_time, day_type, created_at, is_active) VALUES
-- Avatar 3 showtimes
('ST001', 'MV011', 'ROOM005', '2026-01-20 10:00:00+07', '2026-01-20 13:00:00+07', 'WEEKDAY', NOW(), TRUE),
('ST002', 'MV011', 'ROOM005', '2026-01-20 14:00:00+07', '2026-01-20 17:00:00+07', 'WEEKDAY', NOW(), TRUE),
('ST003', 'MV011', 'ROOM005', '2026-01-20 18:00:00+07', '2026-01-20 21:00:00+07', 'WEEKDAY', NOW(), TRUE),
-- Five Nights at Freddy's 2 showtimes
('ST004', 'MV008', 'ROOM003', '2026-01-20 11:00:00+07', '2026-01-20 12:44:00+07', 'WEEKDAY', NOW(), TRUE),
('ST005', 'MV008', 'ROOM003', '2026-01-20 15:00:00+07', '2026-01-20 16:44:00+07', 'WEEKDAY', NOW(), TRUE),
('ST006', 'MV008', 'ROOM003', '2026-01-20 19:00:00+07', '2026-01-20 20:44:00+07', 'WEEKDAY', NOW(), TRUE),
-- Other movies
('ST007', 'MV002', 'ROOM001', '2026-01-20 12:00:00+07', '2026-01-20 13:54:00+07', 'WEEKDAY', NOW(), TRUE),
('ST008', 'MV003', 'ROOM002', '2026-01-20 16:00:00+07', '2026-01-20 18:05:00+07', 'WEEKDAY', NOW(), TRUE),
-- Weekend showtimes
('ST009', 'MV011', 'ROOM005', '2026-01-24 10:00:00+07', '2026-01-24 13:00:00+07', 'WEEKEND', NOW(), TRUE),
('ST010', 'MV011', 'ROOM005', '2026-01-24 14:00:00+07', '2026-01-24 17:00:00+07', 'WEEKEND', NOW(), TRUE);

-- =============================================
-- 25. SHOW TIME SEATS
-- =============================================
-- Showtime ST001 (Avatar 3 - 10:00 IMAX)
INSERT INTO show_time_seats (id, show_time_id, seat_id, status_seat) VALUES
('STS001', 'ST001', 'SEAT401', 'AVAILABLE'),
('STS002', 'ST001', 'SEAT402', 'AVAILABLE'),
('STS003', 'ST001', 'SEAT403', 'BOOKED'),
('STS004', 'ST001', 'SEAT404', 'BOOKED'),
('STS005', 'ST001', 'SEAT405', 'AVAILABLE'),
('STS006', 'ST001', 'SEAT431', 'AVAILABLE'),
('STS007', 'ST001', 'SEAT441', 'HOLDING'),
('STS008', 'ST001', 'SEAT451', 'AVAILABLE');

-- Showtime ST002 (Avatar 3 - 14:00 IMAX)
INSERT INTO show_time_seats (id, show_time_id, seat_id, status_seat) VALUES
('STS009', 'ST002', 'SEAT401', 'AVAILABLE'),
('STS010', 'ST002', 'SEAT402', 'AVAILABLE'),
('STS011', 'ST002', 'SEAT403', 'AVAILABLE'),
('STS012', 'ST002', 'SEAT431', 'AVAILABLE'),
('STS013', 'ST002', 'SEAT441', 'AVAILABLE');

-- Showtime ST004 (FNAF2 - 11:00 3D Room3)
INSERT INTO show_time_seats (id, show_time_id, seat_id, status_seat) VALUES
('STS014', 'ST004', 'SEAT201', 'BOOKED'),
('STS015', 'ST004', 'SEAT202', 'BOOKED'),
('STS016', 'ST004', 'SEAT203', 'AVAILABLE'),
('STS017', 'ST004', 'SEAT221', 'AVAILABLE'),
('STS018', 'ST004', 'SEAT222', 'HOLDING');

-- =============================================
-- 26. ORDERS (Extended for Statistics)
-- =============================================
INSERT INTO orders (id, discount_id, user_id, movie_id, service_vat, payment_status, payment_method, trans_id, total_price, created_at, requested_at) VALUES
('ORD001', 'DISC001', 'USR004', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', NULL, 358400, NOW() - INTERVAL '2 days', NULL),
('ORD002', NULL, 'USR005', 'MV008', 10, 'COMPLETED', 'MOMO', '4654438933', 242000, NOW() - INTERVAL '1 day', NULL),
('ORD003', 'DISC003', 'USR006', 'MV008', 10, 'PENDING', 'CASH', NULL, 165000, NOW() - INTERVAL '3 hours', NULL),
('ORD004', NULL, 'USR007', 'MV002', 10, 'COMPLETED', 'VNPAY', '14517281', 220000, NOW() - INTERVAL '5 hours', NULL),
('ORD005', 'DISC001', 'USR008', 'MV003', 10, 'FAILED', 'CREDIT_CARD', NULL, 0, NOW() - INTERVAL '1 day', NULL),
-- Refund pending orders for testing
('ORD006', NULL, 'USR004', 'MV011', 10, 'REFUND_PENDING', 'VNPAY', 'VNP14238576', 450000, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('ORD007', 'DISC002', 'USR005', 'MV008', 10, 'REFUND_PENDING', 'MOMO', 'MOMO78923456', 180000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('ORD008', NULL, 'USR006', 'MV012', 10, 'REFUND_PENDING', 'VNPAY', 'VNP98765432', 640000, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('ORD009', 'DISC001', 'USR007', 'MV023', 10, 'REFUNDED', 'ZALOPAY', 'ZLP45678901', 360000, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

-- ============ JANUARY 2026 ============
('ORD_JAN_01', NULL, 'USR004', 'MV001', 10, 'COMPLETED', 'MOMO', 'MOMO_JAN01', 285000, '2026-01-05 14:30:00+07', NULL),
('ORD_JAN_02', NULL, 'USR005', 'MV002', 10, 'COMPLETED', 'VNPAY', 'VNP_JAN02', 320000, '2026-01-08 16:00:00+07', NULL),
('ORD_JAN_03', 'DISC002', 'USR006', 'MV003', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JAN03', 195000, '2026-01-10 19:30:00+07', NULL),
('ORD_JAN_04', NULL, 'USR007', 'MV011', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JAN04', 480000, '2026-01-12 10:00:00+07', NULL),
('ORD_JAN_05', NULL, 'USR008', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_JAN05', 225000, '2026-01-15 15:00:00+07', NULL),
('ORD_JAN_06', 'DISC001', 'USR004', 'MV012', 10, 'COMPLETED', 'VNPAY', 'VNP_JAN06', 360000, '2026-01-18 18:30:00+07', NULL),
('ORD_JAN_07', NULL, 'USR005', 'MV023', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JAN07', 420000, '2026-01-20 20:00:00+07', NULL),
('ORD_JAN_08', NULL, 'USR006', 'MV027', 10, 'COMPLETED', 'MOMO', 'MOMO_JAN08', 380000, '2026-01-25 14:00:00+07', NULL),

-- ============ FEBRUARY 2026 ============
('ORD_FEB_01', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'VNPAY', 'VNP_FEB01', 295000, '2026-02-02 11:00:00+07', NULL),
('ORD_FEB_02', 'DISC003', 'USR005', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_FEB02', 185000, '2026-02-05 14:30:00+07', NULL),
('ORD_FEB_03', NULL, 'USR006', 'MV011', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_FEB03', 520000, '2026-02-08 17:00:00+07', NULL),
('ORD_FEB_04', NULL, 'USR007', 'MV001', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_FEB04', 310000, '2026-02-10 19:30:00+07', NULL),
('ORD_FEB_05', 'DISC002', 'USR008', 'MV012', 10, 'COMPLETED', 'VNPAY', 'VNP_FEB05', 275000, '2026-02-14 20:00:00+07', NULL),
('ORD_FEB_06', NULL, 'USR004', 'MV003', 10, 'COMPLETED', 'MOMO', 'MOMO_FEB06', 340000, '2026-02-18 15:30:00+07', NULL),
('ORD_FEB_07', NULL, 'USR005', 'MV023', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_FEB07', 410000, '2026-02-22 18:00:00+07', NULL),
('ORD_FEB_08', 'DISC001', 'USR006', 'MV027', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_FEB08', 365000, '2026-02-25 16:00:00+07', NULL),
('ORD_FEB_09', NULL, 'USR007', 'MV008', 10, 'COMPLETED', 'VNPAY', 'VNP_FEB09', 230000, '2026-02-28 19:00:00+07', NULL),

-- ============ MARCH 2026 ============
('ORD_MAR_01', NULL, 'USR004', 'MV011', 10, 'COMPLETED', 'MOMO', 'MOMO_MAR01', 495000, '2026-03-02 10:30:00+07', NULL),
('ORD_MAR_02', 'DISC002', 'USR005', 'MV001', 10, 'COMPLETED', 'VNPAY', 'VNP_MAR02', 265000, '2026-03-05 14:00:00+07', NULL),
('ORD_MAR_03', NULL, 'USR006', 'MV012', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_MAR03', 380000, '2026-03-08 17:30:00+07', NULL),
('ORD_MAR_04', NULL, 'USR007', 'MV002', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_MAR04', 325000, '2026-03-12 15:00:00+07', NULL),
('ORD_MAR_05', 'DISC003', 'USR008', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_MAR05', 175000, '2026-03-15 18:30:00+07', NULL),
('ORD_MAR_06', NULL, 'USR004', 'MV023', 10, 'COMPLETED', 'VNPAY', 'VNP_MAR06', 445000, '2026-03-18 20:00:00+07', NULL),
('ORD_MAR_07', NULL, 'USR005', 'MV003', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_MAR07', 290000, '2026-03-22 16:00:00+07', NULL),

-- ============ APRIL 2026 ============
('ORD_APR_01', NULL, 'USR004', 'MV001', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_APR01', 305000, '2026-04-01 11:00:00+07', NULL),
('ORD_APR_02', 'DISC001', 'USR005', 'MV011', 10, 'COMPLETED', 'MOMO', 'MOMO_APR02', 405000, '2026-04-05 14:30:00+07', NULL),
('ORD_APR_03', NULL, 'USR006', 'MV008', 10, 'COMPLETED', 'VNPAY', 'VNP_APR03', 245000, '2026-04-08 17:00:00+07', NULL),
('ORD_APR_04', NULL, 'USR007', 'MV012', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_APR04', 395000, '2026-04-12 19:30:00+07', NULL),
('ORD_APR_05', 'DISC002', 'USR008', 'MV002', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_APR05', 280000, '2026-04-15 15:00:00+07', NULL),
('ORD_APR_06', NULL, 'USR004', 'MV023', 10, 'COMPLETED', 'MOMO', 'MOMO_APR06', 460000, '2026-04-18 18:00:00+07', NULL),
('ORD_APR_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'VNPAY', 'VNP_APR07', 355000, '2026-04-22 20:30:00+07', NULL),
('ORD_APR_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_APR08', 195000, '2026-04-25 16:00:00+07', NULL),
('ORD_APR_09', NULL, 'USR007', 'MV001', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_APR09', 320000, '2026-04-28 14:00:00+07', NULL),

-- ============ MAY 2026 ============
('ORD_MAY_01', NULL, 'USR004', 'MV011', 10, 'COMPLETED', 'MOMO', 'MOMO_MAY01', 540000, '2026-05-02 10:00:00+07', NULL),
('ORD_MAY_02', 'DISC001', 'USR005', 'MV012', 10, 'COMPLETED', 'VNPAY', 'VNP_MAY02', 330000, '2026-05-05 13:30:00+07', NULL),
('ORD_MAY_03', NULL, 'USR006', 'MV008', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_MAY03', 255000, '2026-05-08 16:00:00+07', NULL),
('ORD_MAY_04', NULL, 'USR007', 'MV002', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_MAY04', 345000, '2026-05-12 18:30:00+07', NULL),
('ORD_MAY_05', 'DISC002', 'USR008', 'MV001', 10, 'COMPLETED', 'MOMO', 'MOMO_MAY05', 235000, '2026-05-15 20:00:00+07', NULL),
('ORD_MAY_06', NULL, 'USR004', 'MV023', 10, 'COMPLETED', 'VNPAY', 'VNP_MAY06', 480000, '2026-05-18 15:00:00+07', NULL),
('ORD_MAY_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_MAY07', 390000, '2026-05-22 17:30:00+07', NULL),
('ORD_MAY_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_MAY08', 200000, '2026-05-25 19:00:00+07', NULL),
('ORD_MAY_09', NULL, 'USR007', 'MV011', 10, 'COMPLETED', 'MOMO', 'MOMO_MAY09', 510000, '2026-05-28 14:30:00+07', NULL),
('ORD_MAY_10', NULL, 'USR008', 'MV012', 10, 'COMPLETED', 'VNPAY', 'VNP_MAY10', 365000, '2026-05-30 16:00:00+07', NULL),

-- ============ JUNE 2026 ============
('ORD_JUN_01', NULL, 'USR004', 'MV008', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUN01', 270000, '2026-06-02 11:00:00+07', NULL),
('ORD_JUN_02', 'DISC001', 'USR005', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUN02', 420000, '2026-06-05 14:00:00+07', NULL),
('ORD_JUN_03', NULL, 'USR006', 'MV001', 10, 'COMPLETED', 'MOMO', 'MOMO_JUN03', 295000, '2026-06-08 17:30:00+07', NULL),
('ORD_JUN_04', NULL, 'USR007', 'MV023', 10, 'COMPLETED', 'VNPAY', 'VNP_JUN04', 495000, '2026-06-12 19:00:00+07', NULL),
('ORD_JUN_05', 'DISC002', 'USR008', 'MV002', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUN05', 260000, '2026-06-15 15:30:00+07', NULL),
('ORD_JUN_06', NULL, 'USR004', 'MV012', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUN06', 385000, '2026-06-18 18:00:00+07', NULL),
('ORD_JUN_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'MOMO', 'MOMO_JUN07', 375000, '2026-06-22 20:30:00+07', NULL),
('ORD_JUN_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'VNPAY', 'VNP_JUN08', 185000, '2026-06-25 16:00:00+07', NULL),
('ORD_JUN_09', NULL, 'USR007', 'MV008', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUN09', 240000, '2026-06-28 14:00:00+07', NULL),
('ORD_JUN_10', NULL, 'USR008', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUN10', 560000, '2026-06-30 17:00:00+07', NULL),
('ORD_JUN_11', 'DISC001', 'USR004', 'MV001', 10, 'COMPLETED', 'MOMO', 'MOMO_JUN11', 310000, '2026-06-30 19:30:00+07', NULL),

-- ============ JULY 2026 ============
('ORD_JUL_01', NULL, 'USR004', 'MV011', 10, 'COMPLETED', 'VNPAY', 'VNP_JUL01', 580000, '2026-07-02 10:30:00+07', NULL),
('ORD_JUL_02', 'DISC002', 'USR005', 'MV012', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUL02', 300000, '2026-07-05 13:00:00+07', NULL),
('ORD_JUL_03', NULL, 'USR006', 'MV008', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUL03', 285000, '2026-07-08 16:30:00+07', NULL),
('ORD_JUL_04', NULL, 'USR007', 'MV023', 10, 'COMPLETED', 'MOMO', 'MOMO_JUL04', 520000, '2026-07-12 18:00:00+07', NULL),
('ORD_JUL_05', 'DISC001', 'USR008', 'MV002', 10, 'COMPLETED', 'VNPAY', 'VNP_JUL05', 240000, '2026-07-15 20:30:00+07', NULL),
('ORD_JUL_06', NULL, 'USR004', 'MV001', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUL06', 335000, '2026-07-18 15:00:00+07', NULL),
('ORD_JUL_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUL07', 405000, '2026-07-22 17:30:00+07', NULL),
('ORD_JUL_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'MOMO', 'MOMO_JUL08', 170000, '2026-07-25 19:00:00+07', NULL),
('ORD_JUL_09', NULL, 'USR007', 'MV011', 10, 'COMPLETED', 'VNPAY', 'VNP_JUL09', 545000, '2026-07-28 14:00:00+07', NULL),
('ORD_JUL_10', NULL, 'USR008', 'MV012', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_JUL10', 395000, '2026-07-30 16:30:00+07', NULL),
('ORD_JUL_11', 'DISC002', 'USR004', 'MV008', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_JUL11', 210000, '2026-07-31 18:00:00+07', NULL),
('ORD_JUL_12', NULL, 'USR005', 'MV023', 10, 'COMPLETED', 'MOMO', 'MOMO_JUL12', 475000, '2026-07-31 20:00:00+07', NULL),

-- ============ AUGUST 2026 ============
('ORD_AUG_01', NULL, 'USR004', 'MV001', 10, 'COMPLETED', 'VNPAY', 'VNP_AUG01', 315000, '2026-08-02 11:00:00+07', NULL),
('ORD_AUG_02', 'DISC001', 'USR005', 'MV011', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_AUG02', 465000, '2026-08-05 14:30:00+07', NULL),
('ORD_AUG_03', NULL, 'USR006', 'MV012', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_AUG03', 375000, '2026-08-08 17:00:00+07', NULL),
('ORD_AUG_04', NULL, 'USR007', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_AUG04', 260000, '2026-08-12 19:30:00+07', NULL),
('ORD_AUG_05', 'DISC002', 'USR008', 'MV023', 10, 'COMPLETED', 'VNPAY', 'VNP_AUG05', 410000, '2026-08-15 15:00:00+07', NULL),
('ORD_AUG_06', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_AUG06', 345000, '2026-08-18 18:30:00+07', NULL),
('ORD_AUG_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_AUG07', 420000, '2026-08-22 20:00:00+07', NULL),
('ORD_AUG_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'MOMO', 'MOMO_AUG08', 180000, '2026-08-25 16:00:00+07', NULL),
('ORD_AUG_09', NULL, 'USR007', 'MV001', 10, 'COMPLETED', 'VNPAY', 'VNP_AUG09', 330000, '2026-08-28 14:30:00+07', NULL),
('ORD_AUG_10', NULL, 'USR008', 'MV011', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_AUG10', 530000, '2026-08-30 17:00:00+07', NULL),

-- ============ SEPTEMBER 2026 ============
('ORD_SEP_01', NULL, 'USR004', 'MV012', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_SEP01', 360000, '2026-09-02 11:30:00+07', NULL),
('ORD_SEP_02', 'DISC001', 'USR005', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_SEP02', 215000, '2026-09-05 14:00:00+07', NULL),
('ORD_SEP_03', NULL, 'USR006', 'MV011', 10, 'COMPLETED', 'VNPAY', 'VNP_SEP03', 510000, '2026-09-08 17:30:00+07', NULL),
('ORD_SEP_04', NULL, 'USR007', 'MV023', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_SEP04', 485000, '2026-09-12 19:00:00+07', NULL),
('ORD_SEP_05', 'DISC002', 'USR008', 'MV001', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_SEP05', 250000, '2026-09-15 15:30:00+07', NULL),
('ORD_SEP_06', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'MOMO', 'MOMO_SEP06', 355000, '2026-09-18 18:00:00+07', NULL),
('ORD_SEP_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'VNPAY', 'VNP_SEP07', 395000, '2026-09-22 20:30:00+07', NULL),
('ORD_SEP_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_SEP08', 165000, '2026-09-25 16:00:00+07', NULL),

-- ============ OCTOBER 2026 ============
('ORD_OCT_01', NULL, 'USR004', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_OCT01', 555000, '2026-10-02 10:00:00+07', NULL),
('ORD_OCT_02', 'DISC001', 'USR005', 'MV001', 10, 'COMPLETED', 'MOMO', 'MOMO_OCT02', 275000, '2026-10-05 13:30:00+07', NULL),
('ORD_OCT_03', NULL, 'USR006', 'MV008', 10, 'COMPLETED', 'VNPAY', 'VNP_OCT03', 235000, '2026-10-08 16:00:00+07', NULL),
('ORD_OCT_04', NULL, 'USR007', 'MV012', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_OCT04', 380000, '2026-10-12 18:30:00+07', NULL),
('ORD_OCT_05', 'DISC002', 'USR008', 'MV023', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_OCT05', 440000, '2026-10-15 20:00:00+07', NULL),
('ORD_OCT_06', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'MOMO', 'MOMO_OCT06', 325000, '2026-10-18 15:00:00+07', NULL),
('ORD_OCT_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'VNPAY', 'VNP_OCT07', 410000, '2026-10-22 17:30:00+07', NULL),

-- ============ NOVEMBER 2026 ============
('ORD_NOV_01', NULL, 'USR004', 'MV001', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_NOV01', 290000, '2026-11-02 11:00:00+07', NULL),
('ORD_NOV_02', 'DISC001', 'USR005', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_NOV02', 495000, '2026-11-05 14:30:00+07', NULL),
('ORD_NOV_03', NULL, 'USR006', 'MV012', 10, 'COMPLETED', 'MOMO', 'MOMO_NOV03', 365000, '2026-11-08 17:00:00+07', NULL),
('ORD_NOV_04', NULL, 'USR007', 'MV008', 10, 'COMPLETED', 'VNPAY', 'VNP_NOV04', 250000, '2026-11-12 19:30:00+07', NULL),
('ORD_NOV_05', 'DISC002', 'USR008', 'MV023', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_NOV05', 470000, '2026-11-15 15:00:00+07', NULL),
('ORD_NOV_06', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_NOV06', 340000, '2026-11-18 18:30:00+07', NULL),
('ORD_NOV_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'MOMO', 'MOMO_NOV07', 385000, '2026-11-22 20:00:00+07', NULL),
('ORD_NOV_08', 'DISC003', 'USR006', 'MV003', 10, 'COMPLETED', 'VNPAY', 'VNP_NOV08', 175000, '2026-11-25 16:00:00+07', NULL),
('ORD_NOV_09', NULL, 'USR007', 'MV001', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_NOV09', 305000, '2026-11-28 14:00:00+07', NULL),

-- ============ DECEMBER 2026 ============
('ORD_DEC_01', NULL, 'USR004', 'MV011', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_DEC01', 620000, '2026-12-02 10:30:00+07', NULL),
('ORD_DEC_02', 'DISC001', 'USR005', 'MV012', 10, 'COMPLETED', 'MOMO', 'MOMO_DEC02', 350000, '2026-12-05 13:00:00+07', NULL),
('ORD_DEC_03', NULL, 'USR006', 'MV008', 10, 'COMPLETED', 'VNPAY', 'VNP_DEC03', 275000, '2026-12-08 16:30:00+07', NULL),
('ORD_DEC_04', NULL, 'USR007', 'MV023', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_DEC04', 545000, '2026-12-12 18:00:00+07', NULL),
('ORD_DEC_05', 'DISC002', 'USR008', 'MV001', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_DEC05', 265000, '2026-12-15 20:30:00+07', NULL),
('ORD_DEC_06', NULL, 'USR004', 'MV002', 10, 'COMPLETED', 'MOMO', 'MOMO_DEC06', 360000, '2026-12-18 15:00:00+07', NULL),
('ORD_DEC_07', NULL, 'USR005', 'MV027', 10, 'COMPLETED', 'VNPAY', 'VNP_DEC07', 445000, '2026-12-22 17:30:00+07', NULL),
('ORD_DEC_08', 'DISC001', 'USR006', 'MV011', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_DEC08', 580000, '2026-12-24 19:00:00+07', NULL),
('ORD_DEC_09', NULL, 'USR007', 'MV012', 10, 'COMPLETED', 'CREDIT_CARD', 'CC_DEC09', 400000, '2026-12-26 14:00:00+07', NULL),
('ORD_DEC_10', NULL, 'USR008', 'MV008', 10, 'COMPLETED', 'MOMO', 'MOMO_DEC10', 290000, '2026-12-28 16:30:00+07', NULL),
('ORD_DEC_11', 'DISC002', 'USR004', 'MV023', 10, 'COMPLETED', 'VNPAY', 'VNP_DEC11', 510000, '2026-12-30 18:00:00+07', NULL),
('ORD_DEC_12', NULL, 'USR005', 'MV001', 10, 'COMPLETED', 'ZALOPAY', 'ZLP_DEC12', 330000, '2026-12-31 20:00:00+07', NULL);

-- =============================================
-- 27. TICKETS
-- =============================================
INSERT INTO tickets (id, ticket_price_id, order_id, showtime_seat_id, checked_in, qr_code, ticket_status) VALUES
-- Order 1: 2 IMAX tickets (weekend) - COMPLETED order
('TKT001', 'TP016', 'ORD001', 'STS003', TRUE, 'QR_TKT001_A3B4C5D6', 'CONFIRMED'),
('TKT002', 'TP016', 'ORD001', 'STS004', TRUE, 'QR_TKT002_E7F8G9H0', 'CONFIRMED'),
-- Order 2: 2 3D tickets (weekday) - COMPLETED order
('TKT003', 'TP007', 'ORD002', 'STS014', FALSE, 'QR_TKT003_I1J2K3L4', 'CONFIRMED'),
('TKT004', 'TP007', 'ORD002', 'STS015', FALSE, 'QR_TKT004_M5N6O7P8', 'CONFIRMED'),
-- Order 4: 2 2D tickets (weekday) - PENDING order
('TKT005', 'TP001', 'ORD004', 'STS001', FALSE, 'QR_TKT005_Q9R0S1T2', 'PENDING'),
('TKT006', 'TP001', 'ORD004', 'STS002', FALSE, 'QR_TKT006_U3V4W5X6', 'PENDING');

-- =============================================
-- 28. MENU ITEMS IN TICKETS (Extended)
-- =============================================
INSERT INTO menu_item_in_tickets (id, order_id, item_id, quantity, unit_price, total_price) VALUES
('MIT001', 'ORD001', 'MENU001', 2, 50000, 100000),
('MIT002', 'ORD001', 'MENU004', 2, 35000, 70000),
('MIT003', 'ORD002', 'MENU002', 1, 40000, 40000),
('MIT004', 'ORD002', 'MENU005', 1, 30000, 30000),
('MIT005', 'ORD004', 'MENU003', 2, 30000, 60000),
-- Additional menu items from monthly orders
('MIT006', 'ORD_JAN_01', 'MENU001', 1, 50000, 50000),
('MIT007', 'ORD_JAN_03', 'MENU004', 2, 35000, 70000),
('MIT008', 'ORD_FEB_02', 'MENU002', 2, 40000, 80000),
('MIT009', 'ORD_MAR_01', 'MENU009', 1, 45000, 45000),
('MIT010', 'ORD_APR_04', 'MENU010', 2, 55000, 110000),
('MIT011', 'ORD_MAY_02', 'MENU001', 2, 50000, 100000),
('MIT012', 'ORD_JUN_05', 'MENU006', 3, 35000, 105000),
('MIT013', 'ORD_JUL_01', 'MENU002', 2, 40000, 80000),
('MIT014', 'ORD_AUG_03', 'MENU004', 2, 35000, 70000),
('MIT015', 'ORD_SEP_04', 'MENU009', 2, 45000, 90000),
('MIT016', 'ORD_OCT_02', 'MENU010', 1, 55000, 55000),
('MIT017', 'ORD_NOV_05', 'MENU001', 3, 50000, 150000),
('MIT018', 'ORD_DEC_01', 'MENU002', 2, 40000, 80000),
('MIT019', 'ORD_DEC_08', 'MENU004', 4, 35000, 140000);

-- =============================================
-- 29. COMBO ITEMS IN TICKETS (Extended)
-- =============================================
INSERT INTO combo_item_in_tickets (id, order_id, combo_id) VALUES
('CIT001', 'ORD001', 'COMBO004'),
('CIT002', 'ORD002', 'COMBO002'),
('CIT003', 'ORD004', 'COMBO001'),
-- Additional combos from monthly orders
('CIT004', 'ORD_JAN_04', 'COMBO003'),
('CIT005', 'ORD_FEB_03', 'COMBO004'),
('CIT006', 'ORD_MAR_06', 'COMBO002'),
('CIT007', 'ORD_APR_02', 'COMBO001'),
('CIT008', 'ORD_MAY_01', 'COMBO004'),
('CIT009', 'ORD_JUN_04', 'COMBO003'),
('CIT010', 'ORD_JUL_04', 'COMBO002'),
('CIT011', 'ORD_AUG_02', 'COMBO004'),
('CIT012', 'ORD_SEP_03', 'COMBO001'),
('CIT013', 'ORD_OCT_01', 'COMBO003'),
('CIT014', 'ORD_NOV_02', 'COMBO004'),
('CIT015', 'ORD_DEC_04', 'COMBO002'),
('CIT016', 'ORD_DEC_11', 'COMBO004');

-- =============================================
-- DATA SEED COMPLETED
-- =============================================

-- Verify row counts
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'actions', COUNT(*) FROM actions
UNION ALL SELECT 'authorizes', COUNT(*) FROM authorizes
UNION ALL SELECT 'movie_types', COUNT(*) FROM movie_types
UNION ALL SELECT 'movies', COUNT(*) FROM movies
UNION ALL SELECT 'rates', COUNT(*) FROM rates
UNION ALL SELECT 'comments', COUNT(*) FROM comments
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'slides', COUNT(*) FROM slides
UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL SELECT 'combos', COUNT(*) FROM combos
UNION ALL SELECT 'combo_items', COUNT(*) FROM combo_items
UNION ALL SELECT 'combo_movies', COUNT(*) FROM combo_movies
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'formats', COUNT(*) FROM formats
UNION ALL SELECT 'seat_types', COUNT(*) FROM seat_types
UNION ALL SELECT 'combo_events', COUNT(*) FROM combo_events
UNION ALL SELECT 'discounts', COUNT(*) FROM discounts
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'seats', COUNT(*) FROM seats
UNION ALL SELECT 'show_times', COUNT(*) FROM show_times
UNION ALL SELECT 'show_time_seats', COUNT(*) FROM show_time_seats
UNION ALL SELECT 'ticket_prices', COUNT(*) FROM ticket_prices
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL SELECT 'menu_item_in_tickets', COUNT(*) FROM menu_item_in_tickets
UNION ALL SELECT 'combo_item_in_tickets', COUNT(*) FROM combo_item_in_tickets
ORDER BY table_name;
