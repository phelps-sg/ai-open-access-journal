import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JournalApiClient, toolResult, toolError } from "../client.js";

export function register(server: McpServer, client: JournalApiClient) {
  server.registerTool("list_submissions", {
    description: "List all submissions for the authenticated user",
  }, async () => {
    try {
      const data = await client.get("/api/submissions");
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("create_submission", {
    description: "Create a new submission with a title and study type",
    inputSchema: {
      title: z.string().describe("Title of the submission"),
      studyType: z.enum(["empirical", "simulation", "replication", "negative_results"]).describe("Type of study"),
    },
  }, async ({ title, studyType }) => {
    try {
      const data = await client.post("/api/submissions", { title, studyType });
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("get_submission", {
    description: "Get a submission by ID",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.get(`/api/submissions/${submissionId}`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("update_submission", {
    description: "Update a submission's title, pre-registration data, or keywords. Read the journal://schemas/pre-registration resource for the pre-registration schema.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
      title: z.string().optional().describe("New title"),
      preRegistration: z.record(z.string(), z.unknown()).optional().describe("Pre-registration data (see journal://schemas/pre-registration resource for schema)"),
      keywords: z.array(z.string()).optional().describe("Keywords for the submission"),
    },
  }, async ({ submissionId, ...updates }) => {
    try {
      const body: Record<string, unknown> = {};
      if (updates.title !== undefined) body.title = updates.title;
      if (updates.preRegistration !== undefined) body.preRegistration = updates.preRegistration;
      if (updates.keywords !== undefined) body.keywords = updates.keywords;
      const data = await client.patch(`/api/submissions/${submissionId}`, body);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });

  server.registerTool("delete_submission", {
    description: "Delete a draft submission. Only submissions in 'draft' status can be deleted.",
    inputSchema: {
      submissionId: z.string().describe("The submission ID (UUID)"),
    },
  }, async ({ submissionId }) => {
    try {
      const data = await client.delete(`/api/submissions/${submissionId}`);
      return toolResult(data);
    } catch (error) {
      return toolError(error);
    }
  });
}
