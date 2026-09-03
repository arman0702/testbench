// Пока в приложении нет мультипроектности / авторизации на бэкенде —
// все данные привязаны к одному дефолтному проекту.
// Этот id должен совпадать с тем, что создаёт prisma/seed.ts
export const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001";

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export const AUTOMATION = ["MANUAL", "AUTOMATED"] as const;
export const AUTOMATION_LABEL: Record<string, string> = {
  MANUAL: "Ручной",
  AUTOMATED: "Авто",
};

export const RESULT_STATUSES = ["PASSED", "FAILED", "SKIPPED", "UNTESTED"] as const;
export const RESULT_LABEL: Record<string, string> = {
  PASSED: "Пройден",
  FAILED: "Провален",
  SKIPPED: "Пропущен",
  UNTESTED: "Не выполнен",
};
export const RESULT_COLOR: Record<string, string> = {
  PASSED: "bg-emerald-500",
  FAILED: "bg-red-500",
  SKIPPED: "bg-amber-500",
  UNTESTED: "bg-zinc-500",
};
