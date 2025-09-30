import { useState } from 'react'
import type { Card } from '../../types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Calendar, MessageSquare, Clock, User } from 'lucide-react'

interface CardModalProps {
  card: Card
  isOpen: boolean
  onClose: () => void
  onSave: (card: Card) => void
}

export function CardModal({ card, isOpen, onClose, onSave }: CardModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dateStart, setDateStart] = useState(
    card.date_start ? new Date(card.date_start).toISOString().split('T')[0] : ''
  )
  const [dateEnd, setDateEnd] = useState(
    card.date_end ? new Date(card.date_end).toISOString().split('T')[0] : ''
  )
  const [newComment, setNewComment] = useState('')

  const handleSave = () => {
    const updatedCard: Card = {
      ...card,
      title: title.trim(),
      description: description.trim(),
      date_start: dateStart ? new Date(dateStart).toISOString() : undefined,
      date_end: dateEnd ? new Date(dateEnd).toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }
    onSave(updatedCard)
    onClose()
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        card_id: card.id,
        user_id: 'demo-user',
        action: 'comment',
        details: newComment.trim(),
        created_at: new Date().toISOString(),
        user: {
          id: 'demo-user',
          email: 'demo@example.com',
          name: 'Demo User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      
      const updatedCard: Card = {
        ...card,
        activity: [...(card.activity || []), comment],
        updated_at: new Date().toISOString(),
      }
      onSave(updatedCard)
      setNewComment('')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Card" size="lg">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
            className="text-lg font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Start Date
            </label>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Due Date
            </label>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MessageSquare className="inline w-4 h-4 mr-1" />
            Comments
          </label>
          
          {/* Existing Comments */}
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {card.activity?.filter(activity => activity.action === 'comment').map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.user?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-6">
                  {comment.details}
                </p>
              </div>
            ))}
            {(!card.activity || card.activity.filter(a => a.action === 'comment').length === 0) && (
              <p className="text-sm text-gray-500 italic">No comments yet</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="flex space-x-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="flex-1 resize-none"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="self-end"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}