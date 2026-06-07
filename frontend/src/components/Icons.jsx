export function Icon({ name, className = "" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  };

  switch (name) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "recipes":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case "grocery":
      return (
        <svg {...common}>
          <path d="M5 6h2l2.2 9.5a1 1 0 0 0 1 .8h7.6a1 1 0 0 0 1-.8L20 9H9" />
          <circle cx="10" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" />
        </svg>
      );
    case "prep":
      return (
        <svg {...common}>
          <path d="M6 4h12l2 4-8 12L4 8z" />
          <path d="M9 8h6" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7" />
          <path d="M4 4v4h4M12 8v5l3 2" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="19" height="19" rx="6" fill="currentColor" stroke="none" />
          <path d="M8 12.5c3.4-5 7.9-5.5 8.8-5.5-.1.9-.7 5.4-5.6 8.7M8.2 12.2c1.4.1 3 .8 4.8 2.7" stroke="#fff" />
        </svg>
      );
    case "progress":
      return (
        <svg {...common}>
          <path d="M4 16l5-5 3 3 6-7" />
          <path d="M14 7h4v4" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5h.01" />
        </svg>
      );
    case "print":
      return (
        <svg {...common}>
          <path d="M7 8V4h10v4M7 16h10v4H7z" />
          <rect x="4" y="9" width="16" height="8" rx="2" />
        </svg>
      );
    default:
      return null;
  }
}
