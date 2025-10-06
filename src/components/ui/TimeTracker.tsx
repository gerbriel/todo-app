import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Play, Square, Clock, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { timeTrackingApi } from '../../api/timeTracking'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import type { TimeEntry, CreateTimeEntryData } from '../../types'

interface TimeTrackerProps {
  cardId: string
}

export function TimeTracker({ cardId }: TimeTrackerProps) {
  const queryClient = useQueryClient()
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [newEntry, setNewEntry] = useState<CreateTimeEntryData>({
    card_id: cardId,
    description: '',
    hours: 0,
    billable: true
  })

  // Load time entries for this card
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries', cardId],
    queryFn: () => timeTrackingApi.getTimeEntries(cardId)
  })

  // Load total time for this card
  const { data: totalTime } = useQuery({
    queryKey: ['totalTime', cardId],
    queryFn: () => timeTrackingApi.getTotalTime(cardId)
  })

  // Load running timer
  const { data: runningTimer } = useQuery({
    queryKey: ['runningTimer'],
    queryFn: () => timeTrackingApi.getRunningTimer(),
    refetchInterval: 1000 // Update every second
  })

  // Mutations
  const createEntryMutation = useMutation({
    mutationFn: (data: CreateTimeEntryData) => timeTrackingApi.createTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', cardId] })
      queryClient.invalidateQueries({ queryKey: ['totalTime', cardId] })
      setIsAddingEntry(false)
      setNewEntry({
        card_id: cardId,
        description: '',
        hours: 0,
        billable: true
      })
    }
  })

  const startTimerMutation = useMutation({
    mutationFn: (description?: string) => timeTrackingApi.startTimer(cardId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTimer'] })
    }
  })

  const stopTimerMutation = useMutation({
    mutationFn: (entryId: string) => timeTrackingApi.stopTimer(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTimer'] })
      queryClient.invalidateQueries({ queryKey: ['timeEntries', cardId] })
      queryClient.invalidateQueries({ queryKey: ['totalTime', cardId] })
    }
  })

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => timeTrackingApi.deleteTimeEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', cardId] })
      queryClient.invalidateQueries({ queryKey: ['totalTime', cardId] })
    }
  })

  const handleStartTimer = () => {
    startTimerMutation.mutate(undefined)
  }

  const handleStopTimer = () => {
    if (runningTimer) {
      stopTimerMutation.mutate(runningTimer.id)
    }
  }

  const handleAddEntry = () => {
    if (newEntry.hours > 0) {
      createEntryMutation.mutate(newEntry)
    }
  }

  const handleDeleteEntry = (entry: TimeEntry) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      deleteEntryMutation.mutate(entry.id)
    }
  }

  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getCurrentTimerDuration = () => {
    if (!runningTimer?.start_time) return '0h 0m'
    const now = new Date()
    const start = new Date(runningTimer.start_time)
    const hours = (now.getTime() - start.getTime()) / (1000 * 60 * 60)
    return formatTime(hours)
  }

  const isTimerRunningForThisCard = runningTimer?.card_id === cardId

  return (
    <div className="space-y-4">
      {/* Header with totals */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              Total: {totalTime ? formatTime(totalTime.total_hours) : '0h 0m'}
            </span>
          </div>
          {totalTime && totalTime.billable_hours > 0 && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">
                Billable: {formatTime(totalTime.billable_hours)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Timer controls */}
          {isTimerRunningForThisCard ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono text-blue-600">
                {getCurrentTimerDuration()}
              </span>
              <Button
                size="sm"
                variant="danger"
                onClick={handleStopTimer}
                disabled={stopTimerMutation.isPending}
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleStartTimer}
              disabled={startTimerMutation.isPending || !!runningTimer}
              title={runningTimer ? 'Stop other timer first' : 'Start timer'}
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={() => setIsAddingEntry(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Time
          </Button>
        </div>
      </div>

      {/* Time entries list */}
      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Time Entries</h4>
          <div className="space-y-1">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatTime(entry.hours)}</span>
                    {entry.billable && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        Billable
                      </span>
                    )}
                  </div>
                  {entry.description && (
                    <p className="text-gray-600 mt-1">{entry.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add time entry modal */}
      <Modal
        isOpen={isAddingEntry}
        onClose={() => setIsAddingEntry(false)}
        title="Add Time Entry"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={newEntry.description || ''}
              onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What did you work on?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours *
            </label>
            <Input
              type="number"
              step="0.25"
              min="0"
              value={newEntry.hours}
              onChange={(e) => setNewEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
              placeholder="2.5"
              required
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newEntry.billable}
                onChange={(e) => setNewEntry(prev => ({ ...prev, billable: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Billable time</span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleAddEntry}
              disabled={newEntry.hours <= 0 || createEntryMutation.isPending}
              className="flex-1"
            >
              Add Entry
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsAddingEntry(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}