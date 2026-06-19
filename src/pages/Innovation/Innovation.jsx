import InnovationBillingIssues from "./InnovationBillingIssues";
import InnovationContextTester from "./InnovationContextTester";
import InnovationInsights from "./InnovationInsights";
import InnovationRuleManager from "./InnovationRuleManager";
import InnovationSummaryCard from "./InnovationSummaryCard";
import { useInnovationPage } from "./useInnovationPage";

import "../../styles/Innovation.css";

export default function Innovation() {
  const page = useInnovationPage();

  return (
    <div className="innovation-page">
      <header className="innovation-header">
        <div>
          <h1>Innovation IA</h1>
          <p>Intelligence d'activit&eacute;, d&eacute;tection projet, r&eacute;sum&eacute; et facturation.</p>
        </div>

        <button type="button" onClick={page.load} disabled={page.loading}>
          {page.loading ? "Chargement..." : "Rafra\u00eechir"}
        </button>
      </header>

      {page.errorMessage && <p className="innovation-error">{page.errorMessage}</p>}
      {page.successMessage && <p className="innovation-success">{page.successMessage}</p>}

      <section className="innovation-grid">
        <InnovationRuleManager
          rules={page.rules}
          ruleForm={page.ruleForm}
          editingRuleId={page.editingRuleId}
          savingRule={page.savingRule}
          onFieldChange={page.updateRuleForm}
          onSaveRule={page.handleSaveRule}
          onResetRuleForm={page.resetRuleForm}
          onEditRule={page.handleEditRuleById}
          onToggleRule={page.handleToggleRuleById}
          onDeleteRule={page.handleDeleteRuleById}
        />

        <InnovationContextTester
          testAppName={page.testAppName}
          testWindowTitle={page.testWindowTitle}
          suggestion={page.suggestion}
          classification={page.classification}
          patternKeyword={page.patternKeyword}
          patternWeight={page.patternWeight}
          projectSuggestions={page.projectSuggestions}
          savingPattern={page.savingPattern}
          onAppNameChange={page.setTestAppName}
          onWindowTitleChange={page.setTestWindowTitle}
          onClassifyContext={page.handleClassifyContext}
          onSuggestProject={page.handleSuggestProject}
          onProjectFeedback={page.handleProjectFeedback}
          onPatternKeywordChange={page.setPatternKeyword}
          onPatternWeightChange={page.setPatternWeight}
          onCreateProjectPattern={page.handleCreateProjectPatternFromSuggestion}
        />

        <InnovationInsights insights={page.insights} />
        <InnovationSummaryCard summary={page.summary} saving={page.savingSummary} onSave={page.handleSaveSummary} />
        <InnovationBillingIssues issues={page.issues} />
      </section>
    </div>
  );
}
