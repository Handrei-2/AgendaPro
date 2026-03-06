# 📋 SaaS de Agendamento — Documentação Completa

## 🏗 Arquitetura Geral

```
Cliente (Next.js) → API Routes (Next.js/Node) → Prisma ORM → PostgreSQL
                          ↓
                    Middleware JWT
                    (verifica token + extrai companyId)
```

## 📁 Estrutura de Pastas

```
saas-agendamento/
├── prisma/
│   └── schema.prisma          ← Todos os modelos do banco
├── src/
│   ├── app/
│   │   ├── (auth)/login/      ← Página de login
│   │   ├── (auth)/register/   ← Cadastro de empresa
│   │   ├── (dashboard)/       ← Painel admin (protegido)
│   │   │   ├── page.tsx       ← Dashboard
│   │   │   ├── agenda/        ← Agenda do dia
│   │   │   ├── barbeiros/     ← CRUD de barbeiros
│   │   │   ├── servicos/      ← CRUD de serviços
│   │   │   └── configuracoes/ ← Config da empresa
│   │   ├── book/[slug]/       ← Página pública de agendamento
│   │   └── api/               ← Rotas da API
│   │       ├── auth/register/ ← POST: Criar conta
│   │       ├── auth/login/    ← POST: Autenticar
│   │       ├── barbers/       ← CRUD de barbeiros
│   │       ├── services/      ← CRUD de serviços
│   │       ├── appointments/  ← CRUD de agendamentos
│   │       ├── availability/  ← GET: Horários disponíveis
│   │       └── customers/     ← CRUD de clientes
│   ├── lib/
│   │   ├── prisma.ts          ← Singleton do Prisma
│   │   ├── auth.ts            ← JWT helpers
│   │   └── validations.ts     ← Schemas Zod
│   └── components/
│       ├── ui/                ← Button, Input, Modal, etc.
│       ├── dashboard/         ← AppointmentCard, StatsCard...
│       └── booking/           ← Wizard de agendamento público
```

## 🗄 Banco de Dados — Diagrama de Relacionamentos

```
Company (1) ──────── (N) User
Company (1) ──────── (N) Barber
Company (1) ──────── (N) Service
Company (1) ──────── (N) Customer
Company (1) ──────── (N) Appointment

Barber  (N) ──────── (N) Service    [via BarberService]
Appointment → Barber, Service, Customer
```

### Multi-tenancy
> Toda tabela tem `companyId`. O middleware extrai o `companyId` do JWT e todas as queries usam `WHERE companyId = :id` — dados completamente isolados por empresa.

## 🔐 Autenticação — Fluxo JWT

```
1. POST /api/auth/register
   → Cria Company + User
   → Retorna JWT com { userId, companyId, role }

2. POST /api/auth/login
   → Verifica credenciais
   → Retorna JWT

3. Todas as rotas protegidas:
   Authorization: Bearer <token>
   → Middleware extrai companyId do token
   → Queries sempre filtram por companyId
```

## 🛣 Rotas da API

| Método | Rota                        | Descrição                         |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/auth/register          | Criar conta (empresa + admin)     |
| POST   | /api/auth/login             | Login                             |
| GET    | /api/barbers                | Listar barbeiros da empresa       |
| POST   | /api/barbers                | Criar barbeiro                    |
| PUT    | /api/barbers/[id]           | Editar barbeiro                   |
| DELETE | /api/barbers/[id]           | Desativar barbeiro (soft delete)  |
| GET    | /api/services               | Listar serviços                   |
| POST   | /api/services               | Criar serviço                     |
| GET    | /api/appointments           | Listar agendamentos (+ filtros)   |
| POST   | /api/appointments           | Criar agendamento                 |
| PATCH  | /api/appointments/[id]      | Atualizar status                  |
| GET    | /api/availability           | Horários disponíveis              |
| GET    | /api/customers              | Listar clientes                   |
| GET    | /api/companies/me           | Dados da empresa logada           |
| PATCH  | /api/companies/me           | Editar empresa                    |

## ⚡ Lógica de Disponibilidade

```
GET /api/availability?barberId=xxx&serviceId=xxx&date=2024-01-15

1. Busca horário de trabalho do barbeiro (workingHours.mon/tue/...)
2. Gera slots de 30 em 30 minutos entre abertura e fechamento
3. Para cada slot: verifica se (slot + duração) colide com agendamento existente
4. Retorna array de slots livres em ISO 8601
```

## 🧪 Como Rodar

```bash
# Instalar dependências
npm install

# Configurar .env
DATABASE_URL="postgresql://user:pass@localhost:5432/saas_agendamento"
JWT_SECRET="seu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Rodar migrations
npx prisma migrate dev

# Popular banco (seed)
npx prisma db seed

# Iniciar dev
npm run dev
```

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## 🗺 Próximos Passos (Roadmap)

### Fase 1 — MVP ✅
- [x] Arquitetura multi-tenant
- [x] Schema do banco de dados
- [x] Autenticação JWT
- [x] CRUD de barbeiros, serviços, agendamentos
- [x] Verificação de conflito de horários
- [x] Dashboard admin

### Fase 2 — Produto
- [ ] Página pública de agendamento (/book/[slug])
- [ ] Upload de logo e foto de barbeiro
- [ ] Notificações WhatsApp (Twilio/Z-API)
- [ ] Relatórios financeiros
- [ ] Histórico de clientes

### Fase 3 — Escala
- [ ] Planos e billing (Stripe)
- [ ] Subdomain por empresa (empresa.agend.app)
- [ ] App mobile (React Native)
- [ ] Integração Google Calendar
