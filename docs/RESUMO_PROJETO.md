# Resumo do Projeto AVANTE

Este documento consolida tudo o que foi implementado e construído no projeto até a data atual. O AVANTE é um sistema de gestão e precificação focado em produtividade e clareza financeira.

## 1. Arquitetura e Estrutura Básica
- **Turborepo (Monorepo):** O projeto foi estruturado como um monorepo, permitindo compartilhar dependências de maneira inteligente entre o backend e o frontend.
- **Node.js + pnpm:** Gerenciador de pacotes rápido que alavanca a estrutura em *workspaces* (`apps/api`, `apps/web`, `packages/shared`, `packages/types`).
- **Pacotes Compartilhados:** A lógica de cálculo financeiro pesada (Markup, Preço de Venda, Lucro Líquido, etc.) foi isolada no `packages/shared` para garantir que o backend e frontend bebam da mesma fonte de verdade sem código duplicado.

## 2. Backend (NestJS + Prisma + PostgreSQL)
- **API Modular (NestJS):** Backend estruturado em módulos independentes (`Auth`, `Products`, `Calculations`), garantindo escalabilidade.
- **Banco de Dados em Nuvem (Prisma ORM + Neon Postgres):**
  - Configurado com PostgreSQL, hospedado nativamente na nuvem usando **Neon (Serverless Postgres)** via integração Vercel.
  - Tabelas principais: `User` (autenticação), `Product` (produtos com categorias e custo) e `Calculation` (histórico financeiro anexado aos produtos).
- **Autenticação (JWT):** Implementado login e registro seguros. O backend emite tokens JWT para as sessões dos usuários logados, barrando acessos não autorizados nos endpoints críticos.

## 3. Frontend (React + Vite + Tailwind CSS)
- **Roteamento Dinâmico (React Router):** SPA (Single Page Application) fluida que dispensa recarregamento de página.
- **Estética Premium e Dark Mode:**
  - O sistema possui suporte nativo à alternância suave de **Dark Mode 🌙 / Light Mode ☀️** em 100% das telas (inclusive Login).
  - Componentes flutuantes (Glassmorphism) com transparências calculadas, micro-interações (`hover`, animações) e iconografia impecável da biblioteca `lucide-react`.
- **Estado Global Persistido:** A biblioteca **Zustand** foi utilizada para guardar preferências (Tema, consentimento de Cookies) e, principalmente, a sessão de usuário.
- **Cookies de Sessão:** O token do usuário fica salvo em Cookies para persistência segura e não invasiva.
- **React Query:** Abstrai todas as requisições (fetches, loadings, retries) para garantir uma resposta imediata na UI, evitando gargalos ou lentidões falsas.

## 4. Telas Implementadas
1. **Autenticação (Login e Register):** Telas limpas e com validação contra a API, protegendo a entrada no sistema.
2. **Dashboard Geral:** Exibe KPIs importantes em tempo real, como "Total de Produtos", "Margem Média Geral" e informações do "Último Cálculo".
3. **Módulo de Produtos:** Permite a criação e listagem visual de produtos com seus custos e categorias associadas.
4. **Calculadora Financeira Avançada:** Uma tela inteligente onde o usuário insere o produto e os custos (impostos, taxa de cartão, margem e custo fixo). O sistema processa os cálculos utilizando nosso pacote `@avante/shared` e devolve *Markup, Lucro Líquido, Preço de Venda* e o *Desconto Máximo permitido*.
5. **Histórico:** Permite revisar todas as simulações já salvas com suas datas e resultados financeiros de maneira clara.

## 5. Arquitetura de Produção (Cloud)
O sistema hoje se encontra totalmente hospedado e funcional na nuvem (Live), dividido da seguinte forma:
- **Frontend (Vercel):** Hospedagem serverless de altíssima performance para o painel React (SPA).
- **Backend (Render):** O servidor NestJS roda de forma contínua em um Web Service no Render, garantindo a execução das regras de negócio, envio de e-mails (SMTP) e segurança da API.
- **Banco de Dados (Neon Postgres):** O banco relacional foi provisionado na nuvem (AWS US-East) e integrado à stack via Prisma.
- **Integração Front-Back:** O frontend consome a API do Render automaticamente através de variáveis de ambiente (`VITE_API_URL` chumbada para produção).
