-- =====================================================
-- SUPABASE CRONJOBS FOR CINEMA MANAGEMENT SYSTEM
-- Auto-deactivate expired items daily
-- =====================================================

-- Enable pg_cron extension (run this first if not enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- 1. FUNCTION: Deactivate expired ShowTimes
-- Check show_times where end_time < NOW()
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_show_times()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE show_times
    SET is_active = FALSE
    WHERE is_active = TRUE
      AND end_time < NOW();
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RAISE NOTICE 'Deactivated % expired show_times', affected_rows;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNCTION: Deactivate expired Events
-- Check events where end_date < CURRENT_DATE
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_events()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE events
    SET is_active = FALSE
    WHERE is_active = TRUE
      AND end_date < CURRENT_DATE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RAISE NOTICE 'Deactivated % expired events', affected_rows;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNCTION: Deactivate expired Discounts
-- Check discounts where valid_to < CURRENT_DATE
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_discounts()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE discounts
    SET is_active = FALSE
    WHERE is_active = TRUE
      AND valid_to < CURRENT_DATE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RAISE NOTICE 'Deactivated % expired discounts', affected_rows;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCTION: Deactivate expired Combos
-- Combo is considered expired when ALL its linked events are expired/inactive
-- If combo has no events, it stays active (manually managed)
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_combos()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Deactivate combos where ALL linked events are inactive or expired
    UPDATE combos c
    SET is_active = FALSE
    WHERE c.is_active = TRUE
      AND EXISTS (
          -- Combo must have at least one event linked
          SELECT 1 FROM combo_events ce WHERE ce.combo_id = c.id
      )
      AND NOT EXISTS (
          -- No active events linked to this combo
          SELECT 1 
          FROM combo_events ce
          JOIN events e ON ce.event_id = e.id
          WHERE ce.combo_id = c.id
            AND e.is_active = TRUE
            AND e.end_date >= CURRENT_DATE
      );
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RAISE NOTICE 'Deactivated % expired combos', affected_rows;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. MASTER FUNCTION: Run all deactivation tasks
-- This function calls all individual deactivation functions
-- =====================================================
CREATE OR REPLACE FUNCTION run_daily_deactivation_tasks()
RETURNS TABLE (
    task_name TEXT,
    rows_affected INTEGER,
    executed_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Deactivate expired show_times
    RETURN QUERY
    SELECT 
        'show_times'::TEXT,
        deactivate_expired_show_times(),
        NOW();
    
    -- Deactivate expired events
    RETURN QUERY
    SELECT 
        'events'::TEXT,
        deactivate_expired_events(),
        NOW();
    
    -- Deactivate expired discounts
    RETURN QUERY
    SELECT 
        'discounts'::TEXT,
        deactivate_expired_discounts(),
        NOW();
    
    -- Deactivate expired combos (after events are deactivated)
    RETURN QUERY
    SELECT 
        'combos'::TEXT,
        deactivate_expired_combos(),
        NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULING WITH pg_cron (Supabase Pro/Enterprise)
-- Run daily at 00:05 AM (Vietnam timezone UTC+7)
-- =====================================================

-- Note: pg_cron uses UTC timezone
-- Vietnam is UTC+7, so 00:05 AM Vietnam = 17:05 UTC (previous day)

-- Schedule the master job to run daily
-- SELECT cron.schedule(
--     'daily-deactivation-job',           -- job name
--     '5 17 * * *',                        -- cron expression: 17:05 UTC = 00:05 Vietnam
--     $$SELECT run_daily_deactivation_tasks()$$
-- );

-- =====================================================
-- ALTERNATIVE: Individual job scheduling
-- =====================================================

-- Schedule show_times deactivation
-- SELECT cron.schedule(
--     'deactivate-expired-showtimes',
--     '5 17 * * *',
--     $$SELECT deactivate_expired_show_times()$$
-- );

-- Schedule events deactivation
-- SELECT cron.schedule(
--     'deactivate-expired-events',
--     '6 17 * * *',
--     $$SELECT deactivate_expired_events()$$
-- );

-- Schedule discounts deactivation
-- SELECT cron.schedule(
--     'deactivate-expired-discounts',
--     '7 17 * * *',
--     $$SELECT deactivate_expired_discounts()$$
-- );

-- Schedule combos deactivation (after events)
-- SELECT cron.schedule(
--     'deactivate-expired-combos',
--     '10 17 * * *',
--     $$SELECT deactivate_expired_combos()$$
-- );

-- =====================================================
-- UTILITY: View scheduled jobs
-- =====================================================
-- SELECT * FROM cron.job;

-- =====================================================
-- UTILITY: View job execution history
-- =====================================================
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- =====================================================
-- UTILITY: Unschedule a job
-- =====================================================
-- SELECT cron.unschedule('daily-deactivation-job');

-- =====================================================
-- MANUAL TEST: Run the master function directly
-- =====================================================
-- SELECT * FROM run_daily_deactivation_tasks();
