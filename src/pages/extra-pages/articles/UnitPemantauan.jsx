import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import SiteLayout from 'components/landing/SiteLayout';
import { CloseIcon, MapPinIcon, SearchIcon } from 'components/landing/icons';
import { Button } from 'components/landing/ui/Button';
import { generateLiveUnitData } from 'data/simulasi';
import { useAi2Data } from 'hooks/useAi2Data';
import { useLiveData } from 'hooks/useTestAwareLiveData';

import styles from './UnitPemantauan.module.css';

// Leaflet resolves its default marker sprites relative to the stylesheet, which
// a bundled build breaks. Every marker here uses `siteMarker`, so this only
// keeps any future default marker from rendering as a broken image.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Steam teal, matching --ls-accent. Leaflet takes a URL rather than a node, so
// the colour cannot come from the custom property here.
const siteMarker = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0e7c86" width="36" height="36">' +
        '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' +
        '</svg>'
    ),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Kamojang reads the same live API the dashboard does. Ulubelu has no
// instrumentation yet, so its figures are simulated and labelled as such.
const SITES = {
  kamojang: {
    id: 'kamojang',
    name: 'PLTP Kamojang Unit 5',
    shortName: 'Kamojang',
    region: 'Garut, Jawa Barat',
    position: [-7.1485, 107.7947],
    href: '/login'
  },
  ulubelu: {
    id: 'ulubelu',
    name: 'PLTP Ulubelu Unit 3',
    shortName: 'Ulubelu',
    region: 'Tanggamus, Lampung',
    position: [-5.0833, 104.5833],
    href: null
  }
};

function MapController({ target, onArrive }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return undefined;

    map.flyTo(SITES[target].position, 13, { duration: 1.5 });
    const timer = setTimeout(() => onArrive(target), 1500);
    return () => clearTimeout(timer);
  }, [target, map, onArrive]);

  return null;
}

MapController.propTypes = {
  target: PropTypes.string,
  onArrive: PropTypes.func.isRequired
};

const parseValue = (value) => {
  if (value === null || value === undefined || value === 'null') return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(parsed) ? null : parsed;
};

const fmt = (value, decimals, unit) => {
  const parsed = parseValue(value);
  return parsed === null ? 'N/A' : `${parsed.toFixed(decimals)} ${unit}`;
};

// ==============================|| PUBLIC - UNIT PEMANTAUAN ||============================== //

