export function SakykMark(props) {
  return (
    <svg viewBox="0 0 100 104" fill="none" aria-hidden="true" {...props}>
      <path
        d="M51 1.5a46.5 46.5 0 1 1-20 88.5L8 101a4 4 0 0 1-5-5l10-22A46.5 46.5 0 0 1 51 1.5Z"
        fill="#F4B400"
      />
      <circle cx="51" cy="48" r="33.5" fill="#FFFFFF" />
      <path
        d="M51 13v70M16 48h70M38 26l13 13 13-13M38 70l13-13 13 13M29 35l13 13-13 13M73 35 60 48l13 13"
        stroke="#F4B400"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="sakyk-wordmark">
      sak
      <span className="leaf-letter">
        y
        <svg viewBox="0 0 24 28" aria-hidden="true">
          <path d="M3 25C0 12 8 5 22 2c2 14-4 23-19 23Z" fill="#165C3D" />
        </svg>
      </span>
      k
    </span>
  );
}

export function BrandArt() {
  return (
    <svg
      className="brand-art"
      viewBox="0 0 240 220"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 186c37-45 49 37 92 0s72-24 121-46"
        stroke="#3BA7F0"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <g transform="translate(56 23) rotate(-10 55 55)">
        <SakykMark width="118" height="123" />
      </g>
      <path
        d="m26 51-10-8m22-6-4-13"
        stroke="#F4B400"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M181 109c-8-28 6-42 28-47 5 24-4 41-28 47Z" fill="#165C3D" />
      <path
        d="m181 119 17-40"
        stroke="#165C3D"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M205 26v24m-12-12h24m-20-8 16 16m0-16-16 16"
        stroke="#C94B3C"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
