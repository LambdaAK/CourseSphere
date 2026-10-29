# CourseSphere — análise de segurança (AppSec) e confiabilidade (SRE)

Fork de [`LambdaAK/CourseSphere`](https://github.com/LambdaAK/CourseSphere) (chatbot que recomenda cursos) usado no **Desafio Técnico AppSec & SRE**. Este repositório contém o código original **mais** as correções, o hardening, a observabilidade, os containers e o relatório.

- Relatório completo: [`SECURITY_REPORT.md`](SECURITY_REPORT.md)
- Evidências (SAST/SCA): [`docs/evidence/`](docs/evidence/)
- Versão vulnerável × corrigida: tags `vulneravel` e `corrigido` (ver "Como reproduzir os achados")

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python, Flask, Gunicorn, Flask-CORS, Flask-Limiter, prometheus-client |
| Frontend | React + TypeScript + Vite |
| Dados / autenticação | Firebase Auth e Realtime Database (Admin SDK no backend) |
| Chatbot | OpenAI (hoje isolado atrás de função preguiçosa) |
| Infra | Docker, Docker Compose, Nginx (balanceador) |

> O desafio sugere Rails; este repositório usa Flask/React, que o enunciado permite desde que haja autenticação, CRUD e consumo de API. Aqui o CRUD é de **perfil de usuário e chats**; o módulo de cursos (`backend/blueprints/courses.py`) **não está registrado** na aplicação (ver achado V7 do relatório).

## Estrutura

```
backend/            API Flask (endpoints.py, firebase.py, observability.py, tests/)
frontend/           SPA React (Dockerfile, nginx.conf)
deploy/nginx/       nginx.conf do balanceador
docker-compose.yml  Nginx + 2 backends + frontend
firebase.json, database.rules.json   emulador do Firebase e regras do banco
.github/workflows/ci.yml             testes + SAST/SCA a cada push
docs/evidence/      saídas do Bandit, pip-audit e npm audit
```

## Pré-requisitos

Git, Python 3.12+, Node 22, Docker (Compose v2) e Java 11+ (só para o emulador do Firebase).

## 1. Rodar os testes (não precisa de Firebase nem de Docker)

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt pytest
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q
```
Esperado: `23 passed`. Os testes usam `monkeypatch` para as chamadas ao Firebase.

## 2. Subir tudo com Docker

```powershell
docker compose up --build -d
docker compose ps          # backend1 e backend2 devem ficar "healthy"
```
- API (via Nginx): http://localhost:8080 · frontend: http://localhost:5173
- **Demonstrar o balanceamento:**
  ```powershell
  1..10 | ForEach-Object { curl.exe -s -o NUL http://localhost:8080/health }
  docker compose logs nginx --tail 12
  ```
  Cada linha traz `upstream=<ip>:5000`; os IPs devem **alternar entre as duas instâncias**.
- Encerrar: `docker compose down`.

> O compose **não inclui o emulador do Firebase**: `/health` e o balanceamento funcionam, mas rotas que dependem do Firebase respondem `500 {"error":"Internal server error"}`. Para o fluxo completo, use o modo local abaixo. O frontend em container, ao fazer login, usa o projeto Firebase definido em `frontend/src/firebaseConfig.ts` (o original, de terceiros) — **não use credenciais reais para testar**.

## 3. Modo local completo (backend + emulador do Firebase)

Terminal 1 — emulador (Auth em 9099, Database em 9000, UI em http://127.0.0.1:4000):
```powershell
npx --yes firebase-tools@latest emulators:start --project demo-coursesphere
```
Terminal 2 — backend:
```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"
$env:FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000"
$env:GCLOUD_PROJECT = "demo-coursesphere"
.\backend\.venv\Scripts\python.exe backend\endpoints.py
```
Criar um usuário e consultar o perfil (token **no header**):
```powershell
curl.exe -s -X POST http://127.0.0.1:5000/users/create -H "Content-Type: application/json" --data-binary '{\"email\":\"teste@exemplo.com\",\"password\":\"Senha-forte-123\"}'
$login = curl.exe -s -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake" -H "Content-Type: application/json" --data-binary '{\"email\":\"teste@exemplo.com\",\"password\":\"Senha-forte-123\",\"returnSecureToken\":true}' | ConvertFrom-Json
curl.exe -s -i http://127.0.0.1:5000/users/info -H "Authorization: Bearer $($login.idToken)"
```

### Variáveis de ambiente do backend

| Variável | Padrão | Função |
|---|---|---|
| `FIREBASE_AUTH_EMULATOR_HOST`, `FIREBASE_DATABASE_EMULATOR_HOST` | — | Ativam o modo emulador (sem credenciais) |
| `GOOGLE_APPLICATION_CREDENTIALS` | `./credentials.json` | Chave de serviço do Firebase (produção; **nunca commitar**) |
| `FIREBASE_DATABASE_URL` | URL do projeto original | Banco de produção |
| `OPENAI_API_KEY` | — | Chave da OpenAI (alternativa: `config.json`) |
| `FLASK_DEBUG` | desligado | `1` liga o depurador (**só em desenvolvimento**) |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origens do frontend permitidas |
| `TRUST_PROXY` | `0` | `1` só atrás de proxy confiável (confia em `X-Forwarded-*`) |
| `RATELIMIT_STORAGE_URI` | `memory://` | Backend do rate limit (use Redis com várias instâncias) |
| `LOG_LEVEL` | `INFO` | Nível dos logs JSON |

## 4. Como reproduzir os achados

A forma mais simples e repetível é comparar a versão vulnerável com a corrigida pelos **testes de regressão**:

```powershell
git checkout vulneravel
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q     # esperado: 8 failed, 1 passed
git checkout corrigido
.\backend\.venv\Scripts\python.exe -m pytest backend\tests -q     # esperado: 23 passed
```
Os passos manuais de cada achado (V1–V9), com a saída esperada antes e depois, estão no [`SECURITY_REPORT.md`](SECURITY_REPORT.md). Para voltar à versão de trabalho: `git checkout appsec/baseline`.

## 5. Ferramentas de segurança

```powershell
# SAST — Bandit (backend)
.\backend\.venv\Scripts\python.exe -m pip install bandit pip-audit
.\backend\.venv\Scripts\python.exe -m bandit -r backend -x backend\.venv,backend\tests,backend\cornell-course-sphere-data
# SCA — backend
.\backend\.venv\Scripts\python.exe -m pip_audit -r backend\requirements.txt
# SCA — frontend
cd frontend; npm audit --omit=dev; cd ..
```
O mesmo roda no CI (`.github/workflows/ci.yml`) e anexa os relatórios como artefatos. **O CI só foi escrito localmente; ele ainda não foi executado no GitHub.**

## 6. Observabilidade

- **Logs JSON** em stdout: `docker compose logs backend1 --tail 5`. Campos: `ts`, `level`, `request_id`, `method`, `path`, `endpoint`, `status`, `duration_ms`; eventos `auth_failed`, `user_created`, `rate_limited`. Nunca registram query string, senha ou token.
- **`X-Request-ID`:** gerado pelo Nginx, propagado ao backend e devolvido ao cliente; o mesmo ID aparece nos dois logs.
- **`GET /health`:** liveness.
- **`GET /metrics`** (Prometheus): **interno** — o Nginx devolve 404 ao público. Para ver as métricas:
  ```powershell
  docker compose exec backend1 python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:5000/metrics').read().decode()[:1500])"
  ```
- SLIs/SLOs e o desenho do dashboard: seção 8 do relatório.

## 7. Decisões e limitações conhecidas

- **1 worker × 4 threads por instância**: o rate limit em memória fica coerente por instância, mas o limite efetivo é multiplicado pelo número de instâncias (solução: Redis).
- **`TRUST_PROXY=1`** só é seguro porque os backends **não publicam portas**; sem proxy, o cliente poderia forjar o IP.
- **Sem TLS**: HSTS só é enviado quando a conexão é HTTPS.
- O script `npm run build` do frontend **já falhava** (15 erros de TypeScript pré-existentes); as imagens usam `vite build`.
- Achados **abertos**: política de senha (V5), segredo do Reddit no repositório (V6), SQL injection latente (V7) e regras do banco não verificáveis (V12).
- O desafio cita "bloqueio após login malsucedido": o login **não passa pelo backend** (é feito direto no Firebase), então o controle de força bruta nele é do Firebase e não foi testado.

## Status de validação

| Item | Estado |
|---|---|
| Testes automatizados do backend | Executados no Windows (Python 3.14) pelo autor |
| Backend + Nginx + 2 instâncias (compose) | Subiu com os dois backends `healthy` (Docker 27.2.0) |
| Distribuição entre instâncias | ⚠️ PREENCHER (colar o log do passo 2) |
| Imagem do frontend | ⚠️ PREENCHER (`docker compose ps` mostrando `frontend` saudável) |
| CI no GitHub Actions | Não executado |
| Fluxo ponta a ponta no navegador | Não realizado |
