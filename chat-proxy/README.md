# chat-proxy

Cloudflare Worker behind the portfolio's **Ask my portfolio** chat. It answers only from
`knowledge.md`, keeps all model access server-side and streams the answer to the browser.

```
browser ──POST {messages}──▶ worker ──▶ Workers AI (Llama 3.3 70B, stream)
                               │          └─ or Azure OpenAI (PROVIDER = "azure")
                               └─ CORS check · validation · system prompt · rate limit
```

## What it does

- **Model**: Cloudflare Workers AI through the `AI` binding, default
  `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (change `WORKERS_AI_MODEL`, e.g.
  `@cf/meta/llama-3.1-8b-instruct` to stretch the free allowance). Workers AI's
  `{"response": ...}` stream is converted to OpenAI chat-completions SSE, so the frontend
  works with either provider.
- **CORS**: only origins in `ALLOWED_ORIGIN` (comma-separated) get a response.
- **Validation**: POST only, ≤ 12 messages, ≤ 1000 characters each, user/assistant roles
  only; client-supplied system messages are dropped.
- **System prompt**: built server-side from `knowledge.md`; answers in the third person,
  says "I don't know" instead of guessing, declines unrelated requests.
- **Limits**: 500 output tokens, temperature 0.3, 20 requests per IP per 10 minutes
  (in-memory per isolate; bind `RATE_LIMIT_KV` for a shared limit).

## Cost

The Workers AI free allowance is 10,000 neurons per day. With the knowledge base as the
system prompt, one answer on the 70B model costs roughly 100–200 neurons, so expect around fifty
chats per day for free; the 8B model stretches that several times. When the
allowance runs out the worker returns 503 and the site shows its "email me instead"
message. Check usage under **Workers & Pages → AI → Usage**.

## Deploy from GitHub Actions (recommended)

`.github/workflows/deploy.yml` deploys this worker on every push to `main`, then builds the
site with the worker URL. Add two repository **secrets** (Settings → Secrets and variables
→ Actions):

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | API token from the "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from the Workers & Pages overview |

The account needs a `workers.dev` subdomain (Workers & Pages → Overview, one-time). Without
the secrets the job is skipped and the site builds with the chat offline.

## Deploy by hand

```bash
cd chat-proxy
npx wrangler login
npx wrangler deploy          # prints https://portfolio-chat-proxy.<subdomain>.workers.dev
```

Then set the repository variable `VITE_CHAT_ENDPOINT` to that URL and re-run the Pages
workflow.

## Using Azure OpenAI instead

Set in `wrangler.toml`:

```toml
[vars]
PROVIDER = "azure"
AZURE_OPENAI_ENDPOINT = "https://<resource>.openai.azure.com"
AZURE_OPENAI_DEPLOYMENT = "gpt-4o"
AZURE_OPENAI_API_VERSION = "2024-10-21"
```

and run `npx wrangler secret put AZURE_OPENAI_API_KEY` before deploying.

## Test locally

```bash
npm run test:worker              # from the repo root: plain Node, no Cloudflare account needed
npx wrangler dev                 # in chat-proxy/; Workers AI calls run against your account
curl -N http://localhost:8787 \
  -H 'Origin: http://localhost:5173' -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What has Sanket built with LLM agents?"}]}'
```

## Updating the knowledge base

Edit `knowledge.md` when `src/data/portfolioData.json` changes; the next push to `main`
redeploys the worker.
