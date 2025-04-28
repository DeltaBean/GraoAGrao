-- applying description capitalization for tb_item
CREATE OR REPLACE FUNCTION trg_capitalize_item_description()
RETURNS TRIGGER AS $$
BEGIN
    NEW.item_description := fn_capitalize_proper_noun(NEW.item_description);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_capitalize_item_description on tb_item;
CREATE TRIGGER trg_capitalize_item_description
BEFORE INSERT OR UPDATE ON tb_item
FOR EACH ROW
EXECUTE FUNCTION trg_capitalize_item_description();



-- applying description capitalization for tb_category
CREATE OR REPLACE FUNCTION trg_capitalize_category_description()
RETURNS TRIGGER AS $$
BEGIN
    NEW.category_description := fn_capitalize_proper_noun(NEW.category_description);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_capitalize_category_description ON tb_category;
CREATE TRIGGER trg_capitalize_category_description
BEFORE INSERT OR UPDATE ON tb_category
FOR EACH ROW
EXECUTE FUNCTION trg_capitalize_category_description();



-- applying description capitalization for tb_item_packaging
CREATE OR REPLACE FUNCTION trg_capitalize_item_packaging_description()
RETURNS TRIGGER AS $$
BEGIN
    NEW.item_packaging_description := fn_capitalize_proper_noun(NEW.item_packaging_description);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_capitalize_item_packaging_description ON tb_item_packaging;
CREATE TRIGGER trg_capitalize_item_packaging_description
BEFORE INSERT OR UPDATE ON tb_item_packaging
FOR EACH ROW
EXECUTE FUNCTION trg_capitalize_item_packaging_description();




-- applying description capitalization for tb_unit_of_measure
CREATE OR REPLACE FUNCTION trg_capitalize_unit_of_measure_description()
RETURNS TRIGGER AS $$
BEGIN
    NEW.unit_description := fn_capitalize_proper_noun(NEW.unit_description);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_capitalize_unit_of_measure_description ON tb_unit_of_measure;
CREATE TRIGGER trg_capitalize_unit_of_measure_description
BEFORE INSERT OR UPDATE ON tb_unit_of_measure
FOR EACH ROW
EXECUTE FUNCTION trg_capitalize_unit_of_measure_description();
