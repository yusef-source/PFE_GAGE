import { useEffect, useMemo, useRef, useState } from "react";
import FilterPanel from "./FilterPanel";
import Legend from "./Legend";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup,Polyline, Polygon,
CircleMarker, Tooltip, useMapEvents, WMSTileLayer } from "react-leaflet";
import ParcellesLayer from "./ParcellesLayer";
import ParcellePopup from "./ParcellePopup";
import VoirieLayer from "./VoirieLayer";
import TramLayer from "./TramLayer";
import BusLayer from "./BusLayer";
import GareLayer from "./GareLayer";
import EquipementsLayer from "./EquipementsLayer";
import HeatmapLayer from "./HeatmapLayer";
import ParcellesContourLayer from "./ParcellesContourLayer";
import PrixCentroidLayer from "./PrixCentroidLayer";
import SearchBar from "./SearchBar";
import SearchParcelHighlight from "./SearchParcelHighlight";

import { getParcelles, getParcelleAtPoint } from "../../services/parcellesService";
import L from "leaflet";
import MapStatusBar from "./MapStatusBar";
import InvestmentSimulatorModal from "./InvestmentSimulatorModal";
import AttributeTable from "./AttributeTable";
import * as turf from "@turf/turf";
import CoordinateConverterModal from "./CoordinateConverterModal";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { exportMapPdf } from "../../utils/exportMapPdf";
import { generateParcellePdf } from "../../utils/generateParcellePdf";
import StationsTramLayer from "./StationsTramLayer";


function AutoZoomExternalLayer({ externalLayers }) {
  const map = useMap();

  useEffect(() => {
    if (!externalLayers || externalLayers.length === 0) return;

    const lastLayer = externalLayers[externalLayers.length - 1];

    if (!lastLayer?.data) return;

    const leafletLayer = L.geoJSON(lastLayer.data);
    const bounds = leafletLayer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 18,
      });
    }
  }, [externalLayers, map]);

  return null;
}

function ParcelleWmsClickHandler({ disabled, onParcelFound }) {
  const map = useMapEvents({
    click: async (e) => {
      if (disabled) return;

      // Empêcher les clics dans le popup Leaflet de relancer un clic carte
      const target = e.originalEvent?.target;
      if (
        target?.closest?.(".leaflet-popup") ||
        target?.closest?.(".parcelle-popup")
      ) {
        return;
      }

      try {
        const { lat, lng } = e.latlng;
        const res = await getParcelleAtPoint(lat, lng);

        if (!res.data) return;

        const feature = res.data;

        onParcelFound(feature, e.latlng);

        if (feature.geometry) {
          const layer = L.geoJSON(feature);
          const bounds = layer.getBounds();

          if (bounds.isValid()) {
           map.fitBounds(bounds, {
  paddingTopLeft: [40, 120],
  paddingBottomRight: [40, 60],
  maxZoom: 19,
  animate: true,
});
          }
        }
      } catch (error) {
        console.error("Erreur clic parcelle WMS:", error);
        toast.error("Erreur lors de la récupération de la parcelle.");
      }
    },
  });

  return null;
}

const FIDA_CENTER = [33.5650, -7.5898];
const FIDA_ZOOM = 14;

function MapToolsControl({
  measureMode,
  setMeasureMode,
  setMeasurePoints,
  setMeasureClosed,
  drawMode,
  setDrawMode,
  setDrawMenuOpen,
  setCurrentLinePoints,
  setCurrentPolygonPoints,
  setRectangleStart,
  setRectanglePreview,
  setDrawFeatures,
  selectionMode,
  setSelectionMode,
  setSelectedFeatures,
  selectedFeatures,
  exportSelectedGeoJSON,
  showAttributeTable,
  setShowAttributeTable,

  exportMapPdfFn,
layers,
heatmapField,
scaleText,
}) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div");

      container.style.background = "transparent";
      container.style.border = "none";
      container.style.boxShadow = "none";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";

      const topRow = L.DomUtil.create("div", "", container);
      topRow.style.display = "flex";
      topRow.style.flexDirection = "row";
      topRow.style.gap = "6px";
      topRow.style.padding = "4px";
      topRow.style.background = "rgba(15, 23, 42, 0.82)";
      topRow.style.border = "1px solid rgba(255,255,255,0.10)";
      topRow.style.borderRadius = "12px";
      topRow.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
      topRow.style.backdropFilter = "blur(8px)";

      const toolsColumn = L.DomUtil.create("div", "", container);
      toolsColumn.style.display = "flex";
      toolsColumn.style.flexDirection = "column";
      toolsColumn.style.gap = "6px";
      toolsColumn.style.alignSelf = "flex-end";
      toolsColumn.style.padding = "4px";
      toolsColumn.style.background = "rgba(15, 23, 42, 0.82)";
      toolsColumn.style.border = "1px solid rgba(255,255,255,0.10)";
      toolsColumn.style.borderRadius = "12px";
      toolsColumn.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
      toolsColumn.style.backdropFilter = "blur(8px)";

      const createButton = (
        symbol,
        title,
        onClick,
        active = false,
        parent = toolsColumn
      ) => {
        const button = L.DomUtil.create("button", "", parent);

        button.innerHTML = symbol;
        button.title = title;
        button.setAttribute("aria-label", title);

        button.style.width = "40px";
        button.style.height = "40px";
        button.style.background = active ? "#0f766e" : "#1f2937";
        button.style.color = "#ffffff";
        button.style.border = active
          ? "1px solid #2dd4bf"
          : "1px solid rgba(255,255,255,0.14)";
        button.style.borderRadius = "10px";
        button.style.fontSize = "18px";
        button.style.cursor = "pointer";
        button.style.boxShadow = active
          ? "0 0 0 2px rgba(45,212,191,0.20), 0 8px 20px rgba(0,0,0,0.40)"
          : "0 4px 14px rgba(0,0,0,0.35)";
        button.style.display = "flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";
        button.style.padding = "0";
        button.style.transition = "all 0.18s ease";
        button.style.fontWeight = "700";

        button.onmouseenter = () => {
          button.style.background = active ? "#14b8a6" : "#374151";
          button.style.transform = "translateY(-1px)";
        };

        button.onmouseleave = () => {
          button.style.background = active ? "#0f766e" : "#1f2937";
          button.style.transform = "translateY(0)";
        };

        button.onclick = onClick;

        return button;
      };

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      createButton(
        "X⇄Y",
        "Convertir des coordonnées",
        () => {
          window.dispatchEvent(new CustomEvent("open-coordinate-converter"));
          toast("Convertisseur de coordonnées ouvert.", {
            icon: "ℹ️",
          });
        },
        false,
        topRow
      );

      createButton(
        "▦",
        showAttributeTable
          ? "Fermer la table attributaire"
          : "Ouvrir la table attributaire",
        () => {
          const nextShowAttributeTable = !showAttributeTable;

setShowAttributeTable(nextShowAttributeTable);

if (nextShowAttributeTable) {
  toast.success("Table attributaire ouverte.", {
    id: "attribute-table-toast",
  });
} else {
  toast("Table attributaire fermée.", {
    icon: "ℹ️",
    id: "attribute-table-toast",
  });
}
        },
        showAttributeTable,
        topRow
      );

      createButton(
        "⛶",
        "Activer / quitter le mode plein écran",
        async () => {
          try {
            const mapWrapper = document.querySelector(".map-wrapper");

            if (!document.fullscreenElement) {
              await mapWrapper?.requestFullscreen?.();
              toast.success("Mode plein écran activé.");
            } else {
              await document.exitFullscreen?.();
              toast("Mode plein écran désactivé.", {
                icon: "ℹ️",
              });
            }
          } catch (error) {
            console.error("Erreur plein écran :", error);
            toast.error("Impossible de changer le mode plein écran.");
          }
        },
        false,
        topRow
      );

      createButton(
        "◎",
        "Recentrer la carte sur Fida",
        () => {
          map.flyTo(FIDA_CENTER, FIDA_ZOOM, {
            animate: true,
            duration: 0.6,
          });

          toast.success("Carte recentrée sur l’emprise Fida.");
        },
        false,
        topRow
      );


      createButton(
  "＋",
  "Zoom avant",
  () => {
    map.zoomIn();
  }
);

