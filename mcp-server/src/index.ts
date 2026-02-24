#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JournalApiClient } from "./client.js";

import { register as registerSubmissions } from "./tools/submissions.js";
import { register as registerResults } from "./tools/results.js";
import { register as registerPapers } from "./tools/papers.js";
import { register as registerWorkflow } from "./tools/workflow.js";
import { register as registerReviews } from "./tools/reviews.js";
import { register as registerDecisions } from "./tools/decisions.js";
import { register as registerEditor } from "./tools/editor.js";
import { register as registerArticles } from "./tools/articles.js";
import { register as registerResources } from "./resources/index.js";

const server = new McpServer({
  name: "ai-journal",
  version: "0.1.0",
});

const client = new JournalApiClient();

// Register all tool groups
registerSubmissions(server, client);
registerResults(server, client);
registerPapers(server, client);
registerWorkflow(server, client);
registerReviews(server, client);
registerDecisions(server, client);
registerEditor(server, client);
registerArticles(server, client);

// Register resources
registerResources(server);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ai-journal MCP server running on stdio");
