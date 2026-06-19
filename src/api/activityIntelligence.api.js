import api from "./api";

function fallbackValue(error, fallback) {
  console.error("Erreur API Activity Intelligence:", error?.response?.data || error?.message || error);
  return fallback;
}

export async function getActivityInsights() {
  try {
    const res = await api.get("/activity-intelligence/insights");
    return res.data || [];
  } catch (err) {
    return fallbackValue(err, []);
  }
}

export async function getActivityRules() {
  try {
    const res = await api.get("/activity-intelligence/rules");
    return res.data || [];
  } catch (err) {
    return fallbackValue(err, []);
  }
}

export async function createActivityRule(payload) {
  try {
    const res = await api.post("/activity-intelligence/rules", payload);
    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function updateActivityRule(ruleId, payload) {
  try {
    const res = await api.put(`/activity-intelligence/rules/${ruleId}`, payload);
    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function deleteActivityRule(ruleId) {
  try {
    const res = await api.delete(`/activity-intelligence/rules/${ruleId}`);
    return res.data || { success: true };
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function classifyActivityContext(payload) {
  try {
    const res = await api.post("/activity-intelligence/classify-context", payload);
    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function sendActivityFeedback(payload) {
  try {
    const res = await api.post("/activity-intelligence/feedback", payload);
    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function suggestProject({ appName, windowTitle }) {
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

export async function getDaySummary(date) {
  try {
    const res = await api.get(`/day-summary/${date}`);
    return res.data;
  } catch (err) {
    return fallbackValue(err, {
      summary_date: date,
      total_seconds: 0,
      billable_seconds: 0,
      entries_count: 0,
      projects: [],
      summary_text: `Resume du ${date}\n\nAucune donnee disponible pour le moment.`,
    });
  }
}

export async function saveDaySummary(date, summaryText) {
  try {
    const res = await api.put(`/day-summary/${date}`, {
      summary_text: summaryText,
    });

    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function suggestBillingDescription(timeEntryId) {
  try {
    const res = await api.post("/billing-assistant/suggest-description", {
      timeEntryId,
    });

    return res.data;
  } catch (err) {
    return fallbackValue(err, null);
  }
}

export async function getBillingIssues() {
  try {
    const res = await api.get("/billing-assistant/issues");
    return res.data || [];
  } catch (err) {
    return fallbackValue(err, []);
  }
}
