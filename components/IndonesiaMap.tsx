
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { FormState } from '../types';
import { MapPin, AlertTriangle, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * Senior Geospatial Web Engineer Implementation
 * Leaflet.js Map Module with Basemap Fallback and Marker Clustering
 */

// Fix for Leaflet default icon issues in React/Vite environments
// This ensures markers show up correctly using CDN assets
// @ts-ignore
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface IndonesiaMapProps {
  data: (FormState & { docId: string; timestamp: number })[];
}

/**
 * Basemap Provider Configuration
 * Ordered by priority as per requirements
 */
const BASEMAPS = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    name: 'ESRI World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
  }
];

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<any>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // UI State
  const [status, setStatus] = useState<'loading' | 'active' | 'fallback' | 'error'>('loading');
  const [basemapIndex, setBasemapIndex] = useState(0);
  const [mappedCount, setMappedCount] = useState(0);

  /**
   * Section 1: Map Initialization
   * Sets up the Leaflet instance and MarkerCluster group
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Indonesia
    const map = L.map(mapContainerRef.current, {
      center: [-2.5489, 118.0149],
      zoom: 5,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: true
    });

    // Custom zoom control position
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // Initialize Marker Cluster Group for performance with thousands of points
    // @ts-ignore
    const markerCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true, // Optimize for large datasets
      maxClusterRadius: 50
    });
    map.addLayer(markerCluster);
    markerClusterRef.current = markerCluster;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /**
   * Section 2: Basemap Fallback System
   * Implements automatic provider switching on failure
   */
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const basemap = BASEMAPS[basemapIndex];

    // Remove existing layer if any
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Create new tile layer
    const layer = L.tileLayer(basemap.url, {
      attribution: basemap.attribution,
      maxZoom: 19,
    });

    let tileErrorOccurred = false;

    // Tile Error Detection
    layer.on('tileerror', (e) => {
      if (!tileErrorOccurred) {
        tileErrorOccurred = true;
        console.warn(`Basemap ${basemap.name} failed to load tiles at ${e.coords.z}/${e.coords.x}/${e.coords.y}`);
        handleFallback();
      }
    });

    // Success Detection
    layer.on('load', () => {
      if (!tileErrorOccurred) {
        setStatus(basemapIndex === 0 ? 'active' : 'fallback');
      }
    });

    layer.addTo(map);
    tileLayerRef.current = layer;

    // Fallback Logic
    const handleFallback = () => {
      if (basemapIndex < BASEMAPS.length - 1) {
        console.log(`Switching to fallback basemap: ${BASEMAPS[basemapIndex + 1].name}`);
        setBasemapIndex(prev => prev + 1);
      } else {
        console.error("All basemap providers failed.");
        setStatus('error');
      }
    };

    // Failsafe timeout for initial connection
    const connectionTimeout = setTimeout(() => {
      if (status === 'loading') {
        handleFallback();
      }
    }, 8000);

    return () => clearTimeout(connectionTimeout);
  }, [basemapIndex]);

  /**
   * Section 3: Marker Cluster Implementation
   * Efficiently renders thousands of points with popups
   */
  useEffect(() => {
    if (!markerClusterRef.current) return;

    const cluster = markerClusterRef.current;
    cluster.clearLayers();

    // Data Sanitization & Filtering
    const points = data.filter(d => {
      const lat = typeof d.latitude === 'string' ? parseFloat(d.latitude) : d.latitude;
      const lng = typeof d.longitude === 'string' ? parseFloat(d.longitude) : d.longitude;
      return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    });

    setMappedCount(points.length);

    // Batch add markers to cluster group
    const markersToAdd: L.Marker[] = [];
    
    points.forEach(item => {
      const lat = typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude!;
      const lng = typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude!;
      
      const marker = L.marker([lat, lng]);
      
      // Modern Popup Template
      const popupContent = `
        <div class="p-3 min-w-[200px] font-sans">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-red-600"></div>
            <h4 class="font-bold text-slate-900 text-sm uppercase tracking-tight">${item.namaLembaga}</h4>
          </div>
          <div class="space-y-1 mb-3">
            <p class="text-[10px] text-slate-500 flex items-center gap-1">
              <span class="font-bold">DESA:</span> ${item.desa}
            </p>
            <p class="text-[10px] text-slate-500 flex items-center gap-1">
              <span class="font-bold">KEC:</span> ${item.kecamatan}
            </p>
            <p class="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100">
              ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </p>
          </div>
          <a href="${item.googleMapsUrl || `https://www.google.com/maps?q=${lat},${lng}`}" 
             target="_blank" 
             class="inline-flex items-center justify-center w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-all gap-1.5 no-underline">
            BUKA DI GOOGLE MAPS
          </a>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 300
      });
      
      markersToAdd.push(marker);
    });

    cluster.addLayers(markersToAdd);

    // Auto-fit bounds on initial load if data exists
    if (points.length > 0 && mapRef.current && mappedCount === 0) {
      try {
        mapRef.current.fitBounds(cluster.getBounds(), { padding: [50, 50], maxZoom: 12 });
      } catch (e) {
        console.warn("Could not fit bounds:", e);
      }
    }
  }, [data]);

  const retryMap = () => {
    setBasemapIndex(0);
    setStatus('loading');
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col gap-4">
      {/* Section 4: UI Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <MapPin className="text-red-600" size={20} />
            Peta Sebaran Lembaga Ekonomi
          </h3>
          <p className="text-xs text-slate-500">Visualisasi geospasial real-time berbasis Leaflet.js</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all shadow-sm ${
            status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            status === 'fallback' ? 'bg-amber-50 border-amber-200 text-amber-700' :
            status === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            {status === 'loading' && <RefreshCw size={12} className="animate-spin" />}
            {status === 'active' && <CheckCircle2 size={12} />}
            {status === 'fallback' && <Layers size={12} />}
            {status === 'error' && <AlertTriangle size={12} />}
            {status === 'loading' ? 'Menghubungkan...' : 
             status === 'active' ? 'Sistem Peta Aktif' : 
             status === 'fallback' ? `Mode Cadangan: ${BASEMAPS[basemapIndex].name}` : 
             'Sistem Terputus'}
          </div>
          
          <div className="bg-slate-900 px-3 py-1.5 rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {mappedCount.toLocaleString()} TITIK TERVERIFIKASI
          </div>
        </div>
      </div>

      {/* Section 5: Map Container & Loading States */}
      <div className="relative h-[500px] w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner group">
        <div ref={mapContainerRef} className="w-full h-full z-10" />
        
        {/* Loading Overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-20 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-900 font-bold uppercase tracking-widest">Memuat Peta Dasar</p>
              <p className="text-[10px] text-slate-400 mt-1">Menghubungkan ke server {BASEMAPS[basemapIndex].name}...</p>
            </div>
          </div>
        )}

        {/* Error State / Retry Mechanism */}
        {status === 'error' && (
          <div className="absolute inset-0 z-20 bg-red-50/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Koneksi Peta Terputus</h4>
            <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">
              Gagal memuat peta dasar dari semua sumber cadangan (OSM, Carto, ESRI). 
              Pastikan koneksi internet Anda stabil atau coba hubungkan kembali.
            </p>
            <button 
              onClick={retryMap}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <RefreshCw size={16} />
              HUBUNGKAN KEMBALI SISTEM
            </button>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg pointer-events-none hidden sm:block">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Legenda Peta</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-700">Lembaga Ekonomi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-700">Klaster (Cluster)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest px-1">
        <div className="flex items-center gap-4">
          <span>Engine: Leaflet 1.9.4</span>
          <span>Cluster: Leaflet.markercluster</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers size={10} />
          <span>Sumber Aktif: {BASEMAPS[basemapIndex].name}</span>
        </div>
      </div>

      {/* Custom Popup Styles */}
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .marker-cluster-small { background-color: rgba(181, 226, 140, 0.6); }
        .marker-cluster-small div { background-color: rgba(110, 204, 57, 0.6); }
        .marker-cluster-medium { background-color: rgba(241, 211, 87, 0.6); }
        .marker-cluster-medium div { background-color: rgba(240, 194, 12, 0.6); }
        .marker-cluster-large { background-color: rgba(253, 156, 115, 0.6); }
        .marker-cluster-large div { background-color: rgba(241, 128, 23, 0.6); }
        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font: 12px "Inter", sans-serif;
          font-weight: bold;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
