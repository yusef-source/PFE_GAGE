import "./ParcellePopup.css";

function ParcellePopup({ properties }) {
  const p = properties || {};

  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || value === "") return "N/A";

    const n = Number(value);
    if (isNaN(n)) return "N/A";

    return n.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) <= 0) {
      return "N/A";
    }

    return `${formatNumber(value, 0)} DH/m²`;
  };

  const score = Number(p.score_final_amc);
  const scoreText = !isNaN(score) ? score.toFixed(2) : "N/A";

  const getScoreLabel = (s) => {
    if (isNaN(s)) return "Non défini";
    if (s >= 0.75) return "Très élevé";
    if (s >= 0.65) return "Élevé";
    if (s >= 0.55) return "Moyen";
    if (s >= 0.45) return "Faible";
    return "Très faible";
  };

  const getScoreColor = (s) => {
  if (isNaN(s)) return "#9ca3af";
  if (s >= 0.75) return "#17783c"; // très élevé
  if (s >= 0.65) return "#22c55e"; // élevé
  if (s >= 0.55) return "#facc15"; // moyen
  if (s >= 0.45) return "#f87d25"; // faible
  return "#ef4444"; // très faible
};

const scoreColor = getScoreColor(score);

  const getScorePercent = (s) => {
    if (isNaN(s)) return 0;
    return Math.max(0, Math.min(100, s * 100));
  };

  return (
    <div className="parcelle-popup">
      <div className="popup-header">
        <div className="popup-title-block">
          <div className="popup-icon">◎</div>
          <div>
            <div className="popup-title">Parcelle {p.gid ?? "-"}</div>
            <div className="popup-subtitle">TF : {p.tf ?? "-"}</div>
          </div>
        </div>

       <div
  className="popup-score-badge"
  style={{
    borderColor: `${scoreColor}66`,
    background: `${scoreColor}18`,
    color: scoreColor,
  }}
>
  <span style={{ background: scoreColor }}></span>
  <strong>{scoreText}</strong>
  <small>AMC</small>
</div>
      </div>

      <div className="popup-grid">
        <div className="popup-info-card">
          <span>◇ Surface</span>
          <strong>{formatNumber(p.surface, 0)} m²</strong>
        </div>

        <div className="popup-info-card">
          <span>▦ Hauteur max</span>
          <strong>{p.hauteur_mx ?? "-"}</strong>
        </div>

        <div className="popup-info-card">
          <span>⌂ Zonage</span>
          <strong>{p.zonage ?? "-"}</strong>
        </div>

        <div className="popup-info-card">
          <span>◉ Secteur</span>
          <strong>{p.secteur ?? "-"}</strong>
        </div>

        <div className="popup-info-card popup-info-card-full">
          <span>Quartier</span>
          <strong>{p.quartier ?? "-"}</strong>
        </div>
      </div>

      <div className="popup-score-section">
        <div className="popup-score-line">
          <span>Score AMC — {getScoreLabel(score)}</span>
          <strong>{scoreText} / 1.00</strong>
        </div>

        <div className="popup-score-bar">
          <div
            className="popup-score-fill"
            style={{ width: `${getScorePercent(score)}%` }}
          ></div>
        </div>

        <div className="popup-score-labels">
          <span>Très faible</span>
          <span>Faible</span>
          <span>Moyen</span>
          <span>Élevé</span>
          <span>Très élevé</span>
        </div>
      </div>

      <div className="popup-price-section">
        <div className="popup-section-title">↓ Référentiel des prix</div>

        <div className="popup-price-row">
          <span>⌂ Appartement</span>
          <strong>{formatPrice(p.prix_app_final)}</strong>
        </div>

        <div className="popup-price-row">
          <span>⚑ Terrain villa</span>
          <strong>{formatPrice(p.pt_v_final)}</strong>
        </div>

        <div className="popup-price-row">
          <span>⚙ Construction villa</span>
          <strong>{formatPrice(p.pc_v_final)}</strong>
        </div>

        <div className="popup-price-row">
          <span>▣ Terrain ZI</span>
          <strong>{formatPrice(p.pt_zi_final)}</strong>
        </div>

        <div className="popup-price-row">
          <span>⌁ Construction ZI</span>
          <strong>{formatPrice(p.pc_zi_final)}</strong>
        </div>
      </div>

     <div className="popup-actions">
  <button data-action="pdf" data-gid={p.gid}>Rapport PDF</button>
  <button data-action="compare" data-gid={p.gid}>Comparer</button>
  <button data-action="simulate" data-gid={p.gid}>Simuler</button>
  <button data-action="close">×</button>
</div>
    </div>
  );
}

export default ParcellePopup;