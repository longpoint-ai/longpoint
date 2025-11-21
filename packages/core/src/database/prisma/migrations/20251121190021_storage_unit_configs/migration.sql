/*
  Warnings:

  - You are about to drop the column `config` on the `StorageUnit` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `StorageUnit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storageProviderConfigId,name]` on the table `StorageUnit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storageProviderConfigId` to the `StorageUnit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SearchIndexItemStatus" AS ENUM ('INDEXING', 'INDEXED', 'STALE');

-- DropIndex
DROP INDEX "StorageUnit_name_key";

-- DropIndex
DROP INDEX "StorageUnit_provider_idx";

-- AlterTable
ALTER TABLE "StorageUnit" DROP COLUMN "config",
DROP COLUMN "provider",
ADD COLUMN     "storageProviderConfigId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VectorProviderConfig" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VectorProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndex" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "indexing" BOOLEAN NOT NULL DEFAULT false,
    "mediaIndexed" INTEGER NOT NULL DEFAULT 0,
    "embeddingModelId" TEXT,
    "vectorProviderId" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastIndexedAt" TIMESTAMP(3),

    CONSTRAINT "SearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexItem" (
    "id" TEXT NOT NULL,
    "status" "SearchIndexItemStatus" NOT NULL DEFAULT 'INDEXING',
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "indexId" TEXT NOT NULL,
    "mediaContainerId" TEXT,

    CONSTRAINT "SearchIndexItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageProviderConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VectorProviderConfig_providerId_key" ON "VectorProviderConfig"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndex_name_key" ON "SearchIndex"("name");

-- CreateIndex
CREATE INDEX "SearchIndex_embeddingModelId_idx" ON "SearchIndex"("embeddingModelId");

-- CreateIndex
CREATE INDEX "SearchIndex_vectorProviderId_idx" ON "SearchIndex"("vectorProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndexItem_externalId_key" ON "SearchIndexItem"("externalId");

-- CreateIndex
CREATE INDEX "SearchIndexItem_indexId_idx" ON "SearchIndexItem"("indexId");

-- CreateIndex
CREATE INDEX "SearchIndexItem_status_idx" ON "SearchIndexItem"("status");

-- CreateIndex
CREATE INDEX "SearchIndexItem_mediaContainerId_idx" ON "SearchIndexItem"("mediaContainerId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndexItem_indexId_mediaContainerId_key" ON "SearchIndexItem"("indexId", "mediaContainerId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageProviderConfig_name_key" ON "StorageProviderConfig"("name");

-- CreateIndex
CREATE INDEX "StorageProviderConfig_provider_idx" ON "StorageProviderConfig"("provider");

-- CreateIndex
CREATE INDEX "StorageUnit_storageProviderConfigId_idx" ON "StorageUnit"("storageProviderConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageUnit_storageProviderConfigId_name_key" ON "StorageUnit"("storageProviderConfigId", "name");

-- AddForeignKey
ALTER TABLE "SearchIndexItem" ADD CONSTRAINT "SearchIndexItem_indexId_fkey" FOREIGN KEY ("indexId") REFERENCES "SearchIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchIndexItem" ADD CONSTRAINT "SearchIndexItem_mediaContainerId_fkey" FOREIGN KEY ("mediaContainerId") REFERENCES "MediaContainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageUnit" ADD CONSTRAINT "StorageUnit_storageProviderConfigId_fkey" FOREIGN KEY ("storageProviderConfigId") REFERENCES "StorageProviderConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
