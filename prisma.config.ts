import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  engine: 'classic',
  datasource: {
    url: 'postgresql://postgres.ufsvkactqbheeczrrqks:86da36112179d2b4@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require',
  },
  migrations: {
    path: 'prisma/migrations',
  },
});