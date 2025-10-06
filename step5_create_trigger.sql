-- Step 5: Create trigger
DROP TRIGGER IF EXISTS update_card_sections_updated_at ON card_sections;

CREATE TRIGGER update_card_sections_updated_at BEFORE UPDATE ON card_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();