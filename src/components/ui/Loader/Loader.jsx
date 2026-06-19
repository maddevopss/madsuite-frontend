import "./loader.css";

function SkeletonLine({ className = "" }) {
  return <span className={`ui-skeleton-line ${className}`} aria-hidden="true" />;
}

function DashboardSkeleton() {
  return (
    <div className="ui-loader-skeleton ui-loader-skeleton--dashboard" aria-hidden="true">
      <div className="ui-skeleton-metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="ui-skeleton-card ui-skeleton-card--metric" key={index}>
            <SkeletonLine className="ui-skeleton-line--short" />
            <SkeletonLine className="ui-skeleton-line--value" />
            <SkeletonLine className="ui-skeleton-line--medium" />
          </div>
        ))}
      </div>

      <div className="ui-skeleton-card ui-skeleton-card--wide">
        <SkeletonLine className="ui-skeleton-line--medium" />
        <SkeletonLine className="ui-skeleton-line--title" />
        <SkeletonLine className="ui-skeleton-line--short" />
      </div>

      <div className="ui-skeleton-grid-two">
        <div className="ui-skeleton-card ui-skeleton-card--panel">
          <SkeletonLine className="ui-skeleton-line--medium" />
          <SkeletonLine />
          <SkeletonLine className="ui-skeleton-line--wide" />
          <SkeletonLine className="ui-skeleton-line--medium" />
        </div>
        <div className="ui-skeleton-card ui-skeleton-card--panel">
          <SkeletonLine className="ui-skeleton-line--medium" />
          <span className="ui-skeleton-chart" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 4 }) {
  return (
    <div className="ui-loader-skeleton ui-loader-skeleton--table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="ui-skeleton-row" key={rowIndex}>
          <SkeletonLine className="ui-skeleton-line--dot" />
          <SkeletonLine className="ui-skeleton-line--short" />
          <SkeletonLine className="ui-skeleton-line--wide" />
          <SkeletonLine className="ui-skeleton-line--medium" />
          <SkeletonLine className="ui-skeleton-line--short" />
          <SkeletonLine className="ui-skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="ui-loader-skeleton" aria-hidden="true">
      <div className="ui-skeleton-card ui-skeleton-card--panel">
        <SkeletonLine className="ui-skeleton-line--medium" />
        <SkeletonLine />
        <SkeletonLine className="ui-skeleton-line--wide" />
      </div>
    </div>
  );
}

export default function Loader({ label, text, variant = "default", rows }) {
  const loadingText = label || text || "Chargement...";

  const skeleton = {
    dashboard: <DashboardSkeleton />,
    table: <TableSkeleton rows={rows} />,
    default: <DefaultSkeleton />,
  }[variant] || <DefaultSkeleton />;

  return (
    <div className={`ui-loader ui-loader--${variant}`} role="status" aria-live="polite">
      <span className="ui-loader-label">{loadingText}</span>
      {skeleton}
    </div>
  );
}
