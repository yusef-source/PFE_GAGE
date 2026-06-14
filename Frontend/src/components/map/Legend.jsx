import { useState } from "react";

function Legend({ layers, heatmapField }) {
  const [collapsed, setCollapsed] = useState(false);

  const priceLabel = {
    prix_app_final: "Prix appartement",
    pt_v_final: "Prix terrain villa",
    pt_zi_final: "Prix terrain ZI",
  };

  const legendContainerStyle = {
    position: "fixed",
    bottom: "1px",
    right: "1px",
    zIndex: 99999,
    width: "300px",
    maxHeight: "55vh",
    background: "rgba(15, 23, 32, 0.92)",
    color: "#e5e7eb",
    border: "1px solid rgba(56, 189, 248, 0.22)",
    borderRadius: "16px",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.38)",
    fontSize: "12px",
    fontFamily: "Arial, sans-serif",
    backdropFilter: "blur(6px)",
    overflow: "visible",
  };

  const headerStyle = {
    height: "38px",
    background: "rgba(15, 23, 32, 0.96)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    fontWeight: 700,
    fontSize: "13px",
    color: "#ffffff",
  };

  const contentStyle = {
    padding: "12px 14px 45px 14px",
    paddingRight: "8px",
    fontSize: "12px",
    lineHeight: "1.7",
    maxHeight: "calc(55vh - 38px)",
    overflowY: "auto",
    overflowX: "hidden",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    boxSizing: "border-box",
  };

  const sectionStyle = {
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
  };

  const titleStyle = {
    display: "block",
    color: "#ffffff",
    fontSize: "12px",
    marginBottom: "5px",
  };

  const subLabelStyle = {
    color: "#9ca3af",
    fontSize: "11px",
    marginBottom: "4px",
  };

  const square = (color) => ({
    background: color,
    width: 12,
    height: 12,
    display: "inline-block",
    marginRight: 7,
    verticalAlign: "middle",
    borderRadius: "2px",
  });

  const circle = (color) => ({
    background: color,
    width: 12,
    height: 12,
    borderRadius: "50%",
    display: "inline-block",
    marginRight: 7,
    verticalAlign: "middle",
    border: "1px solid rgba(255,255,255,0.65)",
  });

  const line = (color, height = 4) => ({
    background: color,
    width: 28,
    height,
    display: "inline-block",
    marginRight: 7,
    verticalAlign: "middle",
    borderRadius: "4px",
  });

  const tramStationSymbol = {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#ffffff",
    border: "2px solid #e11d48",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    verticalAlign: "middle",
    boxShadow: "0 2px 7px rgba(0,0,0,0.35)",
  };

  return (
    <div style={legendContainerStyle}>
      <div style={headerStyle}>
        <strong>
          <span style={{ color: "#38bdf8", marginRight: 6 }}>ⓘ</span>
          LÉGENDE
        </strong>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Ouvrir la légende" : "Réduire la légende"}
          style={{
            border: "none",
            background: "transparent",
            color: "#38bdf8",
            fontSize: "20px",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {collapsed ? "⌃" : "⌄"}
        </button>
      </div>

      {!collapsed && (
        <div className="legend-scroll" style={contentStyle}>
          {layers?.parcelles && (
            <div>
              <strong style={titleStyle}>Score AMC</strong>

              <div>
                <span style={square("#166534")}></span>
                Très élevé : ≥ 0.75
              </div>
              <div>
                <span style={square("#22c55e")}></span>
                Élevé : 0.65 – 0.75
              </div>
              <div>
                <span style={square("#84cc16")}></span>
                Moyen : 0.55 – 0.65
              </div>
              <div>
                <span style={square("#facc15")}></span>
                Faible : 0.45 – 0.55
              </div>
              <div>
                <span style={square("#ef4444")}></span>
                Très faible : &lt; 0.45
              </div>
            </div>
          )}

          {layers?.heatmap && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Heatmap prix</strong>
              <div style={subLabelStyle}>
                {priceLabel[heatmapField] || "Prix"}
              </div>

              <div>
                <span style={square("#2563eb")}></span>
                Prix faibles
              </div>
              <div>
                <span style={square("#22c55e")}></span>
                Prix moyens
              </div>
              <div>
                <span style={square("#facc15")}></span>
                Prix élevés
              </div>
              <div>
                <span style={square("#f97316")}></span>
                Prix très élevés
              </div>
              <div>
                <span style={square("#ef4444")}></span>
                Prix maximums
              </div>
            </div>
          )}

          {layers?.prixCentroid && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Points prix par parcelle</strong>
              <div style={subLabelStyle}>
                {priceLabel[heatmapField] || "Prix"}
              </div>

              <div>
                <span style={circle("#2563eb")}></span>
                Classe 1 — prix faibles
              </div>
              <div>
                <span style={circle("#22c55e")}></span>
                Classe 2
              </div>
              <div>
                <span style={circle("#facc15")}></span>
                Classe 3
              </div>
              <div>
                <span style={circle("#f97316")}></span>
                Classe 4
              </div>
              <div>
                <span style={circle("#ef4444")}></span>
                Classe 5 — prix élevés
              </div>
            </div>
          )}

          {layers?.voirie && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Voirie</strong>
              <div>
                <span
                  style={{
                    ...line("#ffffff", 4),
                    border: "1px solid rgba(15, 23, 32, 0.8)",
                  }}
                ></span>
                Voirie
              </div>
            </div>
          )}

          {(layers?.tram || layers?.stationsTram) && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Transport guidé</strong>

              {layers?.tram && (
                <>
                  <div>
                    <span style={line("#e11d48", 5)}></span>
                    Tramway T1
                  </div>

                  <div>
                    <span style={line("#2563eb", 5)}></span>
                    Tramway T2
                  </div>

                  <div>
                    <span style={line("#f59e0b", 5)}></span>
                    Tramway T3
                  </div>

                  <div>
                    <span style={line("#9333ea", 5)}></span>
                    Tramway T4
                  </div>

                  <div>
                    <span style={line("#16a34a", 5)}></span>
                    Busway L1
                  </div>

                  <div>
                    <span style={line("#22c55e", 5)}></span>
                    Busway L2
                  </div>
                </>
              )}

              {layers?.stationsTram && (
                <div>
                  <span style={tramStationSymbol}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="3"
                        width="12"
                        height="13"
                        rx="2"
                        fill="#e11d48"
                      />
                      <rect
                        x="8"
                        y="5"
                        width="8"
                        height="4"
                        rx="1"
                        fill="#ffffff"
                      />
                      <circle cx="9" cy="13" r="1.3" fill="#ffffff" />
                      <circle cx="15" cy="13" r="1.3" fill="#ffffff" />
                      <path
                        d="M8 20L11 16"
                        stroke="#e11d48"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 20L13 16"
                        stroke="#e11d48"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  Stations tram / busway
                </div>
              )}
            </div>
          )}

          {layers?.bus && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Bus</strong>
              <div>
                <span style={circle("#2563eb")}></span>
                Arrêt de bus
              </div>
            </div>
          )}

          {layers?.gare && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Gare</strong>
              <div>
                <span style={circle("#f59e0b")}></span>
                Gare
              </div>
            </div>
          )}

          {layers?.equipements && (
            <div style={sectionStyle}>
              <strong style={titleStyle}>Équipements</strong>

              <div>
                <span style={square("#9333ea")}></span>
                Cultuel
              </div>
              <div>
                <span style={square("#e11d48")}></span>
                Santé
              </div>
              <div>
                <span style={square("#2563eb")}></span>
                Enseignement
              </div>
              <div>
                <span style={square("#f59e0b")}></span>
                Public
              </div>
              <div>
                <span style={square("#16a34a")}></span>
                Sportif
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Legend;