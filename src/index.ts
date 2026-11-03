#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GitGuardClient } from './client';
import { registerTools, SERVER_INSTRUCTIONS } from './tools';

async function main() {
  const token = process.env.GITGUARD_TOKEN?.trim();
  if (!token || !token.startsWith('gg_pat_')) {
    // stderr: o stdout é o canal do protocolo MCP e não pode receber texto solto.
    // Nunca imprime o valor da chave, nem parte dele.
    console.error(
      'GITGUARD_TOKEN ausente ou inválida. Gere uma chave no GitGuard (menu MCP) e rode, por exemplo:\n' +
        '  claude mcp add gitguard -e GITGUARD_TOKEN=gg_pat_... -- npx -y @secopsguardian1/mcp',
    );
    process.exit(1);
  }

  const api = new GitGuardClient({ token, baseUrl: process.env.GITGUARD_API_URL });
  const server = new McpServer({ name: 'gitguard', version: '0.1.0' }, { instructions: SERVER_INSTRUCTIONS });
  registerTools(server, api);

  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error('Falha ao iniciar o GitGuard MCP:', err instanceof Error ? err.message : 'erro desconhecido');
  process.exit(1);
});
