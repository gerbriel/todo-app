import { supabase } from '../src/lib/supabase.js'

async function setupDatabase() {
  console.log('🚀 Setting up Custom Fields and Time Tracking tables...')

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('workspaces')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return
    }

    console.log('✅ Database connection successful')

    // Check if tables already exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_list')
      .single()

    // Create custom_fields table
    console.log('📋 Creating custom_fields table...')
    const { error: customFieldsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS custom_fields (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
          name text NOT NULL,
          field_type text NOT NULL,
          options jsonb,
          required boolean DEFAULT false,
          default_value text,
          placeholder text,
          help_text text,
          position integer DEFAULT 0,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })

    if (customFieldsError) {
      console.error('❌ Error creating custom_fields table:', customFieldsError)
    } else {
      console.log('✅ custom_fields table created')
    }

    // Create custom_field_values table
    console.log('📋 Creating custom_field_values table...')
    const { error: valuesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS custom_field_values (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
          custom_field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
          value text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(card_id, custom_field_id)
        );
      `
    })

    if (valuesError) {
      console.error('❌ Error creating custom_field_values table:', valuesError)
    } else {
      console.log('✅ custom_field_values table created')
    }

    // Create time_entries table
    console.log('⏱️ Creating time_entries table...')
    const { error: timeError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS time_entries (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
          user_id uuid REFERENCES auth.users(id),
          description text,
          hours decimal(10,2) NOT NULL DEFAULT 0,
          billable boolean DEFAULT true,
          hourly_rate decimal(10,2),
          start_time timestamptz,
          end_time timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })

    if (timeError) {
      console.error('❌ Error creating time_entries table:', timeError)
    } else {
      console.log('✅ time_entries table created')
    }

    console.log('🎉 Database setup completed!')
    console.log('💡 You can now enable custom fields and time tracking in the app')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

// Run setup
setupDatabase()