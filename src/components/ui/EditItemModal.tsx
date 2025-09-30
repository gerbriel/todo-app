import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Textarea } from './Textarea'

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string }) => void
  title: string
  itemName: string
  itemDescription?: string
  nameLabel?: string
  descriptionLabel?: string
  showDescription?: boolean
}

export function EditItemModal({
  isOpen,
  onClose,
  onSave,
  title,
  itemName,
  itemDescription = '',
  nameLabel = 'Name',
  descriptionLabel = 'Description',
  showDescription = true
}: EditItemModalProps) {
  const [name, setName] = useState(itemName)
  const [description, setDescription] = useState(itemDescription)

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: showDescription ? description.trim() : undefined
      })
      onClose()
    }
  }

  const handleClose = () => {
    setName(itemName)
    setDescription(itemDescription)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {nameLabel}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${nameLabel.toLowerCase()}`}
            autoFocus
          />
        </div>
        
        {showDescription && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {descriptionLabel}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${descriptionLabel.toLowerCase()}`}
              rows={3}
            />
          </div>
        )}
        
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}