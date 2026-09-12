export function WindowMark() {
  return (
    <svg viewBox="0 0 48 52" fill="none" aria-hidden="true">
      <path
        d="M6 46V24a18 18 0 0 1 36 0v22Z"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="M24 6v40M6 25h36M4 46h40"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="m9 40 8-8 7 6 7-10 10 12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}
export function TownArt() {
  return (
    <svg
      className="town-art"
      viewBox="0 0 380 265"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="243" cy="84" r="63" fill="#EDCA76" opacity=".6" />
      <path d="M48 225h301" stroke="#CBA585" strokeWidth="2" />
      <path d="M270 220V101h48v119" fill="#F8F1DE" />
      <path d="m263 104 31-34 31 34Z" fill="#B16E55" />
      <path d="M282 70V49h23v21" fill="#ECDABC" />
      <path d="m282 50 12-24 12 24" fill="#679187" />
      <path d="M294 28V17m-5 5h10" stroke="#5B7770" strokeWidth="2" />
      <path d="M98 223V110h84v113" fill="#F8EBD3" />
      <path d="m88 111 51-57 54 57Z" fill="#A7654F" />
      <path d="m102 98 37-41 38 41" stroke="#E0AB86" strokeWidth="2" />
      <path d="M180 222V138h83v84" fill="#E6B18E" />
      <path d="M174 140h96l-19-35h-58Z" fill="#728A76" />
      <path d="M188 126h73M193 113h61" stroke="#98A18A" strokeWidth="2" />
      <path d="M40 224V153h59v71" fill="#D3D9BA" />
      <path d="m33 155 37-42 34 42Z" fill="#689085" />
      {[115, 151].map((x) => (
        <g key={x}>
          <path d={`M${x} 147v-17a7 7 0 0 1 14 0v17Z`} fill="#73958B" />
          <path
            d={`M${x + 7} 124v23M${x} 137h14`}
            stroke="#F7EBD2"
            strokeWidth="2"
          />
          <path d={`M${x} 185v-18a7 7 0 0 1 14 0v18Z`} fill="#73958B" />
          <path
            d={`M${x + 7} 162v23M${x} 175h14`}
            stroke="#F7EBD2"
            strokeWidth="2"
          />
        </g>
      ))}
      <path d="M131 222v-21a10 10 0 0 1 20 0v21" fill="#8B8467" />
      <path d="M204 222v-31a15 15 0 0 1 30 0v31" fill="#658577" />
      <path d="M219 178v44" stroke="#BBD0AB" strokeWidth="2" />
      {[194, 239].map((x) => (
        <g key={x}>
          <path d={`M${x} 167v-16h12v16Z`} fill="#F9E9CC" />
          <path d={`M${x + 6} 151v16`} stroke="#B68C6B" />
        </g>
      ))}
      <path d="M56 184v-19h13v19m9 0v-19h13v19" fill="#F9F0D8" />
      <path
        d="M287 129v-12a7 7 0 0 1 14 0v12m-14 29v-12a7 7 0 0 1 14 0v12"
        fill="#8FA59B"
      />
      <path d="M321 225V171" stroke="#6B7E60" strokeWidth="4" />
      <ellipse cx="322" cy="168" rx="21" ry="35" fill="#849875" />
      <ellipse cx="334" cy="185" rx="16" ry="25" fill="#A4AF83" />
      <path d="M32 224v-37" stroke="#6B7E60" strokeWidth="3" />
      <ellipse cx="31" cy="184" rx="15" ry="25" fill="#97A477" />
      <path
        d="M116 237h149m-114 10h80"
        stroke="#DBB799"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m47 68 6-3 6 3m132-32 6-3 6 3m118 37 6-3 6 3"
        stroke="#AB9075"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M79 222h9v-15h-9m161 15h10v-12h-10" fill="#B5805E" />
      <path
        d="M84 209v-10m-4 3 4 4 5-6m156 10v-12m-4 4 4 4 5-7"
        stroke="#668870"
        strokeWidth="2"
      />
    </svg>
  );
}
