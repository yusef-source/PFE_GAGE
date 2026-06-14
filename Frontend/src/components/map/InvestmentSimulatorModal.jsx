import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./InvestmentSimulatorModal.css";

function InvestmentSimulatorModal({ parcel, onClose }) {
  const normalizeText = (value) =>
    String(value || "")
      .toUpperCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const zoneText = normalizeText(parcel?.zonage);
  const heightText = normalizeText(parcel?.hauteur_mx);

  const isVillaZone = zoneText.includes("D");
  const isPUZone = zoneText.includes("PU");

  const hasHeight =
    heightText !== "" &&
    heightText !== "-" &&
    heightText !== "NULL" &&
    !heightText.includes("NON DEFIN") &&
    !heightText.includes("NON FIX") &&
    !heightText.includes("INDEFIN");

  const [projectType, setProjectType] = useState(
    isVillaZone ? "villa" : "appartement"
  );

  const [sellableRate, setSellableRate] = useState(85);
  const [feesRate, setFeesRate] = useState(10);
  const [puLevels, setPuLevels] = useState(7);
  const [mixedCommercialRate, setMixedCommercialRate] = useState(20);
  const [mixedPriceCoef, setMixedPriceCoef] = useState(1.15);

  const surface = Number(parcel?.surface) || 0;

  const hasCos =
    parcel?.cos !== null &&
    parcel?.cos !== undefined &&
    parcel?.cos !== "" &&
    !isNaN(Number(parcel?.cos)) &&
    Number(parcel?.cos) > 0;

  const cos = hasCos ? Number(parcel.cos) : null;

  const extractLevels = (hauteur) => {
    if (!hauteur || hauteur === "-" || hauteur === "") return 1;

    const text = String(hauteur).toUpperCase().trim();
    const match = text.match(/R\s*\+\s*(\d+)/);

    if (match) return Number(match[1]) + 1;
    if (text === "R") return 1;

    return 1;
  };

  const levels = isPUZone && !hasHeight ? puLevels : extractLevels(heightText);

  const floorArea = hasCos ? surface * cos : surface * levels;
  const sellableArea = floorArea * (sellableRate / 100);

  const priceApp = Number(parcel?.prix_app_final) || 0;
  const priceVillaLand = Number(parcel?.pt_v_final) || 0;
  const priceZiLand = Number(parcel?.pt_zi_final) || 0;

  const constructionVilla = Number(parcel?.pc_v_final) || 3500;
  const constructionZi = Number(parcel?.pc_zi_final) || 3500;

  const round2 = (value) => {
    return Math.round(Number(value || 0) * 100) / 100;
  };

  const values = useMemo(() => {
    let sellingPriceM2 = priceApp;
    let landPriceM2 = priceZiLand;
    let constructionCostM2 = constructionZi;

    if (projectType === "villa") {
      sellingPriceM2 = priceVillaLand;
      landPriceM2 = priceVillaLand;
      constructionCostM2 = constructionVilla;
    }

    if (projectType === "mixte") {
      sellingPriceM2 = priceApp;
      landPriceM2 = priceZiLand;
      constructionCostM2 = constructionZi;
    }

    let residentialArea = sellableArea;
    let commercialArea = 0;
    let commercialPriceM2 = 0;

    let revenue = round2(sellableArea) * round2(sellingPriceM2);

    if (projectType === "mixte") {
      commercialArea = sellableArea * (mixedCommercialRate / 100);
      residentialArea = sellableArea - commercialArea;
      commercialPriceM2 = priceApp * mixedPriceCoef;

      revenue =
        round2(residentialArea) * round2(priceApp) +
        round2(commercialArea) * round2(commercialPriceM2);
    }

    const landCost = round2(surface) * round2(landPriceM2);
    const constructionCost = round2(floorArea) * round2(constructionCostM2);
    const fees = round2(landCost + constructionCost) * (feesRate / 100);
    const totalCost = landCost + constructionCost + fees;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      sellingPriceM2,
      landPriceM2,
      constructionCostM2,
      revenue,
      landCost,
      constructionCost,
      fees,
      totalCost,
      profit,
      margin,
      residentialArea,
      commercialArea,
      commercialPriceM2,
    };
  }, [
    projectType,
    priceApp,
    priceVillaLand,
    priceZiLand,
    constructionVilla,
    constructionZi,
    surface,
    floorArea,
    sellableArea,
    feesRate,
    mixedCommercialRate,
    mixedPriceCoef,
  ]);

  const costChartData = [
    {
      name: "Terrain",
      value: Math.max(values.landCost, 0),
      color: "#38bdf8",
    },
    {
      name: "Construction",
      value: Math.max(values.constructionCost, 0),
      color: "#facc15",
    },
    {
      name: "Frais",
      value: Math.max(values.fees, 0),
      color: "#f97316",
    },
    {
      name: "Bénéfice",
      value: Math.max(values.profit, 0),
      color: values.profit >= 0 ? "#22c55e" : "#ef4444",
    },
  ];

  const sensitivityData = [-20, -10, 0, 10, 20].map((variation) => {
    const adjustedPrice = values.sellingPriceM2 * (1 + variation / 100);

    const adjustedRevenue =
      projectType === "mixte"
        ? round2(values.residentialArea) * round2(priceApp * (1 + variation / 100)) +
          round2(values.commercialArea) *
            round2(values.commercialPriceM2 * (1 + variation / 100))
        : round2(sellableArea) * round2(adjustedPrice);

    const adjustedProfit = adjustedRevenue - values.totalCost;
    const adjustedMargin =
      adjustedRevenue > 0 ? (adjustedProfit / adjustedRevenue) * 100 : 0;

    return {
      variation: `${variation > 0 ? "+" : ""}${variation}%`,
      marge: Number(adjustedMargin.toFixed(1)),
    };
  });

  const formatMoney = (v) =>
    Number(v || 0).toLocaleString("fr-FR", {
      maximumFractionDigits: 0,
    }) + " DH";

  const formatNumber = (v) =>
    Number(v || 0).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    });



    const getDecision = (margin) => {
  if (margin >= 20) {
    return {
      label: "Projet rentable",
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      border: "rgba(34, 197, 94, 0.35)",
      message:
        "La marge nette est confortable. Le projet présente un potentiel d’investissement favorable.",
    };
  }

  if (margin >= 10) {
    return {
      label: "Projet acceptable",
      color: "#facc15",
      bg: "rgba(250, 204, 21, 0.12)",
      border: "rgba(250, 204, 21, 0.35)",
      message:
        "La marge est correcte mais reste sensible aux variations du prix de vente et des coûts.",
    };
  }

  if (margin >= 0) {
    return {
      label: "Projet fragile",
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.12)",
      border: "rgba(249, 115, 22, 0.35)",
      message:
        "La rentabilité est faible. Le projet nécessite une optimisation des coûts ou du prix de vente.",
    };
  }

  return {
    label: "Projet déficitaire",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    message:
      "Le projet ne couvre pas correctement les coûts estimés. Il est déconseillé dans les paramètres actuels.",
  };
};