export default function UnitPemantauan() {
  const [activeUnit, setActiveUnit] = useState(null);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [target, setTarget] = useState(null);

  const { data: apiLiveData } = useLiveData();
  const { liveData: ai2Data } = useAi2Data();
  const [ulubeluSim, setUlubeluSim] = useState(generateLiveUnitData());

  const searchRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setUlubeluSim(generateLiveUnitData()), 1000);
    return () => clearInterval(interval);
  }, []);

  const readings = useMemo(
    () => ({
      kamojang: {
        dryness:
          ai2Data?.dryness_predict != null
            ? `${parseFloat(ai2Data.dryness_predict).toFixed(2)} %`
            : fmt(apiLiveData?.metrics?.dryness?.value, 2, '%'),
        tds: fmt(apiLiveData?.metrics?.tds?.value, 2, 'ppm'),
        ncg:
          ai2Data?.ncg_predict != null
            ? `${parseFloat(ai2Data.ncg_predict).toFixed(2)} wt%`
            : fmt(apiLiveData?.metrics?.ncg?.value, 2, 'wt%'),
        pressure: fmt(apiLiveData?.metrics?.pressure?.value, 2, 'barg'),
        temp: fmt(apiLiveData?.metrics?.temperature?.value, 1, '°C'),
        power: fmt(apiLiveData?.metrics?.active_power?.value, 2, 'MW')
      },
      ulubelu: ulubeluSim.ulubelu
    }),
    [apiLiveData, ai2Data, ulubeluSim]
  );

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return Object.values(SITES).filter((site) =>
      [site.name, site.shortName, site.region].some((field) => field.toLowerCase().includes(term))
    );
  }, [query]);

  const selectSite = (id) => {
    setQuery(SITES[id].name);
    setShowResults(false);
    setTarget(id);
  };

  const handleArrive = useCallback((id) => {
    setActiveUnit(id);
    setTarget(null);
  }, []);

  // Clicking away closes the result list. The unit panel keeps its own close
  // button instead, so a stray click on the map cannot dismiss what someone is
  // still reading.
  useEffect(() => {
    if (!showResults) return undefined;
    const onPointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) setShowResults(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showResults]);

  const site = activeUnit ? SITES[activeUnit] : null;
  const value = activeUnit ? readings[activeUnit] : null;

  return (
    <SiteLayout>
      <section className={styles.stage}>
        <div className={styles.search} ref={searchRef}>
          <div className={styles.searchBar}>
            <SearchIcon size={18} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Cari lapangan panas bumi"
              aria-label="Cari lapangan panas bumi"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowResults(event.target.value.trim() !== '');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && matches.length > 0) selectSite(matches[0].id);
                if (event.key === 'Escape') setShowResults(false);
              }}
            />
          </div>

          {showResults && (
            <div className={styles.results}>
              {matches.length > 0 ? (
                matches.map((match) => (
                  <button key={match.id} type="button" className={styles.result} onClick={() => selectSite(match.id)}>
                    <span className={styles.resultIcon}>
                      <MapPinIcon size={16} />
                    </span>
                    <span>
                      <span className={styles.resultName}>{match.name}</span>
                      <span className={styles.resultRegion}>{match.region}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className={styles.empty}>Lokasi tidak ditemukan.</p>
              )}
            </div>
          )}
        </div>

        <MapContainer center={[-2.5, 118]} zoom={5} zoomControl={false} className={styles.map}>
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapController target={target} onArrive={handleArrive} />

          {Object.values(SITES).map((entry) => (
            <Marker key={entry.id} position={entry.position} icon={siteMarker} eventHandlers={{ click: () => setActiveUnit(entry.id) }}>
              <Popup>
                <strong>{entry.name}</strong>
                <br />
                {entry.region}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {site && (
          <aside className={styles.panel} aria-label={`Ringkasan ${site.name}`}>
            <div className={styles.panelHead}>
              <div>
                <h2 className={styles.panelTitle}>{site.name}</h2>
                <p className={styles.panelRegion}>
                  <MapPinIcon size={14} />
                  {site.region}
                </p>
              </div>
              <button type="button" className={styles.close} onClick={() => setActiveUnit(null)} aria-label="Tutup panel">
                <CloseIcon size={18} />
              </button>
            </div>

            <ul className={styles.metrics}>
              <li className={styles.metric}>
                <span className={styles.metricLabel}>
                  Dryness Fraction
                  <span className={styles.metricFull}>Fraksi kekeringan uap</span>
                </span>
                <span className={styles.metricValue}>{value.dryness}</span>
              </li>
              <li className={styles.metric}>
                <span className={styles.metricLabel}>
                  TDS
                  <span className={styles.metricFull}>Total Dissolved Solid</span>
                </span>
                <span className={styles.metricValue}>{value.tds}</span>
              </li>
              <li className={styles.metric}>
                <span className={styles.metricLabel}>
                  NCG
                  <span className={styles.metricFull}>Non Condensable Gas</span>
                </span>
                <span className={styles.metricValue}>{value.ncg}</span>
              </li>
            </ul>

            <ul className={styles.readings}>
              <li className={styles.reading}>
                <span className={styles.readingLabel}>Daya</span>
                <span className={styles.readingValue}>{value.power}</span>
              </li>
              <li className={styles.reading}>
                <span className={styles.readingLabel}>Temperatur</span>
                <span className={styles.readingValue}>{value.temp}</span>
              </li>
              <li className={styles.reading}>
                <span className={styles.readingLabel}>Tekanan</span>
                <span className={styles.readingValue}>{value.pressure}</span>
              </li>
            </ul>

            <div className={styles.panelFoot}>
              {site.href ? (
                <Button href={site.href}>Buka dashboard</Button>
              ) : (
                <p className={styles.pendingNote}>
                  Instrumentasi di unit ini masih dalam tahap penyiapan. Angka yang ditampilkan berasal dari data simulasi.
                </p>
              )}
            </div>
          </aside>
        )}
      </section>
    </SiteLayout>
  );
}
