/**
 * Logo component for GenSlides
 * Design: Stylized slide/presentation icon with the app name
 */

export function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Stylized presentation slides */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background slide (back) */}
        <rect
          x="6"
          y="8"
          width="20"
          height="14"
          rx="1"
          fill="var(--md-sky)"
          stroke="var(--md-graphite)"
          strokeWidth="2"
        />
        {/* Foreground slide (front) with offset */}
        <rect
          x="8"
          y="10"
          width="20"
          height="14"
          rx="1"
          fill="var(--md-sunbeam)"
          stroke="var(--md-graphite)"
          strokeWidth="2"
        />
        {/* Content lines on front slide */}
        <line
          x1="12"
          y1="14"
          x2="24"
          y2="14"
          stroke="var(--md-graphite)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="18"
          x2="20"
          y2="18"
          stroke="var(--md-graphite)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* App Name */}
      <span className="text-sm font-bold uppercase tracking-wider text-[var(--md-ink)]">
        GenSlides
      </span>
    </div>
  );
}
