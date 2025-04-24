import { LatLon } from './model/LatLon';
import { PowerLineSegment } from './model/PowerLineSegment';
import { Region } from './model/Region';
import { VegetationAlert } from './model/VegetationAlert';

const API_URL = 'http://127.0.0.1:8000';

/**
 * Fetch list of available regions.
 */
export const fetchRegions = async (): Promise<Region[]> => {
  const url = `${API_URL}/regions`;
  const res = await fetch(url);
  const regions: Region[] = await res.json();
  return regions;
};


/**
 * Fetch geometry of low-voltage power lines for a given region.
 *
 * @param sw southwest bounding box corner
 * @param ne northeast bounding box corner
 */
export const fetchPowerLines = async (sw: LatLon, ne: LatLon): Promise<PowerLineSegment[]> => {
  const url = `${API_URL}/power-lines?sw=${sw.lat},${sw.lon}&ne=${ne.lat},${ne.lon}`;
  const res = await fetch(url);
  const segments: PowerLineSegment[] = await res.json();
  return segments;
};


/** Fetch geo-referenced vegetation alerts for a given region.
 * 
 * @param sw southwest bounding box corner
 * @param ne northeast bounding box corner
 */
export const fetchVegetationAlerts = async (sw: LatLon, ne: LatLon): Promise<VegetationAlert[]> => {
  const url = `${API_URL}/vegetation/alerts?sw=${sw.lat},${sw.lon}&ne=${ne.lat},${ne.lon}`;
  const res = await fetch(url);
  const alerts: VegetationAlert[] = await res.json();
  return alerts;
};