createButton(
  "－",
  "Zoom arrière",
  () => {
    map.zoomOut();
  }
);

      createButton(
        "✏",
        drawMode !== null ? "Désactiver le dessin" : "Ouvrir les outils de dessin",
        () => {
          if (drawMode !== null) {
            setDrawMode(null);
            setDrawMenuOpen(false);
            setCurrentLinePoints([]);
            setCurrentPolygonPoints([]);
            setRectangleStart(null);
            setRectanglePreview(null);

            toast("Mode dessin désactivé.", {
              icon: "ℹ️",
            });
            return;
          }

          setSelectionMode(false);
          setMeasureMode(false);
          setMeasurePoints([]);
          setMeasureClosed(false);
          setDrawMenuOpen((prev) => !prev);

          toast("Choisissez un type de dessin : point, ligne, polygone ou rectangle.", {
            icon: "✏️",
          });
        },
        drawMode !== null
      );

      createButton(
        "☑",
        selectionMode
          ? "Désactiver le mode sélection"
          : "Activer la sélection des entités",
        () => {
        const nextSelectionMode = !selectionMode;

setSelectionMode(nextSelectionMode);

if (nextSelectionMode) {
  setMeasureMode(false);
  setDrawMode(null);
  setDrawMenuOpen(false);
  setMeasurePoints([]);
  setMeasureClosed(false);

  toast.success("Mode sélection activé.", {
    id: "selection-mode-toast",
  });
} else {
  toast("Mode sélection désactivé.", {
    icon: "ℹ️",
    id: "selection-mode-toast",
  });
}
        },
        selectionMode
      );

      createButton(
        "📏",
        measureMode ? "Désactiver la mesure" : "Mesurer une distance ou une surface",
        () => {
        const nextMeasureMode = !measureMode;

setMeasureMode(nextMeasureMode);
setMeasurePoints([]);
setMeasureClosed(false);

if (nextMeasureMode) {
  setDrawMode(null);
  setDrawMenuOpen(false);
  setSelectionMode(false);

  toast.success("Mode mesure activé.", {
    id: "measure-mode-toast",
  });
} else {
  toast("Mode mesure désactivé.", {
    icon: "ℹ️",
    id: "measure-mode-toast",
  });
}
        },
        measureMode
      );

      createButton(
        "⎙",
        "Exporter la sélection au format GeoJSON",
        () => {
          exportSelectedGeoJSON();
        }
      );


      createButton(
  "🖨",
  "Exporter la carte en PDF",
  () => {
    const titleInput = prompt(
      "Titre de la carte :",
      "Carte parcellaire — Fida, Casablanca"
    );
    if (titleInput === null) return;

    exportMapPdfFn({
      title: titleInput,
      layers,
      heatmapField,
      scaleText,
    });

    toast.success("Export PDF de la carte en cours...");
  }
);

      createButton(
        "🧹",
        "Effacer les dessins ou les éléments sélectionnés",
        () => {
          if (selectedFeatures.length > 0) {
            const selectedIds = selectedFeatures.map((f) => f.id);

            setDrawFeatures((prev) =>
              prev.filter((feature) => !selectedIds.includes(feature.id))
            );

            setSelectedFeatures([]);

            toast.success("Éléments sélectionnés supprimés.");
            return;
          }

          setDrawFeatures([]);
          setCurrentLinePoints([]);
          setCurrentPolygonPoints([]);
          setRectangleStart(null);
          setRectanglePreview(null);
          setDrawMode(null);
          setDrawMenuOpen(false);

          toast.success("Tous les dessins ont été effacés.");
        }
      );

      return container;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [
    map,
    measureMode,
    drawMode,
    selectionMode,
    showAttributeTable,
    selectedFeatures,
    setMeasureMode,
    setMeasurePoints,
    setMeasureClosed,
    setDrawMode,
    setDrawMenuOpen,
    setCurrentLinePoints,
    setCurrentPolygonPoints,
    setRectangleStart,
    setRectanglePreview,
    setDrawFeatures,
    setSelectionMode,
    setSelectedFeatures,
    setShowAttributeTable,
    exportSelectedGeoJSON,
  ]);

  return null;
}

function SearchPointZoom({ searchPoint }) {
  const map = useMap();

  useEffect(() => {
    if (!searchPoint) return;

    map.flyTo([searchPoint.lat, searchPoint.lng], 18, {
      animate: true,
      duration: 0.7,
    });
  }, [searchPoint, map]);

  return null;
}

function SearchParcelZoom({ searchParcel }) {
  const map = useMap();

  useEffect(() => {
    if (!searchParcel) return;

    const layer = L.geoJSON(searchParcel);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 18,
      });
    }
  }, [searchParcel, map]);

  return null;
}

function MeasureTool({
  measureMode,
  measurePoints,
  setMeasurePoints,
  measureClosed,
  setMeasureClosed,
  hoverStartPoint,
  setHoverStartPoint,
  snapVertices,
  setSnapPreview,
}) {
  const map = useMap();

  useEffect(() => {
    if (measureMode) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
      setSnapPreview(null);
    }

    return () => {
      map.doubleClickZoom.enable();
      setSnapPreview(null);
    };
  }, [map, measureMode, setSnapPreview]);

  useMapEvents({
    mousemove(e) {
      if (!measureMode || measureClosed) {
        setSnapPreview(null);
        return;
      }

      const snap = getSnapResult(map, e.latlng, snapVertices, 50);

      if (snap.snapped) {
        setSnapPreview(snap.latlng);
      } else {
        setSnapPreview(null);
      }
    },

    click(e) {
      if (!measureMode || measureClosed) return;

      const snap = getSnapResult(map, e.latlng, snapVertices, 50);

      setMeasurePoints((prev) => [...prev, snap.latlng]);
    },
  });

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatArea = (m2) => {
    if (m2 < 10000) return `${m2.toFixed(0)} m²`;
    return `${(m2 / 10000).toFixed(2)} ha`;
  };

  const calculateDistance = (points, closed = false) => {
    let total = 0;

    for (let i = 1; i < points.length; i++) {
      total += points[i - 1].distanceTo(points[i]);
    }

    if (closed && points.length > 2) {
      total += points[points.length - 1].distanceTo(points[0]);
    }

    return total;
  };

  const calculateArea = (points) => {
    if (points.length < 3) return 0;

    const earthRadius = 6378137;
    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      const lon1 = (p1.lng * Math.PI) / 180;
      const lon2 = (p2.lng * Math.PI) / 180;
      const lat1 = (p1.lat * Math.PI) / 180;
      const lat2 = (p2.lat * Math.PI) / 180;

      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    return Math.abs((area * earthRadius * earthRadius) / 2);
  };

  const linePositions =
    measureClosed && measurePoints.length >= 3
      ? [...measurePoints, measurePoints[0]]
      : measurePoints;

  const totalDistance = calculateDistance(measurePoints, measureClosed);
  const totalArea = measureClosed ? calculateArea(measurePoints) : 0;

  return (
    <>
      {measurePoints.length > 1 && (
        <Polyline
          pane="drawPane"
          positions={linePositions}
          pathOptions={{
            color: "#00e5ff",
            weight: 3,
            opacity: 1,
            dashArray: "6, 6",
          }}
        />
      )}

      {measurePoints.map((point, index) => {
        const isStart = index === 0;
        const canClose =
          isStart && measureMode && measurePoints.length >= 3 && !measureClosed;

        return (
          <CircleMarker
            key={index}
            pane="drawPane"
            center={point}
            radius={isStart ? 7 : 5}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor:
                canClose && hoverStartPoint
                  ? "#facc15"
                  : isStart
                  ? "#1a8c78"
                  : "#00e5ff",
              fillOpacity: 1,
            }}
            eventHandlers={{
              mouseover: () => {
                if (canClose) setHoverStartPoint(true);
              },
              mouseout: () => {
                if (canClose) setHoverStartPoint(false);
              },
              click: (e) => {
                if (canClose) {
                  e.originalEvent.preventDefault();
                  e.originalEvent.stopPropagation();

                  setMeasureClosed(true);
                  setHoverStartPoint(false);
                  setSnapPreview(null);
                }
              },
            }}
          />
        );
      })}

      {measurePoints.length > 1 && (
        <CircleMarker
          pane="drawPane"
          center={measurePoints[measurePoints.length - 1]}
          radius={0}
          interactive={false}
        >
          <Tooltip permanent direction="right" offset={[10, 0]}>
            {measureClosed ? (
              <>
                Périmètre : {formatDistance(totalDistance)}
                <br />
                Surface : {formatArea(totalArea)}
              </>
            ) : (
              <>Distance : {formatDistance(totalDistance)}</>
            )}
          </Tooltip>
        </CircleMarker>
      )}
    </>
  );
}

