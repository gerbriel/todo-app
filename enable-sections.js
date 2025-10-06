import fs from 'fs'

console.log('🔄 Re-enabling sections functionality...')

const filePath = './src/components/ui/SafeCardEditModal.tsx'

try {
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Find and replace the disabled sections query
  const oldPattern = `  // Load sections - TEMPORARILY DISABLED until table is created
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['cardSections', card.id],
    queryFn: () => sectionsApi.getSections(card.id),
    enabled: false, // Disabled until card_sections table is created
  })`
  
  const newPattern = `  // Load sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['cardSections', card.id],
    queryFn: () => sectionsApi.getSections(card.id),
    enabled: isOpen && !!card.id,
  })`
  
  if (content.includes('enabled: false')) {
    content = content.replace(oldPattern, newPattern)
    fs.writeFileSync(filePath, content)
    console.log('✅ Sections functionality re-enabled!')
    console.log('🎉 You can now use drag-and-drop sections in your card editor!')
  } else {
    console.log('ℹ️ Sections are already enabled.')
  }
  
} catch (error) {
  console.error('❌ Error re-enabling sections:', error)
}