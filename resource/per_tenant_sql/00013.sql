-- +goose Up
CREATE OR REPLACE FUNCTION fn_capitalize_proper_noun(input TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    word TEXT;
BEGIN
    FOR word IN SELECT unnest(string_to_array(lower(input), ' ')) LOOP
        result := result || initcap(word) || ' ';
    END LOOP;

    RETURN rtrim(result); -- remove trailing space
END;
$$ LANGUAGE plpgsql IMMUTABLE;
