# Testbench — Next.js/Prisma/Supabase каркас

Я не смог собрать и запустить это здесь (в песочнице нет доступа в интернет — ни `npm install`,
ни подключения к Supabase), поэтому это код "как есть", написанный по вашей схеме и промптам,
но не протестированный локальным запуском. Структурно всё стандартно для App Router, но перед
продакшеном стоит прогнать `npm run build` и проверить рантайм-ошибки.

## 1. Создать проект

```bash
npx create-next-app@latest testbench --typescript --tailwind --app --src-dir=false
cd testbench
```

## 2. Инициализировать shadcn/ui (тёмная тема)

```bash
npx shadcn@latest init
npx shadcn@latest add button input textarea sheet table badge select label scroll-area progress checkbox
```

## 3. Prisma + Supabase

```bash
npm install prisma @prisma/client
npm install -D tsx
npx prisma init
```

Замените сгенерированный `prisma/schema.prisma` на файл из этого архива.
В `.env` пропишите `DATABASE_URL` из Supabase (Settings → Database → Connection string, режим *pooled*
подходит для serverless / Vercel).

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

`prisma db seed` создаст дефолтный `Project`, к которому привязаны все данные —
его id захардкожен в `lib/constants.ts` (`DEFAULT_PROJECT_ID`). Если хотите несколько проектов —
это первое, что нужно доработать (сейчас мультипроектности в UI нет).

## 4. Скопировать файлы

Перенесите в свой проект, сохранив пути:

```
lib/prisma.ts
lib/constants.ts
lib/actions.ts
lib/runActions.ts
app/repository/page.tsx
app/repository/repository-client.tsx
app/runs/[runId]/page.tsx
app/runs/[runId]/run-client.tsx
app/api/v1/test-runs/report/route.ts
app/api/ai-generate/route.ts
```

## 5. Переменные окружения

Скопируйте `.env.example` → `.env.local`, впишите `DATABASE_URL` и `AI_API_KEY`.

## 6. Запуск

```bash
npm run dev
```

- Репозиторий тест-кейсов: `/repository`
- Выполнение прогона: `/runs/[id рана]` — id рана берите из Prisma Studio (`npx prisma studio`)
  или создайте ран вручную через тот же Studio/через отчёт CI.
- Приём отчёта CI: `POST /api/v1/test-runs/report`
- Генерация шагов AI: `POST /api/ai-generate` (используется кнопкой в Sheet-редакторе)

## Известные ограничения (сознательно не решал, чтобы не выходить за рамки того, что вы просили)

- **Suite — плоский список**, не дерево: в схеме нет `parentId`. Если нужна вложенность —
  добавьте `parentId String?` + self-relation в модель `Suite`.
- **Нет авторизации** на бэкенде — ни в описанных вами промптах, ни в схеме её не было.
  Если нужна реальная аутентификация — это отдельная задача (NextAuth/Supabase Auth + модель User),
  не то же самое, что локальный "профиль" в прошлой HTML-версии.
- **Нет мультипроектности в UI** — используется один захардкоженный `DEFAULT_PROJECT_ID`.
- Страница `/runs/[runId]` ожидает, что ран и его `RunResult` уже существуют в базе
  (создаются либо через `report`-роут, либо вручную/через будущий "New Run" экран — его отдельно не просили).
