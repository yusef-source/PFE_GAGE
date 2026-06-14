import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { getStationsTram } from "../../services/stationsTramService";

function StationsTramLayer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getStationsTram()
      .then((res) => {
        console.log("Stations tram :", res.data.features.length);
        console.log("Première station tram :", res.data.features[0]);
        setData(res.data);
      })
      .catch((err) =>
        console.error("Erreur chargement stations tram :", err)
      );
  }, []);

  const createStationTramIcon = () => {
    const color = "#e11d48";

    return L.divIcon({
      className: "station-tram-symbol-wrapper",
      html: `
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid ${color};
          box-shadow: 0 3px 10px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="3" width="12" height="13" rx="2" fill="${color}"/>
            <rect x="8" y="5" width="8" height="4" rx="1" fill="#ffffff"/>
            <circle cx="9" cy="13" r="1.3" fill="#ffffff"/>
            <circle cx="15" cy="13" r="1.3" fill="#ffffff"/>
            <path d="M8 20L11 16" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 20L13 16" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -14],
      tooltipAnchor: [0, -14],
    });
  };

  if (!data?.features) return null;

  return (
    <>
      {data.features.map((feature) => {
        const p = feature.properties || {};
        const geom = feature.geometry;

        if (!geom) return null;

        let coordinates = null;

        if (geom.type === "Point") {
          coordinates = geom.coordinates;
        }

        if (geom.type === "MultiPoint" && geom.coordinates?.length > 0) {
          coordinates = geom.coordinates[0];
        }

        if (!coordinates || coordinates.length < 2) return null;

        const position = [coordinates[1], coordinates[0]];

        return (
          <Marker
            key={p.gid}
            position={position}
            icon={createStationTramIcon()}
          >
            <Popup>
              <div style={{ fontFamily: "Arial, sans-serif", minWidth: "190px" }}>
                <strong style={{ fontSize: "14px" }}>Station tram</strong>
                <br />
                Nom : {p.nom || "Non renseigné"}
                <br />
                Ligne : {p.ligne || "Non renseignée"}
                <br />
                Nature : {p.nature || "Non renseignée"}
              </div>
            </Popup>

            {p.nom && (
              <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                {p.nom}
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </>
  );
}

export default StationsTramLayer;