import { config } from 'dotenv'
import pg from 'pg'

config({ path: '.env.local' })

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
})

const client = await pool.connect()

// Contar produtores (colunas em camelCase — padrão do Prisma)
const producers = await client.query('SELECT id, name, email FROM producers ORDER BY "createdAt"')
console.log(`\n👤 Produtores cadastrados: ${producers.rowCount}`)
if (producers.rowCount > 0) {
  producers.rows.forEach(p => console.log(`   ✅ ${p.name} <${p.email}>`))
} else {
  console.log('   ⚠️  Nenhum produtor — precisa rodar o seed.')
}

// Contagens gerais
const counts = await client.query(`
  SELECT
    (SELECT count(*) FROM events)          AS events,
    (SELECT count(*) FROM estimates)       AS estimates,
    (SELECT count(*) FROM meetings)        AS meetings,
    (SELECT count(*) FROM proposals)       AS proposals,
    (SELECT count(*) FROM checklist_items) AS checklist
`)
console.log('\n📊 Registros por tabela:')
const c = counts.rows[0]
console.log(`   events: ${c.events} | estimates: ${c.estimates} | meetings: ${c.meetings} | proposals: ${c.proposals} | checklist: ${c.checklist}`)

// Verificar RLS
const rls = await client.query(`
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('producers','events','estimates','meetings','proposals','checklist_items')
  ORDER BY tablename
`)
console.log('\n🔒 Status do RLS:')
rls.rows.forEach(r =>
  console.log(`   ${r.tablename}: ${r.rowsecurity ? '✅ habilitado' : '❌ desabilitado'}`)
)

client.release()
await pool.end()
