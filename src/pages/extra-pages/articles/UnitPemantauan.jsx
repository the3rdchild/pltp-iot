import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pertasmartLogo from '../../../assets/images/Pertasmart4x1.svg';
import { generateLiveUnitData } from '../../../data/simulasi';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="40" height="40">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Data lokasi - will be populated with live data
const getLocations = (liveData) => ({
  kamojang: {
    id: 'kamojang',
    name: 'Kamojang Unit 5',
    shortName: 'Kamojang',
    location: 'Jawa Barat',
    position: [-7.1485, 107.7947],
    data: {
      dryness: liveData.kamojang.dryness,
      tds: liveData.kamojang.tds,
      ncg: liveData.kamojang.ncg,
      pressure: liveData.kamojang.pressure,
      temp: liveData.kamojang.temp,
      power: liveData.kamojang.power
    }
  },
  ulubelu: {
    id: 'ulubelu',
    name: 'Ulubelu Unit 3',
    shortName: 'Ulubelu',
    location: 'Lampung',
    position: [-5.0833, 104.5833],
    data: {
      dryness: liveData.ulubelu.dryness,
      tds: liveData.ulubelu.tds,
      ncg: liveData.ulubelu.ncg,
      pressure: liveData.ulubelu.pressure,
      temp: liveData.ulubelu.temp,
      power: liveData.ulubelu.power
    }
  }
});

// Component untuk handle map zoom dan fly to location
const MapController = ({ targetLocation, onLocationReached, locations }) => {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      const location = locations[targetLocation];
      if (location) {
        map.flyTo(location.position, 13, {
          duration: 1.5
        });
        // Trigger callback setelah animasi selesai
        setTimeout(() => {
          onLocationReached(targetLocation);
        }, 1500);
      }
    }
  }, [targetLocation, map, onLocationReached, locations]);

  return null;
};

