CREATE OR REPLACE FUNCTION fn_capitalize_sentences(input TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    sentence TEXT;
    sentences TEXT[];
    i INT;
BEGIN
    sentences := regexp_split_to_array(trim(input), '[.!?]\s*');

    FOR i IN array_lower(sentences, 1)..array_upper(sentences, 1) LOOP
        IF trim(sentences[i]) <> '' THEN
            result := result ||
                      initcap(left(trim(sentences[i]), 1)) ||
                      lower(substr(trim(sentences[i]), 2)) ||
                      '. ';
        END IF;
    END LOOP;

    RETURN rtrim(result);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
