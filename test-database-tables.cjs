const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btiyyxmiwngikpuygpsq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aXl5eG1pd25naWtwdXlncHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MTc0MTMsImV4cCI6MjA0MjQ5MzQxM30.ixEpJmIBfF1kZEKoGO2H5rZr9o0Ux0qX-WJIgJhFsJ0'
);

async function testTables() {
  try {
    console.log('🔍 Testing database tables...\n');
    
    // Test each table individually
    const tables = ['card_sections', 'custom_fields', 'card_custom_field_values', 'time_entries'];
    
    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: accessible (${count} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n🔍 Testing a sample card_sections query...');
    
    // Test inserting a sample section (will fail gracefully if no cards exist)
    const { data: cards } = await supabase
      .from('cards')
      .select('id')
      .limit(1);
    
    if (cards && cards.length > 0) {
      console.log(`Found card ID: ${cards[0].id}`);
      
      // Try to query sections for this card
      const { data: sections, error: sectionsError } = await supabase
        .from('card_sections')
        .select('*')
        .eq('card_id', cards[0].id);
      
      if (sectionsError) {
        console.log(`❌ Error querying card sections: ${sectionsError.message}`);
      } else {
        console.log(`✅ Card sections query successful: ${sections.length} sections found`);
      }
    } else {
      console.log('No cards found in database');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTables();