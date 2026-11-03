export const DEFAULT_API_URL = 'https://api.gitguard.com.br/api/v1';

export class GitGuardApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface ClientConfig {
  token: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Texto amigável para os erros que a pessoa consegue resolver sozinha. */
function explain(status: number, apiMessage: string): string {
  if (status === 401) {
    return apiMessage || 'Chave inválida, vencida ou revogada. Gere uma nova no GitGuard (menu MCP) e atualize GITGUARD_TOKEN.';
  }
  if (status === 403) return apiMessage || 'Esta chave não tem permissão para isso.';
  if (status === 404) return apiMessage || 'Não encontrado.';
  if (status === 429) return apiMessage || 'Muitas chamadas seguidas. Espere um minuto e tente de novo.';
  if (status >= 500) return 'O GitGuard está com instabilidade agora. Tente de novo em instantes.';
  return apiMessage || `Erro ${status}.`;
}

/** Cliente fino das rotas /mcp do GitGuard. Só fala com `<base>/mcp/*`. */
export class GitGuardClient {
  private readonly base: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly cfg: ClientConfig) {
    this.base = (cfg.baseUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
    this.fetchImpl = cfg.fetchImpl ?? fetch;
  }

  async request<T = unknown>(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    opts: { query?: Record<string, string | number | undefined>; body?: unknown } = {},
  ): Promise<T> {
    const url = new URL(`${this.base}/mcp/${path.replace(/^\/+/, '')}`);
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.cfg.timeoutMs ?? 30_000);
    try {
      const res = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.cfg.token}`,
          Accept: 'application/json',
          'User-Agent': 'gitguard-mcp/0.1.0',
          ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
        // Nunca seguir redirecionamento com a chave no cabeçalho.
        redirect: 'error',
      });

      const text = await res.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch {
        json = undefined;
      }
      if (!res.ok) {
        const apiMessage = Array.isArray(json?.message) ? json.message.join('; ') : json?.message;
        throw new GitGuardApiError(res.status, explain(res.status, typeof apiMessage === 'string' ? apiMessage : ''));
      }
      return json as T;
    } catch (err) {
      if (err instanceof GitGuardApiError) throw err;
      if ((err as Error)?.name === 'AbortError') {
        throw new GitGuardApiError(0, 'O GitGuard demorou demais para responder.');
      }
      throw new GitGuardApiError(0, 'Não consegui falar com o GitGuard. Confira a internet e GITGUARD_API_URL.');
    } finally {
      clearTimeout(timer);
    }
  }
}
