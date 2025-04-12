'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../backend/lib/firebaseConfig';
import fetchUserData from '../../../backend/pages/api/fetchUserData/fetchUserData';
import fetchUsersData from '../../../backend/pages/api/fetchUsersData/fetchUsersData';
import { useRouter } from 'next/navigation';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

interface FeatureProperties {
  uid: string;
  message: string;
  image: string;
  iconSize: [number, number];
}

interface Coordinates {
  coordinates: [number, number];
  id: string;
  place_name: string;
}

interface UserType {
  uid: string;
  name: string;
  surname: string;
  phone: string;
  selectedAddress: Coordinates;
  photoURL: string;
}

interface Feature {
  type: 'Feature';
  properties: FeatureProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface GeoJSON {
  type: 'FeatureCollection';
  features: Feature[];
}

const MapboxExample: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserType[] | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserType | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }

      const [userData, usersData] = await Promise.all([fetchUserData(currentUser.uid), fetchUsersData()]);

      if (userData) {
        setCurrentUserData({ ...userData, uid: currentUser.uid });
      }
      if (usersData) {
        setAllUsers(usersData);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!mapContainerRef.current || !allUsers || !currentUserData) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: currentUserData.selectedAddress.coordinates,
      zoom: 12,
    });

    const geojson: GeoJSON = {
      type: 'FeatureCollection',
      features: allUsers.map((user) => ({
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
        background-image: url(${marker.properties.image}/${width}/${height});
        width: ${width}px;
        height: ${height}px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        border: 2px solid #000;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      el.addEventListener('click', () => {
        if (marker.properties.uid !== currentUserData.uid) {
          router.push(`/direct/${marker.properties.uid}`);
        }
      });

      new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(mapRef.current!);
    });

    return () => mapRef.current?.remove();
  }, [loading, allUsers, currentUserData, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-8">
      <div ref={mapContainerRef} id="map" className="w-full h-full rounded-xl shadow-lg" />
    </div>
  );
};

export default MapboxExample;
