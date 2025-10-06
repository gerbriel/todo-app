// Test database access for lists table
console.log('Testing database access...')

// Create a simple test function we can run in the browser console
window.testDatabaseAccess = async function() {
  try {
    console.log('Testing basic lists query...')
    
    // Test 1: Basic lists query
    const { data: allLists, error: allListsError } = await window.supabase
      .from('lists')
      .select('*')
      .limit(5)
    
    if (allListsError) {
      console.error('Error querying all lists:', allListsError)
    } else {
      console.log('All lists (first 5):', allLists)
      
      if (allLists && allLists.length > 0) {
        const firstList = allLists[0]
        console.log('First list structure:', Object.keys(firstList))
        
        // Test 2: Query by board_id
        console.log('Testing board_id query...')
        const { data: boardLists, error: boardError } = await window.supabase
          .from('lists')
          .select('*')
          .eq('board_id', firstList.board_id)
        
        if (boardError) {
          console.error('Error querying by board_id:', boardError)
        } else {
          console.log('Lists for board:', boardLists)
        }
        
        // Test 3: Query by name
        console.log('Testing name query...')
        const { data: namedLists, error: nameError } = await window.supabase
          .from('lists')
          .select('*')
          .eq('name', firstList.name)
        
        if (nameError) {
          console.error('Error querying by name:', nameError)
        } else {
          console.log('Lists with name:', namedLists)
        }
        
        // Test 4: Combined query (the problematic one)
        console.log('Testing combined query...')
        const { data: combinedLists, error: combinedError } = await window.supabase
          .from('lists')
          .select('*')
          .eq('board_id', firstList.board_id)
          .eq('name', 'Archived Items')
        
        if (combinedError) {
          console.error('Error with combined query:', combinedError)
        } else {
          console.log('Combined query result:', combinedLists)
        }
      }
    }
    
    // Test 5: Check current user
    const { data: user, error: userError } = await window.supabase.auth.getUser()
    if (userError) {
      console.error('Auth error:', userError)
    } else {
      console.log('Current user:', user?.user?.email)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

console.log('Test function created. Run window.testDatabaseAccess() in the browser console.')