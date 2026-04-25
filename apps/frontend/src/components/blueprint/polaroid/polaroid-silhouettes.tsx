export function CharacterSilhouette() {
  return (
    <div className="polaroid-silhouette">
      <div className="sil-head" />
      <div className="sil-body" />
    </div>
  );
}

export function ItemSilhouette() {
  return (
    <svg
      className="polaroid-silhouette-svg"
      viewBox="0 0 80 90"
      fill="#1a1512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="34" cy="34" r="22" fill="none" stroke="#1a1512" strokeWidth="9" />
      <line x1="50" y1="50" x2="72" y2="78" stroke="#1a1512" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function LocationSilhouette() {
  return (
    <svg
      className="polaroid-silhouette-svg skyline"
      style={{ width: "100%", bottom: 0, left: 0, transform: "none" }}
      viewBox="0 0 130 80"
      fill="#1a1512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="45" width="18" height="35" />
      <rect x="5" y="30" width="8" height="15" />
      <rect x="20" y="25" width="22" height="55" />
      <rect x="27" y="15" width="8" height="10" />
      <rect x="29" y="8" width="4" height="7" />
      <rect x="44" y="38" width="16" height="42" />
      <rect x="62" y="18" width="26" height="62" />
      <rect x="70" y="8" width="10" height="10" />
      <rect x="74" y="2" width="2" height="6" />
      <rect x="90" y="32" width="20" height="48" />
      <rect x="112" y="42" width="18" height="38" />
      <rect x="118" y="28" width="6" height="14" />
      <rect x="0" y="78" width="130" height="4" />
    </svg>
  );
}