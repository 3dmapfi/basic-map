import React, { useState, useRef } from "react";
import Map from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapBoxExample.css";

// Utility: Mapbox feature type
interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
}

function MapboxExample() {
  // State
  const [viewState, setViewState] = useState({
    longitude: -0.126326,
    latitude: 51.533582,
    zoom: 15,
    pitch: 42,
    bearing: -50,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  // Hide mapbox controls
  React.useLayoutEffect(() => {
    const els = document.querySelectorAll(
      ".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right"
    );
    els.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });
  }, []);

  // Geocode search
  const geocode = async (query: string, opts = "") => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=pk.eyJ1IjoiZG9hbm5jMjIxMiIsImEiOiJjbDNvcnhtemgwb2lqM2RveW56YmRhNDRuIn0.hj3nDdcv-dxSvVJ5QDtdgg${opts}`;
    const resp = await fetch(url);
    return resp.json();
  };

  // Handle search submit
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    const data = await geocode(input);
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      setViewState((vs) => ({
        ...vs,
        longitude,
        latitude,
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    } else {
      alert("Place not found");
    }
  };

  // Handle input change (autocomplete)
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const data = await geocode(value, "&autocomplete=true&limit=5");
    if (data.features) {
      setSuggestions(data.features);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (feature: MapboxFeature) => {
    setInput(feature.place_name);
    setShowSuggestions(false);
    const [longitude, latitude] = feature.center;
    setViewState((vs) => ({
      ...vs,
      longitude,
      latitude,
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Search bar in top left corner */}
      <form
        onSubmit={handleSearch}
        className="search-form search-form-top-left"
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Search for an address..."
            className="search-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  aria-selected="false"
                  onMouseDown={() => handleSuggestionClick(feature)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleSuggestionClick(feature);
                  }}
                  className="suggestion-item"
                >
                  <span style={{ color: "#0984e3" }}>●</span>{" "}
                  {feature.place_name}
                </button>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="search-button">
          Go
        </button>
      </form>
      {/* Logo in bottom right corner */}
      <img
        src="/logo.svg"
        alt="Logo"
        className="logo-corner logo-bottom-right"
      />
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiZG9hbm5jMjIxMiIsImEiOiJjbDNvcnhtemgwb2lqM2RveW56YmRhNDRuIn0.hj3nDdcv-dxSvVJ5QDtdgg"
        initialViewState={viewState}
        viewState={viewState}
        onMove={(evt) =>
          setViewState({
            ...evt.viewState,
            width: window.innerWidth,
            height: window.innerHeight,
            padding: {
              top: evt.viewState.padding?.top ?? 0,
              bottom: evt.viewState.padding?.bottom ?? 0,
              left: evt.viewState.padding?.left ?? 0,
              right: evt.viewState.padding?.right ?? 0,
            },
          })
        }
        onLoad={() => {
          const els = document.querySelectorAll(
            ".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right"
          );
          els.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/standard"
      />
    </div>
  );
}

export default MapboxExample;
