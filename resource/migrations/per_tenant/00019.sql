-- +goose Up
-- Step 1: Add column as nullable initially
ALTER TABLE tb_item
ADD COLUMN is_fractionable BOOLEAN;

-- Step 2: Set all existing rows to true
UPDATE tb_item
SET is_fractionable = true;

-- Step 3: Set NOT NULL constraint
ALTER TABLE tb_item
ALTER COLUMN is_fractionable SET NOT NULL;