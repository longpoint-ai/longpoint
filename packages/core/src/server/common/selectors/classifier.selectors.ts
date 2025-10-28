import { Prisma } from '@/database';

export const selectClassifierSummary = () => {
  return {
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    modelId: true,
  } satisfies Prisma.ClassifierSelect;
};

export const selectClassifier = () => {
  return {
    ...selectClassifierSummary(),
    modelConfig: true,
  } satisfies Prisma.ClassifierSelect;
};

export type SelectedClassifier = Prisma.ClassifierGetPayload<{
  select: ReturnType<typeof selectClassifier>;
}>;
