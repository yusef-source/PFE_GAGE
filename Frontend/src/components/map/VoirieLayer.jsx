import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { getVoirie } from "../../services/voirieService";

function VoirieLayer({ onDataLoaded }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getVoirie()
      .then((res) => {
        setData(res.data);

        if (onDataLoaded) {
          onDataLoaded(res.data);
        }
      })
      .catch((err) => console.error("Erreur chargement voirie:", err));
  }, [onDataLoaded]);

  if (!data) return null;

  const voirieStyle = {
    color: "#ffffff",
    weight: 2.5,
    opacity: 0.9,
  };

  return (
    <GeoJSON
      data={data}
      style={voirieStyle}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        layer.bindPopup(`
          <strong>Voirie</strong><br/>
          Nom : ${p.name ?? "Non nommé"}<br/>
          Type : ${p.highway ?? "-"}
        `);

        if (p.name) {
          layer.bindTooltip(p.name, {
            permanent: false,
            direction: "top",
            className: "voirie-label",
          });
        }

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({
              color: "#00e5ff",
              weight: 4,
              opacity: 1,
            });
          },

          mouseout: (e) => {
            e.target.setStyle(voirieStyle);
          },
        });
      }}
    />
  );
}

export default VoirieLayer;