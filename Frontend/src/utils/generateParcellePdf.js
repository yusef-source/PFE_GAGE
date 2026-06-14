import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateParcellePdf(p) {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const dark = "#0f1720";
  const dark2 = "#152333";
  const gold = "#c8aa6e";
  const cyan = "#38bdf8";
  const gray = "#64748b";
  const white = "#ffffff";

  const today = new Date().toLocaleDateString("fr-FR");
  const ref = `EXP-${new Date().getFullYear()}-${p.gid ?? "PARCELLE"}`;

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
      return "Non applicable";
    }

    const formatted = Number(value).toLocaleString("fr-FR", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

return formatted.replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "" || Number(value) <= 0) {
      return "Non applicable";
    }

    return `${formatNumber(value, 2)} DH/m²`;
  };

  const score = Number(p.score_final_amc);

  const getScoreLabel = (s) => {
    if (isNaN(s)) return "Non défini";
    if (s >= 0.75) return "Très élevé";
    if (s >= 0.65) return "Élevé";
    if (s >= 0.55) return "Moyen";
    if (s >= 0.45) return "Faible";
    return "Très faible";
  };

  const getStatus = (value) => {
    return value !== null && value !== undefined && value !== "" && Number(value) > 0
      ? "Applicable"
      : "N/A";
  };

  // =========================
// HEADER
// =========================
doc.setFillColor(dark);
doc.rect(0, 0, pageWidth, 28, "F");

// Ligne dorée gauche décorative
doc.setFillColor(gold);
doc.rect(0, 0, 3, 28, "F");

// === LOGO DESSINÉ (bâtiment + pin géo) ===
const lx = 10; // x de base du logo
const ly = 4;  // y de base du logo

// Fond carré bleu
doc.setFillColor("#1B3A5C");
doc.roundedRect(lx, ly, 20, 20, 2, 2, "F");

// Bordure dorée
doc.setDrawColor(gold);
doc.setLineWidth(0.4);
doc.roundedRect(lx, ly, 20, 20, 2, 2, "S");

// Corps bâtiment
doc.setFillColor("#2A5298");
doc.rect(lx + 5, ly + 11, 10, 8, "F");

// Toit triangulaire
doc.setFillColor("#C8952A");
doc.triangle(lx + 10, ly + 4, lx + 3, ly + 11, lx + 17, ly + 11, "F");

// Porte
doc.setFillColor("#E8B84B");
doc.rect(lx + 8, ly + 14, 4, 5, "F");

// Fenêtre gauche
doc.setFillColor("#7DD3FC");
doc.rect(lx + 4, ly + 12, 3, 2.5, "F");

// Fenêtre droite
doc.setFillColor("#7DD3FC");
doc.rect(lx + 13, ly + 12, 3, 2.5, "F");

// Pin géo (cercle extérieur)
doc.setFillColor("#C8952A");
doc.circle(lx + 16, ly + 4, 3, "F");

// Pin géo (cercle intérieur)
doc.setFillColor("#1B3A5C");
doc.circle(lx + 16, ly + 4, 1.5, "F");

// Queue du pin
doc.setFillColor("#C8952A");
doc.triangle(lx + 14.5, ly + 6.5, lx + 17.5, ly + 6.5, lx + 16, ly + 9, "F");

// === TEXTE LOGO ===
doc.setFontSize(14);
doc.setFont("helvetica", "bold");

// GEO en blanc
doc.setTextColor("#ffffff");
doc.text("GEO", lx + 23, ly + 9);

// PRO en or
doc.setTextColor(gold);
const geoWidth = doc.getTextWidth("GEO");
doc.text("PRO", lx + 23 + geoWidth, ly + 9);

// Expert en blanc normal
doc.setTextColor("#ffffff");
doc.setFont("helvetica", "normal");
const proWidth = doc.getTextWidth("PRO");
doc.text("Expert", lx + 23 + geoWidth + proWidth, ly + 9);

// Sous-titre
doc.setTextColor("#64748b");
doc.setFontSize(7);
doc.setFont("helvetica", "normal");
doc.text("Plateforme web SIG d'Expertise foncière et Immobilière — Casablanca", lx + 23, ly + 15);

