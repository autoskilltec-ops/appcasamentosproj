import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.producer.upsert({
    where: { email: 'admin@weddingmanager.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@weddingmanager.com.br',
      password: hashedPassword,
    },
  })

  console.log('Seed concluído: produtor admin criado.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
