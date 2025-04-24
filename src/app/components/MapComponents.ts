import dynamic from 'next/dynamic';

import { MapContainer as MC, TileLayer as TL, Polyline as PL, Marker as M, Popup as P } from 'react-leaflet';

// The following components rely on the `window` object and cause trouble with SSR.
// We therefore import them dynamically and hide the logic in this utility file.


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MapContainer = dynamic(() => import('react-leaflet/MapContainer').then((module) => module.MapContainer) as any, {
  ssr: false,
}) as (typeof MC);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TileLayer = dynamic(() => import('react-leaflet/TileLayer').then((module) => module.TileLayer) as any, {
  ssr: false,
}) as (typeof TL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Polyline = dynamic(() => import('react-leaflet/Polyline').then((module) => module.Polyline) as any, {
  ssr: false,
}) as (typeof PL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Marker = dynamic(() => import('react-leaflet/Marker').then((module) => module.Marker) as any, {
  ssr: false,
}) as (typeof M);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Popup = dynamic(() => import('react-leaflet/Popup').then((module) => module.Popup) as any, {
  ssr: false,
}) as (typeof P);
