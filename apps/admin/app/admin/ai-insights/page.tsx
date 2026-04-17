import { AdminPageHeader } from "@/components/admin-page-header";
import { AskEstioAiInsightsDashboard } from "@/components/ask-estio-ai-insights-dashboard";

export default function AdminAiInsightsPage() {
  return (
    <>
      <AdminPageHeader
        title="AI Studio — Ask Estio AI insights"
        description="What visitors ask, how intents split, CTA conversion by intent, out-of-scope themes, and a recent event feed (from AiStudioAskEvent)."
        apiReference="GET /admin/ask-estio-ai/insights"
      />
      <AskEstioAiInsightsDashboard />
    </>
  );
}
