"use client";

/**
 * Reusable skeleton shimmer components for loading states.
 * Used across groups, people, conversations, and home pages.
 */

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Card-shaped skeleton for groups/subgroups grids */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <Skeleton style={{ height: 150, borderRadius: 12 }} />
          <div style={{ padding: 22 }}>
            <Skeleton style={{ height: 20, width: "70%", marginBottom: 10 }} />
            <Skeleton style={{ height: 14, width: "90%" }} />
            <Skeleton style={{ height: 14, width: "50%", marginTop: 8 }} />
          </div>
        </div>
      ))}
    </>
  );
}

/** Row-shaped skeleton for lists (people, connections, posts) */
export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <Skeleton
            style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ height: 16, width: "45%", marginBottom: 8 }} />
            <Skeleton style={{ height: 12, width: "75%" }} />
          </div>
        </div>
      ))}
    </>
  );
}

/** Home page hero skeleton */
export function HeroSkeleton() {
  return (
    <div className="skeleton-hero">
      <Skeleton style={{ height: 14, width: 180, marginBottom: 12 }} />
      <Skeleton style={{ height: 32, width: "60%", marginBottom: 10 }} />
      <Skeleton style={{ height: 16, width: "80%", marginBottom: 24 }} />
      <Skeleton style={{ height: 48, width: 180, borderRadius: 12 }} />
    </div>
  );
}
