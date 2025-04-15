-- Step 1: Drop the 'category' column
ALTER TABLE tb_item
DROP COLUMN IF EXISTS category;

-- Step 2: Add 'category_id' column as INTEGER
ALTER TABLE tb_item
ADD COLUMN category_id INTEGER;

-- Step 3: Add foreign key constraint to tb_category
ALTER TABLE tb_item
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id)
REFERENCES tb_category(category_id);