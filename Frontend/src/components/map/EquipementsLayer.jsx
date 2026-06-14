import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { getEquipements } from "../../services/equipementsService";

function EquipementsLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getEquipements()
      .then((res) => {
        console.log("Nombre équipements:", res.data.features.length);
        console.log("Premier équipement:", res.data.features[0]);
        console.log(
  "Natures équipements:",
  [...new Set(res.data.features.map((f) =>
    f.properties.Nature ?? f.properties.nature ?? f.properties.NATURE
  ))]
);
        setData(res.data);
      })
      .catch((err) => console.error("Erreur chargement équipements:", err));
  }, []);

  if (!data) return null;

  const getColorByNature = (nature) => {
    const n = String(nature ?? "").trim().toUpperCase();

    if (n === "EQUIPEMENT CULTUEL") return "#9333ea";
    if (n === "EQUIPEMENT DE SANTE") return "#e11d48";
    if (n === "EQUIPEMENT ENSEIGNEMENT") return "#2563eb";
    if (n === "EQUIPEMENT PUBLIC") return "#f59e0b";
    if (n === "EQUIPEMENT SPORTIF") return "#16a34a";

    return "#6b7280";
  };

  return (
    <GeoJSON
      data={data}
      style={(feature) => {
        const nature =
  feature.properties.Nature ??
  feature.properties.nature ??
  feature.properties.NATURE;
        const color = getColorByNature(nature);

        return {
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.45,
          opacity: 0.9,
        };
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        const name = p.name ?? p.nom ?? p.Nom ?? p.NOM ?? "Non renseigné";
        const nature = p.Nature ?? p.nature ?? p.NATURE ?? "-";

        layer.bindPopup(`
          <strong>Équipement</strong><br/>
          Nom : ${name}<br/>
          Nature : ${nature}
        `);

        layer.bindTooltip(name, {
          permanent: false,
          direction: "top",
        });

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({
              weight: 3,
              fillOpacity: 0.7,
            });
            e.target.bringToFront();
          },

          mouseout: (e) => {
            const color = getColorByNature(nature);

            e.target.setStyle({
              color: color,
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.45,
              opacity: 0.9,
            });
          },
        });
      }}
    />
  );
}

export default EquipementsLayer;