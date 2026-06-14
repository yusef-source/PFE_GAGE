import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { getTram } from "../../services/tramService";

function TramLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getTram()
      .then((res) => {
        console.log("Nombre tram:", res.data.features.length);
        console.log("Premier tram:", res.data.features[0]);
        setData(res.data);
      })
      .catch((err) => console.error("Erreur chargement tram:", err));
  }, []);

  if (!data) return null;

const getTramColor = (ligne) => {
  const value = String(ligne || "")
    .toUpperCase()
    .replace(/\s+/g, "");

  // Busway
  if (value === "L1" || value.includes("L1")) {
    return "#16a34a"; // vert
  }

  if (value === "L2" || value.includes("L2")) {
    return "#22c55e"; // vert clair
  }

  // Tramway
  if (value === "T1" || value.includes("T1")) {
    return "#e11d48"; // rouge
  }

  if (value === "T2" || value.includes("T2")) {
    return "#2563eb"; // bleu
  }

  if (value === "T3" || value.includes("T3")) {
    return "#f59e0b"; // orange
  }

  if (value === "T4" || value.includes("T4")) {
    return "#9333ea"; // violet
  }

  // Défaut
  return "#e11d48";
};

  return (
    <>
      {/* Contour sombre sous la ligne tram */}
      <GeoJSON
        key="tram-shadow"
        data={data}
        style={{
          color: "#111827",
          weight: 8,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }}
      />

      {/* Ligne tram principale */}
      <GeoJSON
        key="tram-main"
        data={data}
        style={(feature) => ({
          color: getTramColor(feature.properties?.ligne),
          weight: 3.5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        })}
        onEachFeature={(feature, layer) => {
          const p = feature.properties || {};
          const ligne = p.ligne ?? "Non renseignée";

          
layer.bindPopup(`
  <div style="font-family: Arial, sans-serif; min-width: 180px;">
    <strong style="font-size: 14px;">Tramway / Busway</strong><br/>
    Ligne : ${ligne}<br/>
  </div>
`);

          if (p.ligne) {
            layer.bindTooltip(`Ligne ${p.ligne}`, {
              permanent: false,
              direction: "top",
            });
          }

          layer.on({
            mouseover: (e) => {
              e.target.setStyle({
                color: "#facc15",
                weight: 5,
                opacity: 1,
              });

              e.target.bringToFront();
            },

            mouseout: (e) => {
              e.target.setStyle({
                color: getTramColor(p.ligne),
                weight: 3.5,
                opacity: 1,
              });
            },
          });
        }}
      />
    </>
  );
}

export default TramLayer;