import { useEffect, useState } from "react";
import "./FilterPanel.css";
import shp from "shpjs";
import Papa from "papaparse";
import toast from "react-hot-toast";

export default function FilterPanel({
  filters,
  setFilters,
  applyFilters,
  resetFilters,
  layers,
  setLayers,
  basemap,
  setBasemap,
  externalLayers,
  setExternalLayers,
  heatmapField,
  setHeatmapField,
  analysisStats,
  totalCount,
  filteredCount,
}) {
  const [activeTab, setActiveTab] = useState("layers");
  const [collapsedPanel, setCollapsedPanel] = useState(true);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [importType, setImportType] = useState("geojson");

  const [filterOptions, setFilterOptions] = useState({
    quartiers: [],
    zonages: [],
    hauteurs: [],
    natures: [],
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/filter-options")
      .then((res) => res.json())
      .then((data) => {
        setFilterOptions({
          quartiers: data.quartiers || [],
          zonages: data.zonages || [],
          hauteurs: data.hauteurs || [],
          natures: data.natures || [],
        });
      })
      .catch((error) => {
        console.error("Erreur chargement options filtres:", error);
      });
  }, []);

  const toggleLayer = (key, checked) => {
    setLayers((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const LayerSwitch = ({ label, layerKey, color }) => (
    <div className="layer-switch-row">
      <div className="layer-info">
        <span className="layer-color" style={{ background: color }}></span>
        <span>{label}</span>
      </div>

      <label className="switch">
        <input
          type="checkbox"
          checked={layers?.[layerKey] || false}
          onChange={(e) => toggleLayer(layerKey, e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );

  const handleGeoJsonUpload = (event) => {
  const file = event.target.files[0];

  if (!file) {
    toast("Aucun fichier sélectionné.", {
      icon: "⚠️",
    });
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const geojson = JSON.parse(e.target.result);

      if (!geojson.type || !geojson.features) {
        toast("Fichier GeoJSON invalide.", {
          icon: "⚠️",
        });
        return;
      }

      setExternalLayers((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: file.name,
          data: geojson,
          visible: true,
        },
      ]);

      setShowAddDataModal(false);

      toast.success("Couche GeoJSON importée avec succès.");
    } catch (error) {
      console.error("Erreur import GeoJSON :", error);
      toast.error("Erreur lors de la lecture du fichier GeoJSON.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
};

const handleShapefileUpload = async (event) => {
  const file = event.target.files[0];

  if (!file) {
    toast("Aucun fichier sélectionné.", {
      icon: "⚠️",
    });
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);

    setExternalLayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: file.name,
        data: geojson,
        visible: true,
      },
    ]);

    setShowAddDataModal(false);

    toast.success("Shapefile importé avec succès.");
  } catch (error) {
    console.error("Erreur import Shapefile:", error);
    toast.error(
      "Erreur : vérifiez que le fichier ZIP contient .shp, .shx, .dbf et .prj."
    );
  } finally {
    event.target.value = "";
  }
};

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const features = result.data
            .map((row, index) => {
              const lon =
                Number(row.longitude) ||
                Number(row.lon) ||
                Number(row.x) ||
                Number(row.X);

              const lat =
                Number(row.latitude) ||
                Number(row.lat) ||
                Number(row.y) ||
                Number(row.Y);

              if (!lon || !lat) return null;

              return {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [lon, lat],
                },
                properties: {
                  id: index + 1,
                  ...row,
                },
              };
            })
            .filter(Boolean);

          if (features.length === 0) {
            toast(
              "Aucun point valide trouvé. Vérifie les colonnes longitude/latitude ou x/y.", {
  icon: "⚠️",
}
            );
            return;
          }

          const geojson = {
            type: "FeatureCollection",
            features,
          };

          setExternalLayers((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: file.name,
              data: geojson,
              visible: true,
            },
          ]);

          setShowAddDataModal(false);
          toast.success("Fichier CSV importé avec succès.");
        } catch (error) {
          console.error("Erreur import CSV:", error);
          toast("Erreur lors de l'import CSV.", {
  icon: "⚠️",
});
        }
      },
      error: (error) => {
        console.error("Erreur lecture CSV:", error);
        toast("Impossible de lire le fichier CSV.", {
  icon: "⚠️",
});
      },
    });
  };

  const handleFileUpload = (event) => {
    if (importType === "geojson") {
      handleGeoJsonUpload(event);
    } else if (importType === "shp") {
      handleShapefileUpload(event);
    } else if (importType === "csv") {
      handleCsvUpload(event);
    } else if (importType === "url") {
      toast("Chargement depuis une URL sera ajouté plus tard.", {
  icon: "⚠️",
});
    }

    event.target.value = "";
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return Number(value).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return `${Number(value).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} DH/m²`;
  };

  const formatSurface = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    return `${Number(value).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    })} m²`;
  };

  const exportAnalysisCsv = () => {
    if (!analysisStats) {
      toast("Aucune analyse disponible.", {
  icon: "⚠️",
});
      return;
    }

    const rows = [
      ["Indicateur", "Valeur"],
      ["Parcelles sélectionnées", analysisStats.count ?? ""],
      ["Surface totale (m²)", analysisStats.surfaceTotal ?? ""],
      ["Surface moyenne (m²)", analysisStats.surfaceAvg ?? ""],
      ["Score AMC moyen", analysisStats.scoreAvg ?? ""],
      ["Prix appartement moyen (DH/m²)", analysisStats.prixAppAvg ?? ""],
      ["Prix terrain villa moyen (DH/m²)", analysisStats.ptVAvg ?? ""],
      ["Prix terrain ZI moyen (DH/m²)", analysisStats.ptZiAvg ?? ""],
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(";"))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "analyse_selection_parcelles.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <aside className={`y-panel ${collapsedPanel ? "collapsed" : ""}`}>
      <button
        className="y-panel-toggle"
        onClick={() => setCollapsedPanel(!collapsedPanel)}
        title={collapsedPanel ? "Ouvrir le panneau" : "Réduire le panneau"}
      >
        {collapsedPanel ? "›" : "‹"}
      </button>

      {!collapsedPanel && (
        <>
        <div className="y-logo">
  <div className="sidebar-brand">
   <div className="sidebar-logo-box">
  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
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
    <div className="sidebar-brand-text">
      <h1>
        <span className="brand-geo">GEO</span>
        <span className="brand-pro">PRO</span>
        <span className="brand-expert">Expert</span>
      </h1>
      <p>Plateforme web SIG<br/>d'expertise foncière et immobilière</p>
    </div>
  </div>
          </div>

          <div className="y-tabs">
            <button
              className={`y-tab ${activeTab === "layers" ? "active" : ""}`}
              onClick={() => setActiveTab("layers")}
            >
              Couches
            </button>

            <button
              className={`y-tab ${activeTab === "filters" ? "active" : ""}`}
              onClick={() => setActiveTab("filters")}
            >
              Filtres
            </button>

            <button
              className={`y-tab ${activeTab === "analysis" ? "active" : ""}`}
              onClick={() => setActiveTab("analysis")}
            >
              Analyse
            </button>

            <button
              className={`y-tab ${activeTab === "basemaps" ? "active" : ""}`}
              onClick={() => setActiveTab("basemaps")}
            >
              Cartes
            </button>
          </div>

          {activeTab === "layers" && (
            <div className="y-section">
              <h2>Couches</h2>

              <button
                className="y-add-data-btn"
                onClick={() => setShowAddDataModal(true)}
              >
                + Ajouter des données
              </button>

              <div className="y-layer-group-title">Couches principales</div>

              <LayerSwitch label="Parcelles" layerKey="parcelles" color="#22c55e" />

              <LayerSwitch
                label="Limites parcelles"
                layerKey="parcellesContour"
                color="#ececec"
              />

              <LayerSwitch label="Voirie" layerKey="voirie" color="#94a3b8" />

              <div className="y-layer-group-title">Transport</div>

              <LayerSwitch label="Tram" layerKey="tram" color="#e11d48" />
              <LayerSwitch
  label="Stations tram"
  layerKey="stationsTram"
  color="#f43f5e"
/>
              <LayerSwitch label="Bus" layerKey="bus" color="#2563eb" />
              <LayerSwitch label="Gare" layerKey="gare" color="#f59e0b" />

              <div className="y-layer-group-title">Équipements</div>

              <LayerSwitch
                label="Équipements"
                layerKey="equipements"
                color="#9333ea"
              />

              <div className="y-layer-group-title">Analyse spatiale</div>

              <LayerSwitch
                label="Heatmap prix"
                layerKey="heatmap"
                color="#ef4444"
              />

              <LayerSwitch
                label="Points prix par parcelle"
                layerKey="prixCentroid"
                color="#38bdf8"
              />

              {(layers?.heatmap || layers?.prixCentroid) && (
                <div className="y-filter-group y-price-type-box">
                  <label>Type de prix</label>

                  <select
                    value={heatmapField}
                    onChange={(e) => setHeatmapField(e.target.value)}
                  >
                    <option value="prix_app_final">Prix appartement</option>
                    <option value="pt_v_final">Prix terrain villa</option>
                    <option value="pt_zi_final">Prix terrain ZI</option>
                  </select>
                </div>
              )}

              <div className="y-layer-group-title">Couches importées</div>

              {externalLayers.length === 0 ? (
                <div className="y-empty">Aucune couche importée</div>
              ) : (
                externalLayers.map((layer) => (
                  <div key={layer.id} className="layer-switch-row">
                    <div className="layer-info">
                      <span
                        className="layer-color"
                        style={{ background: "#7dd3fc" }}
                      ></span>
                      <span>{layer.name}</span>
                    </div>

                    <div className="external-layer-actions">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={(e) =>
                            setExternalLayers((prev) =>
                              prev.map((l) =>
                                l.id === layer.id
                                  ? { ...l, visible: e.target.checked }
                                  : l
                              )
                            )
                          }
                        />
                        <span className="slider"></span>
                      </label>

                      <button
                        className="y-delete-layer-btn"
                        title="Supprimer la couche"
                        onClick={() =>
                          setExternalLayers((prev) =>
                            prev.filter((l) => l.id !== layer.id)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "filters" && (
            <div className="y-section">
              <div className="y-filter-title-line">
                <h2>Filtres</h2>

                <button
                  className="y-reset-icon-btn"
                  title="Réinitialiser les filtres"
                  onClick={resetFilters}
                >
                  ↻
                </button>

                <div className="y-filter-mini-count">
                  {filteredCount} / {totalCount}
                </div>
              </div>

              <button className="y-apply-filter-btn" onClick={applyFilters}>
                Appliquer les filtres
              </button>

              <div className="y-filter-group">
                <label>Prix au m² max : {filters.prixMax} DH/m²</label>

                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="100"
                  value={filters.prixMax}
                  onChange={(e) =>
                    updateFilter("prixMax", Number(e.target.value))
                  }
                />

                <div className="y-range-values">
                  <span>0 DH/m²</span>
                  <span>20 000 DH/m²</span>
                </div>
              </div>

              <div className="y-filter-group">
                <label>
                  Surface max :{" "}
                  {filters.surfaceMax >= 10000
                    ? "10 000 m² et +"
                    : `${filters.surfaceMax} m²`}
                </label>

                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="50"
                  value={filters.surfaceMax}
                  onChange={(e) =>
                    updateFilter("surfaceMax", Number(e.target.value))
                  }
                />

                <div className="y-range-values">
                  <span>0 m²</span>
                  <span>10 000 m² et +</span>
                </div>
              </div>

              <div className="y-filter-group">
                <label>Quartier</label>
                <select
                  value={filters.quartier}
                  onChange={(e) => updateFilter("quartier", e.target.value)}
                >
                  <option value="">Tous les quartiers</option>

                  {filterOptions.quartiers.map((quartier) => (
                    <option key={quartier} value={quartier}>
                      {quartier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="y-filter-group">
                <label>Zonage sélectionné : {filters.zonage || "Tous"}</label>

                <select
                  value={filters.zonage}
                  onChange={(e) => updateFilter("zonage", e.target.value)}
                >
                  <option value="">Tous les zonages</option>

                  {filterOptions.zonages.map((zonage) => (
                    <option key={zonage} value={zonage}>
                      {zonage}
                    </option>
                  ))}
                </select>
              </div>

              <div className="y-filter-group">
                <label>Score AMC min : {filters.scoreMin}</label>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={filters.scoreMin}
                  onChange={(e) =>
                    updateFilter("scoreMin", Number(e.target.value))
                  }
                />

                <div className="y-range-values">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              <details className="y-advanced">
                <summary>Avancé</summary>

                <div className="y-filter-group">
                  <label>
                    Façade max :{" "}
                    {filters.facadeMax >= 4 ? "4 et +" : filters.facadeMax}
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={filters.facadeMax}
                    onChange={(e) =>
                      updateFilter("facadeMax", Number(e.target.value))
                    }
                  />

                  <div className="y-range-values">
                    <span>0</span>
                    <span>4 et +</span>
                  </div>
                </div>

                <div className="y-filter-group">
                  <label>Hauteur max : {filters.hauteurMx || "Toutes"}</label>

                  <select
                    value={filters.hauteurMx}
                    onChange={(e) =>
                      updateFilter("hauteurMx", e.target.value)
                    }
                  >
                    <option value="">Toutes les hauteurs</option>

                    {filterOptions.hauteurs.map((hauteur) => (
                      <option key={hauteur} value={hauteur}>
                        {hauteur}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="y-filter-group">
                  <label>Nature : {filters.nature || "Toutes"}</label>

                  <select
                    value={filters.nature}
                    onChange={(e) => updateFilter("nature", e.target.value)}
                  >
                    <option value="">Toutes les natures</option>

                    {filterOptions.natures.map((nature) => (
                      <option key={nature} value={nature}>
                        {nature}
                      </option>
                    ))}
                  </select>
                </div>
              </details>
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="y-section">
              <h2>Analyse</h2>

              <div className="y-analysis-note">
                Analyse basée sur les parcelles actuellement filtrées.
              </div>

              <button className="y-export-analysis-btn" onClick={exportAnalysisCsv}>
                Exporter l’analyse CSV
              </button>

              <div className="y-analysis-card">
                <h3>Sélection</h3>

                <div className="y-analysis-row">
                  <span>Parcelles sélectionnées</span>
                  <strong>{analysisStats?.count ?? "-"}</strong>
                </div>

                <div className="y-analysis-row">
                  <span>Surface totale</span>
                  <strong>{formatSurface(analysisStats?.surfaceTotal)}</strong>
                </div>

                <div className="y-analysis-row">
                  <span>Surface moyenne</span>
                  <strong>{formatSurface(analysisStats?.surfaceAvg)}</strong>
                </div>
              </div>

              <div className="y-analysis-card">
                <h3>Score AMC</h3>

                <div className="y-analysis-row">
                  <span>Score moyen</span>
                  <strong>{formatNumber(analysisStats?.scoreAvg)}</strong>
                </div>
              </div>

              <div className="y-analysis-card">
                <h3>Prix moyens</h3>

                <div className="y-analysis-row">
                  <span>Appartement</span>
                  <strong>{formatPrice(analysisStats?.prixAppAvg)}</strong>
                </div>

                <div className="y-analysis-row">
                  <span>Terrain villa</span>
                  <strong>{formatPrice(analysisStats?.ptVAvg)}</strong>
                </div>

                <div className="y-analysis-row">
                  <span>Terrain ZI</span>
                  <strong>{formatPrice(analysisStats?.ptZiAvg)}</strong>
                </div>
              </div>
            </div>
          )}

{activeTab === "basemaps" && (
  <div className="y-section">
    <h2>Cartes</h2>

    <div
      className={`y-basemap-card ${basemap === "osm" ? "active" : ""}`}
      onClick={() => setBasemap("osm")}
    >
      OpenStreetMap
    </div>

    <div
      className={`y-basemap-card ${basemap === "dark" ? "active" : ""}`}
      onClick={() => setBasemap("dark")}
    >
      Dark
    </div>

    <div
      className={`y-basemap-card ${basemap === "light" ? "active" : ""}`}
      onClick={() => setBasemap("light")}
    >
      Light
    </div>

    <div
      className={`y-basemap-card ${basemap === "satellite" ? "active" : ""}`}
      onClick={() => setBasemap("satellite")}
    >
      Satellite
    </div>

    <div
      className={`y-basemap-card ${basemap === "orthophoto" ? "active" : ""}`}
      onClick={() => setBasemap("orthophoto")}
    >
      Orthophoto Fida
    </div>
  </div>
)}
        </>
      )}

      {showAddDataModal && (
        <div className="add-data-overlay">
          <div className="add-data-modal">
            <button
              className="add-data-close"
              onClick={() => setShowAddDataModal(false)}
            >
              ×
            </button>

            <h2>Ajouter des données à la carte</h2>

            <div className="add-data-tabs">
              <button
                className={importType === "geojson" ? "active" : ""}
                onClick={() => setImportType("geojson")}
              >
                GeoJSON / JSON
              </button>

              <button
                className={importType === "shp" ? "active" : ""}
                onClick={() => setImportType("shp")}
              >
                Shapefile ZIP
              </button>

              <button
                className={importType === "csv" ? "active" : ""}
                onClick={() => setImportType("csv")}
              >
                CSV points
              </button>

            </div>

            <div className="add-data-info">
              {importType === "geojson" && (
                <span>
                  Importez un fichier <strong>GeoJSON</strong> ou{" "}
                  <strong>JSON</strong>.
                </span>
              )}

              {importType === "shp" && (
                <span>
                  Importez un <strong>Shapefile ZIP</strong> contenant .shp,
                  .shx, .dbf et .prj.
                </span>
              )}

              {importType === "csv" && (
                <span>
                  Importez un fichier <strong>CSV</strong> contenant les colonnes
                  longitude/latitude ou x/y.
                </span>
              )}

              {importType === "url" && (
                <span>Chargement depuis une URL sera ajouté plus tard.</span>
              )}
            </div>

            <div className="drop-zone">
              <div className="file-icons">
                <span>JSON</span>
                <span>GEOJSON</span>
                <span>SHP ZIP</span>
                <span>CSV</span>
              </div>

              <div className="upload-icon">⇩</div>

              <p>Glissez-déposez votre fichier ici</p>

              <label className="browse-btn">
                parcourir vos fichiers
                <input
                  key={importType}
                  type="file"
                  accept={
                    importType === "geojson"
                      ? ".geojson,.json,application/json"
                      : importType === "shp"
                      ? ".zip,application/zip,application/x-zip-compressed"
                      : importType === "csv"
                      ? ".csv,text/csv"
                      : ""
                  }
                  hidden
                  onChange={handleFileUpload}
                />
              </label>

              <small>Les données seront ajoutées temporairement à la carte.</small>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}