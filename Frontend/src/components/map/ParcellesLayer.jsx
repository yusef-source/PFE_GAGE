import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { getParcelles } from "../../services/parcellesService";
import { renderToString } from "react-dom/server";
import ParcellePopup from "./ParcellePopup";
import { generateParcellePdf } from "../../utils/generateParcellePdf";
import toast from "react-hot-toast";


function ParcellesLayer({
  filters,
  setTotalCount,
  setFilteredCount,
  setAnalysisStats,
  interactionDisabled = false,
   selectionMode = false,
  toggleSelectedFeature,
  isFeatureSelected,
}) {
  const activeFilters = filters || {
    prixMax: 20000,
    surfaceMax: 10000,
    quartier: "",
    zonage: "",
    scoreMin: 0,
    facadeMax: 4,
    hauteurMx: "",
    nature: "",
  };

  const [data, setData] = useState(null);
  const activePopupLayerRef = useRef(null);

  useEffect(() => {
    getParcelles()
      .then((res) => {
        console.log("Nombre parcelles:", res.data.features.length);

        const sortedData = {
          ...res.data,
          features: [...res.data.features].sort((a, b) => {
            return Number(b.properties.surface) - Number(a.properties.surface);
          }),
        };

        setData(sortedData);
      })
      .catch((err) => console.error("Erreur chargement parcelles:", err));
  }, []);

  const filteredData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      features: data.features.filter((feature) => {
        const p = feature.properties;

        const prix = Number(p.prix_app_final || 0);
        const surface = Number(p.surface || 0);
        const score = Number(p.score_final_amc || 0);
        const facade = Number(p.facade || p.facade_count || p.nb_facade || 0);

        const matchPrix = prix <= activeFilters.prixMax;

        const matchSurface =
          activeFilters.surfaceMax >= 10000
            ? true
            : surface <= activeFilters.surfaceMax;

        const matchQuartier =
          !activeFilters.quartier || p.quartier === activeFilters.quartier;

        const matchZonage =
          !activeFilters.zonage ||
          p.zonage === activeFilters.zonage ||
          p.secteur === activeFilters.zonage;

        const matchScore = score >= activeFilters.scoreMin;

        const matchFacade =
          activeFilters.facadeMax >= 4
            ? true
            : facade <= activeFilters.facadeMax;

        const normalizeText = (value) => {
          return String(value ?? "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");
        };

        const hauteurParcelle = normalizeText(p.hauteur_mx);
        const hauteurFiltre = normalizeText(activeFilters.hauteurMx);

        const matchHauteur =
          !hauteurFiltre || hauteurParcelle === hauteurFiltre;

        const matchNature =
          !activeFilters.nature || p.nature === activeFilters.nature;

        return (
          matchPrix &&
          matchSurface &&
          matchQuartier &&
          matchZonage &&
          matchScore &&
          matchFacade &&
          matchHauteur &&
          matchNature
        );
      }),
    };
  }, [data, activeFilters]);

  const calculateStats = (features) => {
  const valid = features.map((f) => f.properties);

  const sum = (field) =>
    valid.reduce((acc, p) => acc + (Number(p[field]) || 0), 0);

  const avg = (field) => {
    const values = valid
      .map((p) => Number(p[field]))
      .filter((v) => !isNaN(v) && v > 0);

    if (values.length === 0) return null;

    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const count = valid.length;
  const surfaceTotal = sum("surface");

  return {
    count,
    surfaceTotal,
    surfaceAvg: count > 0 ? surfaceTotal / count : null,
    scoreAvg: avg("score_final_amc"),
    prixAppAvg: avg("prix_app_final"),
    ptVAvg: avg("pt_v_final"),
    ptZiAvg: avg("pt_zi_final"),
  };
};

 useEffect(() => {
  if (data && setTotalCount) {
    setTotalCount(data.features.length);
  }

  if (filteredData && setFilteredCount) {
    setFilteredCount(filteredData.features.length);
  }

  if (filteredData && setAnalysisStats) {
    setAnalysisStats(calculateStats(filteredData.features));
  }
}, [data, filteredData, setTotalCount, setFilteredCount, setAnalysisStats]);

  if (!data || !filteredData) return null;

  const getColorByScore = (score) => {
    if (score === null || score === undefined || score === "") {
      return "#9ca3af";
    }

    const s = parseFloat(String(score).replace(",", "."));

    if (isNaN(s)) return "#9ca3af";

    if (s >= 0.75) return "#166534";
    if (s >= 0.65) return "#22c55e";
    if (s >= 0.55) return "#84cc16";
    if (s >= 0.45) return "#facc15";
    return "#ef4444";
  };

  return (
    <GeoJSON
  key={`parcelles-${filteredData.features.length}-${JSON.stringify(
    activeFilters
  )}-${interactionDisabled}-${selectionMode}`}
  data={filteredData}
  interactive={!interactionDisabled}
  style={(feature) => {
  const selected = isFeatureSelected?.(`parcelle-${feature.properties.gid}`);

  return {
    color: selected ? "#08ffff" : "#111827",
    weight: selected ? 3 : 0.8,
    fillColor: getColorByScore(feature.properties.score_final_amc),
    fillOpacity: selected ? 0.85 : 0.6,
  };
}}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;

        const popupHtml = renderToString(<ParcellePopup properties={p} />);
        console.log("PROPRIETES PARCELLE PDF:", p);

if (!selectionMode) {
  layer.bindPopup(popupHtml, {
  className: "parcelle-popup-wrapper",
  maxWidth: 340,
  closeButton: true,
  autoPan: true,
  keepInView: true,
  autoPanPadding: [80, 80],
  offset: [0, -10],
});

layer.on("popupopen", () => {
  const popupEl = layer.getPopup().getElement();

const pdfBtn = popupEl?.querySelector('[data-action="pdf"]');
const simulateBtn = popupEl?.querySelector('[data-action="simulate"]');
const closeBtn = popupEl?.querySelector('[data-action="close"]');
const compareBtn = popupEl?.querySelector('[data-action="compare"]');

if (simulateBtn) {
  simulateBtn.onclick = () => {
    window.dispatchEvent(
      new CustomEvent("open-investment-simulator", {
        detail: p,
      })
    );

    layer.closePopup();
  };
}

  if (pdfBtn) {
  pdfBtn.onclick = () => {
    try {
      generateParcellePdf(p);
      toast.success("Rapport PDF généré avec succès.");
    } catch (error) {
      console.error("Erreur génération PDF :", error);
      toast.error("Erreur lors de la génération du rapport PDF.");
    }
  };
}

  if (closeBtn) {
    closeBtn.onclick = () => {
      layer.closePopup();
    };
  }

  if (compareBtn) {
  compareBtn.onclick = () => {
    window.dispatchEvent(
      new CustomEvent("add-parcelle-compare", {
        detail: p,
      })
    );

    layer.closePopup();
  };
}

});

}

        layer.on({
click: (e) => {
  if (interactionDisabled) return;

  const p = feature.properties;

  if (selectionMode) {
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();

    toggleSelectedFeature?.({
      id: `parcelle-${p.gid}`,
      type: "parcelle",
      properties: p,
      geometry: feature.geometry,
    });

    e.target.closePopup();

    return;
  }

  const map = e.target._map;

  map.fitBounds(e.target.getBounds(), {
    padding: [80, 80],
    maxZoom: 18,
  });


   // enlever l'ancien clignotement
  if (activePopupLayerRef.current) {
    const oldEl = activePopupLayerRef.current.getElement?.();
    if (oldEl) oldEl.classList.remove("active-parcelle-blink");
  }

  // ajouter le clignotement sur la parcelle cliquée
  activePopupLayerRef.current = e.target;

  setTimeout(() => {
    const el = e.target.getElement?.();
    if (el) el.classList.add("active-parcelle-blink");
  }, 50);
},


popupclose: () => {
  const el = layer.getElement?.();

  if (el) {
    el.classList.remove("active-parcelle-blink");
  }

  if (activePopupLayerRef.current === layer) {
    activePopupLayerRef.current = null;
  }
},



  mouseover: (e) => {
    if (interactionDisabled || selectionMode) return;
    if (interactionDisabled) return;

    e.target.setStyle({
      weight: 2,
      color: "#000000",
      fillOpacity: 0.85,
    });
  },

  mouseout: (e) => {
    if (interactionDisabled || selectionMode) return;
    if (interactionDisabled) return;

    e.target.setStyle({
      color: "#111827",
      weight: 0.8,
      fillColor: getColorByScore(feature.properties.score_final_amc),
      fillOpacity: 0.6,
    });
  },
});
      }}
    />
  );
}

export default ParcellesLayer;