const decision = getDecision(values.margin);

  return (
    <div className="simulator-overlay">
      <div className="simulator-modal">
        <div className="simulator-header">
          <div>
            <h2>Simulateur d’investissement</h2>
            <p>
              Parcelle {parcel?.gid} — {parcel?.quartier || "-"} —{" "}
              {parcel?.zonage || "-"} — {parcel?.secteur || "-"}
            </p>
          </div>

          <button onClick={onClose}>×</button>
        </div>

        <div className="simulator-layout">
          <div className="simulator-column">
            <div className="simulator-panel">
              <h3>Paramètres du projet</h3>

              <label>Type de projet</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                {isVillaZone ? (
                  <option value="villa">Villa</option>
                ) : (
                  <>
                    <option value="appartement">Immeuble résidentiel</option>
                    <option value="mixte">Immeuble mixte</option>
                  </>
                )}
              </select>

              {projectType === "mixte" && (
                <>
                  <label>Part commerce / bureau : {mixedCommercialRate}%</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={mixedCommercialRate}
                    onChange={(e) =>
                      setMixedCommercialRate(Number(e.target.value))
                    }
                  />

                  <label>
                    Coefficient prix commerce / bureau : ×{mixedPriceCoef}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="1.5"
                    step="0.05"
                    value={mixedPriceCoef}
                    onChange={(e) => setMixedPriceCoef(Number(e.target.value))}
                  />

                  <div className="simulator-note">
                    Immeuble mixte : une partie de la surface vendable est
                    considérée comme commerce/bureau, avec un prix estimé
                    supérieur au logement selon le coefficient choisi.
                  </div>
                </>
              )}

              {isPUZone && !hasHeight && (
                <>
                  <label>Hauteur simulée PU : R+{puLevels - 1}</label>

                  <input
                    type="range"
                    min="2"
                    max="11"
                    step="1"
                    value={puLevels}
                    onChange={(e) => setPuLevels(Number(e.target.value))}
                  />

                  <div className="simulator-note">
                    Zone PU sans hauteur définie : la hauteur est une hypothèse
                    de simulation, à confirmer selon le Plan d’Aménagement.
                  </div>
                </>
              )}

              <label>Taux de surface vendable : {sellableRate}%</label>
              <input
                type="range"
                min="70"
                max="95"
                step="1"
                value={sellableRate}
                onChange={(e) => setSellableRate(Number(e.target.value))}
              />

              <label>Frais annexes : {feesRate}%</label>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={feesRate}
                onChange={(e) => setFeesRate(Number(e.target.value))}
              />

              <div className="simulator-note">
                Simulation indicative basée sur la surface, le COS lorsqu’il est
                fixé, sinon sur la hauteur maximale autorisée, les prix finaux
                AMC et les hypothèses de commercialisation.
              </div>
            </div>

            <div className="simulator-panel simulator-results">
              <h3>Résultats financiers</h3>

              <div className="simulator-kpi">
                <span>Chiffre d’affaires potentiel</span>
                <strong>{formatMoney(values.revenue)}</strong>
              </div>

              <div className="simulator-kpi">
                <span>Coût total du projet</span>
                <strong>{formatMoney(values.totalCost)}</strong>
              </div>

              <div className="simulator-kpi main">
                <span>Bénéfice estimé</span>
                <strong>{formatMoney(values.profit)}</strong>
              </div>

              <div className="simulator-kpi">
                <span>Marge nette</span>
                <strong>{formatNumber(values.margin)}%</strong>
              </div>
            </div>

            <div
  className="simulator-decision"
  style={{
    background: decision.bg,
    borderColor: decision.border,
  }}
>
  <div className="simulator-decision-title" style={{ color: decision.color }}>
    {decision.label}
  </div>

  <div className="simulator-decision-message">
    {decision.message}
  </div>
</div>

            <div className="simulator-panel simulator-chart-panel">
              <h3>Répartition financière</h3>

              <div className="simulator-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={costChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {costChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="simulator-chart-legend">
                {costChartData.map((item) => (
                  <div key={item.name}>
                    <span style={{ background: item.color }}></span>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="simulator-column">
            <div className="simulator-panel">
              <h3>Données parcelle</h3>

              <div className="simulator-row">
                <span>Titre foncier</span>
                <strong>{parcel?.tf || "-"}</strong>
              </div>

              <div className="simulator-row">
                <span>Surface terrain</span>
                <strong>{formatNumber(surface)} m²</strong>
              </div>

              <div className="simulator-row">
                <span>COS</span>
                <strong>{hasCos ? formatNumber(cos) : "Non fixé"}</strong>
              </div>

              {!hasCos && (
                <div className="simulator-row">
                  <span>Base d’estimation</span>
                  <strong>
                    {isPUZone && !hasHeight
                      ? `Zone PU → R+${puLevels - 1} (${levels} niveaux)`
                      : `Hauteur ${
                          parcel?.hauteur_mx || "non définie"
                        } → ${levels} niveau(x)`}
                  </strong>
                </div>
              )}

              {hasCos && isPUZone && !hasHeight && (
                <div className="simulator-row">
                  <span>Hauteur simulée</span>
                  <strong>
                    R+{puLevels - 1} ({levels} niveaux) — indicatif
                  </strong>
                </div>
              )}

              <div className="simulator-row">
                <span>Surface plancher estimée</span>
                <strong>{formatNumber(floorArea)} m²</strong>
              </div>

              <div className="simulator-row">
                <span>Surface vendable estimée</span>
                <strong>{formatNumber(sellableArea)} m²</strong>
              </div>

              <div className="simulator-row">
                <span>Score AMC</span>
                <strong>{formatNumber(parcel?.score_final_amc)}</strong>
              </div>
            </div>

            <div className="simulator-panel">
              <h3>Détail des coûts</h3>

              <div className="simulator-row">
                <span>Coût terrain</span>
                <strong>{formatMoney(values.landCost)}</strong>
              </div>

              <div className="simulator-row">
                <span>Coût construction</span>
                <strong>{formatMoney(values.constructionCost)}</strong>
              </div>

              <div className="simulator-row">
                <span>Frais annexes</span>
                <strong>{formatMoney(values.fees)}</strong>
              </div>

              <div className="simulator-row">
                <span>Prix de vente estimé au m²</span>
                <strong>{formatNumber(values.sellingPriceM2)} DH/m²</strong>
              </div>

              {projectType === "mixte" && (
                <>
                  <div className="simulator-row">
                    <span>Surface logement</span>
                    <strong>{formatNumber(values.residentialArea)} m²</strong>
                  </div>

                  <div className="simulator-row">
                    <span>Surface commerce/bureau</span>
                    <strong>{formatNumber(values.commercialArea)} m²</strong>
                  </div>

                  <div className="simulator-row">
                    <span>Prix commerce/bureau estimé</span>
                    <strong>
                      {formatNumber(values.commercialPriceM2)} DH/m²
                    </strong>
                  </div>
                </>
              )}
            </div>

            <div className="simulator-panel simulator-chart-panel">
              <h3>Sensibilité de la marge</h3>

              <div className="simulator-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sensitivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.16)"
                    />
                    <XAxis dataKey="variation" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Marge nette"]}
                      labelFormatter={(label) => `Variation prix : ${label}`}
                    />
                    <Bar
                      dataKey="marge"
                      fill="#38bdf8"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="simulator-note">
                Ce graphique montre l’effet d’une variation du prix de vente au
                m² sur la marge nette du projet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentSimulatorModal;