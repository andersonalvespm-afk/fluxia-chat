# Fluxia Chat 💬

Um chat moderno construído com **Next.js 14** (App Router), **JavaScript** e **Supabase**.

## ✨ Recursos

- Interface de chat moderna e responsiva
- Envio com **Enter** (Shift+Enter para nova linha)
- Timestamps formatados em pt-BR
- Auto-scroll das mensagens
- Indicador de "digitando"
- Tema escuro com gradientes
- API route própria (`/api/chat`) com persistência no **Supabase**

## 🚀 Pré-requisitos

- **Node.js** 18.17 ou superior ([download](https://nodejs.org/))
- Uma conta no **Supabase** ([supabase.com](https://supabase.com/))

## ⚙️ Configuração

### 1. Variáveis de ambiente

Copie o `.env.example` para `.env` e preencha:

```powershell
Copy-Item .env.example .env
```

| Variável                        | Descrição                                 |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do seu projeto Supabase               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) — usada no navegador |
| `SUPABASE_SERVICE_ROLE_KEY`     | Chave secreta — **somente no servidor**   |
| `DATABASE_NAME`                 | Nome do banco de dados                    |
| `DATABASE_PASSWORD`             | Senha do banco de dados                   |

> ⚠️ **Nunca comite o `.env`.** Ele já está no `.gitignore`.
> 🔐 Se as chaves vazarem, rotacione-as em *Settings → API → Rotate*.

### 2. Banco de dados

Você tem duas opções:

**Opção A — automática (recomendada):**

```powershell
npm run db:setup
```

Isso conecta ao seu Supabase e cria a tabela `messages` + políticas de segurança.

**Opção B — manual:** no painel do Supabase, abra o **SQL Editor** e execute o
conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).

## 📦 Instalação e execução

```powershell
npm install
npm run dev
```

Depois abra: http://localhost:3000

## 🛠️ Scripts

| Script            | Descrição                      |
| ----------------- | ------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento    |
| `npm run build`   | Build de produção              |
| `npm start`       | Executa o build de produção    |
| `npm run lint`    | Verifica o código com ESLint   |
| `npm run db:setup`| Cria a tabela `messages` no Supabase |

## 📁 Estrutura

```
Fluxia Chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.js    # API do chat (POST /api/chat)
│   │   ├── layout.js           # Layout raiz
│   │   ├── page.js             # Página inicial
│   │   └── globals.css         # Estilos globais
│   ├── components/
│   │   └── Chat.js             # Componente do chat
│   └── lib/
│       ├── supabase.js         # Cliente Supabase (navegador / anon)
│       └── supabaseAdmin.js    # Cliente Supabase (servidor / service_role)
├── supabase/
│   └── schema.sql              # Schema do banco
├── scripts/
│   └── setup-db.mjs            # Cria a tabela no Supabase (npm run db:setup)
├── .env.example
├── jsconfig.json
├── next.config.mjs
├── package.json
└── .eslintrc.json
```

## 🔌 Integração com IA

A API `/api/chat` funciona em **dois modos**, escolhidos automaticamente:

1. **Modo local (padrão)** — respostas rule-based, sem custo nem chave extra.
   Funciona imediatamente após a instalação.
2. **Modo IA (OpenAI)** — ativado quando existe `OPENAI_API_KEY` no `.env`.
   Usa o modelo definido em `OPENAI_MODEL` (padrão: `gpt-4o-mini`).

Para ativar a IA real, descomente no `.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Se a chamada à OpenAI falhar, a API cai automaticamente no modo local — o chat
nunca fica sem resposta. A resposta indica a origem no campo `source`
(`"openai"` ou `"local"`).

> 💡 Quer usar Gemini/Claude/outro provedor? Basta trocar a função
> `generateAIReply` em `src/app/api/chat/route.js`.

## 🔒 Notas de segurança

- A `SUPABASE_SERVICE_ROLE_KEY` **só** é importada em `src/lib/supabaseAdmin.js`,
  que por sua vez só é usado dentro da API route (servidor). Nunca a exponha no cliente.
- A linha 14.x do Next.js possui avisos de segurança conhecidos. Para produção
  com requisitos rígidos, considere migrar para o Next.js 15/16.
