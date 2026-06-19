import { useCallback, useEffect, useMemo, useState } from "react";

import {
  classifyActivityContext,
  createActivityRule,
  deleteActivityRule,
  getActivityInsights,
  getActivityRules,
  getBillingIssues,
  getDaySummary,
  saveDaySummary,
  updateActivityRule,
} from "../../api/activityIntelligence.api";
import {
  createProjectPattern,
  sendProjectDetectionFeedback,
  suggestProjectFromBackend,
} from "../../api/projectDetection.api";
import { emptyRuleForm, normalizeRulePayload } from "./innovationUtils";

function getPatternKeywordFromTitle(windowTitle) {
  return String(windowTitle || "")
    .split(/[\u2014\-:|]/)[0]
    .trim();
}

export function useInnovationPage() {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [rules, setRules] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [classification, setClassification] = useState(null);
  const [patternKeyword, setPatternKeyword] = useState("");
  const [patternWeight, setPatternWeight] = useState(1);
  const [savingPattern, setSavingPattern] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingRule, setSavingRule] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [testAppName, setTestAppName] = useState("Visual Studio Code");
  const [testWindowTitle, setTestWindowTitle] = useState("MADSuite - Visual Studio Code");
  const [ruleForm, setRuleForm] = useState(emptyRuleForm);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [savingSummary, setSavingSummary] = useState(false);

  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    // Met à jour la date au changement de jour (minuit) pour éviter de rester sur une vieille date.
    const msUntilMidnight = (() => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      return next.getTime() - now.getTime();
    })();

    const t = setTimeout(() => {
      setToday(new Date().toISOString().slice(0, 10));
    }, msUntilMidnight);

    return () => clearTimeout(t);
  }, []);

  const refreshRules = useCallback(async () => {
    const rulesData = await getActivityRules();
    setRules(rulesData || []);
  }, []);

  const load = useCallback(async () => {
    // anti-spam double-click / double submit
    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const [insightsData, summaryData, issuesData, rulesData] = await Promise.all([
        getActivityInsights(),
        getDaySummary(today),
        getBillingIssues(),
        getActivityRules(),
      ]);

      setInsights(insightsData || []);
      setSummary(summaryData || null);
      setIssues(issuesData || []);
      setRules(rulesData || []);
    } catch (err) {
      console.error("Erreur chargement Innovation:", err?.response?.data || err?.message || err);
      setErrorMessage("Impossible de charger les donn\u00e9es Innovation pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditRuleById = useCallback(
    (id) => {
      const rule = rules.find((r) => r.id === id);
      if (rule) handleEditRule(rule);
    },
    [rules],
  );

  const handleToggleRuleById = useCallback(
    async (id) => {
      const rule = rules.find((r) => r.id === id);
      if (rule) await handleToggleRule(rule);
    },
    [rules],
  );

  const handleDeleteRuleById = useCallback(
    async (id) => {
      const rule = rules.find((r) => r.id === id);
      if (rule) await handleDeleteRule(rule);
    },
    [rules],
  );

  function updateRuleForm(field, value) {
    setRuleForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetRuleForm() {
    setRuleForm(emptyRuleForm);
    setEditingRuleId(null);
  }

  function handleEditRule(rule) {
    setEditingRuleId(rule.id);
    setRuleForm({
      app_pattern: rule.app_pattern || "",
      title_pattern: rule.title_pattern || "",
      category: rule.category || "D\u00e9veloppement",
      tag: rule.tag || "",
      confidence: rule.confidence ?? 80,
      is_productive: rule.is_productive !== false,
      priority: rule.priority ?? 10,
      active: rule.active !== false,
    });
  }

  async function handleSaveRule(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload = normalizeRulePayload(ruleForm);

    if (!payload.app_pattern || !payload.category) {
      setErrorMessage("App pattern et cat\u00e9gorie sont requis.");
      return;
    }

    setSavingRule(true);

    try {
      const savedRule = editingRuleId ? await updateActivityRule(editingRuleId, payload) : await createActivityRule(payload);

      if (!savedRule) {
        setErrorMessage("Impossible de sauvegarder la r\u00e8gle.");
        return;
      }

      setSuccessMessage(editingRuleId ? "R\u00e8gle mise \u00e0 jour." : "R\u00e8gle cr\u00e9\u00e9e.");
      resetRuleForm();
      await refreshRules();
    } finally {
      setSavingRule(false);
    }
  }

  async function handleToggleRule(rule) {
    setErrorMessage("");
    setSuccessMessage("");

    const updated = await updateActivityRule(rule.id, {
      active: !rule.active,
    });

    if (!updated) {
      setErrorMessage("Impossible de changer l'\u00e9tat de la r\u00e8gle.");
      return;
    }

    setSuccessMessage(rule.active ? "R\u00e8gle d\u00e9sactiv\u00e9e." : "R\u00e8gle activ\u00e9e.");
    await refreshRules();
  }

  async function handleDeleteRule(rule) {
    const confirmed = window.confirm(`Supprimer la r\u00e8gle ${rule.app_pattern}?`);

    if (!confirmed) return;

    const deleted = await deleteActivityRule(rule.id);

    if (!deleted) {
      setErrorMessage("Impossible de supprimer la r\u00e8gle.");
      return;
    }

    setSuccessMessage("R\u00e8gle supprim\u00e9e.");
    await refreshRules();
  }

  async function handleSuggestProject() {
    setErrorMessage("");
    setSuggestion(null);
    setProjectSuggestions([]);

    const data = await suggestProjectFromBackend({
      appName: testAppName,
      windowTitle: testWindowTitle,
    });

    setSuggestion(data?.suggestion || null);
    setProjectSuggestions(Array.isArray(data?.suggestions) ? data.suggestions.slice(0, 5) : []);

    if (data?.suggestion?.nom) {
      setPatternKeyword(getPatternKeywordFromTitle(testWindowTitle));
      setPatternWeight(1);
    }

    if (!data?.suggestion) {
      setErrorMessage("Aucune suggestion trouv\u00e9e pour ce titre de fen\u00eatre.");
    }
  }

  async function handleCreateProjectPatternFromSuggestion() {
    setErrorMessage("");
    setSuccessMessage("");

    if (!suggestion?.id) {
      setErrorMessage("Aucun projet sugg\u00e9r\u00e9.");
      return;
    }

    const keyword = String(patternKeyword || "").trim();
    if (keyword.length < 2) {
      setErrorMessage("Keyword pattern requis (min 2 caract\u00e8res).");
      return;
    }

    setSavingPattern(true);
    try {
      await createProjectPattern({
        projet_id: suggestion.id,
        keyword,
        weight: Number(patternWeight) || 1,
      });

      setSuccessMessage("Pattern projet cr\u00e9\u00e9.");
    } finally {
      setSavingPattern(false);
    }
  }

  async function handleProjectFeedback(feedbackType, project = suggestion) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!project?.id && feedbackType !== "rejected") {
      setErrorMessage("Aucun projet sugg\u00e9r\u00e9.");
      return;
    }

    const saved = await sendProjectDetectionFeedback({
      projet_id: project?.id || null,
      appName: testAppName,
      windowTitle: testWindowTitle,
      feedback_type: feedbackType,
    });

    if (!saved) {
      setErrorMessage("Impossible d'enregistrer le feedback projet.");
      return;
    }

    setSuccessMessage(feedbackType === "rejected" ? "Suggestion refus\u00e9e." : "Suggestion confirm\u00e9e.");
  }

  async function handleSaveSummary(summaryText) {
    setErrorMessage("");
    setSuccessMessage("");
    setSavingSummary(true);

    try {
      const saved = await saveDaySummary(today, summaryText);

      if (!saved) {
        setErrorMessage("Impossible de sauvegarder le r\u00e9sum\u00e9.");
        return;
      }

      setSummary((current) => ({
        ...(current || {}),
        ...saved,
        summary_date: today,
        summary_text: saved.summary_text || summaryText,
        is_edited: true,
      }));
      setSuccessMessage("R\u00e9sum\u00e9 sauvegard\u00e9.");
    } finally {
      setSavingSummary(false);
    }
  }

  async function handleClassifyContext() {
    setErrorMessage("");
    setClassification(null);

    const data = await classifyActivityContext({
      currentActivity: {
        app_name: testAppName,
        window_title: testWindowTitle,
      },
      openWindows: [
        {
          app_name: testAppName,
          window_title: testWindowTitle,
        },
      ],
    });

    if (!data) {
      setErrorMessage("Impossible de classifier ce contexte.");
      return;
    }

    setClassification(data);
  }

  return {
    classification,
    editingRuleId,
    errorMessage,
    handleClassifyContext,
    handleCreateProjectPatternFromSuggestion,
    handleDeleteRule,
    handleEditRule,
    handleProjectFeedback,
    handleSaveRule,
    handleSaveSummary,
    handleSuggestProject,
    handleToggleRule,
    insights,
    issues,
    load,
    loading,
    patternKeyword,
    patternWeight,
    projectSuggestions,
    resetRuleForm,
    ruleForm,
    rules,
    savingPattern,
    savingRule,
    savingSummary,
    setPatternKeyword,
    setPatternWeight,
    setTestAppName,
    setTestWindowTitle,
    successMessage,
    suggestion,
    summary,
    testAppName,
    testWindowTitle,
    updateRuleForm,

    // wrappers par id (évite les closures inline côté liste)
    handleEditRuleById,
    handleToggleRuleById,
    handleDeleteRuleById,
  };
}
