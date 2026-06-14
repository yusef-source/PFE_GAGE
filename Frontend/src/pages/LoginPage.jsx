import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    role: "",
    organisation: "",
    email: "",
    motDePasse: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.email || !form.motDePasse) {
      setError("Email et mot de passe requis.");
      return;
    }
    if (!form.nom || !form.prenom) {
      setError("Nom et prénom requis.");
      return;
    }

    // Sauvegarder le profil
    localStorage.setItem("geoProUser", JSON.stringify({
      nom: form.nom,
      prenom: form.prenom,
      role: form.role || "Expert",
      organisation: form.organisation || "GEOPROExpert",
      email: form.email,
      initiales: `${form.prenom[0]}${form.nom[0]}`.toUpperCase(),
    }));

    navigate("/map");
  };

  return (
    <div className="login-root">
      <div className="login-card">

        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
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
          <div className="login-logo-text">
            <span className="ng">GEO</span>
            <span className="np">PRO</span>
            <span className="ne">Expert</span>
          </div>
        </div>

        <h2>Connexion</h2>
        <p>Accédez à votre espace expertise foncière</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-form">

          {/* Ligne nom / prénom */}
          <div className="login-row">
            <div className="login-field">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Entrer votre prenom"
                value={form.prenom}
                onChange={handleChange}
              />
            </div>
            <div className="login-field">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                placeholder="Entrer votre nom"
                value={form.nom}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Ligne rôle / organisation */}
          <div className="login-row">
            <div className="login-field">
              <label>Rôle</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Choisir...</option>
                <option value="Expert immobilier">Expert immobilier</option>
                <option value="Urbaniste">Urbaniste</option>
                <option value="Notaire">Notaire</option>
                <option value="Promoteur">Promoteur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>
            <div className="login-field">
              <label>Organisation</label>
              <input
                type="text"
                name="organisation"
                placeholder="AUC"
                value={form.organisation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="login-field">
            <label>Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              placeholder="••••••••"
              value={form.motDePasse}
              onChange={handleChange}
            />
          </div>

          <button className="login-submit" onClick={handleSubmit}>
            Se connecter →
          </button>

          <button className="login-back" onClick={() => navigate("/")}>
            ← Retour à l'accueil
          </button>

        </div>
      </div>
    </div>
  );
}