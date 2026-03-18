-- 1. Đảm bảo quyền truy cập schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant đầy đủ quyền cho tất cả bảng hiện có (an toàn cho dev)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Grant quyền cho các sequence (nếu dùng auto-increment id)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Đặt mặc định cho các bảng mới tạo sau này (rất quan trọng!)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

--- heartbeat function
DROP FUNCTION IF EXISTS public.heartbeat_user(uid uuid);

CREATE OR REPLACE FUNCTION public.heartbeat_user(uid TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET
    last_seen = now(),
    is_online = true
  WHERE id = uid
    AND (
      last_seen IS NULL
      OR last_seen < now() - interval '5 seconds'
    );
END;
$$ LANGUAGE plpgsql;
 
--- schedule
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users (last_seen);

-- =====================================================
-- CINEMA MANAGEMENT SYSTEM - RPC FUNCTIONS
-- All database RPC functions consolidated
-- =====================================================

-- =====================================================
-- 1. ORDER DETAILS FUNCTION
-- Lấy đầy đủ thông tin của một order
-- =====================================================
CREATE OR REPLACE FUNCTION get_order_details(p_order_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        -- Order Information
        'order', json_build_object(
            'id', o.id,
            'user_id', o.user_id,
            'movie_id', o.movie_id,
            'discount_id', o.discount_id,
            'service_vat', o.service_vat,
            'payment_status', o.payment_status,
            'payment_method', o.payment_method,
            'trans_id', o.trans_id,
            'total_price', o.total_price,
            'created_at', o.created_at,
            'requested_at', o.requested_at
        ),
        
        -- User Information
        'user', json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'phone', u.phone
        ),
        
        -- Movie Information
        'movie', json_build_object(
            'id', m.id,
            'title', m.title,
            'director', m.director,
            'country', m.country,
            'description', m.description,
            'release_date', m.release_date,
            'duration', m.duration,
            'rating', m.rating,
            'trailer', m.trailer,
            'image', m.image,
            'thumbnail', m.thumbnail,
            'movie_types', (
                SELECT COALESCE(json_agg(json_build_object(
                    'id', mt.id,
                    'type', mt.type
                )), '[]'::json)
                FROM movie_movie_types mmt
                JOIN movie_types mt ON mmt.movie_type_id = mt.id
                WHERE mmt.movie_id = m.id
            )
        ),
        
        -- Tickets with Seats, ShowTimes, Rooms
        'tickets', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', t.id,
                    'checked_in', t.checked_in,
                    'qr_code', t.qr_code,
                    'ticket_price', json_build_object(
                        'id', tp.id,
                        'price', tp.price,
                        'day_type', tp.day_type
                    ),
                    'showtime_seat', json_build_object(
                        'id', sts.id,
                        'status_seat', sts.status_seat,
                        'seat', json_build_object(
                            'id', s.id,
                            'seat_number', s.seat_number,
                            'seat_type', json_build_object(
                                'id', st.id,
                                'name', st.name
                            )
                        )
                    ),
                    'showtime', json_build_object(
                        'id', sh.id,
                        'start_time', sh.start_time,
                        'end_time', sh.end_time,
                        'day_type', sh.day_type,
                        'room', json_build_object(
                            'id', r.id,
                            'name', r.name,
                            'location', r.location,
                            'format', json_build_object(
                                'id', f.id,
                                'name', f.name
                            )
                        )
                    )
                )
            ), '[]'::json)
            FROM tickets t
            LEFT JOIN ticket_prices tp ON t.ticket_price_id = tp.id
            LEFT JOIN show_time_seats sts ON t.showtime_seat_id = sts.id
            LEFT JOIN seats s ON sts.seat_id = s.id
            LEFT JOIN seat_types st ON s.type = st.id
            LEFT JOIN show_times sh ON sts.show_time_id = sh.id
            LEFT JOIN rooms r ON sh.room_id = r.id
            LEFT JOIN formats f ON r.format_id = f.id
            WHERE t.order_id = o.id
        ),
        
        -- Menu Items
        'menu_items', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', mit.id,
                    'quantity', mit.quantity,
                    'unit_price', mit.unit_price,
                    'total_price', mit.total_price,
                    'item', json_build_object(
                        'id', mi.id,
                        'name', mi.name,
                        'description', mi.description,
                        'price', mi.price,
                        'item_type', mi.item_type,
                        'image', mi.image
                    )
                )
            ), '[]'::json)
            FROM menu_item_in_tickets mit
            LEFT JOIN menu_items mi ON mit.item_id = mi.id
            WHERE mit.order_id = o.id
        ),
        
        -- Combos
        'combos', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', cit.id,
                    'combo', json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'description', c.description,
                        'total_price', c.total_price,
                        'items', (
                            SELECT COALESCE(json_agg(
                                json_build_object(
                                    'id', ci.id,
                                    'quantity', ci.quantity,
                                    'unit_price', ci.unit_price,
                                    'menu_item', json_build_object(
                                        'id', cmi.id,
                                        'name', cmi.name,
                                        'description', cmi.description,
                                        'price', cmi.price,
                                        'item_type', cmi.item_type,
                                        'image', cmi.image
                                    )
                                )
                            ), '[]'::json)
                            FROM combo_items ci
                            LEFT JOIN menu_items cmi ON ci.menu_item_id = cmi.id
                            WHERE ci.combo_id = c.id AND ci.is_active = TRUE
                        )
                    )
                )
            ), '[]'::json)
            FROM combo_item_in_tickets cit
            LEFT JOIN combos c ON cit.combo_id = c.id
            WHERE cit.order_id = o.id
        ),
        
        -- Discount Information
        'discount', CASE 
            WHEN d.id IS NOT NULL THEN json_build_object(
                'id', d.id,
                'name', d.name,
                'description', d.description,
                'discount_percent', d.discount_percent,
                'valid_from', d.valid_from,
                'valid_to', d.valid_to
            )
            ELSE NULL
        END,
        
        -- Event Information (from discount)
        'event', CASE 
            WHEN e.id IS NOT NULL THEN json_build_object(
                'id', e.id,
                'name', e.name,
                'description', e.description,
                'start_date', e.start_date,
                'end_date', e.end_date,
                'image', e.image,
                'only_at_counter', e.only_at_counter,
                'event_type', json_build_object(
                    'id', et.id,
                    'name', et.name
                )
            )
            ELSE NULL
        END
    ) INTO v_result
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN movies m ON o.movie_id = m.id
    LEFT JOIN discounts d ON o.discount_id = d.id
    LEFT JOIN events e ON d.event_id = e.id
    LEFT JOIN event_types et ON e.event_type_id = et.id
    WHERE o.id = p_order_id;
    
    -- Check if order exists
    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Order with id % not found', p_order_id;
    END IF;
    
    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_order_details(TEXT) TO authenticated;

COMMENT ON FUNCTION get_order_details(TEXT) IS 
'Lấy đầy đủ thông tin của một order bao gồm:
- Order: thông tin đơn hàng
- User: thông tin người dùng
- Movie: thông tin phim
- Tickets: danh sách vé với thông tin ghế, suất chiếu, phòng
- Menu Items: các món ăn kèm theo
- Combos: các combo kèm theo với chi tiết items
- Discount: thông tin giảm giá
- Event: thông tin sự kiện liên quan đến discount';


-- =====================================================
-- 2. SHOW TIME DETAILS FUNCTION
-- Lấy chi tiết 1 suất chiếu
-- =====================================================
CREATE OR REPLACE FUNCTION get_show_time_details(p_show_time_id TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', st.id,
    'start_time', st.start_time,
    'end_time', st.end_time,
    'day_type', st.day_type,
    'is_active', st.is_active,
    'created_at', st.created_at,
    -- Movie info
    'movie', json_build_object(
      'id', m.id,
      'title', m.title,
      'director', m.director,
      'country', m.country,
      'description', m.description,
      'release_date', m.release_date,
      'duration', m.duration,
      'rating', m.rating,
      'image', m.image,
      'thumbnail', m.thumbnail,
      'trailer', m.trailer,
      'movie_types', (
        SELECT COALESCE(json_agg(json_build_object(
            'id', mt.id,
            'type', mt.type
        )), '[]'::json)
        FROM movie_movie_types mmt
        JOIN movie_types mt ON mmt.movie_type_id = mt.id
        WHERE mmt.movie_id = m.id
      )
    ),
    -- Room info với format và seats
    'room', json_build_object(
      'id', r.id,
      'name', r.name,
      'location', r.location,
      'format', json_build_object(
        'id', f.id,
        'name', f.name
      ),
      'seats', (
        SELECT json_agg(
          json_build_object(
            'id', s.id,
            'seat_number', s.seat_number,
            'is_active', s.is_active,
            'seat_type', json_build_object(
              'id', seat_t.id,
              'name', seat_t.name
            ),
            'show_time_seat', (
              SELECT json_build_object(
                'id', sts.id,
                'status_seat', sts.status_seat
              )
              FROM show_time_seats sts
              WHERE sts.seat_id = s.id 
                AND sts.show_time_id = st.id
            )
          )
          ORDER BY s.seat_number
        )
        FROM seats s
        LEFT JOIN seat_types seat_t ON s.type = seat_t.id
        WHERE s.room_id = r.id
          AND s.is_active = true
      )
    )
  ) INTO result
  FROM show_times st
  LEFT JOIN movies m ON st.movie_id = m.id
  LEFT JOIN rooms r ON st.room_id = r.id
  LEFT JOIN formats f ON r.format_id = f.id
  WHERE st.id = p_show_time_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 3. INSERT COMBO WITH DETAILS FUNCTION
