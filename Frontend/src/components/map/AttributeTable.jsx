import { useEffect, useMemo, useState } from "react";
import "./AttributeTable.css";

import { getParcelles } from "../../services/parcellesService";
import { getVoirie } from "../../services/voirieService";
import { getTram } from "../../services/tramService";
import { getBus } from "../../services/busService";
import { getGare } from "../../services/gareService";
import { getEquipements } from "../../services/equipementsService";

function AttributeTable({
  externalLayers,
  selectedFeatures = [],
  onZoomFeature,
   filters = {},
  onClose,
}) {
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [layerData, setLayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showOnlyFiltered, setShowOnlyFiltered] = useState(false);
  const [activeRowKey, setActiveRowKey] = useState(null);

  const rowsPerPage = 100;

  const normalizeText = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const availableLayers = useMemo(() => {
    const baseLayers = [
      { id: "parcelles", name: "Parcelles", loader: getParcelles },
      { id: "voirie", name: "Voirie", loader: getVoirie },
      { id: "tram", name: "Tramway", loader: getTram },
      { id: "bus", name: "Bus", loader: getBus },
      { id: "gare", name: "Gare", loader: getGare },
      { id: "equipements", name: "Équipements", loader: getEquipements },
    ];

    const importedLayers = externalLayers.map((layer) => ({
      id: `external-${layer.id}`,
      name: layer.name,
      data: layer.data,
    }));

    return [...baseLayers, ...importedLayers];
  }, [externalLayers]);

  useEffect(() => {
    setSearchText("");
    setPage(1);
setActiveRowKey(null);
    if (!selectedLayerId) {
      setLayerData(null);
      return;
    }

    const selectedLayer = availableLayers.find(
      (layer) => layer.id === selectedLayerId
    );

    if (!selectedLayer) return;

    if (selectedLayer.data) {
      setLayerData(selectedLayer.data);
      return;
    }

    if (selectedLayer.loader) {
      setLoading(true);
      setLayerData(null);

      selectedLayer
        .loader()
        .then((res) => {
          setLayerData(res.data);
        })
        .catch((err) => {
          console.error("Erreur chargement table attributaire:", err);
          setLayerData(null);
          toast("Erreur lors du chargement de la table attributaire.", {
  icon: "⚠️",
});
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedLayerId, availableLayers]);


  const selectedGeoJsonFeatures = useMemo(() => {
  return selectedFeatures
    .map((item) => {
      if (item.type === "parcelle") {
        return {
          type: "Feature",
          geometry: item.geometry,
          properties: {
            source: "parcelle",
            ...item.properties,
          },
        };
      }

      if (item.type === "point") {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [item.latlng.lng, item.latlng.lat],
          },
          properties: {
            id: item.id,
            source: "dessin",
            type: "point",
          },
        };
      }

      if (item.type === "line") {
        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: item.latlngs.map((p) => [p.lng, p.lat]),
          },
          properties: {
            id: item.id,
            source: "dessin",
            type: "line",
          },
        };
      }

      if (item.type === "polygon" || item.type === "rectangle") {
        const coords = item.latlngs.map((p) => {
          if (Array.isArray(p)) return [p[1], p[0]];
          return [p.lng, p.lat];
        });

        if (
          coords.length > 0 &&
          (coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1])
        ) {
          coords.push(coords[0]);
        }

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coords],
          },
          properties: {
            id: item.id,
            source: "dessin",
            type: item.type,
          },
        };
      }

      return null;
    })
    .filter(Boolean);
}, [selectedFeatures]);



const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const matchParcelFilters = (feature) => {
  const p = feature.properties || {};

  const prixMax = toNumber(filters.prixMax);
  const surfaceMax = toNumber(filters.surfaceMax);
  const scoreMin = toNumber(filters.scoreMin);
  const facadeMax = toNumber(filters.facadeMax);

  const prixApp = toNumber(p.prix_app_final);
  const surface = toNumber(p.surface);
  const score = toNumber(p.score_final_amc);
  const facade = toNumber(p.facade);

  // Prix max : ignorer si valeur vide ou valeur max par défaut
  if (prixMax !== null && prixMax < 20000 && prixApp !== null && prixApp > prixMax) {
    return false;
  }

  // Surface max : ignorer si valeur vide ou valeur max par défaut
  if (surfaceMax !== null && surfaceMax < 10000 && surface !== null && surface > surfaceMax) {
    return false;
  }

  if (filters.quartier && normalize(p.quartier) !== normalize(filters.quartier)) {
    return false;
  }

if (filters.zonage) {
  const filterZone = normalize(filters.zonage);

  const parcelZonage = normalize(p.zonage);
  const parcelSecteur = normalize(p.secteur);

  const matchZone =
    parcelZonage === filterZone ||
    parcelSecteur === filterZone ||
    parcelZonage.includes(filterZone) ||
    parcelSecteur.includes(filterZone) ||
    filterZone.includes(parcelZonage) ||
    filterZone.includes(parcelSecteur);

  if (!matchZone) {
    return false;
  }
}

  if (scoreMin !== null && scoreMin > 0 && score !== null && score < scoreMin) {
    return false;
  }

  // Façade max : ignorer si valeur max par défaut
  if (facadeMax !== null && facadeMax < 4 && facade !== null && facade > facadeMax) {
    return false;
  }

  if (filters.hauteurMx && normalize(p.hauteur_mx) !== normalize(filters.hauteurMx)) {
    return false;
  }

  if (filters.nature && normalize(p.nature) !== normalize(filters.nature)) {
    return false;
  }

  return true;
};



  const baseFeatures = layerData?.features || [];

