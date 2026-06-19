import api from "./api";

function fallbackValue(error, fallback) {
  console.error("Erreur API projectDetection:", error?.response?.data || error?.message || error);
  return fallback;
}

export async function suggestProjectFromBackend({ appName, windowTitle }) {
  try {
    const res = await api.post("/project-detection/suggest", {
      appName,
      windowTitle,
    });

    return res.data || { suggestion: null, suggestions: [] };
  } catch (err) {
    return fallbackValue(err, { suggestion: null, suggestions: [] });
  }
}

export async function createProjectPattern({ projet_id, keyword, weight = 1 }) {
  try {
    const res = await api.post("/project-detection/patterns", {
      projet_id,
      keyword,
      weight,
    });

    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function sendProjectDetectionFeedback({ activityLogId, projet_id, appName, windowTitle, feedback_type }) {
  try {
    const res = await api.post("/project-detection/feedback", {
      activityLogId,
      projet_id,
      appName,
      windowTitle,
      feedback_type,
    });

    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}
