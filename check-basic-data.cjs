const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btiyyxmiwngikpuygpsq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aXl5eG1pd25naWtwdXlncHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzA0MDUsImV4cCI6MjA3NDc0NjQwNX0.4tt9SZ0VRsCObhvTKJzqb1IEkfGwi8IL_yI8PHjMvdo'
);

async function checkBasicData() {
  try {
    console.log('🔍 Checking basic data in database...\n');
    
    // Check workspaces
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .limit(5);
    
    if (workspaceError) {
      console.log(`❌ Workspaces: ${workspaceError.message}`);
    } else {
      console.log(`✅ Workspaces: ${workspaces.length} found`);
      if (workspaces.length > 0) {
        console.log(`   First workspace: ${workspaces[0].name} (${workspaces[0].id})`);
      }
    }
    
    // Check boards
    const { data: boards, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .limit(5);
    
    if (boardError) {
      console.log(`❌ Boards: ${boardError.message}`);
    } else {
      console.log(`✅ Boards: ${boards.length} found`);
      if (boards.length > 0) {
        console.log(`   First board: ${boards[0].name} (${boards[0].id})`);
      }
    }
    
    // Check lists
    const { data: lists, error: listError } = await supabase
      .from('lists')
      .select('*')
      .limit(5);
    
    if (listError) {
      console.log(`❌ Lists: ${listError.message}`);
    } else {
      console.log(`✅ Lists: ${lists.length} found`);
    }
    
    // Check cards
    const { data: cards, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .limit(5);
    
    if (cardError) {
      console.log(`❌ Cards: ${cardError.message}`);
    } else {
      console.log(`✅ Cards: ${cards.length} found`);
    }
    
    // Check if we're authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log(`\n🔐 Authentication: ${user ? 'Authenticated as ' + user.email : 'Not authenticated'}`);
    
  } catch (error) {
    console.error('Check failed:', error.message);
  }
}

checkBasicData();