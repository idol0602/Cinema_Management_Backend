-- Tạo role
CREATE ROLE ai_reader LOGIN PASSWORD 'ai_reader';
GRANT USAGE ON SCHEMA public TO ai_reader;

-- Đảm bảo không có quyền ghi mặc định
REVOKE CREATE ON SCHEMA public FROM ai_reader;

-- =====================
-- GRANT SELECT các bảng cần thiết
-- =====================

-- Phim & thể loại
GRANT SELECT ON movies TO ai_reader;
GRANT SELECT ON movie_types TO ai_reader;
GRANT SELECT ON movie_movie_types TO ai_reader;

-- Suất chiếu & phòng & ghế
GRANT SELECT ON show_times TO ai_reader;
GRANT SELECT ON show_time_seats TO ai_reader;
GRANT SELECT ON rooms TO ai_reader;
GRANT SELECT ON formats TO ai_reader;
GRANT SELECT ON seats TO ai_reader;
GRANT SELECT ON seat_types TO ai_reader;

-- Giá vé
GRANT SELECT ON ticket_prices TO ai_reader;

-- Menu & combo
GRANT SELECT ON menu_items TO ai_reader;
GRANT SELECT ON combos TO ai_reader;
GRANT SELECT ON combo_items TO ai_reader;

-- Sự kiện & khuyến mãi
GRANT SELECT ON events TO ai_reader;
GRANT SELECT ON event_types TO ai_reader;
GRANT SELECT ON discounts TO ai_reader;
GRANT SELECT ON combo_events TO ai_reader;
GRANT SELECT ON combo_movies TO ai_reader;

-- Bài viết & slide
GRANT SELECT ON posts TO ai_reader;
GRANT SELECT ON slides TO ai_reader;

-- Đảm bảo KHÔNG có quyền ghi (thường không cần thiết nếu chưa grant, nhưng để rõ ràng)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM ai_reader;

-- Không cho tạo object mới
REVOKE CREATE ON SCHEMA public FROM ai_reader;

-- =====================
-- Ngăn tự động cấp quyền cho bảng tạo mới trong tương lai
-- =====================
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM ai_reader;


GRANT CONNECT ON DATABASE postgres TO ai_reader;

GRANT ai_reader TO postgres;