const UnitPemantauan = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeUnit, setActiveUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [targetLocation, setTargetLocation] = useState(null);
  const [liveUnitData, setLiveUnitData] = useState(generateLiveUnitData());

  const sidebarRef = useRef(null);
  const searchRef = useRef(null);

  // Live data update every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUnitData(generateLiveUnitData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get locations with live data
  const locations = getLocations(liveUnitData);

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter locations based on search query
    const results = Object.values(locations).filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.shortName.toLowerCase().includes(query.toLowerCase()) ||
      location.location.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Select search result
  const handleSelectLocation = (locationId) => {
    const location = locations[locationId];
    setSearchQuery(location.name);
    setShowSearchResults(false);
    setTargetLocation(locationId);
  };

  // Callback setelah map zoom selesai
  const handleLocationReached = (locationId) => {
    setActiveUnit(locationId);
    setTargetLocation(null); // Reset target
  };

  // Handle marker click
  const handleMarkerClick = (locationId) => {
    setActiveUnit(locationId);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeUnit && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.leaflet-marker-icon')
      ) {
        setActiveUnit(null);
      }

      // Close search results when clicking outside
      if (
        showSearchResults &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeUnit, showSearchResults]);

  // Handle Enter key in search
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelectLocation(searchResults[0].id);
    }
  };

  return (
    <div className="unit-pemantauan">
      {/* Sidebar Navigation */}
      <div 
        className={`sidebar-nav ${isSidebarOpen ? 'open' : ''}`}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="sidebar-content">
          <a href="/login" className="sidebar-link">PLTP Kamojang Unit 5</a>
          <a href="#" className="sidebar-link">PLTP Ulubelu Unit 3</a>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-logos">
            <img src={pertasmartLogo} alt="Pertasmart" className="header-logo" />
          </div>
          <nav className="nav">
            <a href="/" className="nav-link">Home</a>
            
            <div className="nav-dropdown">
              <button className="nav-link dropdown-btn">
                Lokasi
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="dropdown-content">
                <a href="/login">Kamojang Unit 5</a>
                <a href="#">Ulubelu Unit 3</a>
              </div>
            </div>
            
            <a href="/unit-pemantauan" className="nav-link active">Steam Monitoring</a>
          </nav>
        </div>
      </header>

      {/* Map Container */}
      <div className="map-wrapper">
        {/* Search Bar */}
        <div className="search-container" ref={searchRef}>
          <div className="search-bar">
            {/* Hamburger Menu Inside Search */}
            <button 
              className="hamburger-btn"
              onMouseEnter={() => setIsSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <input
              type="text"
              placeholder="Search PLTP"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="search-input"
            />

            <svg 
              className="search-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((location) => (
                <div
                  key={location.id}
                  className="search-result-item"
                  onClick={() => handleSelectLocation(location.id)}
                >
                  <div className="result-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="result-info">
                    <div className="result-name">{location.name}</div>
                    <div className="result-location">{location.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
            <div className="search-results">
              <div className="search-no-results">
                Lokasi tidak ditemukan
              </div>
            </div>
          )}
        </div>

        {/* Leaflet Map */}
        <MapContainer
          center={[-2.5, 118]}
          zoom={5.49999}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController
            targetLocation={targetLocation}
            onLocationReached={handleLocationReached}
            locations={locations}
          />

          {/* Markers */}
          {Object.values(locations).map((location) => (
            <Marker
              key={location.id}
              position={location.position}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(location.id)
              }}
            >
              <Popup>
                <strong>{location.name}</strong><br />
                {location.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Sidebar Info Panel */}
        {activeUnit && (
          <div 
            ref={sidebarRef}
            className={`info-sidebar ${activeUnit ? 'show' : ''}`}
          >
            <button 
              className="close-btn"
              onClick={() => setActiveUnit(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="sidebar-header">
              <div>
                <h3 className="sidebar-title">{locations[activeUnit].name}</h3>
                <p className="sidebar-location">{locations[activeUnit].location}</p>
              </div>
              <button className="btn-unit-dropdown">
                Unit {activeUnit === 'kamojang' ? '5' : '3'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <div className="metrics-grid">
              <div className="metric-box">
                <p className="metric-label">Dryness Fraction</p>
                <p className="metric-value">{locations[activeUnit].data.dryness}</p>
              </div>
              <div className="metric-box">
                <p className="metric-label">TDS<br/><span>(Total Dissolve Solid)</span></p>
                <p className="metric-value">{locations[activeUnit].data.tds}</p>
              </div>
              <div className="metric-box">
                <p className="metric-label">NCG<br/><span>(Non Condensed Gas)</span></p>
                <p className="metric-value">{locations[activeUnit].data.ncg}</p>
              </div>
            </div>

            <div className="metrics-row">
              <div className="metric-item">
                <span className="metric-label">Power</span>
                <span className="metric-value">{locations[activeUnit].data.power}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Temp</span>
                <span className="metric-value">{locations[activeUnit].data.temp}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Pressure</span>
                <span className="metric-value">{locations[activeUnit].data.pressure}</span>
              </div>
            </div>

            <a
              href={activeUnit === 'kamojang' ? '/login' : '#'}
              className="btn-dashboard"
            >
              Dashboard
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .unit-pemantauan {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
        }

        /* Sidebar Navigation */
        .sidebar-nav {
            position: absolute;
            top: 154px;  /* ← 16px (top) + 40px (height search bar) + 8px (gap) */
            left: 16px;
            width: 360px;  /* ← SAMA DENGAN SEARCH BAR */
            background: white;
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
        }

            .sidebar-nav.open {
            opacity: 1;  /* ← Show saat open */
            visibility: visible;
        }

        .sidebar-content {
            padding: 16px;  /* ← Padding kecil aja */
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .sidebar-link {
          color: #1a1a1a;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: block;
        }

        .sidebar-link:hover,
        .sidebar-link.active {
          background: #e8f0fe;
          color: #1a73e8;
          transform: translateX(8px);
        }

        /* Header */
        .header {
          background-color: #1a2642;
          color: white;
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-logos {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-logo {
          height: 48px;
          width: auto;
          filter: brightness(0) invert(1);
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 400;
          font-size: 1rem;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #f7941d;
        }

        .nav-dropdown {
          position: relative;
        }

        .dropdown-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 400;
          font-size: 1rem;
          font-family: inherit;
          color: white;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #1a2642;
          min-width: 180px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-top: 0;
          padding-top: 8px;
          z-index: 1;
        }

        .nav-dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-content a {
          color: white;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          transition: all 0.3s ease;
        }

        .dropdown-content a:hover {
          background: #2563eb;
          color: white;
        }

        /* Map Wrapper */
        .map-wrapper {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        /* Custom Leaflet Zoom Control Styling */
        :global(.leaflet-control-zoom) {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }

        :global(.leaflet-control-zoom a) {
          background: white !important;
          color: #5f6368 !important;
          border: none !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 20px !important;
          font-weight: 500 !important;
        }

        :global(.leaflet-control-zoom a:hover) {
          background: #f1f3f4 !important;
          color: #202124 !important;
        }

        :global(.leaflet-control-zoom a:first-child) {
          border-radius: 4px 4px 0 0 !important;
        }

        :global(.leaflet-control-zoom a:last-child) {
          border-radius: 0 0 4px 4px !important;
        }

        /* Search Container */
        .search-container {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 1000;  
            width: 360px;
        }

        .search-bar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 8px;
          height: 40px;
        }

        .hamburger-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5f6368;
          flex-shrink: 0;
          transition: all 0.2s ease;
          border-radius: 4px;
        }

        .hamburger-btn:hover {
          background: #f1f3f4;
          color: #202124;
        }

        .hamburger-btn svg {
          width: 20px;
          height: 20px;
        }

        .search-icon {
          color: #5f6368;
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .search-input {
          border: none;
          outline: none;
          font-size: 0.9375rem;
          width: 100%;
          color: #202124;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: #9aa0a6;
          font-weight: 400;
        }

        /* Search Results */
        .search-results {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          margin-top: 4px;
          overflow: hidden;
          max-height: 280px;
          overflow-y: auto;
        }

        .search-result-item {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .search-result-item:hover {
          background: #f1f3f4;
        }

        .result-icon {
          width: 36px;
          height: 36px;
          background: #e8f0fe;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a73e8;
          flex-shrink: 0;
        }

        .result-icon svg {
          width: 18px;
          height: 18px;
        }

        .result-info {
          flex: 1;
        }

        .result-name {
          font-weight: 500;
          color: #202124;
          font-size: 0.875rem;
          line-height: 1.3;
        }

        .result-location {
          font-size: 0.75rem;
          color: #5f6368;
          margin-top: 2px;
        }

        .search-no-results {
          padding: 12px;
          text-align: center;
          color: #5f6368;
          font-size: 0.8125rem;
        }

        /* Info Sidebar */
        .info-sidebar {
            position: absolute;
            top: 72px;
            left: -400px;
            width: 360px;
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 900;
            transition: left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* ← Lebih smooth & jelas */
            max-height: calc(100vh - 112px);
            overflow-y: auto;
            opacity: 0;
            transform: translateX(-20px);  /* ← Tambahin ini */
        }

        .info-sidebar.show {
            left: 16px;
            opacity: 1;
            transform: translateX(0);  /* ← Tambahin ini */
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f1f3f4;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #5f6368;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #e8eaed;
          color: #202124;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
          padding-right: 40px;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #202124;
          margin: 0;
        }

        .sidebar-location {
          font-size: 0.875rem;
          color: #5f6368;
          margin: 4px 0 0 0;
        }

        .btn-unit-dropdown {
          background: #1a73e8;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          transition: background 0.2s ease;
        }

        .btn-unit-dropdown:hover {
          background: #1557b0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #5f6368;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .metric-label span {
          font-size: 0.65rem;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #202124;
        }

        .metrics-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
        }

        .metric-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .btn-dashboard {
          background: #1a73e8;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          text-align: center;
          text-decoration: none;
          display: block;
        }

        .btn-dashboard:hover {
          background: #1557b0;
        }

        /* Scrollbar Styling */
        .info-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .info-sidebar::-webkit-scrollbar-track {
          background: #f1f3f4;
          border-radius: 3px;
        }

        .info-sidebar::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 3px;
        }

        .info-sidebar::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .search-container {
            width: calc(100% - 32px);
            max-width: 360px;
            left: 16px;
            right: 16px;
          }

          .info-sidebar {
            width: calc(100% - 32px);
            max-width: 360px;
          }

          .info-sidebar.show {
            left: 16px;
          }

          .header-container {
            padding: 0 16px;
          }

          .nav {
            gap: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default UnitPemantauan;