function DrawTool({
  drawMode,
  setDrawFeatures,
  currentLinePoints,
  setCurrentLinePoints,
  currentPolygonPoints,
  setCurrentPolygonPoints,
  setHoverPolygonStart,
  skipNextDrawClickRef,
  snapVertices,
  setSnapPreview,
  rectangleStart,
setRectangleStart,
rectanglePreview,
setRectanglePreview,
}) {
  const map = useMap();

  useEffect(() => {
    if (drawMode === "line" || drawMode === "polygon") {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }

    return () => {
      map.doubleClickZoom.enable();
    };
  }, [map, drawMode]);

  useMapEvents({
    mousemove(e) {
      if (drawMode === "rectangle" && rectangleStart) {
  const p1 = rectangleStart;
  const p2 = e.latlng;

  setRectanglePreview([
    [p1.lat, p1.lng],
    [p1.lat, p2.lng],
    [p2.lat, p2.lng],
    [p2.lat, p1.lng],
  ]);
}

      if (drawMode !== "polygon") {
        setSnapPreview(null);
        return;
      }

      const snap = getSnapResult(map, e.latlng, snapVertices, 35);

      if (snap.snapped) {
        setSnapPreview(snap.latlng);
      } else {
        setSnapPreview(null);
      }

      if (drawMode === "rectangle" && rectangleStart) {
  const p1 = rectangleStart;
  const p2 = e.latlng;

  setRectanglePreview([
    [p1.lat, p1.lng],
    [p1.lat, p2.lng],
    [p2.lat, p2.lng],
    [p2.lat, p1.lng],
  ]);
}
    },

    click(e) {

      if (drawMode === "rectangle") {
  if (!rectangleStart) {
    setRectangleStart(e.latlng);
    return;
  }

  const p1 = rectangleStart;
  const p2 = e.latlng;

  const rectangleLatLngs = [
    [p1.lat, p1.lng],
    [p1.lat, p2.lng],
    [p2.lat, p2.lng],
    [p2.lat, p1.lng],
  ];

  setDrawFeatures((prev) => [
    ...prev,
    {
      id: Date.now(),
      type: "rectangle",
      latlngs: rectangleLatLngs,
    },
  ]);

  setRectangleStart(null);
  setRectanglePreview(null);

  // on garde drawMode = "rectangle" pour dessiner plusieurs rectangles
}

      if (skipNextDrawClickRef.current) {
        skipNextDrawClickRef.current = false;
        return;
      }

      if (drawMode === "point") {
        setDrawFeatures((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "point",
            latlng: e.latlng,
          },
        ]);
      }

      if (drawMode === "line") {
        setCurrentLinePoints((prev) => [...prev, e.latlng]);
      }

      if (drawMode === "polygon") {
        const snap = getSnapResult(map, e.latlng, snapVertices, 35);

        setCurrentPolygonPoints((prev) => [...prev, snap.latlng]);
      }
    },

    dblclick(e) {
      if (drawMode !== "line") return;

      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      setCurrentLinePoints((prev) => {
        if (prev.length < 2) return prev;

        setDrawFeatures((old) => [
          ...old,
          {
            id: Date.now(),
            type: "line",
            latlngs: prev,
          },
        ]);

        return [];
      });
    },
  });

  return null;
}

function DrawPane() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("drawPane")) {
      const pane = map.createPane("drawPane");
      pane.style.zIndex = 900;
    }
  }, [map]);

  return null;
}

function getSnapResult(map, clickedLatLng, snapVertices, tolerancePx = 25) {
  if (!snapVertices || snapVertices.length === 0) {
    return {
      snapped: false,
      latlng: clickedLatLng,
    };
  }

  const clickedPoint = map.latLngToLayerPoint(clickedLatLng);

  let nearest = null;
  let minDistance = Infinity;

  snapVertices.forEach((vertex) => {
    const vertexLatLng = L.latLng(vertex.lat, vertex.lng);
    const vertexPoint = map.latLngToLayerPoint(vertexLatLng);
    const distance = clickedPoint.distanceTo(vertexPoint);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = vertexLatLng;
    }
  });

  if (nearest && minDistance <= tolerancePx) {
    return {
      snapped: true,
      latlng: nearest,
      distance: minDistance,
    };
  }

  return {
    snapped: false,
    latlng: clickedLatLng,
  };
}


function AttributeTableZoom({ feature }) {
  const map = useMap();

  useEffect(() => {
    if (!feature?.geometry) return;

    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 18,
      });
    }
  }, [feature, map]);

  if (!feature?.geometry) return null;

  return (
    <GeoJSON
      key={`table-highlight-${Date.now()}`}
      data={feature}
      pane="drawPane"
      interactive={false}
      style={{
        color: "#38bdf8",
        weight: 5,
        opacity: 1,
        fillColor: "#38bdf8",
        fillOpacity: 0.22,
        className: "table-feature-highlight",
      }}
      pointToLayer={(geoJsonPoint, latlng) =>
        L.circleMarker(latlng, {
          pane: "drawPane",
          radius: 10,
          color: "#38bdf8",
          weight: 4,
          opacity: 1,
          fillColor: "#38bdf8",
          fillOpacity: 0.35,
          className: "table-feature-highlight",
        })
      }
    />
  );
}

function SelectionRectangleTool({
  selectionMode,
  selectionBoxStart,
  setSelectionBoxStart,
  setSelectionBoxPreview,
  selectByRectangle,
}) {
  const map = useMap();
  const dragStartPointRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (selectionMode) {
      map.dragging.disable();
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = "";
      setSelectionBoxStart(null);
      setSelectionBoxPreview(null);
      dragStartPointRef.current = null;
      isDraggingRef.current = false;
    }

    return () => {
      map.dragging.enable();
      map.getContainer().style.cursor = "";
    };
  }, [map, selectionMode, setSelectionBoxStart, setSelectionBoxPreview]);

  useMapEvents({
    mousedown(e) {
      if (!selectionMode) return;

      dragStartPointRef.current = map.latLngToContainerPoint(e.latlng);
      isDraggingRef.current = false;
      setSelectionBoxStart(e.latlng);
      setSelectionBoxPreview(null);
    },

    mousemove(e) {
      if (!selectionMode || !selectionBoxStart || !dragStartPointRef.current) {
        return;
      }

      const currentPoint = map.latLngToContainerPoint(e.latlng);
      const distance = currentPoint.distanceTo(dragStartPointRef.current);

      if (distance < 8) return;

      isDraggingRef.current = true;

      const p1 = selectionBoxStart;
      const p2 = e.latlng;

      setSelectionBoxPreview([
        [p1.lat, p1.lng],
        [p1.lat, p2.lng],
        [p2.lat, p2.lng],
        [p2.lat, p1.lng],
      ]);
    },

    mouseup(e) {
      if (!selectionMode || !selectionBoxStart) return;

      if (!isDraggingRef.current) {
        setSelectionBoxStart(null);
        setSelectionBoxPreview(null);
        dragStartPointRef.current = null;
        return;
      }

      const p1 = selectionBoxStart;
      const p2 = e.latlng;

      const rectangleLatLngs = [
        [p1.lat, p1.lng],
        [p1.lat, p2.lng],
        [p2.lat, p2.lng],
        [p2.lat, p1.lng],
      ];

      const append = e.originalEvent.ctrlKey || e.originalEvent.shiftKey;

      selectByRectangle(rectangleLatLngs, append);

      setSelectionBoxStart(null);
      setSelectionBoxPreview(null);
      dragStartPointRef.current = null;
      isDraggingRef.current = false;
    },
  });

  return null;
}

