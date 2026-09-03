import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ВАЖНО: этот id должен совпадать с DEFAULT_PROJECT_ID в lib/constants.ts
const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  await prisma.project.upsert({
    where: { id: DEFAULT_PROJECT_ID },
    update: {},
    create: {
      id: DEFAULT_PROJECT_ID,
      name: "Основной проект",
    },
  });
  console.log("Seed завершён. Проект:", DEFAULT_PROJECT_ID);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
