import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import { getGare } from "../../services/gareService";
import "./GareLayer.css";

function GareLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getGare()
      .then((res) => {
        console.log("Nombre gares:", res.data.features.length);
        console.log("Première gare:", res.data.features[0]);
        setData(res.data);
      })
      .catch((err) => console.error("Erreur chargement gare:", err));
  }, []);

  if (!data) return null;

  const gareIcon = L.divIcon({
    className: "gare-marker",
    html: `<div class="gare-marker-inner">🚉</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  return (
    <GeoJSON
      data={data}
      pointToLayer={(feature, latlng) => {
        return L.marker(latlng, { icon: gareIcon });
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        const name = p.name ?? p.nom ?? p.gare ?? "Non renseigné";

        layer.bindPopup(`
          <strong>Gare</strong><br/>
          Nom : ${name}
        `);

        layer.bindTooltip(name, {
          permanent: false,
          direction: "top",
        });
      }}
    />
  );
}

export default GareLayer;