function MapPanes() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("scoreWmsPane")) {
      const scorePane = map.createPane("scoreWmsPane");
      scorePane.style.zIndex = 350;
      scorePane.style.pointerEvents = "none";
    }

    if (!map.getPane("highlightPane")) {
      const highlightPane = map.createPane("highlightPane");
      highlightPane.style.zIndex = 650;
      highlightPane.style.pointerEvents = "none";
    }

    if (map.getPane("popupPane")) {
      map.getPane("popupPane").style.zIndex = 1000;
    }

    if (map.getPane("tooltipPane")) {
      map.getPane("tooltipPane").style.zIndex = 1001;
    }
  }, [map]);

  return null;
}




function escapeCql(value) {
  return String(value).replace(/'/g, "''");
}

function buildParcellesCqlFilter(filters) {
  const conditions = [];

  if (filters.prixMax && Number(filters.prixMax) < 20000) {
    conditions.push(`prix_app_final <= ${Number(filters.prixMax)}`);
  }

  if (filters.surfaceMax && Number(filters.surfaceMax) < 10000) {
    conditions.push(`surface <= ${Number(filters.surfaceMax)}`);
  }

  if (filters.scoreMin && Number(filters.scoreMin) > 0) {
    conditions.push(`score_final_amc >= ${Number(filters.scoreMin)}`);
  }

  if (filters.facadeMax && Number(filters.facadeMax) < 4) {
    conditions.push(`facade <= ${Number(filters.facadeMax)}`);
  }

  if (filters.quartier) {
    conditions.push(`quartier = '${escapeCql(filters.quartier)}'`);
  }

if (filters.zonage && filters.zonage.trim() !== "") {
  const zonageValue = escapeCql(filters.zonage.trim());
 conditions.push(`secteur LIKE '%${zonageValue}%'`);
}

  if (filters.hauteurMx) {
    conditions.push(`hauteur_mx = '${escapeCql(filters.hauteurMx)}'`);
  }

  if (filters.nature) {
    conditions.push(`nature = '${escapeCql(filters.nature)}'`);
  }

  return conditions.length > 0 ? conditions.join(" AND ") : "INCLUDE";
}




function MapView() {

  const navigate = useNavigate();

const handleBackHome = () => {
  toast("Retour vers la page d’accueil.", {
    icon: "↩️",
    id: "back-home-toast",
  });

  setTimeout(() => {
    navigate("/");
  }, 350);
};

  const skipNextDrawClickRef = useRef(false);
  const defaultFilters = {
    prixMax: 20000,
    surfaceMax: 10000,
    quartier: "",
    zonage: "",
    scoreMin: 0,
    facadeMax: 4,
    hauteurMx: "",
    nature: "",
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);

const [layers, setLayers] = useState({
  parcelles: false,
  parcellesContour: true,
  voirie: false,
  tram: false,
  stationsTram: false,
  bus: false,
  gare: false,
  equipements: false,
  heatmap: false,
  prixCentroid: false,
});

const [wmsPopupParcel, setWmsPopupParcel] = useState(null);
const [wmsPopupPosition, setWmsPopupPosition] = useState(null);

const [heatmapField, setHeatmapField] = useState("prix_app_final");

const [externalLayers, setExternalLayers] = useState([]);

const parcellesCqlFilter = useMemo(() => {
  return buildParcellesCqlFilter(filters);
}, [filters]);





useEffect(() => {
  getParcelles()
    .then((res) => {
      const features = res.data?.features || [];
      setTotalCount(features.length);

      const filteredFeatures = features.filter((feature) => {
        const p = feature.properties || {};

        const prixApp = Number(p.prix_app_final);
        const surface = Number(p.surface);
        const score = Number(p.score_final_amc);
        const facade = Number(p.facade);

        const matchesPrix =
          !filters.prixMax ||
          Number(filters.prixMax) >= 20000 ||
          (!isNaN(prixApp) && prixApp <= Number(filters.prixMax));

        const matchesSurface =
          !filters.surfaceMax ||
          Number(filters.surfaceMax) >= 10000 ||
          (!isNaN(surface) && surface <= Number(filters.surfaceMax));

        const matchesScore =
          !filters.scoreMin ||
          Number(filters.scoreMin) <= 0 ||
          (!isNaN(score) && score >= Number(filters.scoreMin));

        const matchesFacade =
          !filters.facadeMax ||
          Number(filters.facadeMax) >= 4 ||
          (!isNaN(facade) && facade <= Number(filters.facadeMax));

        const matchesQuartier =
          !filters.quartier ||
          String(p.quartier ?? "")
            .trim()
            .toUpperCase()
            .includes(String(filters.quartier).trim().toUpperCase());

        // Important : AM4, E3sr, E2sr... sont dans le champ secteur
        const matchesZonage =
          !filters.zonage ||
          String(p.secteur ?? "")
            .trim()
            .toUpperCase()
            .includes(String(filters.zonage).trim().toUpperCase());

        const matchesHauteur =
          !filters.hauteurMx ||
          String(p.hauteur_mx ?? "")
            .trim()
            .toUpperCase()
            .includes(String(filters.hauteurMx).trim().toUpperCase());

        const matchesNature =
          !filters.nature ||
          String(p.nature ?? "")
            .trim()
            .toUpperCase()
            .includes(String(filters.nature).trim().toUpperCase());

        return (
          matchesPrix &&
          matchesSurface &&
          matchesScore &&
          matchesFacade &&
          matchesQuartier &&
          matchesZonage &&
          matchesHauteur &&
          matchesNature
        );
      });

      setFilteredCount(filteredFeatures.length);

      const getNumber = (feature, field) => {
        const value = Number(feature.properties?.[field]);
        return isNaN(value) ? 0 : value;
      };

      const count = filteredFeatures.length;

      if (count === 0) {
        setAnalysisStats({
          count: 0,
          surfaceTotal: 0,
          surfaceAvg: 0,
          scoreAvg: 0,
          prixAppAvg: 0,
          ptVAvg: 0,
          ptZiAvg: 0,
        });
        return;
      }

      const surfaceTotal = filteredFeatures.reduce(
        (sum, f) => sum + getNumber(f, "surface"),
        0
      );

      const scoreTotal = filteredFeatures.reduce(
        (sum, f) => sum + getNumber(f, "score_final_amc"),
        0
      );

      const prixAppTotal = filteredFeatures.reduce(
        (sum, f) => sum + getNumber(f, "prix_app_final"),
        0
      );

      const ptVTotal = filteredFeatures.reduce(
        (sum, f) => sum + getNumber(f, "pt_v_final"),
        0
      );

      const ptZiTotal = filteredFeatures.reduce(
        (sum, f) => sum + getNumber(f, "pt_zi_final"),
        0
      );

      setAnalysisStats({
        count,
        surfaceTotal,
        surfaceAvg: surfaceTotal / count,
        scoreAvg: scoreTotal / count,
        prixAppAvg: prixAppTotal / count,
        ptVAvg: ptVTotal / count,
        ptZiAvg: ptZiTotal / count,
      });
    })
    .catch((error) => {
      console.error("Erreur calcul analyse :", error);
      setAnalysisStats(null);
      setTotalCount(0);
      setFilteredCount(0);
    });
}, [filters]);







  const [basemap, setBasemap] = useState("dark");
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
const [analysisStats, setAnalysisStats] = useState(null);
const [searchPoint, setSearchPoint] = useState(null);
const [searchParcel, setSearchParcel] = useState(null);
const [measureMode, setMeasureMode] = useState(false);
const [measurePoints, setMeasurePoints] = useState([]);
const [measureFinished, setMeasureFinished] = useState(false);
const [measureClosed, setMeasureClosed] = useState(false);
const [hoverStartPoint, setHoverStartPoint] = useState(false);
const [drawMenuOpen, setDrawMenuOpen] = useState(false);
const [drawMode, setDrawMode] = useState(null);
const [drawFeatures, setDrawFeatures] = useState([]);
const [currentLinePoints, setCurrentLinePoints] = useState([]);
const [snapVertices, setSnapVertices] = useState([]);
const [snapPreview, setSnapPreview] = useState(null);
const [currentPolygonPoints, setCurrentPolygonPoints] = useState([]);
const [hoverPolygonStart, setHoverPolygonStart] = useState(false);
const [rectangleStart, setRectangleStart] = useState(null);
const [rectanglePreview, setRectanglePreview] = useState(null);
const [selectionMode, setSelectionMode] = useState(false);
const [selectedFeatures, setSelectedFeatures] = useState([]);
const selectedFeaturesRef = useRef([]);
const [compareParcelles, setCompareParcelles] = useState([]);
const [simulatorParcel, setSimulatorParcel] = useState(null);
const [showAttributeTable, setShowAttributeTable] = useState(false);
const [parcellesData, setParcellesData] = useState(null);
const [voirieData, setVoirieData] = useState(null);
const [tableZoomFeature, setTableZoomFeature] = useState(null);
const [selectionBoxStart, setSelectionBoxStart] = useState(null);
const [selectionBoxPreview, setSelectionBoxPreview] = useState(null);
const [showCoordinateConverter, setShowCoordinateConverter] = useState(false);
const [convertedPoint, setConvertedPoint] = useState(null);

const [scaleText, setScaleText] = useState("1 : -");

useEffect(() => {
  const openConverter = () => setShowCoordinateConverter(true);

  window.addEventListener("open-coordinate-converter", openConverter);

  return () => {
    window.removeEventListener("open-coordinate-converter", openConverter);
  };
}, []);


useEffect(() => {
  selectedFeaturesRef.current = selectedFeatures;
}, [selectedFeatures]);
const handleSearchCoordinates = ({ lat, lng }) => {
  setSearchPoint({ lat, lng });
};

const handleWmsParcelFound = (feature, latlng) => {
  setWmsPopupParcel(feature);
  setWmsPopupPosition(latlng);
};

const closeWmsPopup = () => {
  setWmsPopupParcel(null);
  setWmsPopupPosition(null);
};

const handleWmsPdf = () => {
  try {
    const p = wmsPopupParcel?.properties;
    if (!p) return;

    generateParcellePdf(p);
    toast.success("Rapport PDF généré avec succès.");
  } catch (error) {
    console.error("Erreur génération PDF :", error);
    toast.error("Erreur lors de la génération du rapport PDF.");
  }
};

const handleWmsCompare = () => {
  const p = wmsPopupParcel?.properties;
  if (!p) return;

  window.dispatchEvent(
    new CustomEvent("add-parcelle-compare", {
      detail: p,
    })
  );

  closeWmsPopup();
};

const handleWmsSimulate = () => {
  const p = wmsPopupParcel?.properties;
  if (!p) return;

  window.dispatchEvent(
    new CustomEvent("open-investment-simulator", {
      detail: p,
    })
  );

  closeWmsPopup();
};

const handleSearchTF = async (tf) => {
  try {
    const res = await getParcelles();

    const feature = res.data.features.find((f) => {
      return String(f.properties.tf ?? "")
        .trim()
        .toUpperCase() === String(tf).trim().toUpperCase();
    });

  if (!feature) {
  toast("Aucune parcelle trouvée pour ce TF.", {
    icon: "⚠️",
  });
  return;
}

setSearchParcel(feature);
} catch (error) {
  console.error("Erreur recherche TF:", error);
  toast.error("Erreur lors de la recherche du TF.");
}
};

const mapToolActive = measureMode || drawMode !== null;

useEffect(() => {
  getParcelles()
    .then((res) => { 
      setParcellesData(res.data);
      const vertices = [];

      res.data.features.forEach((feature) => {
        const geom = feature.geometry;

        if (!geom || !geom.coordinates) return;

        if (geom.type === "Polygon") {
          geom.coordinates.forEach((ring) => {
            ring.forEach((coord) => {
              vertices.push({
                lng: coord[0],
                lat: coord[1],
              });
            });
          });
        }

        if (geom.type === "MultiPolygon") {
          geom.coordinates.forEach((polygon) => {
            polygon.forEach((ring) => {
              ring.forEach((coord) => {
                vertices.push({
                  lng: coord[0],
                  lat: coord[1],
                });
              });
            });
          });
        }
      });

      setSnapVertices(vertices);
      console.log("Sommets accrochage:", vertices.length);
    })
    .catch((err) => console.error("Erreur chargement sommets:", err));
}, []);

const drawSnapVertices = useMemo(() => {
  const vertices = [];

  drawFeatures.forEach((feature) => {
    if (feature.type === "point") {
      vertices.push({
        lat: feature.latlng.lat,
        lng: feature.latlng.lng,
      });
    }

    if (feature.type === "line") {
      feature.latlngs.forEach((p) => {
        vertices.push({
          lat: p.lat,
          lng: p.lng,
        });
      });
    }

    if (feature.type === "polygon" || feature.type === "rectangle") {
      feature.latlngs.forEach((p) => {
        if (Array.isArray(p)) {
          vertices.push({
            lat: p[0],
            lng: p[1],
          });
        } else {
          vertices.push({
            lat: p.lat,
            lng: p.lng,
          });
        }
      });
    }
  });

  return vertices;
}, [drawFeatures]);

const allSnapVertices = useMemo(() => {
  return [...snapVertices, ...drawSnapVertices];
}, [snapVertices, drawSnapVertices]);

console.log("Sommets parcelles:", snapVertices.length);
console.log("Sommets dessins:", drawSnapVertices.length);
console.log("Tous sommets snap:", allSnapVertices.length);

const toggleSelectedFeature = (feature) => {
  setSelectedFeatures((prev) => {
    const exists = prev.some((f) => f.id === feature.id);

    if (exists) {
      return prev.filter((f) => f.id !== feature.id);
    }

    return [...prev, feature];
  });
};
const isFeatureSelected = (id) => {
  return selectedFeatures.some((f) => f.id === id);
};

const exportSelectedGeoJSON = () => {
  const selection = selectedFeaturesRef.current;

if (!selection || selection.length === 0) {
  toast("Aucun élément sélectionné à exporter.", {
  icon: "⚠️",
});
  return;
}

const features = selection.map((item) => {
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
        if (Array.isArray(p)) {
          return [p[1], p[0]];
        }

        return [p.lng, p.lat];
      });

      // fermer automatiquement le polygone si nécessaire
      const first = coords[0];
      const last = coords[coords.length - 1];

      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        coords.push(first);
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
  }).filter(Boolean);

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "selection_export.geojson";
  link.click();

  URL.revokeObjectURL(url);
  toast.success(`${features.length} élément(s) exporté(s) en GeoJSON.`);
};

