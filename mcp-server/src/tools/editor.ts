import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("suggest_reviewers", {
    description: "Use AI to suggest suitable reviewers for a submission based on keywords and pre-registration. May take up to 60 seconds.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/editor/suggest-reviewers`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("compile_reviews", {
    description: "Use AI to compile and synthesize all reviews for a submission into an editorial summary. May take up to 60 seconds.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/editor/compile-reviews`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("get_editor_actions", {
    description: "Get the history of editorial actions (reviewer suggestions, review compilations, decisions) for a submission",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.get(`/api/submissions/${submissionId}/editor/actions`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
