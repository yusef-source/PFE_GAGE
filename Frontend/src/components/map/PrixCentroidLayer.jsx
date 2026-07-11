import { useEffect, useMemo, useState } from "react";
import { CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
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

function PrixCentroidLayer({ heatmapField }) {
  const map = useMap();
  const [points, setPoints] = useState([]);

  // Important : forcer cette couche en SVG pour ne pas bloquer les clics des autres couches
  const priceRenderer = useMemo(() => {
    return L.svg({
      pane: "priceCentroidPane",
    });
  }, []);

  useEffect(() => {
    let pane = map.getPane("priceCentroidPane");

    if (!pane) {
      pane = map.createPane("priceCentroidPane");
    }

    // Points prix au-dessus de la heatmap
    pane.style.zIndex = 650;
    pane.style.pointerEvents = "auto";

    if (map.getPane("popupPane")) {
      map.getPane("popupPane").style.zIndex = 1000;
    }

    if (map.getPane("tooltipPane")) {
      map.getPane("tooltipPane").style.zIndex = 1001;
    }
  }, [map]);

  useEffect(() => {
    getParcelles()
      .then((res) => {
        const features = res.data.features;

        const values = features
          .map((f) => Number(f.properties[heatmapField]))
          .filter((v) => !isNaN(v) && v > 0);

        if (values.length === 0) {
          setPoints([]);
          return;
        }

        const sortedValues = [...values].sort((a, b) => a - b);

        const getPercentile = (arr, p) => {
          const index = Math.floor((p / 100) * (arr.length - 1));
          return arr[index];
        };

        const p20 = getPercentile(sortedValues, 20);
        const p40 = getPercentile(sortedValues, 40);
        const p60 = getPercentile(sortedValues, 60);
        const p80 = getPercentile(sortedValues, 80);

        const getColor = (value) => {
          if (value <= p20) return "#2563eb";
          if (value <= p40) return "#22c55e";
          if (value <= p60) return "#facc15";
          if (value <= p80) return "#f97316";
          return "#ef4444";
        };

        const centroidPoints = features
          .map((feature) => {
            const p = feature.properties;
            const center = getGeometryCenter(feature.geometry);
            const value = Number(p[heatmapField]);

            if (!center || isNaN(value) || value <= 0) return null;

            return {
              id: p.gid,
              lat: center.lat,
              lng: center.lng,
              value,
              color: getColor(value),
              properties: p,
            };
          })
          .filter(Boolean);

        setPoints(centroidPoints);
      })
      .catch((err) => {
        console.error("Erreur chargement centroïdes prix:", err);
      });
  }, [heatmapField]);

  const fieldLabel = {
    prix_app_final: "Prix appartement",
    pt_v_final: "Prix terrain villa",
    pt_zi_final: "Prix terrain ZI",
  };

  return (
    <>
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          pane="priceCentroidPane"
          renderer={priceRenderer}
          center={[point.lat, point.lng]}
          radius={5}
          interactive={true}
          bubblingMouseEvents={false}
          pathOptions={{
            color: "#111827",
            weight: 1,
            fillColor: point.color,
            fillOpacity: 0.9,
          }}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.preventDefault();
              e.originalEvent.stopPropagation();
              e.target.openPopup();
            },
          }}
        >
          <Popup>
            <strong>Parcelle {point.properties.gid}</strong>
            <br />
            TF : {point.properties.tf ?? "-"}
            <br />
            Quartier : {point.properties.quartier ?? "-"}
            <br />
            {fieldLabel[heatmapField]} : {point.value.toFixed(2)} DH/m²
          </Popup>

          <Tooltip>
            {fieldLabel[heatmapField]} : {point.value.toFixed(0)} DH/m²
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

export default PrixCentroidLayer;