useEffect(() => {
  const handleCompare = (event) => {
    const parcelle = event.detail;

    setCompareParcelles((prev) => {
      const exists = prev.some((p) => p.gid === parcelle.gid);

      if (exists) {
  toast("Cette parcelle est déjà dans le comparateur.", {
    icon: "⚠️",
  });
  return prev;
}

if (prev.length >= 4) {
  toast("Vous pouvez comparer au maximum 4 parcelles.", {
    icon: "⚠️",
  });
  return prev;
}

toast.success("Parcelle ajoutée au comparateur.", {
  id: "parcelle-added-compare",
});

return [...prev, parcelle];
    });
  };

  window.addEventListener("add-parcelle-compare", handleCompare);

  return () => {
    window.removeEventListener("add-parcelle-compare", handleCompare);
  };
}, []);

useEffect(() => {
  const handleOpenSimulator = (event) => {
    setSimulatorParcel(event.detail);
  };

  window.addEventListener("open-investment-simulator", handleOpenSimulator);

  return () => {
    window.removeEventListener("open-investment-simulator", handleOpenSimulator);
  };
}, []);


const selectByRectangle = (rectangleLatLngs, append = false) => {
  if (!rectangleLatLngs || rectangleLatLngs.length < 4) return;

  if (!parcellesData?.features) {
    toast("Les parcelles ne sont pas encore chargées.", {
      icon: "⚠️",
    });
    return;
  }

  const lngs = rectangleLatLngs.map((p) => p[1]);
  const lats = rectangleLatLngs.map((p) => p[0]);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const selectionPolygon = turf.bboxPolygon([
    minLng,
    minLat,
    maxLng,
    maxLat,
  ]);

  const selected = [];

  parcellesData.features.forEach((feature) => {
    try {
      if (!feature.geometry) return;

      const parcelleFeature = turf.feature(
        feature.geometry,
        feature.properties || {}
      );

      const intersects = turf.booleanIntersects(
        selectionPolygon,
        parcelleFeature
      );

      if (intersects) {
        selected.push({
          id: `parcelle-${feature.properties.gid}`,
          type: "parcelle",
          properties: feature.properties,
          geometry: feature.geometry,
        });
      }
    } catch (error) {
      console.warn("Erreur sélection parcelle:", error);
    }
  });

  drawFeatures.forEach((item) => {
    try {
      let geojson = null;

      if (item.type === "point") {
        geojson = turf.point([item.latlng.lng, item.latlng.lat]);
      }

      if (item.type === "line") {
        geojson = turf.lineString(item.latlngs.map((p) => [p.lng, p.lat]));
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

        geojson = turf.polygon([coords]);
      }

      if (geojson && turf.booleanIntersects(selectionPolygon, geojson)) {
        selected.push(item);
      }
    } catch (error) {
      console.warn("Erreur sélection dessin:", error);
    }
  });

  setSelectedFeatures((prev) => {
    if (!append) return selected;

    const merged = [...prev];

    selected.forEach((item) => {
      const exists = merged.some((f) => f.id === item.id);
      if (!exists) merged.push(item);
    });

    return merged;
  });

  if (selected.length === 0) {
    toast("Aucun élément trouvé dans le rectangle de sélection.", {
      icon: "⚠️",
    });
  } else {
    toast.success(`${selected.length} élément(s) sélectionné(s).`);
  }
};






  return (
     <div className="map-wrapper-root">
    <div className="map-wrapper">

      <button
  className="platform-back-btn"
  onClick={handleBackHome}
  title="Retour à l’accueil"
>
  ← Accueil
</button>

      <Toaster
  position="top-right"
  containerStyle={{
    zIndex: 2147483647,
    
  }}
  toastOptions={{
    duration: 3500,
    style: {
      zIndex: 2147483647,
      background: "#111827",
      color: "#ffffff",
      border: "1px solid #374151",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 12px 35px rgba(0,0,0,0.45)",
    },
    success: {
      iconTheme: {
        primary: "#22c55e",
        secondary: "#111827",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#111827",
      },
    },
  }}
/>

      <SearchBar
  onSearchCoordinates={handleSearchCoordinates}
  onSearchTF={handleSearchTF}
/>

{showCoordinateConverter && (
  <CoordinateConverterModal
    onClose={() => setShowCoordinateConverter(false)}
   onShowPoint={(point) => {
  setConvertedPoint(point);
  setSearchPoint(point);
  setShowCoordinateConverter(false);

  toast.success("Point converti affiché sur la carte.");
}}
  />
)}


{showAttributeTable && (
<AttributeTable
  externalLayers={externalLayers}
  selectedFeatures={selectedFeatures}
  filters={filters}
  onZoomFeature={(feature) => {
  setTableZoomFeature({
    ...feature,
    _highlightId: Date.now(),
  });

  setTimeout(() => {
    setTableZoomFeature(null);
  }, 10000);
}}
  onClose={() => setShowAttributeTable(false)}
/>
)}


{simulatorParcel && (
  <InvestmentSimulatorModal
    parcel={simulatorParcel}
    onClose={() => setSimulatorParcel(null)}
  />
)}

{compareParcelles.length > 0 && (
  <div className="compare-panel">
    <div className="compare-header">
      <strong>Comparaison parcelles</strong>
      <button onClick={() => setCompareParcelles([])}>×</button>
    </div>

    <div className="compare-count">
      {compareParcelles.length}/4 parcelle(s) ajoutée(s)
    </div>

    <div className="compare-table">
      <div className="compare-table-row compare-table-head">
        <span>Critère</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>P{p.gid}</span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>TF</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>{p.tf ?? "-"}</span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Surface</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>
            {p.surface ? `${Number(p.surface).toFixed(0)} m²` : "-"}
          </span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Zonage</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>{p.zonage ?? "-"}</span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Secteur</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>{p.secteur ?? "-"}</span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Hauteur</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>{p.hauteur_mx ?? "-"}</span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Score AMC</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>
            {p.score_final_amc ? Number(p.score_final_amc).toFixed(2) : "-"}
          </span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Prix app.</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>
            {p.prix_app_final
              ? `${Number(p.prix_app_final).toFixed(0)} DH/m²`
              : "-"}
          </span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Villa</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>
            {p.pt_v_final
              ? `${Number(p.pt_v_final).toFixed(0)} DH/m²`
              : "-"}
          </span>
        ))}
      </div>

      <div className="compare-table-row">
        <span>Zone immeuble</span>
        {compareParcelles.map((p) => (
          <span key={p.gid}>
            {p.pt_zi_final
              ? `${Number(p.pt_zi_final).toFixed(0)} DH/m²`
              : "-"}
          </span>
        ))}
      </div>
    </div>

    <div className="compare-actions">
      {compareParcelles.map((p) => (
        <button
          key={p.gid}
          onClick={() =>
            setCompareParcelles((prev) =>
              prev.filter((item) => item.gid !== p.gid)
            )
          }
        >
          Retirer P{p.gid}
        </button>
      ))}
    </div>
  </div>
)}

