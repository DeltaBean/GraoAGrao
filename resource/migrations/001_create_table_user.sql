CREATE TABLE IF NOT EXISTS tb_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,                -- Nullable for OAuth users
    salt TEXT,                         -- Salt for hashing (only for local users)
    google_id VARCHAR(100),            -- Stores Google-specific user ID
    given_name VARCHAR(255),
    family_name VARCHAR(255),
    picture_url TEXT,                  -- Profile picture URL from OAuth or uploaded
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',  -- 'google', 'local', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_provider_id UNIQUE (auth_provider, google_id)  -- Ensures uniqueness across providers
);
