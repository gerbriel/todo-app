import { useState, useEffect } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import type { Address } from '../../types'

interface AddressInputProps {
  cardId: string
  initialAddress?: Address
  onAddressChange?: (address: Address) => void
}

// Simple address geocoding using OpenStreetMap
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export function AddressInput({ cardId, initialAddress, onAddressChange }: AddressInputProps) {
  const [address, setAddress] = useState<Address>(initialAddress || {
    card_id: cardId,
    full_address: ''
  })
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Auto-geocode when address changes
  useEffect(() => {
    if (address.full_address && address.full_address.length > 10) {
      const timeoutId = setTimeout(async () => {
        setIsGeocoding(true)
        const coords = await geocodeAddress(address.full_address)
        if (coords) {
          const updatedAddress = {
            ...address,
            latitude: coords.lat,
            longitude: coords.lng
          }
          setAddress(updatedAddress)
          onAddressChange?.(updatedAddress)
        }
        setIsGeocoding(false)
      }, 1000) // Debounce geocoding

      return () => clearTimeout(timeoutId)
    }
  }, [address.full_address])

  const updateAddress = (value: string) => {
    const updatedAddress = { ...address, full_address: value }
    setAddress(updatedAddress)
    onAddressChange?.(updatedAddress)
  }

  const openInMaps = () => {
    if (address.latitude && address.longitude) {
      const url = `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
      window.open(url, '_blank')
    } else if (address.full_address) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(address.full_address)}`
      window.open(url, '_blank')
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // Reverse geocode to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            
            if (data && data.display_name) {
              const updatedAddress = {
                ...address,
                full_address: data.display_name,
                latitude,
                longitude
              }
              setAddress(updatedAddress)
              onAddressChange?.(updatedAddress)
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please enter the address manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="space-y-3">
      {/* Single Address Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 inline mr-1" />
          Address
        </label>
        <div className="flex space-x-2">
          <Input
            value={address.full_address}
            onChange={(e) => updateAddress(e.target.value)}
            placeholder="Enter full address..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={getCurrentLocation}
            title="Use current location"
            size="sm"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
        {isGeocoding && (
          <div className="text-xs text-blue-600">Looking up location...</div>
        )}
      </div>

      {/* Map Actions */}
      {address.latitude && address.longitude && (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Location found</span>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? 'Hide' : 'Show'} Map
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={openInMaps}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Embedded Map */}
      {showMap && address.latitude && address.longitude && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="200"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${address.longitude - 0.01},${address.latitude - 0.01},${address.longitude + 0.01},${address.latitude + 0.01}&layer=mapnik&marker=${address.latitude},${address.longitude}`}
            title="Location Map"
          />
        </div>
      )}
    </div>
  )
}