{selectedFeatures.length > 0 && (
  <div className="selection-mini-panel">
    <div className="selection-mini-title">Sélection</div>
    <div className="selection-mini-count">
      {selectedFeatures.length} élément(s)
    </div>
  </div>
)}

{drawMenuOpen && (
  <div className="draw-menu">
   <button
  onClick={() => {
    setDrawMode("point");
    setDrawMenuOpen(false);
  }}
>
  <span>•</span> Point
</button>

    <button onClick={() => {
    setDrawMode("line");
    setDrawMenuOpen(false);
  }}>
      <span>╱</span> Ligne
    </button>

    <button
  onClick={() => {
    setDrawMode("polygon");
    setDrawMenuOpen(false);
  }}
>
  <span>⬠</span> Polygone
</button>

    <button
  onClick={() => {
    setDrawMode("rectangle");
    setDrawMenuOpen(false);
  }}
>
  <span>▭</span> Rectangle
</button>
  </div>
)}

{(searchParcel || searchPoint) && (
  <button
    className="clear-search-btn"
    onClick={() => {
      setSearchParcel(null);
      setSearchPoint(null);
    }}
    title="Effacer la recherche"
  >
    ×
  </button>
)}
      <FilterPanel
        filters={draftFilters}
        setFilters={setDraftFilters}
        applyFilters={() => {
  setFilters(draftFilters);
  toast.success("Filtres appliqués avec succès.");
}}
        resetFilters={() => {
          setDraftFilters(defaultFilters);
          setFilters(defaultFilters);
        }}
        layers={layers}
        setLayers={setLayers}
        basemap={basemap}
        setBasemap={setBasemap}
        externalLayers={externalLayers}
        setExternalLayers={setExternalLayers}
        heatmapField={heatmapField}
        setHeatmapField={setHeatmapField}
        analysisStats={analysisStats}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

