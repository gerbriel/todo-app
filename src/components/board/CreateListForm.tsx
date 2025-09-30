import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface CreateListFormProps {
  onSubmit: (name: string) => void
  onCancel: () => void
}

export function CreateListForm({ onSubmit, onCancel }: CreateListFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter list title..."
        autoFocus
        className="mb-3"
      />
      <div className="flex space-x-2">
        <Button type="submit" size="sm">
          Add List
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}