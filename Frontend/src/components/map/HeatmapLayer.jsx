import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { getParcelles } from "../../services/parcellesService";

function getGeometryCenter(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let coords = [];

  if (geometry.type === "Polygon") {
    coords = geometry.coordinates[0];
  }

  if (geometry.type === "MultiPolygon") {
    coords = geometry.coordinates[0][0];
  }

  if (!coords || coords.length === 0) return null;

  let sumLng = 0;
  let sumLat = 0;

  coords.forEach((coord) => {
    sumLng += coord[0];
    sumLat += coord[1];
  });

  return {
    lng: sumLng / coords.length,
    lat: sumLat / coords.length,
  };
}

function HeatmapLayer({ heatmapField }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    // Supprimer l'ancienne heatmap avant d'en créer une nouvelle
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    getParcelles()
      .then((res) => {
        if (isCancelled) return;

        const features = res.data?.features || [];

        const values = features
          .map((f) => Number(f.properties?.[heatmapField]))
          .filter((v) => !isNaN(v) && v > 0);

        if (values.length === 0) return;

        const sortedValues = [...values].sort((a, b) => a - b);

        const getPercentile = (arr, p) => {
          const index = Math.floor((p / 100) * (arr.length - 1));
          return arr[index];
        };

        const minValue = getPercentile(sortedValues, 5);
        const maxValue = getPercentile(sortedValues, 95);

        console.log("Champ heatmap :", heatmapField);
        console.log("Min percentile 5% :", minValue);
        console.log("Max percentile 95% :", maxValue);

        const points = features
          .map((feature) => {
            const center = getGeometryCenter(feature.geometry);
            const value = Number(feature.properties?.[heatmapField]);

            if (!center || isNaN(value) || value <= 0) return null;

            let normalized =
              maxValue === minValue
                ? 0.5
                : (value - minValue) / (maxValue - minValue);

            normalized = Math.max(0, Math.min(normalized, 1));

            const intensity = Math.pow(normalized, 1.15);

            return [center.lat, center.lng, intensity];
          })
          .filter(Boolean);

        if (points.length === 0) return;

        const heatLayer = L.heatLayer(points, {
          radius: 18,
          blur: 16,
          maxZoom: 18,
          minOpacity: 0.22,
          max: 1.8,
          gradient: {
            0.0: "#2563eb",
            0.25: "#22c55e",
            0.55: "#facc15",
            0.8: "#f97316",
            1.0: "#ef4444",
          },
        });

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
      })
      .catch((err) => {
        console.error("Erreur chargement heatmap:", err);
      });

    return () => {
      isCancelled = true;

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, heatmapField]);

  return null;
}

export default HeatmapLayer;