<MapContainer
  center={[33.5650, -7.5898]}
  zoom={14}
  maxZoom={22}
  zoomControl={false}
  preferCanvas={true}
  zoomAnimation={false}
  fadeAnimation={false}
  markerZoomAnimation={false}
  style={{ height: "100vh", width: "100%" }}
>
        <DrawPane />
        <MapStatusBar setScaleText={setScaleText}  />
        <MapPanes />

        <ParcelleWmsClickHandler
  disabled={mapToolActive || selectionMode || !layers.parcelles}
  onParcelFound={handleWmsParcelFound}
/>

<SelectionRectangleTool
  selectionMode={selectionMode}
  selectionBoxStart={selectionBoxStart}
  setSelectionBoxStart={setSelectionBoxStart}
  setSelectionBoxPreview={setSelectionBoxPreview}
  selectByRectangle={selectByRectangle}
/>

      

        <AttributeTableZoom feature={tableZoomFeature} />

        {selectionMode && selectionBoxPreview && (
  <Polygon
    pane="drawPane"
    positions={selectionBoxPreview}
    pathOptions={{
      color: "#38bdf8",
      weight: 2,
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
      dashArray: "6, 6",
    }}
  />
)}


        {snapPreview && (
  <CircleMarker
    center={snapPreview}
    radius={9}
    pane="drawPane"
    interactive={false}
    pathOptions={{
      color: "#facc15",
      weight: 3,
      fillColor: "#facc15",
      fillOpacity: 0.45,
    }}
    className="snap-preview-marker"
  />
)}

        <AutoZoomExternalLayer externalLayers={externalLayers} />
        
       <MapToolsControl
  measureMode={measureMode}
  setMeasureMode={setMeasureMode}
  setMeasurePoints={setMeasurePoints}
  setMeasureClosed={setMeasureClosed}
  drawMode={drawMode}
  setDrawMode={setDrawMode}
  setDrawMenuOpen={setDrawMenuOpen}
   setCurrentLinePoints={setCurrentLinePoints}
  setCurrentPolygonPoints={setCurrentPolygonPoints}
  setRectangleStart={setRectangleStart}
setRectanglePreview={setRectanglePreview}
setDrawFeatures={setDrawFeatures}
selectionMode={selectionMode}
setSelectionMode={setSelectionMode}
selectedFeatures={selectedFeatures}
setSelectedFeatures={setSelectedFeatures}
exportSelectedGeoJSON={exportSelectedGeoJSON}
showAttributeTable={showAttributeTable}
setShowAttributeTable={setShowAttributeTable}


 exportMapPdfFn={exportMapPdf}
  layers={layers}
  heatmapField={heatmapField}
  scaleText={scaleText}
/>
        <SearchPointZoom searchPoint={searchPoint} />
        <SearchParcelZoom searchParcel={searchParcel} />
        <SearchParcelHighlight searchParcel={searchParcel} />
       
       
<MeasureTool
  measureMode={measureMode}
  measurePoints={measurePoints}
  setMeasurePoints={setMeasurePoints}
  measureClosed={measureClosed}
  setMeasureClosed={setMeasureClosed}
  hoverStartPoint={hoverStartPoint}
  setHoverStartPoint={setHoverStartPoint}
  snapVertices={allSnapVertices}
  setSnapPreview={setSnapPreview}
/>

<DrawTool
  drawMode={drawMode}
  setDrawFeatures={setDrawFeatures}
  currentLinePoints={currentLinePoints}
  setCurrentLinePoints={setCurrentLinePoints}
  currentPolygonPoints={currentPolygonPoints}
  setCurrentPolygonPoints={setCurrentPolygonPoints}
  setHoverPolygonStart={setHoverPolygonStart}
  skipNextDrawClickRef={skipNextDrawClickRef}
  snapVertices={snapVertices}
  setSnapPreview={setSnapPreview}
  rectangleStart={rectangleStart}
setRectangleStart={setRectangleStart}
rectanglePreview={rectanglePreview}
setRectanglePreview={setRectanglePreview}
/>

{drawMode === "rectangle" && rectanglePreview && (
  <Polygon
    pane="drawPane"
    positions={rectanglePreview}
    pathOptions={{
      color: "#00e5ff",
      weight: 3,
      fillColor: "#00e5ff",
      fillOpacity: 0.12,
      dashArray: "6, 6",
    }}
  />
)}

{drawFeatures
  .filter((f) => f.type === "point")
  .map((point) => (
    <CircleMarker
      key={point.id}
      pane="drawPane"
      center={point.latlng}
      radius={6}
      pathOptions={{
        color: "#ffffff",
        weight: 2,
        fillColor: isFeatureSelected(point.id) ? "#08ffff" : "#facc15",
        fillOpacity: 1,
      }}
      eventHandlers={{
  click: () => {
    if (selectionMode) {
      toggleSelectedFeature(point);
    }
  },
}}
    >
      <Tooltip permanent direction="top">
        Point dessiné
      </Tooltip>
    </CircleMarker>
  ))}

{drawFeatures
  .filter((f) => f.type === "rectangle")
  .map((rectangle) => (
    <Polygon
      key={rectangle.id}
      pane="drawPane"
      positions={rectangle.latlngs}
     pathOptions={{
  color: isFeatureSelected(rectangle.id) ? "#08ffff" : "#facc15",
  weight: isFeatureSelected(rectangle.id) ? 5 : 3,
  fillColor: isFeatureSelected(rectangle.id) ? "#08ffff" : "#facc15",
  fillOpacity: isFeatureSelected(rectangle.id) ? 0.35 : 0.25,
}}
eventHandlers={{
  click: () => {
    if (selectionMode) {
      toggleSelectedFeature(rectangle);
    }
  },
}}
    />
  ))}
  {drawMode === "rectangle" && rectanglePreview && (
  <Polygon
    pane="drawPane"
    positions={rectanglePreview}
    pathOptions={{
      color: "#00e5ff",
      weight: 3,
      fillColor: "#00e5ff",
      fillOpacity: 0.12,
      dashArray: "6, 6",
    }}
  />
)}

  {drawFeatures
  .filter((f) => f.type === "polygon")
  .map((polygon) => (
    <Polygon
      key={polygon.id}
      pane="drawPane"
      positions={polygon.latlngs}
      pathOptions={{
  color: isFeatureSelected(polygon.id) ? "#08ffff" : "#facc15",
  weight: isFeatureSelected(polygon.id) ? 5 : 3,
  fillColor: isFeatureSelected(polygon.id) ? "#08ffff" : "#facc15",
  fillOpacity: isFeatureSelected(polygon.id) ? 0.35 : 0.25,
}}
eventHandlers={{
  click: () => {
    if (selectionMode) {
      toggleSelectedFeature(polygon);
    }
  },
}}
    />
  ))}
  {drawMode === "polygon" && currentPolygonPoints.length > 1 && (
  <Polyline
    pane="drawPane"
    positions={currentPolygonPoints}
    pathOptions={{
      color: "#00e5ff",
      weight: 3,
      opacity: 1,
      dashArray: "6, 6",
    }}
  />
)}

