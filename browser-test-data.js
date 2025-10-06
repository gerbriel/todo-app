// Browser console script to create test data
// Copy and paste this into your browser console when the app is open

async function createTestDataInBrowser() {
  console.log('🚀 Creating test data in browser...');
  
  // Use the supabase client from the window object
  const supabase = window.supabase;
  
  if (!supabase) {
    console.error('❌ Supabase client not found. Make sure the app is loaded.');
    return;
  }
  
  try {
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.email || 'Not authenticated');
    
    // If not authenticated, create an anonymous session
    if (!user) {
      console.log('🔐 Creating anonymous session...');
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Auth error:', error);
        return;
      }
      console.log('✅ Anonymous session created');
    }
    
    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Demo Workspace',
        description: 'Test workspace for drag-and-drop sections'
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.error('❌ Workspace error:', workspaceError);
      return;
    }
    console.log('✅ Workspace created:', workspace.name);
    
    // Create board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        workspace_id: workspace.id,
        name: 'Drag & Drop Test Board',
        description: 'Board for testing sections',
        position: 1
      })
      .select()
      .single();
    
    if (boardError) {
      console.error('❌ Board error:', boardError);
      return;
    }
    console.log('✅ Board created:', board.name);
    
    // Create lists
    const { data: list, error: listError } = await supabase
      .from('lists')
      .insert({
        board_id: board.id,
        name: 'Test Cards',
        position: 1
      })
      .select()
      .single();
    
    if (listError) {
      console.error('❌ List error:', listError);
      return;
    }
    console.log('✅ List created:', list.name);
    
    // Create test card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        list_id: list.id,
        title: 'Test Card with Draggable Sections',
        description: 'Click to open and test drag-and-drop sections!',
        position: 1
      })
      .select()
      .single();
    
    if (cardError) {
      console.error('❌ Card error:', cardError);
      return;
    }
    console.log('✅ Card created:', card.title);
    
    // Create sample sections
    const sections = [
      {
        title: 'Text Section',
        content: 'This is a draggable text section!',
        section_type: 'text',
        position: 1
      },
      {
        title: 'Checklist Section',
        content: JSON.stringify({
          items: [
            { text: 'Test drag and drop', completed: true },
            { text: 'Reorder sections', completed: false }
          ]
        }),
        section_type: 'checklist',
        position: 2
      },
      {
        title: 'Notes Section',
        content: 'Try dragging these sections up and down using the drag handles!',
        section_type: 'notes',
        position: 3
      }
    ];
    
    for (const sectionData of sections) {
      const { error: sectionError } = await supabase
        .from('card_sections')
        .insert({
          card_id: card.id,
          ...sectionData
        });
      
      if (sectionError) {
        console.error('❌ Section error:', sectionError);
      } else {
        console.log('✅ Section created:', sectionData.title);
      }
    }
    
    console.log('\\n🎉 Test data created successfully!');
    console.log('Refresh the page and click on the test card to see drag-and-drop sections!');
    
    // Refresh the page to show new data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

// Run the function
createTestDataInBrowser();