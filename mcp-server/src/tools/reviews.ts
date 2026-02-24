import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("list_reviews", {
    description: "List all reviews for a submission's latest paper",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.get(`/api/submissions/${submissionId}/reviews`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("submit_review", {
    description: "Submit a peer review for a submission under review. See journal://schemas/review resource for the review schema.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
      scores: z.object({
        methodology: z.number().min(1).max(10).describe("Methodology score (1-10)"),
        clarity: z.number().min(1).max(10).describe("Clarity score (1-10)"),
        significance: z.number().min(1).max(10).describe("Significance score (1-10)"),
        reproducibility: z.number().min(1).max(10).describe("Reproducibility score (1-10)"),
      }).describe("Review scores"),
      sectionFeedback: z.array(z.object({
        section: z.string().describe("Section name"),
        comment: z.string().describe("Feedback comment"),
      })).describe("Feedback for specific sections (at least one required)"),
      recommendation: z.enum(["accept", "minor_revisions", "major_revisions", "reject"]).describe("Overall recommendation"),
      summary: z.string().describe("Review summary (min 50 chars)"),
    },
  }, async ({ submissionId, ...review }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/reviews`, review);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
