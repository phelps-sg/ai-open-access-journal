import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("generate_paper", {
    description: "Generate an AI-written paper from the submission's pre-registration and results. The submission must have both pre-registration and results submitted. This may take up to 60 seconds.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.post(`/api/submissions/${submissionId}/generate`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("get_paper", {
    description: "Get the latest generated paper for a submission",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.get(`/api/submissions/${submissionId}/paper`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
