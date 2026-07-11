import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp-root">

      {/* ── NAVBAR ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#1B3A5C"/>
            <rect x="16" y="24" width="16" height="16" rx="1" fill="#2A5298"/>
            <polygon points="24,10 13,24 35,24" fill="#C8952A"/>
            <rect x="21" y="32" width="6" height="8" rx="1" fill="#E8B84B"/>
            <rect x="17" y="26" width="5" height="4" rx="0.5" fill="#7DD3FC"/>
            <rect x="26" y="26" width="5" height="4" rx="0.5" fill="#7DD3FC"/>
            <circle cx="37" cy="11" r="5" fill="#C8952A"/>
            <circle cx="37" cy="11" r="2.5" fill="#1B3A5C"/>
            <path d="M34.5 15.5 Q37 20 39.5 15.5" fill="#C8952A"/>
          </svg>
          <span className="lp-nav-name">
            <span className="ng">GEO</span>
            <span className="np">PRO</span>
            <span className="ne">Expert</span>
          </span>
        </div>
        <div className="lp-nav-links">
  <a href="#accueil">Accueil</a>
  <a href="#features">Fonctionnalités</a>
  <a href="#how-it-works">Comment ça marche</a>
  <a href="#about">À propos</a>
  <button className="lp-btn-login" onClick={() => navigate("/login")}>
    Connexion
  </button>
</div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="accueil">
  <div className="lp-hero-inner">
    <div className="lp-hero-content">
      <div className="lp-hero-badge">Plateforme web SIG</div>
      <h1>
        L'expertise foncière<br />
        <span>à portée de carte</span>
      </h1>
      <p>
        Visualisez, filtrez, comparez et évaluez les parcelles
        immobilières à partir de données SIG, urbanistiques
        et économiques.
      </p>

      <div className="lp-hero-actions">
        <button
          className="lp-btn-primary"
          onClick={() => navigate("/login")}
        >
          Accéder à la plateforme →
        </button>

        <a href="#features" className="lp-btn-ghost">
          Découvrir les fonctionnalités
        </a>
      </div>

      <div className="lp-hero-stats">
        <div className="lp-stat">
          <strong>SIG Web</strong>
          <span>Cartographie avancée</span>
        </div>
        <div className="lp-stat-divider" />
        <div className="lp-stat">
          <strong>Analyse AMC</strong>
          <span>Score multicritères</span>
        </div>
        <div className="lp-stat-divider" />
        <div className="lp-stat">
          <strong>Prix ajustés</strong>
          <span>DH/m² par zonage</span>
        </div>
      </div>
    </div>

    <div className="lp-hero-visual">
      <div className="lp-hero-map-card">
        <div className="lp-hero-map-grid" />

        <div className="lp-hero-heat lp-hero-heat-1" />
        <div className="lp-hero-heat lp-hero-heat-2" />
        <div className="lp-hero-heat lp-hero-heat-3" />

        <div className="lp-hero-road lp-road-1" />
        <div className="lp-hero-road lp-road-2" />

        <div className="lp-hero-parcel parcel-1" />
        <div className="lp-hero-parcel parcel-2" />
        <div className="lp-hero-parcel parcel-3" />
        <div className="lp-hero-parcel parcel-4" />
        <div className="lp-hero-parcel parcel-5" />
        <div className="lp-hero-parcel parcel-6" />

        <div className="lp-hero-point point-1" />
        <div className="lp-hero-point point-2" />
        <div className="lp-hero-point point-3" />

       <div className="lp-hero-popup lp-parcel-preview-popup">
  <button className="lp-popup-close">×</button>

  <div className="lp-popup-header">
    <div className="lp-popup-icon">◎</div>

    <div className="lp-popup-title-block">
      <h3>Parcelle 11251</h3>
      <p>TF : T101202/C</p>
    </div>

    <div className="lp-popup-score">
      <strong>0.63</strong>
      <span>AMC</span>
    </div>
  </div>

  <div className="lp-popup-info-grid">
    <div className="lp-popup-info-card">
      <span>⌂ Surface</span>
      <strong>73 m²</strong>
    </div>

    <div className="lp-popup-info-card">
      <span>▦ Hauteur max</span>
      <strong>R+2</strong>
    </div>

    <div className="lp-popup-info-card">
      <span>⌂ Zonage</span>
      <strong>Zone E</strong>
    </div>

    <div className="lp-popup-info-card">
      <span>⊙ Secteur</span>
      <strong>E2sr</strong>
    </div>

    <div className="lp-popup-info-card lp-popup-info-card-wide">
      <span>Quartier</span>
      <strong>AF10</strong>
    </div>
  </div>

  <div className="lp-popup-score-section">
    <div className="lp-popup-score-label">
      <span>Score AMC — Moyen</span>
      <strong>0.63 / 1.00</strong>
    </div>

    <div className="lp-popup-score-bar">
      <div className="lp-popup-score-cursor" />
    </div>

    <div className="lp-popup-score-scale">
      <span>Très faible</span>
      <span>Faible</span>
      <span>Moyen</span>
      <span>Élevé</span>
      <span>Très élevé</span>
    </div>
  </div>

  <div className="lp-popup-price-section">
    <h4>↓ RÉFÉRENTIEL DES PRIX</h4>

    <div className="lp-popup-price-row">
      <span>⌂ Appartement</span>
      <strong>9 604 DH/m²</strong>
    </div>

    <div className="lp-popup-price-row">
      <span>⚑ Terrain villa</span>
      <strong>N/A</strong>
    </div>

    <div className="lp-popup-price-row">
      <span>⚙ Construction villa</span>
      <strong>N/A</strong>
    </div>

    <div className="lp-popup-price-row">
      <span>▣ Terrain ZI</span>
      <strong>15 743 DH/m²</strong>
    </div>

    <div className="lp-popup-price-row">
      <span>⌁ Construction ZI</span>
      <strong>3 500 DH/m²</strong>
    </div>
  </div>
</div>
    
      </div>
    </div>
  </div>
</section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-header">
          <span className="lp-section-badge">Fonctionnalités</span>
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une suite complète d'outils pour l'expertise immobilière et foncière</p>
        </div>
        <div className="lp-features-grid">

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(200,149,42,0.12)", color: "#C8952A" }}>
              🗺️
            </div>
            <h3>Cartographie SIG</h3>
            <p>Visualisation multi-couches : parcelles, voirie, transport, équipements sur fond de carte dynamique.</p>
          </div>

<div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(26,140,120,0.12)", color: "#1a8c78" }}>
              📊
            </div>
            <h3>Analyse multicritère AMC</h3>
            <p>Évaluer le potentiel foncier et immobilier des parcelles à partir d’un score d’aide à la décision.</p>
          </div>

          

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(26,140,120,0.12)", color: "#1a8c78" }}>
              📊
            </div>
            <h3>Analyse & Filtres immobiliers avancés</h3>
            <p>Identifier rapidement les parcelles selon le prix, la surface, le zonage, le score AMC et la hauteur...etc avec statistiques actualisées selon les filtres.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8" }}>
              📍
            </div>
            <h3>Heatmap des prix</h3>
            <p>Visualisez la distribution spatiale des prix au m² par type de bien sur l'ensemble du territoire.</p>
          </div>

          <div className="lp-feature-card">
  <div className="lp-feature-icon" style={{ background: "rgba(200,149,42,0.12)", color: "#C8952A" }}>
    📄
  </div>
  <h3>Rapport PDF automatique</h3>
  <p>Générez une fiche d'expertise parcellaire structurée avec prix, score, observations et recommandations.</p>
</div>

<div className="lp-feature-card">
  <div className="lp-feature-icon" style={{ background: "rgba(168,85,247,0.12)", color: "#c084fc" }}>
    💰
  </div>
  <h3>Simulateur promoteur</h3>
  <p>Estimez la rentabilité d'un projet immobilier : chiffre d'affaires, coûts, bénéfice et marge nette.</p>
</div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
              ✏️
            </div>
            <h3>Outils cartographiques professionnels</h3>
            <p>Outils intégrés pour convertir les coordonnées, mesurer les distances/surfaces, dessiner des points/lignes/polygones/rectangles avec accrochage.</p>
          </div>


          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
              💾
            </div>
            <h3>Import / Export</h3>
            <p>Importez GeoJSON, Shapefile, CSV. Exportez vos sélections et analyses en formats standards.</p>
          </div>

        </div>
      </section>


      {/* ── HOW IT WORKS ── */}
