# @gitguard/mcp

O GitGuard dentro do Claude. Pergunte pelas vulnerabilidades do seu código, mande rodar um scan ou marcar um falso positivo, por conversa.

Disponível nos planos PRO e MAX.

## Como usar

1. No GitGuard, abra o menu **MCP** e crie uma chave. Escolha o que ela pode fazer e a validade. A chave aparece uma vez só.
2. Cole o comando que a tela mostra.

Claude Code:

```bash
claude mcp add gitguard -e GITGUARD_TOKEN=gg_pat_... -- npx -y @gitguard/mcp
```

Claude Desktop (arquivo de configuração):

```json
{
  "mcpServers": {
    "gitguard": {
      "command": "npx",
      "args": ["-y", "@gitguard/mcp"],
      "env": { "GITGUARD_TOKEN": "gg_pat_..." }
    }
  }
}
```

A chave vai sempre em variável de ambiente. Nunca em argumento de comando, em arquivo do projeto ou no GitHub. Esse arquivo do Claude Desktop guarda a chave em texto puro, então não o compartilhe.

## Ferramentas

| Ferramenta | O que faz | Permissão da chave |
| --- | --- | --- |
| `gitguard_whoami` | Conta, plano, permissões e validade da chave | leitura |
| `gitguard_list_repositories` | Repositórios e achados abertos por severidade | leitura |
| `gitguard_get_latest_scan` | Último scan de um repositório | leitura |
| `gitguard_get_scan` | Status, posição na fila e resultado de um scan | leitura |
| `gitguard_list_findings` | Achados com filtros, até 50 por página | leitura |
| `gitguard_get_finding` | Detalhe de um achado | leitura |
| `gitguard_run_scan` | Roda um scan (gasta a cota do plano) | rodar scan |
| `gitguard_set_finding_status` | Marca UM achado por vez | marcar achado |

## Segurança

- A chave só abre as rotas do MCP. Não alcança cobrança, conta, repositórios nem a criação de outras chaves.
- Toda chave vence (7, 30, 60 ou 90 dias) e pode ser revogada ou trocada na tela do GitGuard.
- Texto que vem do código escaneado (caminhos, mensagens, trechos) chega ao Claude dentro de um bloco marcado como **dado**, sem caracteres invisíveis e com tamanho limitado. Trecho de segredo vazado nunca é enviado.
- O pacote não registra a chave em log e não segue redirecionamentos com ela.
- Chave vazou? Revogue na tela do GitGuard. Se não tiver acesso, a API também aceita `POST /api/mcp/revoke-leaked` com o valor da chave.

## Variáveis

| Variável | Para quê |
| --- | --- |
| `GITGUARD_TOKEN` | A chave (`gg_pat_...`). Obrigatória. |
| `GITGUARD_API_URL` | Só para teste. Padrão `https://api.gitguard.com.br/api/v1`. |

## Desenvolvimento

```bash
npm run build --workspace=packages/mcp-server
npm run test  --workspace=packages/mcp-server
```
