export const emptyRuleForm = {
  app_pattern: "",
  title_pattern: "",
  category: "Développement",
  tag: "dev",
  confidence: 80,
  is_productive: true,
  priority: 10,
  active: true,
};

export function normalizeRulePayload(form) {
  return {
    app_pattern: form.app_pattern.trim(),
    title_pattern: form.title_pattern?.trim() || null,
    category: form.category.trim(),
    tag: form.tag?.trim() || null,
    confidence: Number(form.confidence),
    is_productive: Boolean(form.is_productive),
    priority: Number(form.priority),
    active: Boolean(form.active),
  };
}

export function formatMinutes(seconds) {
  return Math.round((Number(seconds) || 0) / 60);
}
