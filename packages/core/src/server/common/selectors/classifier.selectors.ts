import { Prisma } from '@/database';

export const selectClassifier = () => {
  return {
    id: true,
    name: true,
    description: true,
    createdAt: true,
    updatedAt: true,
    modelId: true,
  } satisfies Prisma.ClassifierSelect;
};

export type SelectedClassifier = Prisma.ClassifierGetPayload<{
  select: ReturnType<typeof selectClassifier>;
}>;
