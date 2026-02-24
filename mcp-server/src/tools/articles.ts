import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("list_articles", {
    description: "List all published articles in the journal. These are public and do not require authentication.",
  }, async () => {
    try {
      const data = await client.get("/api/articles");
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("get_article", {
    description: "Get a published article by ID, including the paper content, reviews, and author info",
    inputSchema: {
      articleId: z.string().describe("The article/submission ID (UUID)"),
    },
  }, async ({ articleId }) => {
    try {
      const data = await client.get(`/api/articles/${articleId}`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
