import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  confirmVariant?: 'danger' | 'primary'
  isDestructive?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  isDestructive = false
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {isDestructive && (
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">This action cannot be undone</span>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
        
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={
              confirmVariant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : ''
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}