-- Insert a combo with its items, movie, and event
-- =====================================================
DROP FUNCTION IF EXISTS insert_combo_with_details(JSONB, JSONB, JSONB, JSONB);

CREATE OR REPLACE FUNCTION insert_combo_with_details(
  p_combo JSONB,
  p_combo_items JSONB DEFAULT '[]'::JSONB,
  p_combo_movie JSONB DEFAULT '{}'::JSONB,
  p_combo_event JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_combo_id TEXT;
  v_item JSONB;
  v_result JSONB;
  v_combo_items_result JSONB := '[]'::JSONB;
  v_combo_movie_result JSONB := NULL;
  v_combo_event_result JSONB := NULL;
  v_inserted_item JSONB;
BEGIN
  -- Generate combo ID if not provided
  v_combo_id := COALESCE(p_combo->>'id', gen_random_uuid()::TEXT);
  
  -- Insert combo
  INSERT INTO combos (id, name, description, total_price, image, is_event_combo, is_active, created_at)
  VALUES (
    v_combo_id,
    p_combo->>'name',
    p_combo->>'description',
    (p_combo->>'total_price')::NUMERIC,
    p_combo->>'image',
    COALESCE((p_combo->>'is_event_combo')::BOOLEAN, FALSE),
    COALESCE((p_combo->>'is_active')::BOOLEAN, TRUE),
    COALESCE((p_combo->>'created_at')::TIMESTAMPTZ, NOW())
  );
  
  -- Insert combo_items if provided (array is not empty)
  IF p_combo_items IS NOT NULL AND jsonb_typeof(p_combo_items) = 'array' AND jsonb_array_length(p_combo_items) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_combo_items)
    LOOP
      INSERT INTO combo_items (id, combo_id, menu_item_id, quantity, unit_price, is_active)
      VALUES (
        COALESCE(v_item->>'id', gen_random_uuid()::TEXT),
        v_combo_id,
        v_item->>'menu_item_id',
        (v_item->>'quantity')::INT4,
        (v_item->>'unit_price')::NUMERIC,
        COALESCE((v_item->>'is_active')::BOOLEAN, TRUE)
      )
      RETURNING jsonb_build_object(
        'id', id,
        'combo_id', combo_id,
        'menu_item_id', menu_item_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'is_active', is_active
      ) INTO v_inserted_item;
      
      v_combo_items_result := v_combo_items_result || v_inserted_item;
    END LOOP;
  END IF;
  
  -- Insert combo_movie if provided (object is not empty, has movie_id)
  IF p_combo_movie IS NOT NULL 
     AND jsonb_typeof(p_combo_movie) = 'object' 
     AND p_combo_movie != '{}'::JSONB 
     AND p_combo_movie->>'movie_id' IS NOT NULL 
     AND p_combo_movie->>'movie_id' != '' THEN
    
    INSERT INTO combo_movies (id, combo_id, movie_id)
    VALUES (
      COALESCE(p_combo_movie->>'id', gen_random_uuid()::TEXT),
      v_combo_id,
      p_combo_movie->>'movie_id'
    )
    RETURNING jsonb_build_object(
      'id', id,
      'combo_id', combo_id,
      'movie_id', movie_id
    ) INTO v_combo_movie_result;
  END IF;
  
  -- Insert combo_event if provided (object is not empty, has event_id)
  IF p_combo_event IS NOT NULL 
     AND jsonb_typeof(p_combo_event) = 'object' 
     AND p_combo_event != '{}'::JSONB 
     AND p_combo_event->>'event_id' IS NOT NULL 
     AND p_combo_event->>'event_id' != '' THEN
    
    INSERT INTO combo_events (id, combo_id, event_id)
    VALUES (
      COALESCE(p_combo_event->>'id', gen_random_uuid()::TEXT),
      v_combo_id,
      p_combo_event->>'event_id'
    )
    RETURNING jsonb_build_object(
      'id', id,
      'combo_id', combo_id,
      'event_id', event_id
    ) INTO v_combo_event_result;
  END IF;
  
  -- Build and return the result
  SELECT jsonb_build_object(
    'success', TRUE,
    'combo', jsonb_build_object(
      'id', id,
      'name', name,
      'description', description,
      'total_price', total_price,
      'is_active', is_active,
      'created_at', created_at
    ),
    'combo_items', v_combo_items_result,
    'combo_movie', v_combo_movie_result,
    'combo_event', v_combo_event_result
  ) INTO v_result
  FROM combos
  WHERE id = v_combo_id;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic in a function
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION insert_combo_with_details(JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_combo_with_details(JSONB, JSONB, JSONB, JSONB) TO service_role;

COMMENT ON FUNCTION insert_combo_with_details IS 'Insert a combo with its items, movie, and event in a single transaction. combo_items is an array, combo_movie and combo_event are objects.';


-- =====================================================
-- 4. UPDATE COMBO WITH DETAILS FUNCTION
-- Update a combo with its items, movie, and event
-- =====================================================
DROP FUNCTION IF EXISTS update_combo_with_details(TEXT, JSONB, JSONB, JSONB, JSONB);

CREATE OR REPLACE FUNCTION update_combo_with_details(
  p_combo_id TEXT,
  p_combo JSONB,
  p_combo_items JSONB DEFAULT '[]'::JSONB,
  p_combo_movie JSONB DEFAULT '{}'::JSONB,
  p_combo_event JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_result JSONB;
  v_combo_items_result JSONB := '[]'::JSONB;
  v_combo_movie_result JSONB := NULL;
  v_combo_event_result JSONB := NULL;
  v_inserted_item JSONB;
  v_combo_exists BOOLEAN;
BEGIN
  -- Check if combo exists
  SELECT EXISTS(SELECT 1 FROM combos WHERE id = p_combo_id) INTO v_combo_exists;
  
  IF NOT v_combo_exists THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Combo not found',
      'error_code', 'NOT_FOUND'
    );
  END IF;
  
  -- Update combo basic info
  UPDATE combos
  SET 
    name = COALESCE(p_combo->>'name', name),
    description = COALESCE(p_combo->>'description', description),
    total_price = COALESCE((p_combo->>'total_price')::NUMERIC, total_price),
    image = COALESCE(p_combo->>'image', image),
    is_event_combo = COALESCE((p_combo->>'is_event_combo')::BOOLEAN, is_event_combo),
    is_active = COALESCE((p_combo->>'is_active')::BOOLEAN, is_active)
  WHERE id = p_combo_id;
  
  -- Delete existing combo_items for this combo
  DELETE FROM combo_items WHERE combo_id = p_combo_id;
  
  -- Insert new combo_items if provided (array is not empty)
  IF p_combo_items IS NOT NULL AND jsonb_typeof(p_combo_items) = 'array' AND jsonb_array_length(p_combo_items) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_combo_items)
    LOOP
      INSERT INTO combo_items (id, combo_id, menu_item_id, quantity, unit_price, is_active)
      VALUES (
        COALESCE(v_item->>'id', gen_random_uuid()::TEXT),
        p_combo_id,
        v_item->>'menu_item_id',
        (v_item->>'quantity')::INT4,
        (v_item->>'unit_price')::NUMERIC,
        COALESCE((v_item->>'is_active')::BOOLEAN, TRUE)
      )
      RETURNING jsonb_build_object(
        'id', id,
        'combo_id', combo_id,
        'menu_item_id', menu_item_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'is_active', is_active
      ) INTO v_inserted_item;
      
      v_combo_items_result := v_combo_items_result || v_inserted_item;
    END LOOP;
  END IF;
  
  -- Delete existing combo_movies for this combo
  DELETE FROM combo_movies WHERE combo_id = p_combo_id;
  
  -- Insert new combo_movie if provided (object is not empty, has movie_id)
  IF p_combo_movie IS NOT NULL 
     AND jsonb_typeof(p_combo_movie) = 'object' 
     AND p_combo_movie != '{}'::JSONB 
     AND p_combo_movie->>'movie_id' IS NOT NULL 
     AND p_combo_movie->>'movie_id' != '' THEN
    
    INSERT INTO combo_movies (id, combo_id, movie_id)
    VALUES (
      COALESCE(p_combo_movie->>'id', gen_random_uuid()::TEXT),
      p_combo_id,
      p_combo_movie->>'movie_id'
    )
    RETURNING jsonb_build_object(
      'id', id,
      'combo_id', combo_id,
      'movie_id', movie_id
    ) INTO v_combo_movie_result;
  END IF;
  
  -- Delete existing combo_events for this combo
  DELETE FROM combo_events WHERE combo_id = p_combo_id;
  
  -- Insert new combo_event if provided (object is not empty, has event_id)
  IF p_combo_event IS NOT NULL 
     AND jsonb_typeof(p_combo_event) = 'object' 
     AND p_combo_event != '{}'::JSONB 
     AND p_combo_event->>'event_id' IS NOT NULL 
     AND p_combo_event->>'event_id' != '' THEN
    
    INSERT INTO combo_events (id, combo_id, event_id)
    VALUES (
      COALESCE(p_combo_event->>'id', gen_random_uuid()::TEXT),
      p_combo_id,
      p_combo_event->>'event_id'
    )
    RETURNING jsonb_build_object(
      'id', id,
      'combo_id', combo_id,
      'event_id', event_id
    ) INTO v_combo_event_result;
  END IF;
  
  -- Build and return the result
  SELECT jsonb_build_object(
    'success', TRUE,
    'combo', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'description', c.description,
      'total_price', c.total_price,
      'is_active', c.is_active,
      'created_at', c.created_at
    ),
    'combo_items', v_combo_items_result,
    'combo_movie', v_combo_movie_result,
    'combo_event', v_combo_event_result
  ) INTO v_result
  FROM combos c
  WHERE c.id = p_combo_id;
  
  IF v_result IS NULL THEN
      RETURN jsonb_build_object(
          'success', TRUE,
          'message', 'Update successful but failed to return full object',
          'id', p_combo_id
      );
  END IF;

  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic in a function
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION update_combo_with_details(TEXT, JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_combo_with_details(TEXT, JSONB, JSONB, JSONB, JSONB) TO service_role;

COMMENT ON FUNCTION update_combo_with_details IS 'Update a combo with its items, movie, and event in a single transaction. Replaces all existing items/movie/event with new ones.';


-- =====================================================
-- 5. STATISTICAL FUNCTIONS
-- =====================================================

-- 5.1. Thống kê doanh thu theo tháng trong năm
CREATE OR REPLACE FUNCTION get_monthly_revenue(p_year INTEGER)
RETURNS TABLE (
  month INTEGER,
  revenue NUMERIC,
  tickets BIGINT,
  orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.month_num::INTEGER AS month,
    COALESCE(SUM(o.total_price), 0)::NUMERIC AS revenue,
    COALESCE(COUNT(DISTINCT t.id), 0)::BIGINT AS tickets,
    COALESCE(COUNT(DISTINCT o.id), 0)::BIGINT AS orders
  FROM generate_series(1, 12) AS m(month_num)
  LEFT JOIN orders o ON 
    EXTRACT(MONTH FROM o.created_at) = m.month_num 
    AND EXTRACT(YEAR FROM o.created_at) = p_year
    AND o.payment_status = 'COMPLETED'
  LEFT JOIN tickets t ON t.order_id = o.id
    AND t.ticket_status = 'CONFIRMED'
  GROUP BY m.month_num
  ORDER BY m.month_num;
END;
$$ LANGUAGE plpgsql;

-- 5.2. Thống kê tổng quan
CREATE OR REPLACE FUNCTION get_statistics_summary(p_month INTEGER, p_year INTEGER)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_tickets BIGINT,
  total_orders BIGINT,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.total_price), 0)::NUMERIC AS total_revenue,
    COALESCE(COUNT(DISTINCT t.id), 0)::BIGINT AS total_tickets,
    COALESCE(COUNT(DISTINCT o.id), 0)::BIGINT AS total_orders,
    (SELECT COUNT(*)::BIGINT FROM users WHERE is_active = true) AS total_users
  FROM orders o
  LEFT JOIN tickets t ON t.order_id = o.id
    AND t.ticket_status = 'CONFIRMED'
  WHERE o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year;
