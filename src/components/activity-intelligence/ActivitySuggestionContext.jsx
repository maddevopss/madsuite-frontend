import { createContext, useContext } from "react";
import { useActivitySuggestions } from "../../hooks/useActivitySuggestions";

const ActivitySuggestionContext = createContext();

export function ActivitySuggestionProvider({ children }) {
  const activitySuggestion = useActivitySuggestions();

  return <ActivitySuggestionContext.Provider value={activitySuggestion}>{children}</ActivitySuggestionContext.Provider>;
}

export function useActivitySuggestionContext() {
  return useContext(ActivitySuggestionContext);
}
