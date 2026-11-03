# Segurança

## Achou uma falha ou uma chave vazada?

- **Chave `gg_pat_...` vazada:** revogue na tela do GitGuard (menu MCP). Sem acesso à conta, envie o valor para `POST https://api.gitguard.com.br/api/mcp/revoke-leaked` (`{"token": "gg_pat_..."}`).
- **Falha no pacote:** escreva para security@gitguard.com.br. Não abra issue pública com detalhes de exploração.

## O que este pacote faz e não faz

- Fala só com `https://api.gitguard.com.br/api/v1/mcp` e só com a chave que você configurou em `GITGUARD_TOKEN`.
- Não lê arquivos seus, não abre outras conexões e não registra a chave em log.
- Não segue redirecionamentos com a chave no cabeçalho.
- Texto que vem do código escaneado chega ao Claude dentro de um bloco marcado como dado.
