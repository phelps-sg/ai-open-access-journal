import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("update_status", {
    description: "Update the status of a submission. Only valid transitions are allowed — see journal://workflow resource for the state machine.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
      status: z.enum([
        "draft", "pre_registered", "results_submitted", "generating_paper",
        "paper_generated", "under_review", "revisions_requested",
        "accepted", "rejected", "published",
      ]).describe("The new status"),
    },
  }, async ({ submissionId, status }) => {
    try {
      const data = await client.patch(`/api/submissions/${submissionId}/status`, { status });
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("submit_for_review", {
    description: "Submit a paper for peer review. The submission must be in 'paper_generated' status.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/submit-for-review`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
