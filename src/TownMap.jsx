import React from "react";

// A small reading stimulus, not a navigation UI. Locations and the starting
// direction are authored data; no correct route or destination is highlighted.
export default function TownMap({ map }) {
  return (
    <figure className="chapter-town-map">
      <svg viewBox="0 0 360 260" role="img" aria-label={map.description}>
        <path d="M 60 130 H 300 M 180 35 V 220" className="town-map-road" />
        {map.locations.map(({ id, label, x, y }) => (
          <g key={id}>
            <circle cx={x} cy={y} r="5" />
            <text
              x={x === 180 ? x + 13 : x}
              y={y - 13}
              textAnchor={x === 180 ? "start" : "middle"}
              lang="lt"
            >
              {label}
            </text>
          </g>
        ))}
        <path
          d="m 174 209 6 -10 6 10 M 180 200 V 225"
          className="town-map-start"
        />
        <text x="180" y="249" textAnchor="middle">
          Start ↑
        </text>
      </svg>
      <figcaption>Start at the arrow, facing the bank.</figcaption>
    </figure>
  );
}
