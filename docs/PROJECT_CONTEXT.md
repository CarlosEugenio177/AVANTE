# Visão Geral do AVANTE
MVP do sistema de precificação e gestão de produtos para a empresa Flora Pura.
Aplicação SaaS fullstack, mobile-first, design minimalista.

## Arquitetura
- Monorepo (npm workspaces)
- Frontend: React + Vite + TypeScript (Vercel)
- Backend: NestJS + Prisma + PostgreSQL (Vercel Serverless)

## Regras de Negócio & Precificação
Fórmula de precificação:
- Custo Total % = Custos Fixos % + Impostos % + Taxa Cartão % + Margem Desejada %
- Preço Venda = Custo Produto / (1 - Custo Total % / 100)
