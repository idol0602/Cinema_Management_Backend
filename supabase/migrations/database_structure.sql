-- XÓA TOÀN BỘ - CHẠY TRƯỚC KHI TẠO LẠI
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE TYPE item_types AS ENUM (
  'FOOD',
  'DRINK',
  'GIFT'
);

CREATE TYPE day_types AS ENUM (
  'WEEKDAY',
  'WEEKEND'
);

CREATE TYPE status_seats AS ENUM (
  'AVAILABLE',
  'HOLDING',
  'BOOKED',
  'FIXING'
);

CREATE TYPE methods AS ENUM (
  'GET',
  'POST',
  'PUT',
  'DELETE'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELED',
  'REFUND_PENDING',
  'REFUNDED'
);

CREATE TYPE ticket_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CANCELED'
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  password TEXT,
  is_online BOOLEAN,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  name TEXT,
  path TEXT,
  method methods,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE authorizes (
  id TEXT PRIMARY KEY,
  role_id TEXT REFERENCES roles(id),
  action_id TEXT REFERENCES actions(id)
);

CREATE TABLE movie_types (
  id TEXT PRIMARY KEY,
  type TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE movies (
  id TEXT PRIMARY KEY,
  title TEXT,
  director TEXT,
  country TEXT,
  description TEXT,
  release_date DATE,
  duration INT4,
  rating NUMERIC(2,1),
  trailer TEXT,
  image TEXT,
  thumbnail TEXT,
  -- movie_type_id TEXT REFERENCES movie_types(id),
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE movie_movie_types (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  movie_type_id TEXT NOT NULL REFERENCES movie_types(id) ON DELETE CASCADE
);


CREATE TABLE rates (
  id TEXT PRIMARY KEY,
  movie_id TEXT REFERENCES movies(id),
  user_id TEXT REFERENCES users(id),
  stars NUMERIC,
  created_at TIMESTAMPTZ
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  movie_id TEXT REFERENCES movies(id),
  content TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  image TEXT,
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE slides (
  id TEXT PRIMARY KEY,
  image TEXT,
  trailer TEXT,
  title TEXT,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  price NUMERIC,
  item_type item_types,
  image TEXT,
  num_instock INT4,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE combos (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  total_price NUMERIC,
  image TEXT,
  is_event_combo BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE combo_items (
  id TEXT PRIMARY KEY,
  combo_id TEXT REFERENCES combos(id),
  menu_item_id TEXT REFERENCES menu_items(id),
  quantity INT4,
  unit_price NUMERIC,
  is_active BOOLEAN
);

CREATE TABLE combo_movies (
  id TEXT PRIMARY KEY,
  combo_id TEXT REFERENCES combos(id),
  movie_id TEXT REFERENCES movies(id)
);

CREATE TABLE event_types (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  image TEXT,
  event_type_id text REFERENCES event_types(id),
  only_at_counter BOOLEAN,
  is_in_combo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE combo_events (
  id TEXT PRIMARY KEY,
  combo_id TEXT REFERENCES combos(id),
  event_id TEXT REFERENCES events(id)
);

CREATE TABLE discounts (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id),
  name TEXT,
  description TEXT,
  discount_percent NUMERIC,
  valid_from DATE,
  valid_to DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE formats (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);


CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  format_id TEXT REFERENCES formats(id),
  name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);


CREATE TABLE seat_types (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE seats (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id),
  seat_number TEXT,
  type TEXT REFERENCES seat_types(id),
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE show_times (
  id TEXT PRIMARY KEY,
  movie_id TEXT REFERENCES movies(id),
  room_id TEXT REFERENCES rooms(id),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  day_type day_types,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE show_time_seats (
  id TEXT PRIMARY KEY,
  show_time_id TEXT REFERENCES show_times(id),
  seat_id TEXT REFERENCES seats(id),
  status_seat status_seats
);

CREATE TABLE ticket_prices (
  id TEXT PRIMARY KEY,
  format_id TEXT REFERENCES formats(id),
  seat_type_id TEXT REFERENCES seat_types(id),
  day_type day_types,
  price NUMERIC,
  created_at TIMESTAMPTZ,
  is_active BOOLEAN
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  discount_id TEXT REFERENCES discounts(id),
  user_id TEXT REFERENCES users(id),
  movie_id TEXT REFERENCES movies(id),
  service_vat NUMERIC,
  payment_status payment_status,
  payment_method TEXT,
  trans_id TEXT,
  total_price NUMERIC,
  created_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ
);

CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  ticket_price_id TEXT REFERENCES ticket_prices(id),
  order_id TEXT REFERENCES orders(id),
  showtime_seat_id TEXT REFERENCES show_time_seats(id),
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  qr_code VARCHAR(500) NOT NULL UNIQUE,
  ticket_status ticket_status NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE menu_item_in_tickets (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  item_id TEXT REFERENCES menu_items(id),
  quantity INT4,
  unit_price NUMERIC,
  total_price NUMERIC
);

CREATE TABLE combo_item_in_tickets (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  combo_id TEXT REFERENCES combos(id)
);
-- Bảng cho hệ thống chat giữa khách hàng và nhân viên
CREATE TYPE conversation_status AS ENUM (
  'WAITING',   -- chờ phục vụ
  'ACTIVE',    -- đã tiếp nhận
  'DELETED'    -- đã xóa
);

CREATE TYPE message_type AS ENUM (
  'TEXT',
  'IMAGE',
  'RECALLED'
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES users(id),
  staff_id TEXT REFERENCES users(id),
  status conversation_status DEFAULT 'WAITING',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id),
  content TEXT,
  type message_type DEFAULT 'TEXT',
  image_url TEXT,
  is_seen BOOLEAN DEFAULT FALSE,
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
-- Tạo index để tối ưu hóa truy vấn

CREATE INDEX idx_movies_is_active ON movies(is_active);
CREATE INDEX idx_movie_movie_types_movie ON movie_movie_types(movie_id);
CREATE INDEX idx_movie_movie_types_type ON movie_movie_types(movie_type_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_active ON posts(is_active);

CREATE INDEX idx_comments_movie ON comments(movie_id);
CREATE INDEX idx_comments_user ON comments(user_id);

CREATE INDEX idx_rates_movie ON rates(movie_id);
CREATE INDEX idx_rates_user ON rates(user_id);
CREATE INDEX idx_show_times_movie ON show_times(movie_id);
CREATE INDEX idx_show_times_room ON show_times(room_id);
CREATE INDEX idx_show_times_day_type ON show_times(day_type);
CREATE INDEX idx_show_times_start_time ON show_times(start_time);
CREATE INDEX idx_show_time_seats_showtime ON show_time_seats(show_time_id);
CREATE INDEX idx_show_time_seats_seat ON show_time_seats(seat_id);
CREATE INDEX idx_show_time_seats_status ON show_time_seats(status_seat);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_discount ON orders(discount_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_tickets_order ON tickets(order_id);
-- Partial unique index ensures a seat can only have ONE active ticket (PENDING/CONFIRMED)
CREATE UNIQUE INDEX idx_tickets_showtime_seat ON tickets(showtime_seat_id) WHERE ticket_status IN ('PENDING', 'CONFIRMED');
CREATE INDEX idx_tickets_ticket_price ON tickets(ticket_price_id);
CREATE INDEX idx_menu_items_type ON menu_items(item_type);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
CREATE INDEX idx_combo_items_combo ON combo_items(combo_id);
CREATE INDEX idx_combo_items_menu_item ON combo_items(menu_item_id);
CREATE INDEX idx_combo_movies_combo ON combo_movies(combo_id);
CREATE INDEX idx_combo_movies_movie ON combo_movies(movie_id);

CREATE INDEX idx_combo_events_combo ON combo_events(combo_id);
CREATE INDEX idx_combo_events_event ON combo_events(event_id);
CREATE INDEX idx_events_date_range ON events(start_date, end_date);
CREATE INDEX idx_events_only_at_counter ON events(only_at_counter);
CREATE INDEX idx_discounts_event ON discounts(event_id);
CREATE INDEX idx_discounts_valid_time ON discounts(valid_from, valid_to);
CREATE INDEX idx_discounts_active ON discounts(is_active);
CREATE INDEX idx_rooms_format ON rooms(format_id);

CREATE INDEX idx_seats_room ON seats(room_id);
CREATE INDEX idx_seats_type ON seats(type);
CREATE INDEX idx_ticket_prices_format ON ticket_prices(format_id);
CREATE INDEX idx_ticket_prices_seat_type ON ticket_prices(seat_type_id);
CREATE INDEX idx_ticket_prices_day_type ON ticket_prices(day_type);
CREATE INDEX idx_authorizes_role ON authorizes(role_id);
CREATE INDEX idx_authorizes_action ON authorizes(action_id);

CREATE INDEX idx_actions_method ON actions(method);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_staff ON conversations(staff_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);