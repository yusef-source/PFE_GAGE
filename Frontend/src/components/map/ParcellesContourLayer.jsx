import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { getParcelles } from "../../services/parcellesService";

function ParcellesContourLayer({ interactionDisabled = false }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getParcelles()
      .then((res) => {
        const sortedData = {
          ...res.data,
          features: [...res.data.features].sort((a, b) => {
            return Number(b.properties.surface) - Number(a.properties.surface);
          }),
        };

        setData(sortedData);
      })
      .catch((err) =>
        console.error("Erreur chargement limites parcelles:", err)
      );
  }, []);

  if (!data) return null;

  return (
    <GeoJSON
      key={`contours-${data.features.length}-${interactionDisabled}`}
      data={data}
      interactive={!interactionDisabled}
      style={{
        color: "#ffffff",
        weight: 1,
        fillOpacity: 0,
        opacity: 0.9,
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        layer.bindPopup(`
          <strong>Parcelle ${p.gid}</strong><br/>
          TF : ${p.tf ?? "-"}<br/>
          Surface : ${p.surface ?? "-"} m²<br/>
          Quartier : ${p.quartier ?? "-"}<br/>
          Zonage : ${p.zonage ?? "-"}
        `);

        layer.on({
          click: (e) => {
            if (interactionDisabled) return;

            e.target.setStyle({
              color: "#ffffff",
              weight: 0.6,
              fillOpacity: 0,
              opacity: 0.9,
            });
          },

          mouseover: (e) => {
            if (interactionDisabled) return;

            e.target.setStyle({
              color: "#00e5ff",
              weight: 1.8,
              fillOpacity: 0,
              opacity: 1,
            });
          },

          mouseout: (e) => {
            if (interactionDisabled) return;

            e.target.setStyle({
              color: "#ffffff",
              weight: 0.6,
              fillOpacity: 0,
              opacity: 0.9,
            });
          },
        });
      }}
    />
  );
}

export default ParcellesContourLayer;