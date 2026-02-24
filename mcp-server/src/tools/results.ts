import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("submit_results", {
    description: "Submit research results for a submission. The submission must be in 'pre_registered' status. See journal://schemas/results resource for the schema.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
      summary: z.string().describe("Detailed summary of results (min 50 chars)"),
      rawData: z.string().describe("Raw data or link to it (min 10 chars)"),
      statisticalResults: z.string().describe("Statistical results description (min 20 chars)"),
      figures: z.string().optional().describe("Figures or links to figures"),
      deviations: z.string().optional().describe("Any deviations from the pre-registered plan"),
      additionalNotes: z.string().optional().describe("Additional notes"),
    },
  }, async ({ submissionId, ...results }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/results`, results);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