<section className="lp-how" id="how-it-works">
  <div className="lp-section-header">
    <span className="lp-section-badge">Comment ça marche</span>
    <h2>Une analyse immobilière en quatre étapes</h2>
    <p>
      GEOPROExpert accompagne l’utilisateur depuis l’exploration cartographique
      jusqu’à la décision foncière et immobilière.
    </p>
  </div>

  <div className="lp-how-grid">
    <div className="lp-how-card">
      <div className="lp-how-number">01</div>
      <div className="lp-how-icon">🗺️</div>
      <h3>Explorer</h3>
      <p>
        Visualisez les parcelles, les couches urbaines, les équipements,
        les transports et les prix dans une interface cartographique interactive.
      </p>
    </div>

    <div className="lp-how-card">
      <div className="lp-how-number">02</div>
      <div className="lp-how-icon">🔎</div>
      <h3>Filtrer</h3>
      <p>
        Identifiez rapidement les parcelles selon le prix, la surface,
        le zonage, la hauteur, la façade, la nature juridique et le score AMC.
      </p>
    </div>

    <div className="lp-how-card">
      <div className="lp-how-number">03</div>
      <div className="lp-how-icon">📊</div>
      <h3>Évaluer</h3>
      <p>
        Analysez le potentiel foncier et immobilier à travers les prix
        de référence, les prix ajustés et le score multicritère AMC.
      </p>
    </div>

    <div className="lp-how-card">
      <div className="lp-how-number">04</div>
      <div className="lp-how-icon">📄</div>
      <h3>Décider</h3>
      <p>
        Comparez les parcelles, simulez un projet promoteur, exportez les
        résultats SIG et générez un rapport PDF d’expertise.
      </p>
    </div>
  </div>
