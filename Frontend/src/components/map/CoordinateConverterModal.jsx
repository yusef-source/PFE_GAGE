import { useState } from "react";
import proj4 from "proj4";
import "./CoordinateConverterModal.css";

// Définitions CRS
proj4.defs(
  "EPSG:26191",
  "+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +ellps=clrk80ign +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs"
);

proj4.defs(
  "EPSG:26192",
  "+proj=lcc +lat_1=29.7 +lat_0=29.7 +lon_0=-5.4 +k_0=0.999615596 +x_0=500000 +y_0=300000 +ellps=clrk80ign +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs"
);

proj4.defs(
  "EPSG:26194",
  "+proj=lcc +lat_1=26.1 +lat_0=26.1 +lon_0=-5.4 +k_0=0.999616304 +x_0=1200000 +y_0=400000 +ellps=clrk80ign +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs"
);

proj4.defs(
  "EPSG:26195",
  "+proj=lcc +lat_1=22.5 +lat_0=22.5 +lon_0=-5.4 +k_0=0.999616437 +x_0=1500000 +y_0=400000 +ellps=clrk80ign +towgs84=31,146,47,0,0,0,0 +units=m +no_defs +type=crs"
);

const CRS_OPTIONS = [
  {
    code: "EPSG:4326",
    label: "EPSG:4326 = WGS84 longitude/latitude",
  },
  {
    code: "EPSG:26191",
    label: "EPSG:26191 = Merchich / Nord Maroc",
  },
  {
    code: "EPSG:26192",
    label: "EPSG:26192 = Merchich / Sud Maroc",
  },
  {
    code: "EPSG:26194",
    label: "EPSG:26194 = Merchich / Sahara Nord",
  },
  {
    code: "EPSG:26195",
    label: "EPSG:26195 = Merchich / Sahara Sud",
  },
];

function CoordinateConverterModal({ onClose, onShowPoint }) {
  const [sourceCrs, setSourceCrs] = useState("EPSG:26191");
  const [targetCrs, setTargetCrs] = useState("EPSG:4326");
  const [xValue, setXValue] = useState("");
  const [yValue, setYValue] = useState("");
  const [result, setResult] = useState(null);
  const [wgsPoint, setWgsPoint] = useState(null);
  const [error, setError] = useState("");

  const resetResult = () => {
    setResult(null);
    setWgsPoint(null);
    setError("");
  };

  const convertCoordinates = () => {
    setError("");
    setResult(null);
    setWgsPoint(null);

    const x = Number(String(xValue).replace(",", "."));
    const y = Number(String(yValue).replace(",", "."));

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      setError("Veuillez saisir des coordonnées numériques valides.");
      return;
    }

    try {
      let converted;

      if (sourceCrs === targetCrs) {
        converted = [x, y];
      } else {
        converted = proj4(sourceCrs, targetCrs, [x, y]);
      }

      const [resultX, resultY] = converted;

      if (!Number.isFinite(resultX) || !Number.isFinite(resultY)) {
        setError("Conversion impossible. Vérifiez le système et les coordonnées.");
        return;
      }

      setResult({
        x: resultX,
        y: resultY,
        source: sourceCrs,
        target: targetCrs,
      });

      // Point WGS84 pour affichage Leaflet
      let lon;
      let lat;

      if (targetCrs === "EPSG:4326") {
        lon = resultX;
        lat = resultY;
      } else if (sourceCrs === "EPSG:4326") {
        lon = x;
        lat = y;
      } else {
        [lon, lat] = proj4(sourceCrs, "EPSG:4326", [x, y]);
      }

      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        setWgsPoint({
          lng: lon,
          lat: lat,
        });
      }
    } catch (err) {
      console.error("Erreur conversion coordonnées:", err);
      setError("Erreur lors de la conversion des coordonnées.");
    }
  };

  const handleShowPoint = () => {
    if (!wgsPoint) return;

    onShowPoint({
      lat: wgsPoint.lat,
      lng: wgsPoint.lng,
    });
  };

  const isGeographic = (crs) => crs === "EPSG:4326";

  return (
    <div className="coord-converter-overlay">
      <div className="coord-converter-modal">
        <div className="coord-converter-header">
          <div>
            <h2>Conversion des coordonnées</h2>
            <p>
              Convertir des coordonnées entre WGS84 et les systèmes Merchich du Maroc.
            </p>
          </div>

          <button onClick={onClose}>×</button>
        </div>

        <div className="coord-converter-body">
          <div className="coord-form-group">
            <label>Système source</label>
            <select
              value={sourceCrs}
              onChange={(e) => {
                setSourceCrs(e.target.value);
                resetResult();
              }}
            >
              {CRS_OPTIONS.map((crs) => (
                <option key={crs.code} value={crs.code}>
                  {crs.label}
                </option>
              ))}
            </select>
          </div>

          <div className="coord-form-group">
            <label>Système cible</label>
            <select
              value={targetCrs}
              onChange={(e) => {
                setTargetCrs(e.target.value);
                resetResult();
              }}
            >
              {CRS_OPTIONS.map((crs) => (
                <option key={crs.code} value={crs.code}>
                  {crs.label}
                </option>
              ))}
            </select>
          </div>

          <div className="coord-grid">
            <div className="coord-form-group">
              <label>{isGeographic(sourceCrs) ? "Longitude" : "X / Easting"}</label>
              <input
                type="text"
                value={xValue}
                onChange={(e) => {
                  setXValue(e.target.value);
                  resetResult();
                }}
                placeholder={isGeographic(sourceCrs) ? "-7.5898" : "Ex : 330000"}
              />
            </div>

            <div className="coord-form-group">
              <label>{isGeographic(sourceCrs) ? "Latitude" : "Y / Northing"}</label>
              <input
                type="text"
                value={yValue}
                onChange={(e) => {
                  setYValue(e.target.value);
                  resetResult();
                }}
                placeholder={isGeographic(sourceCrs) ? "33.5650" : "Ex : 370000"}
              />
            </div>
          </div>

          <button className="coord-convert-btn" onClick={convertCoordinates}>
            Convertir
          </button>

          {error && <div className="coord-error">{error}</div>}

          {result && (
            <div className="coord-result">
              <h3>Résultat</h3>

              <div className="coord-result-row">
                <span>{isGeographic(targetCrs) ? "Longitude" : "X / Easting"}</span>
                <strong>{result.x.toFixed(isGeographic(targetCrs) ? 8 : 3)}</strong>
              </div>

              <div className="coord-result-row">
                <span>{isGeographic(targetCrs) ? "Latitude" : "Y / Northing"}</span>
                <strong>{result.y.toFixed(isGeographic(targetCrs) ? 8 : 3)}</strong>
              </div>

              <div className="coord-result-row">
                <span>Système cible</span>
                <strong>{targetCrs}</strong>
              </div>

              {wgsPoint && (
                <button className="coord-show-btn" onClick={handleShowPoint}>
                  Afficher le point sur la carte
                </button>
              )}
            </div>
          )}

          <div className="coord-note">
            Pour afficher un point sur Leaflet, l’application utilise automatiquement
            les coordonnées WGS84 longitude/latitude.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoordinateConverterModal;