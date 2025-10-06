import { Input } from './Input'
import { Textarea } from './Textarea'
import { DatePicker } from './DatePicker'
import type { CustomField, CustomFieldValue } from '../../types'

interface CustomFieldInputProps {
  field: CustomField
  value?: CustomFieldValue
  onChange: (value: string | string[]) => void
  disabled?: boolean
}

export function CustomFieldInput({ field, value, onChange, disabled }: CustomFieldInputProps) {
  const currentValue = value?.value || field.default_value || ''

  const handleChange = (newValue: string | string[]) => {
    onChange(newValue)
  }

  const renderInput = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={field.field_type === 'email' ? 'email' : field.field_type === 'url' ? 'url' : 'text'}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
            rows={3}
          />
        )

      case 'number':
      case 'currency':
        return (
          <div className="relative">
            {field.field_type === 'currency' && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
            )}
            <Input
              type="number"
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
              required={field.required}
              className={field.field_type === 'currency' ? 'pl-8' : ''}
              step={field.field_type === 'currency' ? '0.01' : 'any'}
            />
          </div>
        )

      case 'date':
        const dateValue = typeof currentValue === 'string' && currentValue ? new Date(currentValue) : undefined
        return (
          <div className="relative">
            <DatePicker
              selectedDate={dateValue}
              onDateSelect={(date) => handleChange(date.toISOString().split('T')[0])}
            />
          </div>
        )

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue === 'true'}
              onChange={(e) => handleChange(e.target.checked.toString())}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">{field.name}</span>
          </label>
        )

      case 'select':
        return (
          <select
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'multi-select':
        const selectedValues = Array.isArray(currentValue) 
          ? currentValue 
          : typeof currentValue === 'string' && currentValue 
            ? JSON.parse(currentValue) 
            : []

        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option)
                    handleChange(newValues)
                  }}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <Input
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            required={field.required}
          />
        )
    }
  }

  // Don't render label for checkbox as it's handled internally
  if (field.field_type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderInput()}
        {field.help_text && (
          <p className="text-xs text-gray-500">{field.help_text}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {field.help_text && (
        <p className="text-xs text-gray-500">{field.help_text}</p>
      )}
    </div>
  )
}