</section>



      {/* ── ABOUT ── */}
      <section className="lp-about" id="about">
        <div className="lp-about-content">
          <div className="lp-about-text">
            <span className="lp-section-badge">À propos</span>
            <h2>Une plateforme au service de l’expertise immobilière</h2>
            <p>
            GEOPROExpert s’adresse aux urbanistes de l’Agence Urbaine de Casablanca,
  aux experts fonciers et aux promoteurs immobiliers. Elle permet d’appuyer
  l’estimation de la valeur vénale parcellaire à travers la visualisation, la comparaison, l’analyse des données cadastrales, urbanistiques,
  économiques et spatiales.
            </p>
            <ul className="lp-about-list">
              <li>✓ Données parcellaires géoréférencées</li>
              <li>✓ Scores AMC et prix au m² intégrés</li>
              <li>✓ Simulateur d'investissement immobilier</li>
              <li>✓ Table attributaire et comparaison de parcelles et bien d'autres ...</li>
            </ul>
          </div>
          <div className="lp-about-visual">
            <div className="lp-map-preview">
              <div className="lp-map-dot" style={{ top: "30%", left: "45%" }} />
              <div className="lp-map-dot lp-map-dot--gold" style={{ top: "55%", left: "60%" }} />
              <div className="lp-map-dot lp-map-dot--small" style={{ top: "45%", left: "35%" }} />
              <div className="lp-map-grid" />
              <div className="lp-map-label">Casablanca — Fida</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <h2>Prêt à explorer votre territoire ?</h2>
        <p>Accédez à la plateforme et commencez votre analyse foncière.</p>
        <button className="lp-btn-primary" onClick={() => navigate("/login")}>
          Accéder à GEOPROExpert →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          <span className="ng">GEO</span>
          <span className="np">PRO</span>
          <span className="ne">Expert</span>
        </div>
        <p>Plateforme web SIG d'expertise foncière et immobilière</p>
        <p className="lp-footer-copy">© 2025 GEOPROExpert — Tous droits réservés</p>
      </footer>

    </div>
  );
}