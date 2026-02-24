import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("record_decision", {
    description: "Record an editorial decision on a submission under review. Valid decisions: accepted, rejected, revisions_requested.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
      decision: z.enum(["accepted", "rejected", "revisions_requested"]).describe("The editorial decision"),
    },
  }, async ({ submissionId, decision }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/decision`, { decision });
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
