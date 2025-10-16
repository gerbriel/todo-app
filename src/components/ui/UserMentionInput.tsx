import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import type { AppUser } from '../../api/users'

interface UserMentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSubmit?: () => void
}

interface MentionSuggestion {
  id: string
  name: string
  email: string
  avatar?: string
}

export const UserMentionInput: React.FC<UserMentionInputProps> = ({
  value,
  onChange,
  placeholder = "Type @ to mention users...",
  className = "",
  onSubmit
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get all users for mentions
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers
  })

  // Filter users based on mention query
  const filteredUsers = (users as AppUser[])
    .filter(user => {
      if (!mentionQuery) return true
      const searchText = `${user.name || ''} ${user.email}`.toLowerCase()
      return searchText.includes(mentionQuery.toLowerCase())
    })
    .slice(0, 5) // Limit to 5 suggestions

  // Handle text change and detect mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    
    onChange(newValue)
    setCursorPosition(cursorPos)

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@([^@\s]*)$/)
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setShowSuggestions(true)
      setSuggestionIndex(0)
    } else {
      setShowSuggestions(false)
      setMentionQuery('')
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSuggestionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          )
          break
        case 'Enter':
          if (filteredUsers[suggestionIndex]) {
            e.preventDefault()
            insertMention(filteredUsers[suggestionIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowSuggestions(false)
          break
      }
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      // Submit on Cmd/Ctrl + Enter
      e.preventDefault()
      onSubmit?.()
    }
  }

  // Insert mention into text
  const insertMention = (user: AppUser) => {
    const textBeforeCursor = value.substring(0, cursorPosition)
    const textAfterCursor = value.substring(cursorPosition)
    
    // Find the @ symbol position
    const atIndex = textBeforeCursor.lastIndexOf('@')
    
    if (atIndex !== -1) {
      const beforeAt = textBeforeCursor.substring(0, atIndex)
      const mention = `@${user.name || user.email}`
      const newValue = `${beforeAt}${mention} ${textAfterCursor}`
      
      onChange(newValue)
      setShowSuggestions(false)
      setMentionQuery('')
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = beforeAt.length + mention.length + 1
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !textareaRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get caret position for positioning suggestions
  const getCaretCoordinates = () => {
    if (!textareaRef.current) return { top: 0, left: 0 }
    
    const textarea = textareaRef.current
    const style = window.getComputedStyle(textarea)
    const fontSize = parseInt(style.fontSize)
    
    // Approximate positioning based on cursor position
    const lines = value.substring(0, cursorPosition).split('\n').length
    const top = lines * (fontSize + 4) // rough line height
    
    return { top, left: 0 }
  }

  const { top, left } = getCaretCoordinates()

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full resize-none ${className}`}
        rows={3}
      />
      
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-64"
          style={{
            top: `${top + 24}px`,
            left: `${left}px`
          }}
        >
          <div className="p-2 text-xs text-gray-500 border-b">
            Mention users:
          </div>
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                index === suggestionIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
              }`}
              onClick={() => insertMention(user)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'Unnamed User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                @{user.name || user.email.split('@')[0]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook for parsing mentions in text
export const useParseMentions = (text: string) => {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers
  })

  const parsedText = React.useMemo(() => {
    if (!text) return []
    
    const parts = []
    const mentionRegex = /@([^\s@]+)/g
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        })
      }

      // Find user for mention
      const mentionText = match[1]
      const user = (users as AppUser[]).find(u => 
        (u.name && u.name.toLowerCase() === mentionText.toLowerCase()) ||
        u.email.toLowerCase() === mentionText.toLowerCase() ||
        u.email.split('@')[0].toLowerCase() === mentionText.toLowerCase()
      )

      parts.push({
        type: 'mention',
        content: match[0],
        user: user || null
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      })
    }

    return parts
  }, [text, users])

  return parsedText
}

// Component for rendering parsed mentions
interface MentionTextProps {
  text: string
  className?: string
}

export const MentionText: React.FC<MentionTextProps> = ({ text, className = "" }) => {
  const parts = useParseMentions(text)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium ${
                part.user 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer' 
                  : 'bg-gray-100 text-gray-500'
              }`}
              title={part.user ? `${part.user.name} (${part.user.email})` : 'Unknown user'}
            >
              {part.content}
            </span>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </span>
  )
}