// Ligne de séparation verticale
doc.setDrawColor("#263445");
doc.setLineWidth(0.3);
doc.line(pageWidth - 55, 4, pageWidth - 55, 24);

// Référence et date (côté droit)
doc.setFillColor("#152333");
doc.roundedRect(pageWidth - 53, 5, 38, 18, 2, 2, "F");

doc.setTextColor(gold);
doc.setFontSize(8);
doc.setFont("helvetica", "bold");
doc.text(ref, pageWidth - 50, 12);

doc.setTextColor("#94a3b8");
doc.setFontSize(7);
doc.setFont("helvetica", "normal");
doc.text(today, pageWidth - 50, 18);

// Ligne dorée bas header
doc.setDrawColor(gold);
doc.setLineWidth(0.6);
doc.line(0, 28, pageWidth, 28);
  // =========================
  // TITLE BLOCK
  // =========================
  doc.setFillColor(dark);
  doc.rect(15, 34, pageWidth - 30, 24, "F");

  doc.setTextColor(gold);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORT D’EXPERTISE", 19, 45);

  doc.setTextColor("#94a3b8");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Parcelle ${p.gid ?? "-"} — ${p.quartier ?? "-"} — Casablanca`,
    19,
    53
  );

  // Meta
  doc.setTextColor("#64748b");
  doc.setFontSize(8);
  doc.text(`Réf : ${ref}`, 17, 66);
  doc.text(`Date : ${today}`, 165, 66);

  doc.setDrawColor("#94a3b8");
  doc.setLineWidth(0.2);
  doc.line(15, 70, pageWidth - 15, 70);

  // =========================
  // SECTION 1
  // =========================
  doc.setFillColor(gold);
  doc.rect(15, 75, pageWidth - 30, 8, "F");

  doc.setTextColor("#111827");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Identification de la parcelle", 18, 80.5);

  autoTable(doc, {
    startY: 86,
    margin: { left: 15, right: 15 },
    theme: "plain",
    styles: {
      fontSize: 8,
      textColor: "#e5e7eb",
      cellPadding: 2.5,
      lineWidth: 0.1,
      lineColor: "#263445",
    },
    columnStyles: {
      0: { fillColor: dark2, textColor: "#94a3b8", fontStyle: "bold", cellWidth: 58 },
      1: { fillColor: dark, textColor: "#ffffff", fontStyle: "bold" },
    },
    body: [
      ["Numéro parcelle", p.gid ?? "-"],
      ["Titre foncier", p.tf ?? "-"],
      ["Surface totale", `${formatNumber(p.surface, 2)} m²`],
      ["Zonage PA", p.zonage ?? "-"],
      ["Secteur PA", p.secteur ?? "-"],
      ["Quartier", p.quartier ?? "-"],
      ["Hauteur maximale", p.hauteur_mx ?? "-"],
    ],
  });

  // =========================
  // SECTION 2 SCORE AMC
  // =========================
  let y = doc.lastAutoTable.finalY + 6;

  doc.setFillColor(gold);
  doc.rect(15, y, pageWidth - 30, 8, "F");

  doc.setTextColor("#111827");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("2. Score AMC — Analyse Multicritère", 18, y + 5.5);

  y += 11;

  doc.setFillColor(dark);
  doc.rect(15, y, pageWidth - 30, 24, "F");

  doc.setTextColor(gold);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(!isNaN(score) ? score.toFixed(2) : "N/A", 23, y + 16);

  doc.setTextColor("#e5e7eb");
  doc.setFontSize(9);
  doc.text(`${getScoreLabel(score)} ${!isNaN(score) ? `(${score.toFixed(2)} / 1.00)` : ""}`, 55, y + 8);

  doc.setTextColor("#cbd5e1");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Le score AMC évalue l’attractivité de la parcelle selon plusieurs critères : Situation de la parcelle, accessibilité,",
    55,
    y + 15
  );
  doc.text(
    "équipements,zonage, densité et prix du marché environnant.",
    55,
    y + 20
  );

  y += 29;

  // Score color bar
// =========================
// Barre Score AMC par classes + indicateur
// =========================
const barX = 17;
const barY = y;
const barW = pageWidth - 34;
const barH = 4;

// Classes AMC selon tes seuils
const scoreClasses = [
  { color: "#ef4444", label: "Très faible", range: "< 0.45", start: 0.00, end: 0.45 },
  { color: "#f97316", label: "Faible", range: "0.45–0.55", start: 0.45, end: 0.55 },
  { color: "#facc15", label: "Moyen", range: "0.55–0.65", start: 0.55, end: 0.65 },
  { color: "#22c55e", label: "Élevé", range: "0.65–0.75", start: 0.65, end: 0.75 },
  { color: "#166534", label: "Très élevé", range: "≥ 0.75", start: 0.75, end: 1.00 },
];

// Barre complète, divisée selon les vrais seuils
scoreClasses.forEach((cls) => {
  const x1 = barX + cls.start * barW;
  const w = (cls.end - cls.start) * barW;

  doc.setFillColor(cls.color);
  doc.rect(x1, barY, w, barH, "F");
});

// Indicateur vertical du score
if (!isNaN(score)) {
  const scoreClamped = Math.max(0, Math.min(1, score));
  const markerX = barX + scoreClamped * barW;

  doc.setDrawColor("#ffffff");
  doc.setLineWidth(1);
  doc.line(markerX, barY - 2, markerX, barY + barH + 2);

  doc.setFillColor("#ffffff");
  doc.triangle(
    markerX - 2,
    barY - 3,
    markerX + 2,
    barY - 3,
    markerX,
    barY - 0.5,
    "F"
  );

}

// Labels sous la barre
doc.setTextColor("#64748b");
doc.setFontSize(6);
doc.setFont("helvetica", "normal");

doc.text("Très faible\n< 0.45", barX, y + 11);
doc.text("Faible\n0.45–0.55", barX + barW * 0.45 - 3, y + 11);
doc.text("Moyen\n0.55–0.65", barX + barW * 0.55 - 3, y + 11);
doc.text("Élevé\n0.65–0.75", barX + barW * 0.65 - 3, y + 11);
doc.text("Très élevé\n≥ 0.75", barX + barW * 0.75 - 3, y + 11);

y += 22;

  // =========================
  // SECTION 3 PRIX
  // =========================
  doc.setFillColor(gold);
  doc.rect(15, y, pageWidth - 30, 8, "F");

  doc.setTextColor("#111827");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("3. Référentiel des prix au marché", 18, y + 5.5);

  y += 11;

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
head: [["Type de bien", "Prix de référence moyen", "Statut"]],
body: [
  ["Appartement", formatPrice(p.prix_app), getStatus(p.prix_app)],
  ["Terrain villa", formatPrice(p.pt_v), getStatus(p.pt_v)],
  ["Construction villa", formatPrice(p.pc_v), getStatus(p.pc_v)],
  ["Terrain zone immeuble (ZI)", formatPrice(p.pt_zi), getStatus(p.pt_zi)],
  ["Construction ZI", formatPrice(p.pc_zi), getStatus(p.pc_zi)],
],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: "#263445",
      lineWidth: 0.1,
      textColor: "#e5e7eb",
    },
    headStyles: {
      fillColor: gold,
      textColor: "#111827",
      fontStyle: "bold",
    },
    bodyStyles: {
      fillColor: dark,
    },
    alternateRowStyles: {
      fillColor: dark2,
    },
    columnStyles: {
  0: { cellWidth: 70 },
  1: { halign: "left", textColor: gold, fontStyle: "bold", cellWidth: 65 },
  2: { halign: "left", textColor: "#22c55e" },
},
  });

  y = doc.lastAutoTable.finalY + 6;

  doc.setTextColor("#64748b");
  doc.setFontSize(7);
  doc.text(
    "Les prix indiqués correspondent aux prix moyens de référence issus de la base officielle des notaires",
    17,
    y
  );
  doc.text(
    "Ils constituent la base de calcul avant application du coefficient AMC et des ajustements d’expertise.",
    17,
    y + 4
  );

  y += 10;



  // Footer page 1
  doc.setFillColor(dark);
  doc.rect(0, pageHeight - 13, pageWidth, 13, "F");

  doc.setTextColor("#64748b");
  doc.setFontSize(7);
  doc.text("Document confidentiel — Usage exclusif de l’expert mandaté", 15, pageHeight - 5);
  doc.text("Page 1 / 2", pageWidth - 30, pageHeight - 5);

// =========================
// PAGE 2
// =========================
doc.addPage();
// =========================
// HEADER
// =========================
doc.setFillColor(dark);
doc.rect(0, 0, pageWidth, 28, "F");

doc.setFillColor(gold);
doc.rect(0, 0, 3, 28, "F");

doc.setFillColor("#1B3A5C");
doc.roundedRect(10, 4, 20, 20, 2, 2, "F");

doc.setDrawColor(gold);
doc.setLineWidth(0.4);
doc.roundedRect(10, 4, 20, 20, 2, 2, "S");

doc.setFillColor("#2A5298");
doc.rect(15, 15, 10, 8, "F");

doc.setFillColor("#C8952A");
doc.triangle(20, 8, 13, 15, 27, 15, "F");

doc.setFillColor("#E8B84B");
doc.rect(18, 18, 4, 5, "F");

doc.setFillColor("#7DD3FC");
doc.rect(14, 16, 3, 2.5, "F");

doc.setFillColor("#7DD3FC");
doc.rect(23, 16, 3, 2.5, "F");

doc.setFillColor("#C8952A");
doc.circle(26, 8, 3, "F");

doc.setFillColor("#1B3A5C");
doc.circle(26, 8, 1.5, "F");

doc.setFillColor("#C8952A");
doc.triangle(24.5, 10.5, 27.5, 10.5, 26, 13, "F");

doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor("#ffffff");
doc.text("GEO", 33, 13);

doc.setTextColor(gold);
const geoWidth2 = doc.getTextWidth("GEO");
doc.text("PRO", 33 + geoWidth2, 13);

doc.setTextColor("#ffffff");
doc.setFont("helvetica", "normal");
const proWidth2 = doc.getTextWidth("PRO");
doc.text("Expert", 33 + geoWidth2 + proWidth2, 13);

doc.setTextColor("#64748b");
doc.setFontSize(7);
doc.setFont("helvetica", "normal");
doc.text("Plateforme SIG d'Expertise Immobilière — Casablanca", 33, 19);

doc.setDrawColor("#263445");
doc.setLineWidth(0.3);
doc.line(pageWidth - 55, 4, pageWidth - 55, 24);

doc.setFillColor("#152333");
doc.roundedRect(pageWidth - 53, 5, 38, 18, 2, 2, "F");

doc.setTextColor(gold);
doc.setFontSize(8);
doc.setFont("helvetica", "bold");
doc.text(ref, pageWidth - 50, 12);

doc.setTextColor("#94a3b8");
doc.setFontSize(7);
doc.setFont("helvetica", "normal");
doc.text(today, pageWidth - 50, 18);

doc.setDrawColor(gold);
doc.setLineWidth(0.6);
doc.line(0, 28, pageWidth, 28);

let y2 = 34;

  // =========================
// SECTION 4 ESTIMATION
// =========================
doc.setFillColor(gold);
doc.rect(15, y2, pageWidth - 30, 8, "F");

doc.setTextColor("#111827");
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.text("4. Estimation de la valeur vénale", 18, y2 + 5.5);

y2 += 13;

const surface = Number(p.surface);
const prixApp = Number(p.prix_app_final);
const coef = !isNaN(score) ? 0.85 + score * 0.3 : 1;

const baseValue =
  !isNaN(surface) && !isNaN(prixApp) && prixApp > 0
    ? surface * prixApp
    : null;

const finalValue = baseValue ? baseValue * coef : null;


const getPositiveNumber = (value) => {
  const n = Number(value);
  return !isNaN(n) && n > 0 ? n : null;
};

const calcTotal = (prixM2) => {
  if (!surface || isNaN(surface) || !prixM2) return null;
  return surface * prixM2;
};

const prixAppartementM2 = getPositiveNumber(p.prix_app_final);
const prixVillaM2 = getPositiveNumber(p.pt_v_final);

const prixZiM2 = getPositiveNumber(p.pt_zi_final);

autoTable(doc, {
  startY: y2,
  margin: { left: 15, right: 15 },
  head: [["Type de bien", "Valeur vénale / m²", "Surface", "Prix total estimé"]],
  body: [
    [
      "Appartement",
      prixAppartementM2 ? `${formatNumber(prixAppartementM2, 2)} DH/m²` : "N/A",
      `${formatNumber(surface, 2)} m²`,
      calcTotal(prixAppartementM2)
        ? `${formatNumber(calcTotal(prixAppartementM2), 0)} DH`
        : "N/A",
    ],
    [
      "Villa",
      prixVillaM2 ? `${formatNumber(prixVillaM2, 2)} DH/m²` : "N/A",
      `${formatNumber(surface, 2)} m²`,
      calcTotal(prixVillaM2)
        ? `${formatNumber(calcTotal(prixVillaM2), 0)} DH`
        : "N/A",
    ],
    [
      "Zone immeuble",
      prixZiM2 ? `${formatNumber(prixZiM2, 2)} DH/m²` : "N/A",
      `${formatNumber(surface, 2)} m²`,
      calcTotal(prixZiM2)
        ? `${formatNumber(calcTotal(prixZiM2), 0)} DH`
        : "N/A",
    ],
  ],
  theme: "grid",
  styles: {
    fontSize: 8,
    cellPadding: 2.5,
    lineColor: "#263445",
    lineWidth: 0.1,
    textColor: "#e5e7eb",
  },
  headStyles: {
    fillColor: gold,
    textColor: "#111827",
    fontStyle: "bold",
  },
  bodyStyles: {
    fillColor: dark,
  },
  alternateRowStyles: {
    fillColor: dark2,
  },
  columnStyles: {
    0: { cellWidth: 48 },
    1: { halign: "left", textColor: gold, fontStyle: "bold", cellWidth: 48 },
    2: { halign: "left", cellWidth: 36 },
    3: { halign: "left", textColor: gold, fontStyle: "bold" },
  },
});

y2 = doc.lastAutoTable.finalY + 12;

  doc.setFillColor(gold);
  doc.rect(15, y2, pageWidth - 30, 8, "F");
  doc.setTextColor("#111827");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("5. Observations & recommandations", 18, y2 + 5.5);

  y2 += 13;

  autoTable(doc, {
    startY: y2,
    margin: { left: 15, right: 15 },
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: "#263445",
      lineWidth: 0.1,
      textColor: "#e5e7eb",
    },
    columnStyles: {
      0: { fillColor: dark2, textColor: "#94a3b8", fontStyle: "bold", cellWidth: 42 },
      1: { fillColor: dark, textColor: "#ffffff" },
    },
    body: [
  [
    "Plan d'Aménagement",
    `La parcelle est classée en ${p.zonage ?? "zone non renseignée"}, secteur ${p.secteur ?? "non renseigné"}, avec une hauteur maximale ${p.hauteur_mx ?? "non renseignée"}. Les paramètres urbanistiques associés sont : COS ${p.cos ?? "non renseigné"} et CUS ${p.cus ?? "non renseigné"}. Toute construction devra respecter le règlement d’urbanisme en vigueur.`,
  ],
  [
    "Score AMC",
    `Le score AMC est ${!isNaN(score) ? score.toFixed(2) : "non défini"}, correspondant à un niveau ${getScoreLabel(score)}.`,
  ],
  [
    "Recommandation",
    "Cette estimation est fournie à titre indicatif selon une approche comparative. Elle doit être complétée par une vérification terrain, juridique et urbanistique.",
  ],
],
  });

  y2 = doc.lastAutoTable.finalY + 20;


  doc.setTextColor("#111827");
  doc.setFontSize(9);
  doc.text("Établi par : ........................................", 20, y2);
  doc.text(`Casablanca, le ${today}`, 20, y2 + 8);

  doc.text("Cachet & Signature", 140, y2 + 8);

  doc.setDrawColor("#94a3b8");
  doc.rect(135, y2 - 5, 45, 28);

  doc.setFillColor(dark);
  doc.rect(0, pageHeight - 13, pageWidth, 13, "F");

  doc.setTextColor("#64748b");
  doc.setFontSize(7);
  doc.text("Document confidentiel — Usage exclusif de l’expert mandaté", 15, pageHeight - 5);
  doc.text("Page 2 / 2", pageWidth - 30, pageHeight - 5);

  doc.save(`rapport_expertise_parcelle_${p.gid ?? "export"}.pdf`);
}