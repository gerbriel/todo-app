-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_card_sections_card_id ON card_sections(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sections_position ON card_sections(card_id, position);