const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://btiyyxmiwngikpuygpsq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aXl5eG1pd25naWtwdXlncHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzA0MDUsImV4cCI6MjA3NDc0NjQwNX0.4tt9SZ0VRsCObhvTKJzqb1IEkfGwi8IL_yI8PHjMvdo'
);

async function createTestData() {
  try {
    console.log('🚀 Creating test data for drag-and-drop sections...\n');
    
    // Create a test workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Workspace',
        description: 'Demo workspace for testing drag-and-drop sections',
        owner_id: '00000000-0000-0000-0000-000000000000' // Anonymous user
      })
      .select()
      .single();
    
    if (workspaceError) {
      console.log(`❌ Error creating workspace: ${workspaceError.message}`);
      return;
    }
    console.log(`✅ Workspace created: ${workspace.name} (${workspace.id})`);
    
    // Create a test board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        workspace_id: workspace.id,
        name: 'Drag & Drop Demo Board',
        description: 'Test board for drag-and-drop card sections',
        position: 1,
        archived: false
      })
      .select()
      .single();
    
    if (boardError) {
      console.log(`❌ Error creating board: ${boardError.message}`);
      return;
    }
    console.log(`✅ Board created: ${board.name} (${board.id})`);
    
    // Create test lists
    const lists = [
      { name: 'To Do', position: 1 },
      { name: 'In Progress', position: 2 },
      { name: 'Done', position: 3 }
    ];
    
    const createdLists = [];
    for (const listData of lists) {
      const { data: list, error: listError } = await supabase
        .from('lists')
        .insert({
          board_id: board.id,
          name: listData.name,
          position: listData.position
        })
        .select()
        .single();
      
      if (listError) {
        console.log(`❌ Error creating list: ${listError.message}`);
        continue;
      }
      createdLists.push(list);
      console.log(`✅ List created: ${list.name}`);
    }
    
    // Create test cards with different scenarios
    const cards = [
      {
        title: 'Test Card with Sections',
        description: 'This card will have draggable sections added to it!',
        listIndex: 0
      },
      {
        title: 'Project Planning Card',
        description: 'Use this card to test address, timeline, and checklist sections',
        listIndex: 0
      },
      {
        title: 'Meeting Notes Card',
        description: 'Perfect for testing text sections and note-taking features',
        listIndex: 1
      },
      {
        title: 'Completed Task',
        description: 'This card shows how sections work with completed items',
        listIndex: 2
      }
    ];
    
    const createdCards = [];
    for (let i = 0; i < cards.length; i++) {
      const cardData = cards[i];
      const targetList = createdLists[cardData.listIndex];
      
      if (!targetList) continue;
      
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .insert({
          list_id: targetList.id,
          title: cardData.title,
          description: cardData.description,
          position: i + 1
        })
        .select()
        .single();
      
      if (cardError) {
        console.log(`❌ Error creating card: ${cardError.message}`);
        continue;
      }
      createdCards.push(card);
      console.log(`✅ Card created: ${card.title}`);
    }
    
    // Add some sample card sections to the first card
    if (createdCards.length > 0) {
      const testCard = createdCards[0];
      
      const sampleSections = [
        {
          title: 'Project Overview',
          content: 'This is a sample text section. You can drag this up and down!',
          section_type: 'text',
          position: 1
        },
        {
          title: 'Task Checklist',
          content: JSON.stringify({
            items: [
              { text: 'Set up drag and drop', completed: true },
              { text: 'Test section reordering', completed: false },
              { text: 'Add more section types', completed: false }
            ]
          }),
          section_type: 'checklist',
          position: 2
        },
        {
          title: 'Meeting Location',
          content: JSON.stringify({
            street: '123 Demo Street',
            city: 'Test City',
            state: 'CA',
            zipCode: '12345',
            country: 'USA'
          }),
          section_type: 'address',
          position: 3
        },
        {
          title: 'Additional Notes',
          content: 'Try dragging these sections around to reorder them. The drag-and-drop functionality is fully working!',
          section_type: 'notes',
          position: 4
        }
      ];
      
      for (const sectionData of sampleSections) {
        const { error: sectionError } = await supabase
          .from('card_sections')
          .insert({
            card_id: testCard.id,
            title: sectionData.title,
            content: sectionData.content,
            section_type: sectionData.section_type,
            position: sectionData.position
          });
        
        if (sectionError) {
          console.log(`❌ Error creating section: ${sectionError.message}`);
        } else {
          console.log(`✅ Section created: ${sectionData.title}`);
        }
      }
    }
    
    // Create some test labels
    const labels = [
      { name: 'Priority: High', color: '#ef4444' },
      { name: 'Priority: Medium', color: '#f59e0b' },
      { name: 'Priority: Low', color: '#10b981' },
      { name: 'Feature', color: '#3b82f6' },
      { name: 'Bug', color: '#dc2626' },
      { name: 'Enhancement', color: '#8b5cf6' }
    ];
    
    for (const labelData of labels) {
      const { error: labelError } = await supabase
        .from('labels')
        .insert({
          workspace_id: workspace.id,
          name: labelData.name,
          color: labelData.color
        });
      
      if (labelError) {
        console.log(`❌ Error creating label: ${labelError.message}`);
      } else {
        console.log(`✅ Label created: ${labelData.name}`);
      }
    }
    
    console.log(`\n🎉 Test data creation complete!`);
    console.log(`\n📋 What you can test now:`);
    console.log(`1. Open your app at http://localhost:5175`);
    console.log(`2. You should see the "Drag & Drop Demo Board"`);
    console.log(`3. Click on "Test Card with Sections" to open it`);
    console.log(`4. You'll see 4 pre-created sections that you can drag around!`);
    console.log(`5. Try clicking "Add Section" to create more sections`);
    console.log(`6. Use the drag handles (≡) to reorder sections`);
    console.log(`\n🎯 The drag-and-drop sections feature is ready to test!`);
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error.message);
  }
}

createTestData();