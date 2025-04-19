-- Step 0: Ensure a system user exists (user_id = 1 or fallback)
INSERT INTO tb_user (
    username, email, password_hash, salt, google_id,
    given_name, family_name, picture_url, auth_provider, is_active
)
SELECT
    'system', 'system@example.com', 'placeholder', 'placeholder', NULL,
    'System', 'User', NULL, 'local', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM tb_user WHERE user_id = 1
);

-- Step 1: Create the unit table
CREATE TABLE IF NOT EXISTS tb_unit_of_measure (
    unit_id SERIAL PRIMARY KEY,
    unit_description TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES tb_user(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert default unit (for existing items)
INSERT INTO tb_unit_of_measure (unit_description, owner_id)
VALUES ('Unspecified', 1)
RETURNING unit_id;

-- Step 3: Add nullable column to tb_item
ALTER TABLE tb_item
ADD COLUMN unit_id INTEGER;

-- Step 4: Set all existing rows to default unit_id
UPDATE tb_item
SET unit_id = 1;

-- Step 5: Make the column NOT NULL
ALTER TABLE tb_item
ALTER COLUMN unit_id SET NOT NULL;

-- Step 6: Add FK constraint
ALTER TABLE tb_item
ADD CONSTRAINT fk_item_unit
FOREIGN KEY (unit_id) REFERENCES tb_unit_of_measure(unit_id);
