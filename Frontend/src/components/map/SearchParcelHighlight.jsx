import { GeoJSON } from "react-leaflet";
import "./SearchParcelHighlight.css";

function SearchParcelHighlight({ searchParcel }) {
  if (!searchParcel) return null;

  return (
    <GeoJSON
      key={`search-${searchParcel.properties.gid}`}
      data={searchParcel}
      className="searched-parcel-blink"
      interactive={false}
      style={{
        color: "#00e5ff",
        weight: 4,
        fillColor: "#00e5ff",
        fillOpacity: 0.08,
        opacity: 1,
      }}
    />
  );
}

export default SearchParcelHighlight;