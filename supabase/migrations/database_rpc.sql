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
    COUNT(DISTINCT o.id)::BIGINT AS tickets,
    COALESCE(m.rating, 0)::NUMERIC AS rating
  FROM movies m
  INNER JOIN orders o ON o.movie_id = m.id 
    AND o.payment_status = 'COMPLETED'
    AND EXTRACT(MONTH FROM o.created_at) = p_month
    AND EXTRACT(YEAR FROM o.created_at) = p_year
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
