-- Step 1: Create the unit table
CREATE TABLE IF NOT EXISTS tb_unit_of_measure (
    unit_id SERIAL PRIMARY KEY,
    unit_description TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES tb_user(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tb_item
ADD COLUMN unit_id INTEGER;

ALTER TABLE tb_item
ALTER COLUMN unit_id SET NOT NULL;

ALTER TABLE tb_item
ADD CONSTRAINT fk_item_unit
FOREIGN KEY (unit_id) REFERENCES tb_unit_of_measure(unit_id);