const features = showOnlySelected
  ? selectedGeoJsonFeatures
  : showOnlyFiltered && selectedLayerId === "parcelles"
  ? baseFeatures.filter(matchParcelFilters)
  : baseFeatures;

  const columns = useMemo(() => {
    if (selectedLayerId === "parcelles") {
      return [
        "gid",
        "tf",
        "surface",
        "quartier",
        "zonage",
        "secteur",
        "hauteur_mx",
        "facade",
"cus",
"cos",
"commune_ar",
        "score_final_amc",
        "prix_app_final",
        "pt_v_final",
        "pt_zi_final",
      ];
    }

    const keys = new Set();

    features.forEach((feature) => {
      Object.keys(feature.properties || {}).forEach((key) => keys.add(key));
    });

    return Array.from(keys);
  }, [features, selectedLayerId]);

  const filteredFeatures = useMemo(() => {
    if (!searchText.trim()) return features;

    const query = normalizeText(searchText);

    return features.filter((feature) => {
      const props = feature.properties || {};

      return Object.values(props).some((value) =>
        normalizeText(value).includes(query)
      );
    });
  }, [features, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredFeatures.length / rowsPerPage));

  const visibleFeatures = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredFeatures.slice(start, start + rowsPerPage);
  }, [filteredFeatures, page]);

  useEffect(() => {
    setPage(1);
  }, [searchText, selectedLayerId]);

  return (
    <div className={`attribute-table-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="attribute-table-header">
        <div>
          <strong>Table attributaire</strong>
          <span>
            {filteredFeatures.length} / {features.length} entité(s)
          </span>
        </div>

        <div className="attribute-table-actions">
          <select
            value={selectedLayerId}
            onChange={(e) => setSelectedLayerId(e.target.value)}
          >
            <option value="">Choisir une couche</option>

            {availableLayers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? "Afficher la table" : "Masquer la table"}
          >
            {collapsed ? "⌃" : "⌄"}
          </button>

          <button onClick={onClose}>×</button>
        </div>
      </div>

      {!collapsed && (
        <>
<div className="attribute-table-toolbar">
  <div className="attribute-table-left-tools">
    <label className="attribute-selected-toggle">
      <input
        type="checkbox"
        checked={showOnlySelected}
        onChange={(e) => {
          setShowOnlySelected(e.target.checked);
          setShowOnlyFiltered(false);
          setPage(1);
        }}
      />
      Sélection actuelle ({selectedFeatures.length})
    </label>

    {selectedLayerId === "parcelles" && (
      <label className="attribute-selected-toggle">
        <input
          type="checkbox"
          checked={showOnlyFiltered}
          onChange={(e) => {
            setShowOnlyFiltered(e.target.checked);
            setShowOnlySelected(false);
            setPage(1);
          }}
        />
        Résultat du filtre
      </label>
    )}
  </div>

  <input
    type="text"
    placeholder="Rechercher dans la table..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    disabled={!selectedLayerId || loading}
  />

  <div className="attribute-pagination">
    <button
      disabled={page <= 1}
      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
    >
      ‹
    </button>

    <span>
      Page {page} / {totalPages}
    </span>

    <button
      disabled={page >= totalPages}
      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
    >
      ›
    </button>
  </div>
</div>

          <div className="attribute-table-body">
            {!selectedLayerId ? (
              <div className="attribute-table-empty">
                Sélectionnez une couche pour afficher sa table attributaire.
              </div>
            ) : loading ? (
              <div className="attribute-table-empty">
                Chargement de la table...
              </div>
           ) : baseFeatures.length === 0 ? (
  <div className="attribute-table-empty">
    Aucune entité trouvée pour cette couche.
  </div>
) : features.length === 0 && showOnlyFiltered ? (
  <div className="attribute-table-empty">
    Aucune parcelle ne correspond aux filtres appliqués.
  </div>
) : features.length === 0 && showOnlySelected ? (
  <div className="attribute-table-empty">
    Aucun élément sélectionné.
  </div>
) : filteredFeatures.length === 0 ? (
  <div className="attribute-table-empty">
    Aucun résultat trouvé dans la recherche.
  </div>
) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                {visibleFeatures.map((feature, index) => {
  const rowKey =
    feature.properties?.gid ||
    feature.properties?.id ||
    `${page}-${index}`;

  return (
    <tr
      key={rowKey}
      className={activeRowKey === rowKey ? "active-row" : ""}
      onClick={() => {
        setActiveRowKey(rowKey);

        onZoomFeature?.({
          ...feature,
          _highlightId: Date.now(),
        });
      }}
      title="Zoomer vers cette entité"
    >
                      <td>{(page - 1) * rowsPerPage + index + 1}</td>

                      {columns.map((col) => (
                        <td key={col}>
                          {feature.properties?.[col] !== null &&
                          feature.properties?.[col] !== undefined
                            ? String(feature.properties[col])
                            : ""}
                        </td>
                      ))}
                       </tr>
  );
})}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AttributeTable;