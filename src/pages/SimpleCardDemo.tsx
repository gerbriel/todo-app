import { useState } from 'react'
import { SimpleCardModal } from '../components/ui/SimpleCardModal'

interface SimpleCard {
  id: string
  title: string
  description: string
}

interface CardSection {
  id: string
  title: string
  content: string
  type: 'text' | 'checklist' | 'notes'
  position: number
}

export function SimpleCardDemo() {
  const [cards, setCards] = useState<SimpleCard[]>([
    {
      id: '1',
      title: 'Demo Card - Test Drag & Drop',
      description: 'Click to open and test drag-and-drop sections! This works completely offline.'
    },
    {
      id: '2',
      title: 'Project Planning Card',
      description: 'Perfect for organizing tasks with draggable sections'
    },
    {
      id: '3',
      title: 'Meeting Notes',
      description: 'Add sections for agenda, notes, action items, etc.'
    }
  ])

  const [selectedCard, setSelectedCard] = useState<SimpleCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openCard = (card: SimpleCard) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
  }

  const handleSave = (updatedCard: SimpleCard, sections: CardSection[]) => {
    // Update the card in our state
    setCards(cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ))
    
    // Show success message
    console.log('✅ Card saved:', updatedCard)
    console.log('✅ Sections saved:', sections)
    
    // Show browser notification
    if ('Notification' in window) {
      new Notification('Card Saved!', {
        body: `"${updatedCard.title}" with ${sections.length} sections`,
        icon: '/vite.svg'
      })
    }
  }

  const addNewCard = () => {
    const newCard: SimpleCard = {
      id: Date.now().toString(),
      title: 'New Card',
      description: 'Click to edit and add draggable sections'
    }
    setCards([...cards, newCard])
  }

  const deleteCard = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId))
  }

  // Request notification permission on load
  useState(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Simple Drag & Drop Cards
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Click any card to open it and test the drag-and-drop sections
          </p>
          <p className="text-sm text-gray-500">
            ✨ Completely offline • No database needed • Just pure React drag & drop
          </p>
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={addNewCard}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all font-medium"
          >
            ➕ Add New Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 group"
            >
              <div onClick={() => openCard(card)}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-blue-500 font-medium">
                    Click to open →
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {card.id}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCard(card.id)
                  }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No cards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first card to start testing drag & drop sections
            </p>
            <button
              onClick={addNewCard}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create First Card
            </button>
          </div>
        )}

        {selectedCard && (
          <SimpleCardModal
            card={selectedCard}
            isOpen={isModalOpen}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎮 How to Test Drag & Drop
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ What Works:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click any card to open the modal</li>
                <li>• Drag sections using the ≡ handles</li>
                <li>• Add new sections with "Add Section"</li>
                <li>• Edit titles and content inline</li>
                <li>• Delete sections with the trash icon</li>
                <li>• Save changes automatically</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Smooth drag & drop animations</li>
                <li>• Real-time position updates</li>
                <li>• No database dependencies</li>
                <li>• Responsive design</li>
                <li>• Clean, modern UI</li>
                <li>• Browser notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}