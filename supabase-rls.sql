-- ─────────────────────────────────────────────────────────────────────────
-- RLS (Row Level Security) para o Wedding Manager
--
-- Execute este script no Supabase > SQL Editor.
--
-- Por que isso é seguro com Prisma:
--   • O usuário "postgres" (usado pela DATABASE_URL) tem BYPASSRLS por padrão
--     no Supabase, então o Prisma nunca é bloqueado pelas políticas.
--   • Habilitar RLS sem políticas bloqueia os roles "anon" e "authenticated"
--     (usados pelo Supabase JS client com anon key), que não são usados
--     por esta aplicação.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE producers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items  ENABLE ROW LEVEL SECURITY;

-- Confirmar que o RLS está ativo em todas as tabelas
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('producers','events','estimates','meetings','proposals','checklist_items')
ORDER BY tablename;
