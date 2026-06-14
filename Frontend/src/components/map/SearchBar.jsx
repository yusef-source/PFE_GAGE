import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar({ onSearchCoordinates, onSearchTF }) {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("geoProUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Fermer le menu si clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = () => {
    const value = query.trim();
    if (!value) return;

    const parts = value.split(",").map((p) => p.trim());
    if (parts.length === 2) {
      const lng = Number(parts[0]);
      const lat = Number(parts[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        onSearchCoordinates({ lat, lng });
        return;
      }
    }
    onSearchTF(value);
  };

  const handleLogout = () => {
    localStorage.removeItem("geoProUser");
    navigate("/");
  };

  return (
    <div className="map-topbar">

      {/* LOGO */}
      <div className="topbar-logo">
        <div className="topbar-logo-icon">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
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
        </div>
        <div className="topbar-logo-text">
          <span className="tl-geo">GEO</span>
          <span className="tl-pro">PRO</span>
          <span className="tl-expert">Expert</span>
        </div>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="topbar-search">
        <span className="map-search-icon">⌕</span>
        <input
          type="text"
          placeholder="Rechercher par TF ou coordonnées, ex: -7.5898, 33.5650"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>

      {/* PROFIL DROITE */}
      <div className="topbar-right" ref={menuRef}>
        <span className="topbar-badge">Plateforme web SIG</span>

        {user ? (
          <div className="topbar-profile" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="topbar-avatar topbar-avatar--initials">
              {user.initiales}
            </div>
            <div className="topbar-profile-info">
              <span className="topbar-profile-name">
                {user.prenom} {user.nom}
              </span>
              <span className="topbar-profile-role">{user.role}</span>
            </div>
            <span className="topbar-chevron">{menuOpen ? "▲" : "▼"}</span>
          </div>
        ) : (
          <div className="topbar-avatar">Y</div>
        )}

        {/* MENU DÉROULANT */}
        {menuOpen && user && (
          <div className="topbar-menu">
            <div className="topbar-menu-header">
              <div className="topbar-menu-avatar">{user.initiales}</div>
              <div>
                <p className="topbar-menu-name">
                  {user.prenom} {user.nom}
                </p>
                <p className="topbar-menu-email">{user.email}</p>
              </div>
            </div>

            <div className="topbar-menu-divider" />

            <div className="topbar-menu-info">
              <span className="topbar-menu-label">Rôle</span>
              <span className="topbar-menu-value">{user.role}</span>
            </div>
            <div className="topbar-menu-info">
              <span className="topbar-menu-label">Organisation</span>
              <span className="topbar-menu-value">{user.organisation}</span>
            </div>

            <div className="topbar-menu-divider" />

            <button className="topbar-menu-logout" onClick={handleLogout}>
              ⎋ Se déconnecter
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default SearchBar;