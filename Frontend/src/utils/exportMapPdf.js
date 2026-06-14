import html2canvas from "html2canvas";

export async function exportMapPdf({ title, layers, heatmapField, scaleText }) {

  const mapEl = document.querySelector(".leaflet-container");
  if (!mapEl) return;

  // Masquer les éléments UI pendant la capture
const toHide = document.querySelectorAll(
  ".leaflet-control-container, .map-topbar, .y-panel, .map-status-bar, .leaflet-top, .leaflet-bottom"
);

const hiddenStates = Array.from(toHide).map((el) => ({
  el,
  visibility: el.style.visibility,
}));

const restoreHiddenElements = () => {
  hiddenStates.forEach(({ el, visibility }) => {
    el.style.visibility = visibility;
  });
};

try {
  toHide.forEach((el) => {
    el.style.visibility = "hidden";
  });

  // tout le reste de ton code d'export reste ici


// Remplacez tout le bloc html2canvas par ceci :
const waitForMapTiles = async (mapContainer) => {
  const tiles = Array.from(
    mapContainer.querySelectorAll("img.leaflet-tile")
  );

  await Promise.all(
    tiles.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 1200);
      });
    })
  );
};



const captureMap = async () => {
  const mapContainer = document.querySelector(".leaflet-container");

  if (!mapContainer) {
    throw new Error("Conteneur Leaflet introuvable.");
  }

  await waitForMapTiles(mapContainer);

  // Petit délai pour laisser Leaflet stabiliser les transforms des couches
await new Promise((resolve) => setTimeout(resolve, 900));

const rect = mapContainer.getBoundingClientRect();

const mapCanvas = await html2canvas(mapContainer, {
  useCORS: true,
  allowTaint: false,
  backgroundColor: "#0f1720",

  // Plus stable pour Leaflet + heatmap + SVG
  scale: 1.5,

  width: Math.round(rect.width),
  height: Math.round(rect.height),
  windowWidth: document.documentElement.clientWidth,
  windowHeight: document.documentElement.clientHeight,

  scrollX: 0,
  scrollY: 0,
  logging: false,
  removeContainer: true,

  onclone: (clonedDoc) => {
    const clonedMap = clonedDoc.querySelector(".leaflet-container");

    if (!clonedMap) return;

    clonedMap
      .querySelectorAll(
        ".leaflet-pane, .leaflet-layer, .leaflet-tile-container, .leaflet-zoom-animated, svg, canvas"
      )
      .forEach((el) => {
        el.style.transition = "none";
        el.style.animation = "none";
        el.style.transformOrigin = "0 0";
      });
  },
});

  return mapCanvas;
};

const mapCanvas = await captureMap();

  // Dimensions canvas final A4 paysage

  const mapElRect = mapEl.getBoundingClientRect();
