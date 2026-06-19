import { useActivitySuggestionContext } from "./ActivitySuggestionContext";
import "../feedback/activity-suggestion.css";

export default function ActivitySuggestionBadge() {
  const { suggestion } = useActivitySuggestionContext();

  if (!suggestion) return null;

  return <div className="activity-suggestion-badge">💡 Suggestion intelligente</div>;
}
