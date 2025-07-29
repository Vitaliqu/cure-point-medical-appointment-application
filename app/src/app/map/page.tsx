'use client';

import React, { FC, useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../backend/lib/firebaseConfig';
import fetchUserData from '@/app/api/fetchUserData';
import fetchUsersData from '@/app/api/fetchUsersData';
import { useRouter } from 'next/navigation';
import { GeoJSON, UserType } from '@/interfaces/interfaces';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const MapboxExample: FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [doctors, setAllDoctors] = useState<UserType[] | null>(null);

  const [currentUserData, setCurrentUserData] = useState<UserType | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/authorisation');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const doctorIds = params.get('doctors')?.split(',');

      const [userData, usersData] = await Promise.all([fetchUserData(currentUser.uid), fetchUsersData()]);

      if (userData) {
        setCurrentUserData({ ...userData, uid: currentUser.uid });
      }
      if (usersData) {
        setAllDoctors(usersData?.filter((user) => doctorIds?.includes(user.uid)));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const latNum = lat ? parseFloat(lat) : (currentUserData?.selectedAddress.coordinates?.[0] ?? 0);
    const lngNum = lng ? parseFloat(lng) : (currentUserData?.selectedAddress.coordinates?.[1] ?? 0);

    if (!mapContainerRef.current || !doctors || !currentUserData) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [latNum, lngNum], // Note the order: [lng, lat]
      zoom: 12,
    });

    const geojson: GeoJSON = {
      type: 'FeatureCollection',
      features: doctors.map((user) => ({
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

      el.addEventListener('click', () => {
        router.push(`/doctor/${marker.properties.uid}`);
      });

      new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(mapRef.current!);
    });

    return () => mapRef.current?.remove();
  }, [loading, doctors, currentUserData, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div ref={mapContainerRef} id="map" className="w-full h-full rounded-xl shadow-lg" />
    </div>
  );
};

export default MapboxExample;
