CREATE OR REPLACE FUNCTION update_movie_rating_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM recalculate_movie_rating(
        COALESCE(NEW.movie_id, OLD.movie_id)
    );
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_movie_rating
AFTER INSERT OR UPDATE OR DELETE
ON rates
FOR EACH ROW
EXECUTE FUNCTION update_movie_rating_trigger();
