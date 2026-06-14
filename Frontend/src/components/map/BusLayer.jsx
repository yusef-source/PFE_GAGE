import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import { getBus } from "../../services/busService";
import "./BusLayer.css";

function BusLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getBus()
      .then((res) => {
        console.log("Nombre bus:", res.data.features.length);
        console.log("Premier bus:", res.data.features[0]);
        setData(res.data);
      })
      .catch((err) => console.error("Erreur chargement bus:", err));
  }, []);

  if (!data) return null;

  const busIcon = L.divIcon({
    className: "bus-marker",
    html: "🚌",
   iconSize: [20, 20],
iconAnchor: [10, 10],
popupAnchor: [0, -10],
  });

  return (
    <GeoJSON
      data={data}
      pointToLayer={(feature, latlng) => {
        return L.marker(latlng, { icon: busIcon });
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        const stopName =
          p.StopName ?? p.stopname ?? p.stop_name ?? p.name ?? "Non renseigné";

        const ligneName =
          p.LigneName ?? p.lignename ?? p.ligne_name ?? p.ligne ?? "-";

        layer.bindPopup(`
          <strong>Arrêt de bus</strong><br/>
          StopName : ${stopName}<br/>
          LigneName : ${ligneName}
        `);

        layer.bindTooltip(stopName, {
          permanent: false,
          direction: "top",
        });
      }}
    />
  );
}

export default BusLayer;