CREATE OR REPLACE VIEW public.movie_now_showing AS
SELECT
    m.*,
    MIN(s.start_time) AS first_show_time,
    MAX(s.start_time) AS last_show_time,
    'NOW_SHOWING' AS show_status
FROM public.movies m
JOIN public.show_times s 
    ON s.movie_id = m.id
WHERE m.is_active = true
  AND s.is_active = true
GROUP BY m.id
HAVING NOW() BETWEEN MIN(s.start_time) AND MAX(s.start_time);

CREATE OR REPLACE VIEW public.movie_coming_soon AS
SELECT
    m.*,
    MIN(s.start_time) AS first_show_time,
    MAX(s.start_time) AS last_show_time,
    'COMING_SOON' AS show_status
FROM public.movies m
JOIN public.show_times s 
    ON s.movie_id = m.id
WHERE m.is_active = true
  AND s.is_active = true
GROUP BY m.id
HAVING NOW() < MIN(s.start_time);
