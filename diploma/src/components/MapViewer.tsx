'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { AddressProps, GeoJSON, UserType } from '@/interfaces/interfaces';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const MapViewer = ({
  currentAddress,
  users,
  zoom,
}: {
  currentAddress: AddressProps;
  users: UserType[];
  zoom: number;
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!mapContainerRef.current || !users || !currentAddress) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: currentAddress.coordinates,
      zoom: zoom,
    });

    const geojson: GeoJSON = {
      type: 'FeatureCollection',
      features: users.map((user) => ({
        type: 'Feature',
        properties: {
          uid: user.uid,
          message: `${user.name} ${user.surname}`,
          image: user.photoURL,
          iconSize: [50, 50],
        },
        geometry: {
          type: 'Point',
          coordinates: user.selectedAddress.coordinates || [0, 0],
        },
      })),
    };

    geojson.features.forEach((marker) => {
      const el = document.createElement('div');
      const [width, height] = marker.properties.iconSize;

      el.className = 'marker';
      el.style.cssText = `
        background-image: url(${marker.properties.image});
        width: ${width}px;
        height: ${height}px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 2px solid #000;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(mapRef.current!);
    });

    return () => mapRef.current?.remove();
  }, [users, currentAddress, router, zoom]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainerRef} id="map" className="w-full h-full rounded-xl shadow-lg" />
    </div>
  );
};

export default MapViewer;