const realW = mapElRect.width;
const realH = mapElRect.height;

  
  const panelW = 260;
  const margin = 16;
  const headerH = 72;
  const footerH = 36;
  const cw = panelW + margin * 2 + realW;
  const ch = headerH + footerH + realH + margin * 2;

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");

  const dark  = "#0f1720";
  const dark2 = "#152333";
  const gold  = "#c8aa6e";

  // ── FOND ──
  ctx.fillStyle = dark;
  ctx.fillRect(0, 0, cw, ch);

  // ── HEADER ──
  ctx.fillStyle = dark2;
  ctx.fillRect(0, 0, cw, headerH);
  ctx.fillStyle = gold;
  ctx.fillRect(0, headerH - 2, cw, 2);
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, 5, headerH);

  // Icône logo — fond bleu
  ctx.fillStyle = "#1B3A5C";
  roundRect(ctx, 14, 10, 48, 48, 8);
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 14, 10, 48, 48, 8);
  ctx.stroke();

  // Bâtiment
  ctx.fillStyle = "#2A5298";
  ctx.fillRect(22, 36, 30, 18);
  // Toit
  ctx.fillStyle = "#C8952A";
  ctx.beginPath();
  ctx.moveTo(37, 14); ctx.lineTo(16, 36); ctx.lineTo(58, 36);
  ctx.closePath(); ctx.fill();
  // Porte
  ctx.fillStyle = "#E8B84B";
  ctx.fillRect(31, 42, 12, 12);
  // Fenêtres
  ctx.fillStyle = "#7DD3FC";
  ctx.fillRect(20, 38, 8, 6);
  ctx.fillRect(42, 38, 8, 6);
  // Pin géo
  ctx.fillStyle = "#C8952A";
  ctx.beginPath(); ctx.arc(54, 18, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1B3A5C";
  ctx.beginPath(); ctx.arc(54, 18, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#C8952A";
  ctx.beginPath();
  ctx.moveTo(48, 24); ctx.lineTo(60, 24); ctx.lineTo(54, 34);
  ctx.closePath(); ctx.fill();

  // Texte GEOPROExpert
  ctx.font = "bold 30px Georgia, serif";
  ctx.fillStyle = "#ffffff";
  const geoX = 74;
  ctx.fillText("GEO", geoX, 44);
  const geoW = ctx.measureText("GEO").width;
  ctx.fillStyle = gold;
  ctx.fillText("PRO", geoX + geoW, 44);
  const proW = ctx.measureText("PRO").width;
  ctx.font = "normal 30px Georgia, serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Expert", geoX + geoW + proW, 44);

  // Sous-titre
  ctx.font = "13px Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("Plateforme web SIG d'Expertise foncière et Immobilière — Casablanca", geoX, 60);

  // Titre carte + date — droite
  const today = new Date().toLocaleDateString("fr-FR");
  ctx.textAlign = "right";
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = gold;
  ctx.fillText(title || "Carte GEOPROExpert", cw - 20, 38);
  ctx.font = "13px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Date : ${today}`, cw - 20, 58);
  ctx.textAlign = "left";

  // ── PANNEAU GAUCHE ──
  ctx.fillStyle = dark2;
  ctx.fillRect(0, headerH, panelW, ch - headerH - footerH);
  ctx.fillStyle = gold;
  ctx.fillRect(panelW - 2, headerH, 2, ch - headerH - footerH);

  // Légende
  let ly = headerH + 28;

  const drawSection = (label) => {
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = gold;
    ctx.fillText(label, 14, ly);
    ly += 22;
  };

  const drawItem = (color, label, type = "square") => {
    if (ly > ch - footerH - 20) return;
    if (type === "square") {
      ctx.fillStyle = color;
      ctx.fillRect(14, ly - 13, 14, 14);
    } else if (type === "circle") {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(21, ly - 6, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "line") {
      ctx.fillStyle = color;
      ctx.fillRect(14, ly - 8, 26, 5);
    }
    ctx.font = "13px Arial";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(label, 36, ly);
    ly += 20;
  };

  const priceLabel = {
    prix_app_final: "Prix appartement",
    pt_v_final: "Prix terrain villa",
    pt_zi_final: "Prix terrain ZI",
  };

  if (layers?.parcelles) {
    drawSection("Score AMC");
    drawItem("#166534", "Très élevé ≥ 0.75");
    drawItem("#22c55e", "Élevé 0.65–0.75");
    drawItem("#84cc16", "Moyen 0.55–0.65");
    drawItem("#facc15", "Faible 0.45–0.55");
    drawItem("#ef4444", "Très faible < 0.45");
    ly += 10;
  }
  if (layers?.heatmap) {
    drawSection(`Heatmap — ${priceLabel[heatmapField] || "Prix"}`);
    drawItem("#2563eb", "Prix faibles");
    drawItem("#22c55e", "Prix moyens");
    drawItem("#facc15", "Prix élevés");
    drawItem("#ef4444", "Prix maximums");
    ly += 10;
  }
  if (layers?.voirie) {
    drawSection("Voirie");
    drawItem("#ffffff", "Voirie", "line");
    ly += 10;
  }
  if (layers?.tram || layers?.bus || layers?.gare) {
    drawSection("Transport");
    if (layers?.tram) drawItem("#e11d48", "Tramway", "line");
    if (layers?.bus)  drawItem("#2563eb", "Arrêt bus", "circle");
    if (layers?.gare) drawItem("#f59e0b", "Gare", "circle");
    ly += 10;
  }
  if (layers?.equipements) {
    drawSection("Équipements");
    drawItem("#9333ea", "Cultuel");
    drawItem("#e11d48", "Santé");
    drawItem("#2563eb", "Enseignement");
    drawItem("#16a34a", "Sportif");
  }

  // ── IMAGE CARTE ──
  const mapX = panelW + margin;
  const mapY = headerH + margin;
  const mapW = cw - panelW - margin * 2;
  const mapH = ch - headerH - footerH - margin * 2;

  ctx.drawImage(mapCanvas, mapX, mapY, mapW, mapH);

  // Bordure carte
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  // ── FLÈCHE NORD ──
  const nx = mapX + mapW - 56;
  const ny = mapY + 56;
  const nr = 30;

  ctx.fillStyle = "rgba(15,23,32,0.88)";
  ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2); ctx.stroke();

  // Moitié blanche
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(nx, ny - nr + 6);
  ctx.lineTo(nx - 11, ny + 10);
  ctx.lineTo(nx, ny + 2);
  ctx.closePath(); ctx.fill();

  // Moitié sombre
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.moveTo(nx, ny - nr + 6);
  ctx.lineTo(nx + 11, ny + 10);
  ctx.lineTo(nx, ny + 2);
  ctx.closePath(); ctx.fill();

  // N
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("N", nx, ny + nr - 6);
  ctx.textAlign = "left";

  // ── ÉCHELLE GRAPHIQUE ──
  const sx = mapX + 20;
  const sy = mapY + mapH - 34;
  const sbW = 130;

  ctx.fillStyle = "rgba(15,23,32,0.80)";
  ctx.fillRect(sx - 10, sy - 22, sbW + 90, 42);

  // Barre
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(sx, sy, sbW, 6);
  ctx.fillStyle = dark2;
  ctx.fillRect(sx + sbW / 2, sy, sbW / 2, 6);

  // Tirets
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(sx, sy - 6, 3, 18);
  ctx.fillRect(sx + sbW / 2 - 1, sy - 4, 3, 14);
  ctx.fillRect(sx + sbW - 3, sy - 6, 3, 18);

  // Labels
  ctx.font = "12px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("0", sx, sy + 20);
  ctx.fillText(scaleText || "", sx + sbW / 2, sy + 20);
  ctx.textAlign = "left";

  // ── FOOTER ──
  ctx.fillStyle = dark2;
  ctx.fillRect(0, ch - footerH, cw, footerH);
  ctx.fillStyle = gold;
  ctx.fillRect(0, ch - footerH, cw, 2);

  ctx.font = "12px Arial";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.fillText(
    "GEOPROExpert — Plateforme web SIG d'Expertise foncière et Immobilière — Casablanca",
    cw / 2, ch - footerH / 2 + 5
  );
  ctx.textAlign = "left";

  // ── EXPORT PNG ──
  const link = document.createElement("a");
  link.download = `carte_geooproexpert_${today.replace(/\//g, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  } finally {
  restoreHiddenElements();
}
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}