import Badge from "../Badge/Badge";

// Maps estimate/invoice status values to Badge variants
const STATUS_MAP = {
  draft: "default",
  sent: "info",
  accepted: "success",
  rejected: "danger",
  paid: "success",
  overdue: "danger",
  pending: "warning",
};

/**
 * StatusBadge — renders a coloured badge for status strings.
 * Falls back to 'default' variant for unknown statuses.
 */
export default function StatusBadge({ status }) {
  const variant = STATUS_MAP[status?.toLowerCase()] ?? "default";
  return <Badge variant={variant}>{status}</Badge>;
}
