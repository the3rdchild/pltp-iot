-- Migration 005: Create ai2 table
-- Stores AI predictions for dryness and NCG from edge computing

CREATE TABLE IF NOT EXISTS ai2 (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100),
    dryness_predict DECIMAL(10, 4),
    dryness_confidence DECIMAL(5, 4),
    dryness_mae DECIMAL(10, 4),
    ncg_predict DECIMAL(10, 4),
    ncg_confidence DECIMAL(5, 4),
    ncg_mae DECIMAL(10, 4),
    status VARCHAR(50) DEFAULT 'normal',
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai2_processed_at ON ai2(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai2_status ON ai2(status);
