import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onFocus?: () => void
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  onFocus
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          block w-full pl-10 pr-10 py-2 border border-gray-600 rounded-lg
          bg-gray-700 text-gray-100 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${isFocused ? 'bg-gray-600' : ''}
        `}
        onFocus={() => {
          setIsFocused(true)
          onFocus?.()
        }}
        onBlur={() => {
          setIsFocused(false)
          // Add a small delay to allow for clicking on search results
          setTimeout(() => {
            // This will be handled by the parent component
          }, 200)
        }}
      />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}