{drawMode === "polygon" && currentPolygonPoints.length > 1 && (
  <Polyline
    pane="drawPane"
    positions={currentPolygonPoints}
    pathOptions={{
      color: "#00e5ff",
      weight: 3,
      opacity: 1,
      dashArray: "6, 6",
    }}
  />
)}

{drawMode === "polygon" &&
  currentPolygonPoints.map((point, index) => {
    const isStart = index === 0;
    const canClose = isStart && currentPolygonPoints.length >= 3;

    return (
      <CircleMarker
        key={index}
        pane="drawPane"
        center={point}
        radius={isStart ? 7 : 5}
        pathOptions={{
          color: "#ffffff",
          weight: 2,
          fillColor:
            canClose && hoverPolygonStart
              ? "#facc15"
              : isStart
              ? "#1a8c78"
              : "#00e5ff",
          fillOpacity: 1,
        }}
        eventHandlers={{
          mouseover: () => {
            if (canClose) setHoverPolygonStart(true);
          },
          mouseout: () => {
            if (canClose) setHoverPolygonStart(false);
          },
          click: (e) => {
  if (!canClose) return;

  e.originalEvent.preventDefault();
  e.originalEvent.stopPropagation();

  skipNextDrawClickRef.current = true;

  setDrawFeatures((prev) => [
              ...prev,
              {
                id: Date.now(),
                type: "polygon",
                latlngs: currentPolygonPoints,
              },
            ]);

            setCurrentPolygonPoints([]);
            setHoverPolygonStart(false);
            setSnapPreview(null);

            // important : on garde drawMode = "polygon"
          },
        }}
      />
    );
  })}


  {drawFeatures
  .filter((f) => f.type === "line")
  .map((line) => (
   <Polyline
  key={line.id}
  pane="drawPane"
  positions={line.latlngs}
  pathOptions={{
    color: isFeatureSelected(line.id) ? "#08ffff" : "#facc15",
    weight: isFeatureSelected(line.id) ? 5 : 3,
    opacity: 1,
  }}
  eventHandlers={{
    click: () => {
      if (selectionMode) {
        toggleSelectedFeature(line);
      }
    },
  }}
/>
  ))}

  {drawMode === "line" && currentLinePoints.length > 1 && (
  <Polyline
  pane="drawPane"
    positions={currentLinePoints}
    pathOptions={{
      color: "#00e5ff",
      weight: 3,
      opacity: 1,
      dashArray: "6, 6",
    }}
  />
)}

        {basemap === "osm" && (
  <TileLayer
    attribution="&copy; OpenStreetMap contributors"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    maxZoom={22}
    crossOrigin="anonymous"
  />
)}

{basemap === "dark" && (
  <TileLayer
    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    maxZoom={22}
    crossOrigin="anonymous"
  />
)}

{basemap === "light" && (
  <TileLayer
    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    maxZoom={22}
    crossOrigin="anonymous"
  />
)}

{basemap === "satellite" && (
  <TileLayer
    attribution="Tiles &copy; Esri"
    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    maxZoom={22}
    crossOrigin="anonymous"
  />
)}

{basemap === "orthophoto" && (
  <WMSTileLayer
    url="http://localhost:8080/geoserver/projetwebmap/wms"
    layers="projetwebmap:orthophoto_fida"
    format="image/jpeg"
    transparent={false}
    version="1.1.0"
    tiled={true}
    maxZoom={22}
    maxNativeZoom={22}
    zIndex={0}
  />
)}

       

       {layers.heatmap && (
  <HeatmapLayer
    heatmapField={heatmapField}
  
  />
)}

{layers.prixCentroid && (
  <PrixCentroidLayer heatmapField={heatmapField} />
)}

        {layers.parcellesContour && (
  <ParcellesContourLayer interactionDisabled={mapToolActive} />
)}
        {/* Ancienne couche GeoJSON Score AMC — conservée en secours */}

        {/*
        {layers.parcelles && (

    <ParcellesLayer
  filters={filters}
  setTotalCount={setTotalCount}
  setFilteredCount={setFilteredCount}
  setAnalysisStats={setAnalysisStats}
  interactionDisabled={mapToolActive && !selectionMode}
  selectionMode={selectionMode}
  toggleSelectedFeature={toggleSelectedFeature}
  isFeatureSelected={isFeatureSelected}
/>
        )}   
*/}

{layers.parcelles && (
  <WMSTileLayer
    key={`score-amc-${parcellesCqlFilter}`}
    pane="scoreWmsPane"
    url="http://localhost:8080/geoserver/projetwebmap/wms"
    layers="projetwebmap:v_parcelles_score_amc_wms"
    styles="parcelles_score_amc"
    format="image/png"
    transparent={true}
    version="1.1.0"
    tiled={true}
    opacity={0.85}
    minZoom={12}
    maxZoom={22}
    maxNativeZoom={22}
    params={{
      CQL_FILTER: parcellesCqlFilter,
    }}
  />
)}


{wmsPopupParcel && (
  <GeoJSON
    key={`highlight-wms-${wmsPopupParcel.properties?.gid}`}
    data={wmsPopupParcel}
    pane="highlightPane"
    interactive={false}
    style={{
      color: "#00e5ff",
      weight: 4,
      fillColor: "#00e5ff",
      fillOpacity: 0.25,
      dashArray: "6, 4",
    }}
  />
)}


{wmsPopupParcel && wmsPopupPosition && (
<Popup
  position={wmsPopupPosition}
  className="geoproexpert-parcelle-popup"
  maxWidth={430}
  minWidth={390}
  closeButton={true}
  autoPan={true}
  keepInView={true}
  autoPanPaddingTopLeft={[40, 120]}
  autoPanPaddingBottomRight={[40, 60]}
  offset={[0, -12]}
  onClose={closeWmsPopup}
>
  <ParcellePopup
    properties={wmsPopupParcel.properties}
    onPdf={handleWmsPdf}
    onCompare={handleWmsCompare}
    onSimulate={handleWmsSimulate}
    onClose={closeWmsPopup}
  />
</Popup>
)}

{layers.voirie && <VoirieLayer onDataLoaded={setVoirieData} />}

        {layers.tram && <TramLayer />}  
        {layers.stationsTram && <StationsTramLayer />}
        {layers.bus && <BusLayer />}
        {layers.gare && <GareLayer />}
        {layers.equipements && <EquipementsLayer />}


      
      {externalLayers
  .filter((layer) => layer.visible)
  .map((layer) => (
    <GeoJSON
      key={layer.id}
      data={layer.data}
      style={{
        color: "#00e5ff",
        weight: 2,
        fillColor: "#00e5ff",
        fillOpacity: 0.25,
      }}
      onEachFeature={(feature, leafletLayer) => {
        leafletLayer.bindPopup(`
          <strong>${layer.name}</strong><br/>
          Couche importée
        `);
      }}
    />
  ))}

  {searchPoint && (
  <Marker position={[searchPoint.lat, searchPoint.lng]}>
    <Popup>
      <strong>Point recherché</strong>
      <br />
      Latitude : {searchPoint.lat}
      <br />
      Longitude : {searchPoint.lng}
      <br />
      <button onClick={() => setSearchPoint(null)}>
        Supprimer le point
      </button>
    </Popup>
  </Marker>
)}

{snapPreview && (
  <CircleMarker
    center={snapPreview}
    radius={8}
    pane="drawPane"
    interactive={false}
    pathOptions={{
      color: "#facc15",
      weight: 3,
      fillColor: "#facc15",
      fillOpacity: 0.35,
    }}
  />
)}

  
      </MapContainer>
      <Legend layers={layers} heatmapField={heatmapField} />
    </div>
     </div>
  );
}

export default MapView;