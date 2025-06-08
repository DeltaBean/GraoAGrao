CREATE TABLE tb_stock_waste (
    stock_waste_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    wasted_quantity NUMERIC(10,2) NOT NULL CHECK (wasted_quantity > 0),
    reason_text TEXT NOT NULL,
    reason_image_url text, -- Stores the URL to the uploaded image (e.g. S3 or Cloud Storage)
    created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_stock_waste_item FOREIGN KEY (item_id) REFERENCES tb_item(item_id),
    CONSTRAINT fk_stock_waste_user FOREIGN KEY (created_by) REFERENCES public.tb_user(user_id)
);
