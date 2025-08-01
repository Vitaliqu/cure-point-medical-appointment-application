'use client';
import React, { useState, useEffect, useRef } from 'react';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

interface AddressProps {
  coordinates: [number, number];
  id: string;
  place_name: string;
}

interface Props {
  setSelectedAddress: (value: AddressProps) => void;
  placeHolder: string;
}

const PlacesAutocomplete: React.FC<Props> = ({ setSelectedAddress, placeHolder }) => {
  const [query, setQuery] = useState(placeHolder || '');
  const [suggestions, setSuggestions] = useState<AddressProps[]>([]);
  const [focused, setFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await geocodingClient
          .forwardGeocode({
            query,
            autocomplete: true,
            limit: 5,
          })
          .send();

        const results = response.body.features.map((feature) => {
          // Ensure coordinates are a tuple [longitude, latitude]
          const coordinates = feature.geometry.coordinates as [number, number];

          return {
            coordinates: coordinates, // Tuple type for coordinates
            id: feature.id,
            place_name: feature.place_name,
          };
        });

        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSelect = (address: AddressProps) => {
    setQuery(address.place_name);
    setSuggestions([]);
    setSelectedAddress(address);
    setFocused(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={'Enter your city/address'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          timeoutRef.current = setTimeout(() => {
            setFocused(false);
          }, 100); // delay to allow click on suggestion
        }}
        className="w-full p-3 border transition-all focus:border-blue-500 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {focused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.id}
              onMouseDown={(e) => e.preventDefault()} // keep input focused
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {item.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
