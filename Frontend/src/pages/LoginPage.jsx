import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const ROLES = [
  {
    value: "Urbaniste",
    label: "Urbaniste",
    organisation: "Agence Urbaine de Casablanca",
  },
  {
    value: "Expert foncier",
    label: "Expert foncier",
    organisation: "Cabinet d’expertise foncière",
  },
  {
    value: "Promoteur",
    label: "Promoteur",
    organisation: "Promoteur immobilier",
  },
];

// Comptes autorisés pour la version locale / démonstration PFE
const AUTHORIZED_USERS = [
  {
    email: "auc@geoproexpert.ma",
    motDePasse: "AUC@2026",
    role: "Urbaniste",
  },
  {
    email: "expert@geoproexpert.ma",
    motDePasse: "EXPERT@2026",
    role: "Expert foncier",
  },
  {
    email: "promoteur@geoproexpert.ma",
    motDePasse: "PROMO@2026",
    role: "Promoteur",
  },
];

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
    const { name, value } = e.target;

    if (name === "role") {
      const selectedRole = ROLES.find((r) => r.value === value);

      setForm((prev) => ({
        ...prev,
        role: value,
        organisation: selectedRole ? selectedRole.organisation : "",
      }));

      setError("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = () => {
    const nom = form.nom.trim();
    const prenom = form.prenom.trim();
    const role = form.role.trim();
    const organisation = form.organisation.trim();
    const email = form.email.trim().toLowerCase();
    const motDePasse = form.motDePasse;

    if (!prenom || !nom) {
      setError("Nom et prénom requis.");
      return;
    }

    if (!role) {
      setError("Veuillez choisir un rôle.");
      return;
    }

    if (!email || !motDePasse) {
      setError("Email et mot de passe requis.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    const roleAutorise = ROLES.some((r) => r.value === role);

    if (!roleAutorise) {
      setError("Rôle non autorisé.");
      return;
    }

    const userAutorise = AUTHORIZED_USERS.find(
      (user) =>
        user.email === email &&
        user.motDePasse === motDePasse &&
        user.role === role
    );

    if (!userAutorise) {
      setError("Identifiants incorrects ou rôle non autorisé pour cet utilisateur.");
      return;
    }

    localStorage.setItem(
      "geoProUser",
      JSON.stringify({
        nom,
        prenom,
        role,
        organisation,
        email,
        initiales: `${prenom[0]}${nom[0]}`.toUpperCase(),
      })
    );

    navigate("/map");
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#1B3A5C" />
            <rect x="16" y="24" width="16" height="16" rx="1" fill="#2A5298" />
            <polygon points="24,10 13,24 35,24" fill="#C8952A" />
            <rect x="21" y="32" width="6" height="8" rx="1" fill="#E8B84B" />
            <rect x="17" y="26" width="5" height="4" rx="0.5" fill="#7DD3FC" />
            <rect x="26" y="26" width="5" height="4" rx="0.5" fill="#7DD3FC" />
            <circle cx="37" cy="11" r="5" fill="#C8952A" />
            <circle cx="37" cy="11" r="2.5" fill="#1B3A5C" />
            <path d="M34.5 15.5 Q37 20 39.5 15.5" fill="#C8952A" />
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
          <div className="login-row">
            <div className="login-field">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Entrer votre prénom"
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

          <div className="login-row">
            <div className="login-field">
              <label>Rôle</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">Choisir un rôle</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="login-field">
              <label>Organisation</label>
              <input
                type="text"
                name="organisation"
                placeholder="Organisation"
                value={form.organisation}
                readOnly
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