
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { FormState } from '../types';

interface IndonesiaMapProps {
  data: (FormState & { docId: string; timestamp: number })[];
}

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const MAP_SOURCES = [
      {
        url: 'https://cdn.jsdelivr.net/gh/superpikar/indonesia-topojson@master/indonesia-provinces.json',
        type: 'topojson'
      },
      {
        url: 'https://raw.githubusercontent.com/superpikar/indonesia-topojson/master/indonesia-provinces.json',
        type: 'topojson'
      },
      {
        url: 'https://cdn.jsdelivr.net/gh/anshori/indonesia-geojson@master/indonesia-provinces.json',
        type: 'geojson'
      },
      {
        url: 'https://raw.githubusercontent.com/anshori/indonesia-geojson/master/indonesia-provinces.json',
        type: 'geojson'
      },
      {
        url: 'https://raw.githubusercontent.com/superpikar/indonesia-topojson/main/indonesia-provinces.json',
        type: 'topojson'
      },
      {
        url: 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/indonesia.geojson',
        type: 'geojson'
      },
      {
        url: 'https://raw.githubusercontent.com/superpikar/indonesia-topojson/master/indonesia.json',
        type: 'topojson'
      }
    ];

    const tryFetch = async (index: number) => {
      if (index >= MAP_SOURCES.length) {
        setLoading(false);
        setError("Gagal memuat data peta dari semua sumber. Silakan periksa koneksi internet Anda.");
        return;
      }

      const source = MAP_SOURCES[index];
      try {
        const response = await fetch(source.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log(`Map source ${index} loaded successfully (${source.type})`);
        
        if (source.type === 'topojson') {
          if (!data.objects) throw new Error("Invalid TopoJSON");
          // Try to find a suitable object key (provinces, indonesia, etc)
          const objectKey = Object.keys(data.objects).find(k => 
            k.toLowerCase().includes('province') || 
            k.toLowerCase().includes('indonesia') || 
            k.toLowerCase().includes('states')
          ) || Object.keys(data.objects)[0];
          
          const geojson = feature(data, data.objects[objectKey]) as any;
          setGeoData(geojson);
        } else {
          setGeoData(data);
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.warn(`Source ${index} failed:`, err);
        tryFetch(index + 1);
      }
    };

    setLoading(true);
    setError(null);
    tryFetch(0);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const updateMap = () => {
      if (!svgRef.current) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = svgRef.current.clientWidth || 800;
      const height = 400;

      // Indonesia Bounding Box for fallback
      const indonesiaBounds: any = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[95, -11], [141, -11], [141, 6], [95, 6], [95, -11]]]
          }
        }]
      };

      const projection = d3.geoMercator()
        .fitSize([width, height], geoData || indonesiaBounds);

      const path = d3.geoPath().projection(projection);

      if (geoData) {
        // Draw map
        svg.append("g")
          .selectAll("path")
          .data(geoData.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", "#f1f5f9")
          .attr("stroke", "#cbd5e1")
          .attr("stroke-width", 0.5);
      } else {
        // Draw fallback grid
        svg.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "#f8fafc")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "4,4");
          
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#94a3b8")
          .attr("font-size", "12px")
          .text("Peta dasar tidak tersedia, menampilkan koordinat titik...");
      }

      // Draw points
      const points = data.filter(d => {
        const lat = typeof d.latitude === 'string' ? parseFloat(d.latitude) : d.latitude;
        const lng = typeof d.longitude === 'string' ? parseFloat(d.longitude) : d.longitude;
        return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
      }).map(d => ({
        ...d,
        latitude: typeof d.latitude === 'string' ? parseFloat(d.latitude) : d.latitude,
        longitude: typeof d.longitude === 'string' ? parseFloat(d.longitude) : d.longitude
      }));

      console.log(`Map rendering: ${points.length} points found out of ${data.length} total submissions`);
      if (points.length > 0) {
        console.log('Sample point:', points[0]);
      }

      const gPoints = svg.append("g").attr("class", "points");
      
      gPoints.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", (d: any) => {
          const coords = projection([d.longitude, d.latitude]);
          return coords ? coords[0] : 0;
        })
        .attr("cy", (d: any) => {
          const coords = projection([d.longitude, d.latitude]);
          return coords ? coords[1] : 0;
        })
        .attr("r", 6)
        .attr("fill", "#dc2626")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)
        .style("cursor", "pointer")
        .attr("class", "map-marker")
        .append("title")
        .text((d: any) => `${d.namaLembaga}\n${d.desa}, ${d.kabupaten}\nLat: ${d.latitude}, Long: ${d.longitude}`);

      // Add a small count indicator
      svg.append("rect")
        .attr("x", 5)
        .attr("y", height - 25)
        .attr("width", 180)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("opacity", 0.8)
        .attr("rx", 4);

      svg.append("text")
        .attr("x", 10)
        .attr("y", height - 10)
        .attr("font-size", "10px")
        .attr("fill", points.length > 0 ? "#1e293b" : "#ef4444")
        .attr("font-weight", "bold")
        .text(`Status: ${points.length} Lembaga Terpetakan`);
    };

    updateMap();
    window.addEventListener('resize', updateMap);
    return () => window.removeEventListener('resize', updateMap);
  }, [geoData, data, loading]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Sebaran Lokasi Lembaga Ekonomi</h3>
          <p className="text-xs text-slate-500">Pemetaan spasial berdasarkan hasil tagging GPS</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase">Titik Lokasi</span>
        </div>
      </div>

      <div className="relative h-[400px] w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Memuat Peta Indonesia...</p>
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            className="w-full h-full"
          />
        )}
      </div>
      {error && !loading && (
        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-[10px] text-amber-700 font-medium leading-tight">
              {error} <br/>
              <span className="text-amber-600/70">Menampilkan mode koordinat terbatas (titik lokasi tetap akurat).</span>
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
