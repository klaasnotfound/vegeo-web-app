'use client';

import { fetchPowerLines, fetchRegions, fetchVegetationAlerts } from '@/api';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from '@/app/components/MapComponents';
import { Region } from '@/model/Region';
import { VegetationAlert } from '@/model/VegetationAlert';
import { Empty, LineSegments, NetworkSlash } from '@phosphor-icons/react';
import { Box, Card, Container, Flex, Heading, Inset, Link, Section, Text } from '@radix-ui/themes';
import { LatLngBoundsLiteral, LatLngExpression, LatLngTuple, Map, TileLayer as TL } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';

const INITIAL_ZOOM_LEVEL = 13;

const Home = () => {
  const [regions, setRegions] = useState<Region[] | undefined>();
  const [activeRegion, setActiveRegion] = useState<Region | undefined>();
  const [vegAlerts, setVegAlerts] = useState<VegetationAlert[]>([]);
  const [polyline, setPolyline] = useState<LatLngExpression[][]>();
  const map = useRef<Map>(null);
  const tileLayer = useRef<TL>(null);

  const center = useMemo(() => {
    const c = [
      ((activeRegion?.bbMinLat || 0) + (activeRegion?.bbMaxLat || 0)) / 2,
      ((activeRegion?.bbMinLon || 0) + (activeRegion?.bbMaxLon || 0)) / 2,
    ];
    const sw = [activeRegion?.bbMinLat, activeRegion?.bbMinLon];
    const ne = [activeRegion?.bbMaxLat, activeRegion?.bbMaxLon];
    if (map) {
      map.current?.setView(c as LatLngTuple, INITIAL_ZOOM_LEVEL);
      map.current?.setMaxBounds([sw, ne] as LatLngBoundsLiteral);
    }
    return c;
  }, [activeRegion]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getWarningIcon: (r: number) => any;
  // @ts-expect-error: L only available on the client side
  if (typeof window !== 'undefined' && typeof L !== 'undefined') {
    getWarningIcon = (risk: number) => {
      const str = risk >= 8 ? 'high' : risk >= 5 ? 'medium' : 'low';
      // @ts-expect-error: L only available on the client side
      return L.icon({
        iconUrl: `/img/ic_marker_warning_${str}.png`,
        iconSize: [48, 48],
        iconAnchor: [24, 45],
        popupAnchor: [0, -32],
      });
    };
  }

  useEffect(() => {
    if (regions) return;
    fetchRegions().then((regions) => {
      setRegions(regions.sort((r1, r2) => (r2.numPls || 0) - (r1.numPls || 0)));
    });
  });

  useEffect(() => {
    const sw = { lat: activeRegion?.bbMinLat || 0, lon: activeRegion?.bbMinLon || 0 };
    const ne = { lat: activeRegion?.bbMaxLat || 0, lon: activeRegion?.bbMaxLon || 0 };
    if (sw.lat === ne.lat && sw.lon === ne.lat) return;
    fetchPowerLines(sw, ne).then((segments) => {
      setPolyline(segments.map((s) => JSON.parse(s.geometry)));
    });
    fetchVegetationAlerts(sw, ne).then((alerts) => {
      setVegAlerts(alerts);
    });
  }, [activeRegion]);

  return (
    <Section size="1" pt="8" pb="4">
      <Container size="4" px="4">
        <Flex direction="column" align="center">
          <Heading align="center" size="8" mb="2">
            Vegeo Demo
          </Heading>
          <Text size="5" color="gray" weight="light" mb="6">
            Assessing power line vegetation risks from satellite data
          </Text>
          <Box width="100%" mt="2" mb="6" overflowX="scroll">
            <Flex gap="2">
              {regions &&
                regions.map((region, idx) => (
                  <Box
                    key={idx}
                    minWidth="240px"
                    onClick={() => {
                      setActiveRegion(region);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card style={{ backgroundColor: region.name === activeRegion?.name ? '#00914071' : 'inherit' }}>
                      <Flex gap="3" align="center">
                        <Inset clip="padding-box" side="left">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={region.imgUrl}
                            alt={`Photo of ${region.name}`}
                            style={{
                              display: 'block',
                              objectFit: 'cover',
                              width: 80,
                              height: 84,
                              backgroundColor: 'var(--gray-5)',
                            }}
                          />
                        </Inset>
                        <Box>
                          <Text as="div" size="2" weight="bold">
                            {region.name}
                          </Text>
                          <Text as="div" size="2" color="gray">
                            {region.numPls} power line segments
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  </Box>
                ))}
            </Flex>
          </Box>
          {activeRegion && (
            <MapContainer
              ref={map}
              center={center as LatLngTuple}
              zoom={INITIAL_ZOOM_LEVEL}
              style={{ width: '100%', minHeight: 640 }}
            >
              <TileLayer
                ref={tileLayer}
                attribution='&copy; <a target="_blank" href="https://www.arcgis.com/home/item.html?id=e74cf6b0790e424489bbe84cbc0dc7ad">U.S. National Agriculture Imagery Program</a>'
                url="https://gis.apfo.usda.gov/arcgis/rest/services/NAIP/USDA_CONUS_PRIME/ImageServer/tile/{z}/{y}/{x}"
              />
              <TileLayer maxNativeZoom={17} maxZoom={18} url="http://127.0.0.1:8000/vegetation/tiles/{z}/{y}/{x}" />
              {polyline && (
                <Polyline
                  pathOptions={{ color: '#FFFF57' }}
                  positions={polyline}
                  attribution='<a target="_blank" href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                />
              )}
              {vegAlerts.map((alert, idx) => (
                <Marker
                  key={idx}
                  position={[alert.lat, alert.lon] as LatLngTuple}
                  icon={getWarningIcon(alert.risk) as L.Icon}
                >
                  <Popup>
                    <b>{alert.desc}</b>
                    <br />
                    Segment ID: {alert.plsId}
                    <br />
                    Risk level: {alert.risk}/10
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {!!regions?.length && !activeRegion && (
            <Flex style={{ width: '100%', minHeight: 640 }} direction="column" justify="center" align="center">
              <LineSegments size={32} color="rgba(0, 10, 7, 0.627)" />
              <Text mt="3" color="gray">
                Choose a city above to inspect its power lines.
              </Text>
            </Flex>
          )}
          {!regions && (
            <Flex style={{ width: '100%', minHeight: 640 }} direction="column" justify="center" align="center">
              <NetworkSlash size={32} color="rgba(0, 10, 7, 0.627)" />
              <Text mt="3" align="center" color="gray">
                Could not connect to API server.
                <br />
                Please ensure it is running at 
                <Link href="http://localhost:8000" target="_blank">
                  localhost:8000
                </Link>
                , then refresh the page.
              </Text>
            </Flex>
          )}
          {regions?.length === 0 && (
            <Flex style={{ width: '100%', minHeight: 640 }} direction="column" justify="center" align="center">
              <Empty size={32} color="rgba(0, 10, 7, 0.627)" />
              <Text mt="3" align="center" color="gray">
                No cities found.
                <br />
                Please ensure there is content in the database, then refresh the page.
              </Text>
            </Flex>
          )}
        </Flex>
      </Container>
    </Section>
  );
};
export default Home;
