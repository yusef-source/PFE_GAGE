import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "./MapStatusBar.css";

function MapStatusBar({ setScaleText }) {
  const map = useMap();

  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [scaleDisplay, setScaleDisplay] = useState("1 : -");

  useEffect(() => {
    const niceScales = [
      100, 250, 500, 1000, 2000, 5000, 10000,
      25000, 50000, 100000, 250000, 500000,
      1000000, 2000000, 5000000, 10000000,
    ];

    const updateScale = () => {
      const centerLat = map.getCenter().lat;
      const zoom = map.getZoom();

      const metersPerPixel =
        (156543.03392 * Math.cos((centerLat * Math.PI) / 180)) /
        Math.pow(2, zoom);

      const rawScale = metersPerPixel * 96 * 39.37;

      let nearest = niceScales[0];
      for (let i = 1; i < niceScales.length; i++) {
        if (Math.abs(niceScales[i] - rawScale) < Math.abs(nearest - rawScale)) {
          nearest = niceScales[i];
        }
      }

      const text = `1 : ${nearest.toLocaleString("fr-FR")}`;
      setScaleDisplay(text);
      setScaleText?.(text);
    };

    const handleMouseMove = (e) => {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on("mousemove", handleMouseMove);
    map.on("zoomend moveend", updateScale);
    updateScale();

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("zoomend moveend", updateScale);
    };
  }, [map, setScaleText]);

  const formatCoord = (value, type) => {
    if (value === null || value === undefined) return "-";
    const direction =
      type === "lat"
        ? value >= 0 ? "N" : "S"
        : value >= 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  return (
    <div className="map-status-bar">
      <div className="map-status-item">
        <span className="map-status-icon">✥</span>
        <span>
          {formatCoord(coords.lat, "lat")}, {formatCoord(coords.lng, "lng")}
        </span>
      </div>

      <div className="map-status-separator"></div>

      <div className="map-status-item">
        <span className="map-status-icon">📏</span>
        <span>{scaleDisplay}</span>
      </div>
    </div>
  );
}

export default MapStatusBar;