END;
$$ LANGUAGE plpgsql;

-- 5.3. Top phim doanh thu cao nhất
CREATE OR REPLACE FUNCTION get_top_movies(p_month INTEGER, p_year INTEGER, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  movie_id TEXT,
  title TEXT,
  revenue NUMERIC,
  tickets BIGINT,
  rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id::TEXT AS movie_id,
    m.title::TEXT AS title,
    COALESCE(SUM(o.total_price), 0)::NUMERIC AS revenue,
    COALESCE(COUNT(DISTINCT t.id), 0)::BIGINT AS tickets,
    COALESCE(m.rating, 0)::NUMERIC AS rating
  FROM movies m
  INNER JOIN orders o ON o.movie_id = m.id 
    AND o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
  LEFT JOIN tickets t ON t.order_id = o.id
    AND t.ticket_status = 'CONFIRMED'
  GROUP BY m.id, m.title, m.rating
  ORDER BY revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 5.4. Top Combo bán chạy
CREATE OR REPLACE FUNCTION get_top_combos(p_month INTEGER, p_year INTEGER, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  combo_id TEXT,
  name TEXT,
  sold BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::TEXT AS combo_id,
    c.name::TEXT AS name,
    COUNT(cit.id)::BIGINT AS sold,
    COALESCE(SUM(c.total_price), 0)::NUMERIC AS revenue
  FROM combos c
  INNER JOIN combo_item_in_tickets cit ON cit.combo_id = c.id
  INNER JOIN orders o ON o.id = cit.order_id
    AND o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
  GROUP BY c.id, c.name
  ORDER BY sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 5.5. Top Menu Items bán chạy
CREATE OR REPLACE FUNCTION get_top_menu_items(p_month INTEGER, p_year INTEGER, p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  menu_item_id TEXT,
  name TEXT,
  sold BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id::TEXT AS menu_item_id,
    mi.name::TEXT AS name,
    COALESCE(SUM(miit.quantity), 0)::BIGINT AS sold,
    COALESCE(SUM(miit.total_price), 0)::NUMERIC AS revenue
  FROM menu_items mi
  INNER JOIN menu_item_in_tickets miit ON miit.item_id = mi.id
  INNER JOIN orders o ON o.id = miit.order_id
    AND o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
  GROUP BY mi.id, mi.name
  ORDER BY sold DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 5.6. Phân bố thể loại phim
CREATE OR REPLACE FUNCTION get_genre_distribution(p_month INTEGER, p_year INTEGER)
RETURNS TABLE (
  genre_id TEXT,
  genre TEXT,
  count BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id::TEXT AS genre_id,
    mt.type::TEXT AS genre,
    COUNT(DISTINCT mmt.movie_id)::BIGINT AS count,
    COALESCE(SUM(o.total_price), 0)::NUMERIC AS revenue
  FROM movie_types mt
  LEFT JOIN movie_movie_types mmt ON mmt.movie_type_id = mt.id
  LEFT JOIN movies m ON m.id = mmt.movie_id
  LEFT JOIN orders o ON o.movie_id = m.id
    AND o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
  GROUP BY mt.id, mt.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GET COMBO DETAILS FUNCTION
-- Lấy đầy đủ thông tin của một combo với các quan hệ
-- =====================================================
DROP FUNCTION IF EXISTS get_combo_details(TEXT);

CREATE OR REPLACE FUNCTION get_combo_details(p_combo_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        -- Combo Information
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'total_price', c.total_price,
        'image', c.image,
        'is_event_combo', c.is_event_combo,
        'is_active', c.is_active,
        'created_at', c.created_at,
        
        -- Combo Items with Menu Items
        'combo_items', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', ci.id,
                    'combo_id', ci.combo_id,
                    'menu_item_id', ci.menu_item_id,
                    'quantity', ci.quantity,
                    'unit_price', ci.unit_price,
                    'is_active', ci.is_active,
                    'menu_item', json_build_object(
                        'id', mi.id,
                        'name', mi.name,
                        'description', mi.description,
                        'price', mi.price,
                        'image', mi.image,
                        'item_type', mi.item_type,
                        'num_instock', mi.num_instock,
                        'is_active', mi.is_active
                    )
                )
            ), '[]'::json)
            FROM combo_items ci
            LEFT JOIN menu_items mi ON mi.id = ci.menu_item_id
            WHERE ci.combo_id = c.id
        ),
        
        -- Combo Movies with Movies
        'combo_movies', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', cm.id,
                    'combo_id', cm.combo_id,
                    'movie_id', cm.movie_id,
                    'movie', json_build_object(
                        'id', m.id,
                        'title', m.title,
                        'description', m.description,
                        'director', m.director,
                        'country', m.country,
                        'release_date', m.release_date,
                        'duration', m.duration,
                        'rating', m.rating,
                        'image', m.image,
                        'thumbnail', m.thumbnail,
                        'is_active', m.is_active,
                        'movie_types', (
                            SELECT COALESCE(json_agg(json_build_object(
                                'id', mt.id,
                                'type', mt.type
                            )), '[]'::json)
                            FROM movie_movie_types mmt
                            JOIN movie_types mt ON mmt.movie_type_id = mt.id
                            WHERE mmt.movie_id = m.id
                        )
                    )
                )
            ), '[]'::json)
            FROM combo_movies cm
            LEFT JOIN movies m ON m.id = cm.movie_id
            WHERE cm.combo_id = c.id
        ),
        
        -- Combo Events with Events and Discounts
        'combos_events', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', ce.id,
                    'combo_id', ce.combo_id,
                    'event_id', ce.event_id,
                    'event', json_build_object(
                        'id', e.id,
                        'name', e.name,
                        'description', e.description,
                        'start_date', e.start_date,
                        'end_date', e.end_date,
                        'image', e.image,
                        'event_type_id', e.event_type_id,
                        'only_at_counter', e.only_at_counter,
                        'is_in_combo', e.is_in_combo,
                        'is_active', e.is_active,
                        'discount', (
                            SELECT json_build_object(
                                'id', d.id,
                                'event_id', d.event_id,
                                'name', d.name,
                                'description', d.description,
                                'discount_percent', d.discount_percent,
                                'valid_from', d.valid_from,
                                'valid_to', d.valid_to,
                                'is_active', d.is_active,
                                'created_at', d.created_at
                            )
                            FROM discounts d
                            WHERE d.event_id = e.id
                            LIMIT 1
                        )
                    )
                )
            ), '[]'::json)
            FROM combo_events ce
            LEFT JOIN events e ON e.id = ce.event_id
            WHERE ce.combo_id = c.id
        )
    ) INTO v_result
    FROM combos c
    WHERE c.id = p_combo_id;
    
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION recalculate_movie_rating(p_movie_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg_rating NUMERIC;
BEGIN
    -- Tính trung bình chỉ lấy rate mới nhất của mỗi user cho movie này
    SELECT COALESCE(AVG(sub.stars), 0)
    INTO v_avg_rating
    FROM (
        SELECT DISTINCT ON (r.user_id)
            r.user_id,
            r.stars
        FROM rates r
        WHERE r.movie_id = p_movie_id
        ORDER BY r.user_id, r.created_at DESC
    ) sub;

    -- Update lại rating trong bảng movies
    UPDATE movies
    SET rating = ROUND(v_avg_rating::numeric, 1)
    WHERE id = p_movie_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_movie_with_types(
    p_id TEXT,
    p_title TEXT,
    p_director TEXT,
    p_country TEXT,
    p_description TEXT,
    p_release_date DATE,
    p_duration INT4,
    p_rating NUMERIC,
    p_trailer TEXT,
    p_image TEXT,
    p_thumbnail TEXT,
    p_is_active BOOLEAN,
    p_movie_type_ids TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  -- insert movie
  INSERT INTO movies (
    id,
    title,
    director,
    country,
    description,
    release_date,
    duration,
    rating,
    trailer,
    image,
    thumbnail,
    created_at,
    is_active
  )
  VALUES (
    p_id,
    p_title,
    p_director,
    p_country,
    p_description,
    p_release_date,
    p_duration,
    p_rating,
    p_trailer,
    p_image,
    p_thumbnail,
    NOW(),
    p_is_active
  );

  -- insert movie types relation
  INSERT INTO movie_movie_types (id, movie_id, movie_type_id)
  SELECT
    gen_random_uuid()::text,
    p_id,
    unnest(p_movie_type_ids);

END;
$$;

CREATE OR REPLACE FUNCTION update_movie_with_types(
    p_id TEXT,
    p_title TEXT,
    p_director TEXT,
    p_country TEXT,
    p_description TEXT,
    p_release_date DATE,
    p_duration INT4,
    p_rating NUMERIC,
    p_trailer TEXT,
    p_image TEXT,
    p_thumbnail TEXT,
    p_is_active BOOLEAN,
    p_movie_type_ids TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  -- update movie
  UPDATE movies
  SET
    title = p_title,
    director = p_director,
    country = p_country,
    description = p_description,
    release_date = p_release_date,
    duration = p_duration,
    rating = p_rating,
    trailer = p_trailer,
    image = p_image,
    thumbnail = p_thumbnail,
    is_active = p_is_active
  WHERE id = p_id;

  -- remove old movie types
  DELETE FROM movie_movie_types
  WHERE movie_id = p_id;

  -- insert new relations
  INSERT INTO movie_movie_types (id, movie_id, movie_type_id)
  SELECT
    gen_random_uuid()::text,
    p_id,
    unnest(p_movie_type_ids);

END;
$$;

CREATE OR REPLACE FUNCTION get_movies_with_status()
RETURNS TABLE (
    id TEXT,
    title TEXT,
    director TEXT,
    country TEXT,
    description TEXT,
    release_date DATE,
    duration INT4,
    rating NUMERIC,
    trailer TEXT,
    image TEXT,
    thumbnail TEXT,
    created_at TIMESTAMPTZ,
    is_active BOOLEAN,
    movie_status TEXT
)
LANGUAGE sql
AS $$
    SELECT
        m.id,
        m.title,
        m.director,
        m.country,
        m.description,
        m.release_date,
        m.duration,
        m.rating,
        m.trailer,
        m.image,
        m.thumbnail,
        m.created_at,
        m.is_active,
        CASE
            WHEN MAX(st.end_time) < NOW() THEN 'ENDED'
            WHEN MIN(st.start_time) > NOW() THEN 'COMING_SOON'
            ELSE 'NOW_SHOWING'
        END AS movie_status
    FROM movies m
    LEFT JOIN show_times st
        ON st.movie_id = m.id
        AND st.is_active = TRUE
    WHERE m.is_active = TRUE
    GROUP BY m.id;
$$;


-- =====================================================
-- HANDLE ORDER AND RELATED DATA - ATOMIC TRANSACTION
-- Gom tất cả DB mutations khi xử lý đơn hàng vào 1 transaction
-- Nếu có lỗi ở bất kỳ bước nào → rollback toàn bộ
-- =====================================================
DROP FUNCTION IF EXISTS handle_order_and_related_data(JSONB);

CREATE OR REPLACE FUNCTION handle_order_and_related_data(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order JSONB;
  v_ticket JSONB;
  v_combo JSONB;
  v_menu_item JSONB;
  v_seat_id TEXT;
  v_item JSONB;
  v_combo_items JSONB;
  v_current_stock INT4;
  v_deduct_qty INT4;
  v_item_id TEXT;
  v_item_name TEXT;
  v_new_seat_status TEXT;
  v_tickets_result JSONB := '[]'::JSONB;
  v_combos_result JSONB := '[]'::JSONB;
  v_menu_items_result JSONB := '[]'::JSONB;
  v_order_result JSONB;
  v_inserted JSONB;
BEGIN
  -- ==========================================
  -- 1. UPDATE ORDER
  -- ==========================================
  v_order := p_payload->'order';

  UPDATE orders SET
    payment_status = COALESCE((v_order->>'payment_status')::payment_status, payment_status),
    payment_method = COALESCE(v_order->>'payment_method', payment_method),
    discount_id = COALESCE(v_order->>'discount_id', discount_id),
    service_vat = COALESCE((v_order->>'service_vat')::NUMERIC, service_vat),
    total_price = COALESCE((v_order->>'total_price')::NUMERIC, total_price),
    trans_id = COALESCE(v_order->>'trans_id', trans_id)
  WHERE id = v_order->>'id';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', v_order->>'id';
  END IF;

  -- Get updated order
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'movie_id', o.movie_id,
    'discount_id', o.discount_id,
    'service_vat', o.service_vat,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'trans_id', o.trans_id,
    'total_price', o.total_price,
    'created_at', o.created_at,
    'requested_at', o.requested_at
  ) INTO v_order_result
  FROM orders o
  WHERE o.id = v_order->>'id';

  -- ==========================================
  -- 2. CREATE TICKETS + UPDATE SEAT STATUS
  -- ==========================================
  IF p_payload->'tickets' IS NOT NULL 
     AND jsonb_typeof(p_payload->'tickets') = 'array' 
     AND jsonb_array_length(p_payload->'tickets') > 0 THEN

    FOR v_ticket IN SELECT * FROM jsonb_array_elements(p_payload->'tickets')
    LOOP
      -- 2a. Check if seat is actually available or held (row lock)
      SELECT status_seat INTO v_new_seat_status
      FROM show_time_seats
      WHERE id = v_ticket->>'showtime_seat_id'
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'ShowTimeSeat % not found', v_ticket->>'showtime_seat_id';
      END IF;

      IF v_new_seat_status = 'BOOKED' THEN
        RAISE EXCEPTION 'Seat % is already booked', v_ticket->>'showtime_seat_id';
      END IF;

      -- Insert ticket
      INSERT INTO tickets (id, ticket_price_id, order_id, showtime_seat_id, checked_in, qr_code, ticket_status)
      VALUES (
        v_ticket->>'id',
        v_ticket->>'ticket_price_id',
        v_order->>'id',
        v_ticket->>'showtime_seat_id',
        COALESCE((v_ticket->>'checked_in')::BOOLEAN, FALSE),
        v_ticket->>'qr_code',
        'CONFIRMED'
      )
      RETURNING jsonb_build_object(
        'id', id,
        'ticket_price_id', ticket_price_id,
        'order_id', order_id,
        'showtime_seat_id', showtime_seat_id,
        'checked_in', checked_in,
        'qr_code', qr_code,
        'ticket_status', ticket_status
      ) INTO v_inserted;

      v_tickets_result := v_tickets_result || v_inserted;

      -- Update seat status to BOOKED
      UPDATE show_time_seats 
      SET status_seat = 'BOOKED'
      WHERE id = v_ticket->>'showtime_seat_id';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'ShowTimeSeat % not found', v_ticket->>'showtime_seat_id';
      END IF;
    END LOOP;
  END IF;

  -- ==========================================
  -- 3. CREATE COMBO ITEMS IN TICKETS
  -- ==========================================
  IF p_payload->'combo_items' IS NOT NULL 
     AND jsonb_typeof(p_payload->'combo_items') = 'array' 
     AND jsonb_array_length(p_payload->'combo_items') > 0 THEN

    FOR v_combo IN SELECT * FROM jsonb_array_elements(p_payload->'combo_items')
    LOOP
      INSERT INTO combo_item_in_tickets (id, order_id, combo_id)
      VALUES (
        v_combo->>'id',
        v_order->>'id',
        v_combo->>'combo_id'
      )
      RETURNING jsonb_build_object(
        'id', id,
        'order_id', order_id,
        'combo_id', combo_id
      ) INTO v_inserted;

      v_combos_result := v_combos_result || v_inserted;

      -- Deduct stock for each menu item in this combo
      FOR v_item IN 
        SELECT jsonb_build_object(
          'menu_item_id', ci.menu_item_id,
          'quantity', ci.quantity
        )
        FROM combo_items ci
        WHERE ci.combo_id = v_combo->>'combo_id'
          AND ci.is_active = TRUE
      LOOP
        v_item_id := v_item->>'menu_item_id';
        v_deduct_qty := (v_item->>'quantity')::INT4;

        SELECT num_instock, name INTO v_current_stock, v_item_name
        FROM menu_items
        WHERE id = v_item_id;

        IF v_current_stock IS NULL THEN
          RAISE EXCEPTION 'Menu item % not found (in combo %)', v_item_id, v_combo->>'combo_id';
        END IF;

        IF v_current_stock < v_deduct_qty THEN
          RAISE EXCEPTION 'Insufficient stock for "%" (combo). Requested: %, Available: %', 
            v_item_name, v_deduct_qty, v_current_stock;
        END IF;

        UPDATE menu_items 
        SET num_instock = num_instock - v_deduct_qty
        WHERE id = v_item_id;
      END LOOP;
    END LOOP;
  END IF;

  -- ==========================================
  -- 4. CREATE MENU ITEMS IN TICKETS + DEDUCT STOCK
  -- ==========================================
  IF p_payload->'menu_items' IS NOT NULL 
     AND jsonb_typeof(p_payload->'menu_items') = 'array' 
     AND jsonb_array_length(p_payload->'menu_items') > 0 THEN

    FOR v_menu_item IN SELECT * FROM jsonb_array_elements(p_payload->'menu_items')
    LOOP
      INSERT INTO menu_item_in_tickets (id, order_id, item_id, quantity, unit_price, total_price)
      VALUES (
        v_menu_item->>'id',
        v_order->>'id',
        v_menu_item->>'item_id',
        (v_menu_item->>'quantity')::INT4,
        (v_menu_item->>'unit_price')::NUMERIC,
        (v_menu_item->>'total_price')::NUMERIC
      )
      RETURNING jsonb_build_object(
        'id', id,
        'order_id', order_id,
        'item_id', item_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'total_price', total_price
      ) INTO v_inserted;

      v_menu_items_result := v_menu_items_result || v_inserted;

      -- Deduct stock for this menu item
      v_item_id := v_menu_item->>'item_id';
      v_deduct_qty := (v_menu_item->>'quantity')::INT4;

      SELECT num_instock, name INTO v_current_stock, v_item_name
      FROM menu_items
      WHERE id = v_item_id;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Menu item % not found', v_item_id;
      END IF;

      IF v_current_stock < v_deduct_qty THEN
        RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, Available: %', 
          v_item_name, v_deduct_qty, v_current_stock;
      END IF;

      UPDATE menu_items 
      SET num_instock = num_instock - v_deduct_qty
      WHERE id = v_item_id;
    END LOOP;
  END IF;

  -- ==========================================
  -- 5. RETURN RESULT
  -- ==========================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'order', v_order_result,
    'tickets', v_tickets_result,
    'combo_items', v_combos_result,
    'menu_items', v_menu_items_result
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Automatic rollback in plpgsql function
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION handle_order_and_related_data(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_order_and_related_data(JSONB) TO service_role;

COMMENT ON FUNCTION handle_order_and_related_data IS 
'Atomic transaction xử lý đơn hàng:
- Update order (payment_status, payment_method)
- Create tickets + update seats to BOOKED
- Create combo_item_in_tickets + deduct combo stock
- Create menu_item_in_tickets + deduct menu item stock
Nếu có lỗi ở bất kỳ bước nào → rollback toàn bộ.';


-- =====================================================
-- CREATE ORDER AND RELATED DATA - ATOMIC TRANSACTION
-- Tạo order mới (PENDING) cùng tickets (PENDING),
-- combo_item_in_tickets, menu_item_in_tickets
-- và tạm trừ stock trong 1 transaction
-- =====================================================
DROP FUNCTION IF EXISTS create_order_and_related_data(JSONB);

CREATE OR REPLACE FUNCTION create_order_and_related_data(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order JSONB;
  v_ticket JSONB;
  v_combo JSONB;
  v_menu_item JSONB;
  v_item JSONB;
  v_current_stock INT4;
  v_deduct_qty INT4;
  v_item_id TEXT;
  v_item_name TEXT;
  v_new_seat_status TEXT;
  v_tickets_result JSONB := '[]'::JSONB;
  v_combos_result JSONB := '[]'::JSONB;
  v_menu_items_result JSONB := '[]'::JSONB;
  v_order_result JSONB;
  v_inserted JSONB;
BEGIN
  -- ==========================================
  -- 1. CREATE ORDER (PENDING)
  -- ==========================================
  v_order := p_payload->'order';

  INSERT INTO orders (
    id, discount_id, user_id, movie_id,
    service_vat, payment_status, payment_method,
    trans_id, total_price, created_at, requested_at
  ) VALUES (
    v_order->>'id',
    NULLIF(v_order->>'discount_id', ''),
    v_order->>'user_id',
    v_order->>'movie_id',
    COALESCE((v_order->>'service_vat')::NUMERIC, 0),
    'PENDING',
    v_order->>'payment_method',
    v_order->>'trans_id',
    COALESCE((v_order->>'total_price')::NUMERIC, 0),
    NOW(),
    NOW()
  );

  -- Get created order
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'movie_id', o.movie_id,
    'discount_id', o.discount_id,
    'service_vat', o.service_vat,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'trans_id', o.trans_id,
    'total_price', o.total_price,
    'created_at', o.created_at,
    'requested_at', o.requested_at
  ) INTO v_order_result
  FROM orders o
  WHERE o.id = v_order->>'id';

  -- ==========================================
  -- 2. CREATE TICKETS (PENDING) + HOLD SEATS
  -- ==========================================
  IF p_payload->'tickets' IS NOT NULL
     AND jsonb_typeof(p_payload->'tickets') = 'array'
     AND jsonb_array_length(p_payload->'tickets') > 0 THEN

    FOR v_ticket IN SELECT * FROM jsonb_array_elements(p_payload->'tickets')
    LOOP
      -- 2a. Check if seat is actually available or held (row lock)
      SELECT status_seat INTO v_new_seat_status
      FROM show_time_seats
      WHERE id = v_ticket->>'showtime_seat_id'
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'ShowTimeSeat % not found', v_ticket->>'showtime_seat_id';
      END IF;

      IF v_new_seat_status = 'BOOKED' THEN
        RAISE EXCEPTION 'Seat % is already booked', v_ticket->>'showtime_seat_id';
      END IF;

      -- Insert ticket with PENDING status
      INSERT INTO tickets (id, ticket_price_id, order_id, showtime_seat_id, checked_in, qr_code, ticket_status)
      VALUES (
        v_ticket->>'id',
        v_ticket->>'ticket_price_id',
        v_order->>'id',
        v_ticket->>'showtime_seat_id',
        FALSE,
        v_ticket->>'qr_code',
        'PENDING'
      )
      RETURNING jsonb_build_object(
        'id', id,
        'ticket_price_id', ticket_price_id,
        'order_id', order_id,
        'showtime_seat_id', showtime_seat_id,
        'checked_in', checked_in,
        'qr_code', qr_code,
        'ticket_status', ticket_status
      ) INTO v_inserted;

      v_tickets_result := v_tickets_result || v_inserted;

      -- Hold seat (set status to HOLDING)
      UPDATE show_time_seats
      SET status_seat = 'HOLDING'
      WHERE id = v_ticket->>'showtime_seat_id';
    END LOOP;
  END IF;

  -- ==========================================
  -- 3. CREATE COMBO ITEMS IN TICKETS + DEDUCT STOCK
  -- ==========================================
  IF p_payload->'combo_items' IS NOT NULL
     AND jsonb_typeof(p_payload->'combo_items') = 'array'
     AND jsonb_array_length(p_payload->'combo_items') > 0 THEN

    FOR v_combo IN SELECT * FROM jsonb_array_elements(p_payload->'combo_items')
    LOOP
      INSERT INTO combo_item_in_tickets (id, order_id, combo_id)
      VALUES (
        v_combo->>'id',
        v_order->>'id',
        v_combo->>'combo_id'
      )
      RETURNING jsonb_build_object(
        'id', id,
        'order_id', order_id,
        'combo_id', combo_id
      ) INTO v_inserted;

      v_combos_result := v_combos_result || v_inserted;

      -- Deduct stock for each menu item in this combo
      FOR v_item IN
        SELECT jsonb_build_object(
          'menu_item_id', ci.menu_item_id,
          'quantity', ci.quantity
        )
        FROM combo_items ci
        WHERE ci.combo_id = v_combo->>'combo_id'
          AND ci.is_active = TRUE
      LOOP
        v_item_id := v_item->>'menu_item_id';
        v_deduct_qty := (v_item->>'quantity')::INT4;

        SELECT num_instock, name INTO v_current_stock, v_item_name
        FROM menu_items
        WHERE id = v_item_id;

        IF v_current_stock IS NULL THEN
          RAISE EXCEPTION 'Menu item % not found (in combo %)', v_item_id, v_combo->>'combo_id';
        END IF;

        IF v_current_stock < v_deduct_qty THEN
          RAISE EXCEPTION 'Insufficient stock for "%" (combo). Requested: %, Available: %',
            v_item_name, v_deduct_qty, v_current_stock;
        END IF;

        UPDATE menu_items
        SET num_instock = num_instock - v_deduct_qty
        WHERE id = v_item_id;
      END LOOP;
    END LOOP;
  END IF;

  -- ==========================================
  -- 4. CREATE MENU ITEMS IN TICKETS + DEDUCT STOCK
  -- ==========================================
  IF p_payload->'menu_items' IS NOT NULL
     AND jsonb_typeof(p_payload->'menu_items') = 'array'
     AND jsonb_array_length(p_payload->'menu_items') > 0 THEN

    FOR v_menu_item IN SELECT * FROM jsonb_array_elements(p_payload->'menu_items')
    LOOP
      INSERT INTO menu_item_in_tickets (id, order_id, item_id, quantity, unit_price, total_price)
      VALUES (
        v_menu_item->>'id',
        v_order->>'id',
        v_menu_item->>'item_id',
        (v_menu_item->>'quantity')::INT4,
        (v_menu_item->>'unit_price')::NUMERIC,
        (v_menu_item->>'total_price')::NUMERIC
      )
      RETURNING jsonb_build_object(
        'id', id,
        'order_id', order_id,
        'item_id', item_id,
        'quantity', quantity,
        'unit_price', unit_price,
        'total_price', total_price
      ) INTO v_inserted;

      v_menu_items_result := v_menu_items_result || v_inserted;

      -- Deduct stock for this menu item
      v_item_id := v_menu_item->>'item_id';
      v_deduct_qty := (v_menu_item->>'quantity')::INT4;

      SELECT num_instock, name INTO v_current_stock, v_item_name
      FROM menu_items
      WHERE id = v_item_id;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Menu item % not found', v_item_id;
      END IF;

      IF v_current_stock < v_deduct_qty THEN
        RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, Available: %',
          v_item_name, v_deduct_qty, v_current_stock;
      END IF;

      UPDATE menu_items
      SET num_instock = num_instock - v_deduct_qty
      WHERE id = v_item_id;
    END LOOP;
  END IF;

  -- ==========================================
  -- 5. RETURN RESULT
  -- ==========================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'order', v_order_result,
    'tickets', v_tickets_result,
    'combo_items', v_combos_result,
    'menu_items', v_menu_items_result
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_and_related_data(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_and_related_data(JSONB) TO service_role;

COMMENT ON FUNCTION create_order_and_related_data IS
'Atomic transaction tạo đơn hàng mới:
- Create order với payment_status = PENDING
- Create tickets với ticket_status = PENDING + hold seats (HOLDING)
- Create combo_item_in_tickets + tạm trừ stock combo items
- Create menu_item_in_tickets + tạm trừ stock menu items
Nếu có lỗi ở bất kỳ bước nào → rollback toàn bộ.';


-- =====================================================
-- UPDATE ORDER AND RELATED DATA - ATOMIC TRANSACTION
-- Cập nhật trạng thái order, ticket_status, show_time_seats
-- Nếu COMPLETED → ticket CONFIRMED, seats BOOKED
-- Nếu FAILED/CANCELED → ticket CANCELED, seats AVAILABLE, hoàn stock
-- =====================================================
DROP FUNCTION IF EXISTS update_order_and_related_data(TEXT, TEXT);
DROP FUNCTION IF EXISTS update_order_and_related_data(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION update_order_and_related_data(
  p_order_id TEXT,
  p_payment_status TEXT,
  p_trans_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status payment_status;
  v_new_status payment_status;
  v_new_ticket_status ticket_status;
  v_new_seat_status status_seats;
  v_order_result JSONB;
  v_ticket RECORD;
  v_combo_ticket RECORD;
  v_menu_ticket RECORD;
  v_item RECORD;
  v_restore_qty INT4;
BEGIN
  -- ==========================================
  -- 1. VALIDATE ORDER EXISTS & GET CURRENT STATUS
  -- ==========================================
  SELECT payment_status INTO v_current_status
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- Cast new status
  BEGIN
    v_new_status := p_payment_status::payment_status;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid payment_status: %', p_payment_status;
  END;

  -- ==========================================
  -- 2. DETERMINE NEW TICKET & SEAT STATUS
  -- ==========================================
  IF v_new_status = 'COMPLETED' THEN
    v_new_ticket_status := 'CONFIRMED';
    v_new_seat_status := 'BOOKED';
  ELSIF v_new_status IN ('FAILED', 'CANCELED') THEN
    v_new_ticket_status := 'CANCELED';
    v_new_seat_status := 'AVAILABLE';
  ELSIF v_new_status IN ('REFUND_PENDING', 'REFUNDED') THEN
    v_new_ticket_status := 'CANCELED';
    v_new_seat_status := 'AVAILABLE';
  ELSE
    -- For PENDING or other statuses, no ticket/seat changes
    v_new_ticket_status := NULL;
    v_new_seat_status := NULL;
  END IF;

  -- ==========================================
  -- 3. UPDATE ORDER STATUS + TRANS_ID
  -- ==========================================
  UPDATE orders
  SET
    payment_status = v_new_status,
    trans_id = COALESCE(p_trans_id, trans_id)
  WHERE id = p_order_id;

  -- Get updated order
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'movie_id', o.movie_id,
    'discount_id', o.discount_id,
    'service_vat', o.service_vat,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'trans_id', o.trans_id,
    'total_price', o.total_price,
    'created_at', o.created_at,
    'requested_at', o.requested_at
  ) INTO v_order_result
  FROM orders o
  WHERE o.id = p_order_id;

  -- ==========================================
  -- 4. UPDATE TICKETS & SHOW_TIME_SEATS
  -- ==========================================
  IF v_new_ticket_status IS NOT NULL THEN
    -- Update all tickets for this order
    UPDATE tickets
    SET ticket_status = v_new_ticket_status
    WHERE order_id = p_order_id;

    -- Update all related show_time_seats
    UPDATE show_time_seats
    SET status_seat = v_new_seat_status
    WHERE id IN (
      SELECT t.showtime_seat_id
      FROM tickets t
      WHERE t.order_id = p_order_id
    );
  END IF;

  -- ==========================================
  -- 5. RESTORE STOCK IF CANCELED/FAILED/REFUNDED
  -- ==========================================
  IF v_new_status IN ('FAILED', 'CANCELED', 'REFUNDED') THEN
    -- Restore stock for combo items
    FOR v_combo_ticket IN
      SELECT cit.combo_id
      FROM combo_item_in_tickets cit
      WHERE cit.order_id = p_order_id
    LOOP
      FOR v_item IN
        SELECT ci.menu_item_id, ci.quantity
        FROM combo_items ci
        WHERE ci.combo_id = v_combo_ticket.combo_id
          AND ci.is_active = TRUE
      LOOP
        UPDATE menu_items
        SET num_instock = num_instock + v_item.quantity
        WHERE id = v_item.menu_item_id;
      END LOOP;
    END LOOP;

    -- Restore stock for individual menu items
    FOR v_menu_ticket IN
      SELECT miit.item_id, miit.quantity
      FROM menu_item_in_tickets miit
      WHERE miit.order_id = p_order_id
    LOOP
      UPDATE menu_items
      SET num_instock = num_instock + v_menu_ticket.quantity
      WHERE id = v_menu_ticket.item_id;
    END LOOP;
  END IF;

  -- ==========================================
  -- 6. RETURN RESULT
  -- ==========================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'order', v_order_result,
    'payment_status', v_new_status::TEXT,
    'ticket_status', v_new_ticket_status::TEXT,
    'seat_status', v_new_seat_status::TEXT
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION update_order_and_related_data(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_and_related_data(TEXT, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION update_order_and_related_data IS
'Atomic transaction cập nhật trạng thái đơn hàng:
- Update order payment_status, trans_id
- COMPLETED → ticket CONFIRMED, seats BOOKED
- FAILED/CANCELED → ticket CANCELED, seats AVAILABLE, hoàn stock
- REFUND_PENDING/REFUNDED → ticket CANCELED, seats AVAILABLE, hoàn stock
Nếu có lỗi ở bất kỳ bước nào → rollback toàn bộ.';


-- =====================================================
-- REFUND ORDER AND RELATED DATA - ATOMIC TRANSACTION
-- Hoàn tiền đơn hàng: hủy tickets, giải phóng ghế,
-- hoàn stock menu items/combos, cập nhật payment_status = REFUNDED
-- Tương tự update_order_and_related_data cho trường hợp FAILED/CANCELED
-- =====================================================
DROP FUNCTION IF EXISTS refund_order_and_related_data(TEXT);

CREATE OR REPLACE FUNCTION refund_order_and_related_data(
  p_order_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status payment_status;
  v_order_result JSONB;
  v_combo_ticket RECORD;
  v_menu_ticket RECORD;
  v_item RECORD;
BEGIN
  -- ==========================================
  -- 1. VALIDATE ORDER EXISTS & CHECK STATUS
  -- ==========================================
  SELECT payment_status INTO v_current_status
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- Only allow refund from REFUND_PENDING status
  IF v_current_status != 'REFUND_PENDING' THEN
    RAISE EXCEPTION 'Order % is not in REFUND_PENDING status (current: %)', p_order_id, v_current_status;
  END IF;

  -- ==========================================
  -- 2. UPDATE ORDER STATUS TO REFUNDED
  -- ==========================================
  UPDATE orders
  SET payment_status = 'REFUNDED'
  WHERE id = p_order_id;

  -- Get updated order
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'movie_id', o.movie_id,
    'discount_id', o.discount_id,
    'service_vat', o.service_vat,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'trans_id', o.trans_id,
    'total_price', o.total_price,
    'created_at', o.created_at,
    'requested_at', o.requested_at
  ) INTO v_order_result
  FROM orders o
  WHERE o.id = p_order_id;

  -- ==========================================
  -- 3. CANCEL TICKETS & RELEASE SEATS
  -- ==========================================
  -- Update all tickets for this order to CANCELED
  UPDATE tickets
  SET ticket_status = 'CANCELED'
  WHERE order_id = p_order_id;

  -- Release all related show_time_seats to AVAILABLE
  UPDATE show_time_seats
  SET status_seat = 'AVAILABLE'
  WHERE id IN (
    SELECT t.showtime_seat_id
    FROM tickets t
    WHERE t.order_id = p_order_id
  );

  -- ==========================================
  -- 4. RESTORE STOCK FOR COMBOS
  -- ==========================================
  FOR v_combo_ticket IN
    SELECT cit.combo_id
    FROM combo_item_in_tickets cit
    WHERE cit.order_id = p_order_id
  LOOP
    FOR v_item IN
      SELECT ci.menu_item_id, ci.quantity
      FROM combo_items ci
      WHERE ci.combo_id = v_combo_ticket.combo_id
        AND ci.is_active = TRUE
    LOOP
      UPDATE menu_items
      SET num_instock = num_instock + v_item.quantity
      WHERE id = v_item.menu_item_id;
    END LOOP;
  END LOOP;

  -- ==========================================
  -- 5. RESTORE STOCK FOR INDIVIDUAL MENU ITEMS
  -- ==========================================
  FOR v_menu_ticket IN
    SELECT miit.item_id, miit.quantity
    FROM menu_item_in_tickets miit
    WHERE miit.order_id = p_order_id
  LOOP
    UPDATE menu_items
    SET num_instock = num_instock + v_menu_ticket.quantity
    WHERE id = v_menu_ticket.item_id;
  END LOOP;

  -- ==========================================
  -- 6. RETURN RESULT
  -- ==========================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'order', v_order_result,
    'payment_status', 'REFUNDED',
    'ticket_status', 'CANCELED',
    'seat_status', 'AVAILABLE'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION refund_order_and_related_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION refund_order_and_related_data(TEXT) TO service_role;

COMMENT ON FUNCTION refund_order_and_related_data IS
'Atomic transaction hoàn tiền đơn hàng:
- Validate order exists and is in REFUND_PENDING status
- Update order payment_status to REFUNDED
- Cancel all tickets (ticket_status = CANCELED)
- Release all seats (status_seat = AVAILABLE)
- Restore stock for combo items and individual menu items
Nếu có lỗi ở bất kỳ bước nào → rollback toàn bộ.';


-- =====================================================
-- PREPARE PAYLOAD FOR CREATE ORDER
-- Tổng hợp dữ liệu từ các tham số đơn giản thành payload
-- đầy đủ cho hàm create trong order.service.js
-- =====================================================
DROP FUNCTION IF EXISTS prepare_payload_for_create(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT);

CREATE OR REPLACE FUNCTION prepare_payload_for_create(
  p_user_id TEXT,
  p_movie_id TEXT,
  p_show_time_id TEXT,
  p_show_time_seat_ids TEXT[],
  p_combo_ids TEXT[] DEFAULT '{}',
  p_menu_items JSONB DEFAULT '[]'::JSONB,
  p_payment_method TEXT DEFAULT 'CASH',
  p_event_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_day_type day_types;
  v_room_id TEXT;
  v_format_id TEXT;
  v_discount_id TEXT := NULL;
  v_discount_percent NUMERIC := 0;

  v_seat_id TEXT;
  v_seat_type_id TEXT;
  v_ticket_price_id TEXT;
  v_ticket_price NUMERIC;
  v_sts_id TEXT;

  v_tickets JSONB := '[]'::JSONB;
  v_total_ticket_price NUMERIC := 0;

  v_combo_id TEXT;
  v_combo_price NUMERIC;
  v_combos JSONB := '[]'::JSONB;
  v_total_combo_price NUMERIC := 0;

  v_mi JSONB;
  v_mi_id TEXT;
  v_mi_qty INT4;
  v_mi_unit_price NUMERIC;
  v_mi_total_price NUMERIC;
  v_menu_items_result JSONB := '[]'::JSONB;
  v_total_menu_price NUMERIC := 0;

  v_subtotal NUMERIC;
  v_total_price NUMERIC;
  v_service_vat NUMERIC := 0;
  v_service_vat_percent NUMERIC := 10;
BEGIN
  -- ==========================================
  -- 1. GET SHOWTIME INFO
  -- ==========================================
  SELECT st.start_time, st.end_time, st.day_type, st.room_id
  INTO v_start_time, v_end_time, v_day_type, v_room_id
  FROM show_times st
  WHERE st.id = p_show_time_id AND st.is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'ShowTime not found or inactive: ' || p_show_time_id);
  END IF;

  -- ==========================================
  -- 2. GET FORMAT FROM ROOM
  -- ==========================================
  SELECT r.format_id INTO v_format_id
  FROM rooms r
  WHERE r.id = v_room_id AND r.is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Room not found or inactive: ' || v_room_id);
  END IF;

  -- ==========================================
  -- 3. BUILD TICKETS (lookup ticket_price for each seat)
  -- ==========================================
  FOREACH v_sts_id IN ARRAY p_show_time_seat_ids
  LOOP
    -- Get seat_id and seat_type from show_time_seats → seats
    SELECT s.id, s.type
    INTO v_seat_id, v_seat_type_id
    FROM show_time_seats sts
    JOIN seats s ON s.id = sts.seat_id
    WHERE sts.id = v_sts_id
      AND sts.show_time_id = p_show_time_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', FALSE, 'error', 'ShowTimeSeat not found: ' || v_sts_id);
    END IF;

    -- Lookup ticket_price by (format_id, seat_type_id, day_type)
    SELECT tp.id, tp.price
    INTO v_ticket_price_id, v_ticket_price
    FROM ticket_prices tp
    WHERE tp.format_id = v_format_id
      AND tp.seat_type_id = v_seat_type_id
      AND tp.day_type = v_day_type
      AND tp.is_active = TRUE
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', FALSE, 'error',
        'Ticket price not found for format=' || v_format_id ||
        ', seat_type=' || v_seat_type_id ||
        ', day_type=' || v_day_type::TEXT);
    END IF;

    v_tickets := v_tickets || jsonb_build_object(
      'ticket_price_id', v_ticket_price_id,
      'showtime_seat_id', v_sts_id
    );
    v_total_ticket_price := v_total_ticket_price + v_ticket_price;
  END LOOP;

  -- ==========================================
  -- 4. BUILD COMBO ITEMS
  -- ==========================================
  IF array_length(p_combo_ids, 1) IS NOT NULL THEN
    FOREACH v_combo_id IN ARRAY p_combo_ids
    LOOP
      SELECT c.total_price INTO v_combo_price
      FROM combos c
      WHERE c.id = v_combo_id AND c.is_active = TRUE;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Combo not found or inactive: ' || v_combo_id);
      END IF;

      v_combos := v_combos || jsonb_build_object('combo_id', v_combo_id);
      v_total_combo_price := v_total_combo_price + v_combo_price;
    END LOOP;
  END IF;

  -- ==========================================
  -- 5. BUILD MENU ITEMS
  -- ==========================================
  IF p_menu_items IS NOT NULL
     AND jsonb_typeof(p_menu_items) = 'array'
     AND jsonb_array_length(p_menu_items) > 0 THEN

    FOR v_mi IN SELECT * FROM jsonb_array_elements(p_menu_items)
    LOOP
      v_mi_id := COALESCE(
        v_mi->>'menu_item_id',
        v_mi->>'menuItemId',
        v_mi->>'item_id',
        v_mi->>'id'
      );
      v_mi_qty := (v_mi->>'quantity')::INT4;

      SELECT mi.price INTO v_mi_unit_price
      FROM menu_items mi
      WHERE mi.id = v_mi_id AND mi.is_active = TRUE;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Menu item not found or inactive: ' || v_mi_id);
      END IF;

      v_mi_total_price := v_mi_unit_price * v_mi_qty;

      v_menu_items_result := v_menu_items_result || jsonb_build_object(
        'item_id', v_mi_id,
        'quantity', v_mi_qty,
        'unit_price', v_mi_unit_price,
        'total_price', v_mi_total_price
      );
      v_total_menu_price := v_total_menu_price + v_mi_total_price;
    END LOOP;
  END IF;

  -- ==========================================
  -- 6. LOOKUP DISCOUNT FROM EVENT (if provided)
  -- ==========================================
  IF p_event_id IS NOT NULL AND p_event_id != '' THEN
    SELECT d.id, d.discount_percent
    INTO v_discount_id, v_discount_percent
    FROM discounts d
    WHERE d.event_id = p_event_id
      AND d.is_active = TRUE
      -- AND (d.valid_from IS NULL OR d.valid_from::date <= CURRENT_DATE)
      -- AND (d.valid_to IS NULL OR d.valid_to::date >= CURRENT_DATE)
    ORDER BY d.created_at DESC
    LIMIT 1;
    -- If no valid discount found, discount stays 0
  END IF;

  -- ==========================================
  -- 7. CALCULATE TOTAL PRICE
  -- ==========================================
  v_subtotal := v_total_ticket_price + v_total_combo_price + v_total_menu_price;

  v_service_vat := ROUND(v_subtotal * (1 - v_discount_percent / 100) * v_service_vat_percent / 100.0);

  IF v_discount_percent > 0 THEN
    v_total_price := v_subtotal * (1 - v_discount_percent / 100) + v_service_vat;
  ELSE
    v_total_price := v_subtotal + v_service_vat;
  END IF;

  -- ==========================================
  -- 8. RETURN PAYLOAD
  -- ==========================================
  RETURN jsonb_build_object(
    'success', TRUE,
    'payload', jsonb_build_object(
      'order', jsonb_build_object(
        'user_id', p_user_id,
        'movie_id', p_movie_id,
        'payment_method', p_payment_method,
        'discount_id', v_discount_id,
        'service_vat', v_service_vat,
        'total_price', v_total_price
      ),
      'tickets', v_tickets,
      'comboItemInTickets', v_combos,
      'menuItemInTickets', v_menu_items_result,
      'showTime', jsonb_build_object(
        'start_time', v_start_time,
        'end_time', v_end_time
      )
    ),
    'breakdown', jsonb_build_object(
      'ticket_total', v_total_ticket_price,
      'combo_total', v_total_combo_price,
      'menu_item_total', v_total_menu_price,
      'subtotal', v_subtotal,
      'discount_percent', v_discount_percent,
      'discount_id', v_discount_id,
      'total_price', v_total_price
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION prepare_payload_for_create(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION prepare_payload_for_create(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION prepare_payload_for_create IS
'Tổng hợp dữ liệu từ các tham số đơn giản thành payload cho hàm create order:
- Lấy thông tin showtime (start_time, end_time, day_type)
- Tìm ticket_price cho mỗi ghế dựa trên format, seat_type, day_type
- Tổng hợp combo và menu items với giá
- Lookup discount từ event (nếu có)
- Tính total_price với discount
- Trả về payload đúng format cho order.service.create()';


-- =====================================================
-- GET BOOKING STATE DETAILS
-- Resolve full details from booking state IDs for UI confirmation
-- =====================================================
DROP FUNCTION IF EXISTS get_booking_state_details(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_booking_state_details(
  p_user_id TEXT,
  p_movie_id TEXT,
  p_show_time_id TEXT,
  p_show_time_seat_ids TEXT[] DEFAULT '{}',
  p_combo_ids TEXT[] DEFAULT '{}',
  p_menu_items JSONB DEFAULT '[]'::JSONB,
  p_event_id TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'CASH'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_movie JSONB;
  v_show_time JSONB;
  v_seats JSONB := '[]'::JSONB;
  v_combos JSONB := '[]'::JSONB;
  v_menu_items JSONB := '[]'::JSONB;
  v_event JSONB := NULL;
  v_discount JSONB := NULL;
  v_discount_percent NUMERIC := 0;
  v_ticket_total NUMERIC := 0;
  v_combo_total NUMERIC := 0;
  v_menu_total NUMERIC := 0;
  v_subtotal NUMERIC := 0;
  v_discount_amount NUMERIC := 0;
  v_service_vat_percent NUMERIC := 10;
  v_service_vat NUMERIC := 0;
  v_total NUMERIC := 0;
BEGIN
  -- Movie
  IF p_movie_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', m.id,
      'title', m.title,
      'director', m.director,
      'country', m.country,
      'description', m.description,
      'release_date', m.release_date,
      'duration', m.duration,
      'rating', m.rating,
      'trailer', m.trailer,
      'image', m.image,
      'thumbnail', m.thumbnail
    )
    INTO v_movie
    FROM movies m
    WHERE m.id = p_movie_id;
  END IF;

  -- Showtime + room + format
  IF p_show_time_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', st.id,
      'movie_id', st.movie_id,
      'room_id', st.room_id,
      'start_time', st.start_time,
      'end_time', st.end_time,
      'day_type', st.day_type,
      'room', jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'location', r.location,
        'format', jsonb_build_object(
          'id', f.id,
          'name', f.name
        )
      )
    )
    INTO v_show_time
    FROM show_times st
    LEFT JOIN rooms r ON r.id = st.room_id
    LEFT JOIN formats f ON f.id = r.format_id
    WHERE st.id = p_show_time_id;
  END IF;

  -- Selected seats with resolved ticket_price
  IF p_show_time_seat_ids IS NOT NULL AND array_length(p_show_time_seat_ids, 1) > 0 THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', sts.id,
          'show_time_id', sts.show_time_id,
          'seat_id', sts.seat_id,
          'status_seat', sts.status_seat,
          'seat', jsonb_build_object(
            'id', s.id,
            'seat_number', s.seat_number,
            'seat_type', jsonb_build_object(
              'id', stt.id,
              'name', stt.name,
              'type', stt.name
            )
          ),
          'ticket_price', jsonb_build_object(
            'id', tp.id,
            'price', COALESCE(tp.price, 0),
            'day_type', tp.day_type,
            'seat_type_id', tp.seat_type_id,
            'format_id', tp.format_id
          )
        )
      ),
      '[]'::JSONB
    ),
    COALESCE(SUM(COALESCE(tp.price, 0)), 0)
    INTO v_seats, v_ticket_total
    FROM show_time_seats sts
    LEFT JOIN seats s ON s.id = sts.seat_id
    LEFT JOIN seat_types stt ON stt.id = s.type
    LEFT JOIN show_times st ON st.id = sts.show_time_id
    LEFT JOIN rooms r ON r.id = st.room_id
    LEFT JOIN ticket_prices tp
      ON tp.format_id = r.format_id
      AND tp.seat_type_id = s.type
      AND tp.day_type = st.day_type
      AND tp.is_active = TRUE
    WHERE sts.id = ANY(p_show_time_seat_ids);
  END IF;

  -- Selected combos with combo items
  IF p_combo_ids IS NOT NULL AND array_length(p_combo_ids, 1) > 0 THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description,
          'total_price', COALESCE(c.total_price, 0),
          'image', c.image,
          'is_event_combo', c.is_event_combo,
          'combo_items', COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', ci.id,
                  'quantity', ci.quantity,
                  'unit_price', ci.unit_price,
                  'menu_item', jsonb_build_object(
                    'id', mi.id,
                    'name', mi.name,
                    'description', mi.description,
                    'price', mi.price,
                    'item_type', mi.item_type,
                    'image', mi.image
                  )
                )
              )
              FROM combo_items ci
              LEFT JOIN menu_items mi ON mi.id = ci.menu_item_id
              WHERE ci.combo_id = c.id
            ),
            '[]'::JSONB
          )
        )
      ),
      '[]'::JSONB
    ),
    COALESCE(SUM(COALESCE(c.total_price, 0)), 0)
    INTO v_combos, v_combo_total
    FROM combos c
    WHERE c.id = ANY(p_combo_ids);
  END IF;

  -- Selected menu items from JSONB [{menuItemId|menu_item_id|item_id|id, quantity}]
  IF p_menu_items IS NOT NULL AND jsonb_typeof(p_menu_items) = 'array' AND jsonb_array_length(p_menu_items) > 0 THEN
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'item_id', mi.id,
          'quantity', q.quantity,
          'unit_price', COALESCE(mi.price, 0),
          'total_price', COALESCE(mi.price, 0) * q.quantity,
          'item', jsonb_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', mi.description,
            'price', mi.price,
            'item_type', mi.item_type,
            'image', mi.image
          )
        )
      ),
      '[]'::JSONB
    ),
    COALESCE(SUM(COALESCE(mi.price, 0) * q.quantity), 0)
    INTO v_menu_items, v_menu_total
    FROM (
      SELECT
        COALESCE(
          elem->>'menuItemId',
          elem->>'menu_item_id',
          elem->>'item_id',
          elem->>'id'
        ) AS item_id,
        GREATEST(COALESCE((elem->>'quantity')::INT, 1), 1) AS quantity
      FROM jsonb_array_elements(p_menu_items) elem
      WHERE COALESCE(
        elem->>'menuItemId',
        elem->>'menu_item_id',
        elem->>'item_id',
        elem->>'id'
      ) IS NOT NULL
    ) q
    JOIN menu_items mi ON mi.id = q.item_id;
  END IF;

  -- Event + active discount
  IF p_event_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', e.id,
      'name', e.name,
      'description', e.description,
      'start_date', e.start_date,
      'end_date', e.end_date,
      'image', e.image,
      'only_at_counter', e.only_at_counter,
      'event_type', jsonb_build_object(
        'id', et.id,
        'name', et.name
      )
    )
    INTO v_event
    FROM events e
    LEFT JOIN event_types et ON et.id = e.event_type_id
    WHERE e.id = p_event_id;

    SELECT jsonb_build_object(
      'id', d.id,
      'name', d.name,
      'description', d.description,
      'discount_percent', d.discount_percent,
      'valid_from', d.valid_from,
      'valid_to', d.valid_to,
      'is_active', d.is_active
    ),
    COALESCE(d.discount_percent, 0)
    INTO v_discount, v_discount_percent
    FROM discounts d
    WHERE d.event_id = p_event_id
      AND d.is_active = TRUE
      AND (d.valid_from IS NULL OR d.valid_from::date <= CURRENT_DATE)
      AND (d.valid_to IS NULL OR d.valid_to::date >= CURRENT_DATE)
    ORDER BY d.created_at DESC
    LIMIT 1;
  END IF;

  -- Totals breakdown
  v_subtotal := COALESCE(v_ticket_total, 0) + COALESCE(v_combo_total, 0) + COALESCE(v_menu_total, 0);
  v_discount_amount := ROUND(v_subtotal * COALESCE(v_discount_percent, 0) / 100.0);
  v_service_vat := ROUND((v_subtotal - v_discount_amount) * v_service_vat_percent / 100.0);
  v_total := (v_subtotal - v_discount_amount) + v_service_vat;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'payment_method', COALESCE(NULLIF(p_payment_method, ''), 'CASH'),
    'movie', v_movie,
    'show_time', v_show_time,
    'show_time_seats', v_seats,
    'combos', v_combos,
    'menu_items', v_menu_items,
    'event', v_event,
    'discount', v_discount,
    'breakdown', jsonb_build_object(
      'ticket_total', COALESCE(v_ticket_total, 0),
      'combo_total', COALESCE(v_combo_total, 0),
      'menu_total', COALESCE(v_menu_total, 0),
      'subtotal', COALESCE(v_subtotal, 0),
      'discount_percent', COALESCE(v_discount_percent, 0),
      'discount_amount', COALESCE(v_discount_amount, 0),
      'service_vat_percent', v_service_vat_percent,
      'service_vat', COALESCE(v_service_vat, 0),
      'total', COALESCE(v_total, 0)
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION get_booking_state_details(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_state_details(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT) TO service_role;

COMMENT ON FUNCTION get_booking_state_details(TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB, TEXT, TEXT) IS
'Resolve full details from AI booking state IDs for confirmation UI:
- Movie, showtime, seats and resolved ticket prices
- Selected combos with combo items
- Selected menu items with quantities and totals
- Event/discount and computed breakdown totals';