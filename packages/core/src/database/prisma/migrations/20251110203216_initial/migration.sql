-- CreateEnum
CREATE TYPE "ClassifierRunStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaAssetVariant" AS ENUM ('PRIMARY', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "MediaContainerStatus" AS ENUM ('WAITING_FOR_UPLOAD', 'PROCESSING', 'READY', 'FAILED', 'PARTIALLY_FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('WAITING_FOR_UPLOAD', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE');

-- CreateTable
CREATE TABLE "AiProviderConfig" (
    "providerId" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Classifier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelId" TEXT NOT NULL,
    "modelInput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifierRun" (
    "id" TEXT NOT NULL,
    "status" "ClassifierRunStatus" NOT NULL,
    "result" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "classifierId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,

    CONSTRAINT "ClassifierRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaContainer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MediaContainerStatus" NOT NULL,
    "path" TEXT NOT NULL DEFAULT '/',
    "type" "MediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "storageUnitId" TEXT NOT NULL,

    CONSTRAINT "MediaContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "mediaAssetId" TEXT NOT NULL,

    CONSTRAINT "UploadToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "variant" "MediaAssetVariant" NOT NULL DEFAULT 'PRIMARY',
    "status" "MediaAssetStatus" NOT NULL,
    "classifiersOnUpload" TEXT[],
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "aspectRatio" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "containerId" TEXT NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "permission" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permission")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderConfig_providerId_key" ON "AiProviderConfig"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Classifier_name_key" ON "Classifier"("name");

-- CreateIndex
CREATE INDEX "Classifier_modelId_idx" ON "Classifier"("modelId");

-- CreateIndex
CREATE INDEX "ClassifierRun_classifierId_idx" ON "ClassifierRun"("classifierId");

-- CreateIndex
CREATE INDEX "ClassifierRun_mediaAssetId_idx" ON "ClassifierRun"("mediaAssetId");

-- CreateIndex
CREATE INDEX "ClassifierRun_createdAt_idx" ON "ClassifierRun"("createdAt");

-- CreateIndex
CREATE INDEX "MediaContainer_path_idx" ON "MediaContainer"("path");

-- CreateIndex
CREATE INDEX "MediaContainer_status_idx" ON "MediaContainer"("status");

-- CreateIndex
CREATE INDEX "MediaContainer_storageUnitId_idx" ON "MediaContainer"("storageUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaContainer_path_name_key" ON "MediaContainer"("path", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_token_key" ON "UploadToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_mediaAssetId_key" ON "UploadToken"("mediaAssetId");

-- CreateIndex
CREATE INDEX "UploadToken_expiresAt_idx" ON "UploadToken"("expiresAt");

-- CreateIndex
CREATE INDEX "MediaAsset_containerId_status_idx" ON "MediaAsset"("containerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StorageUnit_name_key" ON "StorageUnit"("name");

-- CreateIndex
CREATE INDEX "StorageUnit_provider_idx" ON "StorageUnit"("provider");

-- CreateIndex
CREATE INDEX "StorageUnit_isDefault_idx" ON "StorageUnit"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "ClassifierRun" ADD CONSTRAINT "ClassifierRun_classifierId_fkey" FOREIGN KEY ("classifierId") REFERENCES "Classifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifierRun" ADD CONSTRAINT "ClassifierRun_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaContainer" ADD CONSTRAINT "MediaContainer_storageUnitId_fkey" FOREIGN KEY ("storageUnitId") REFERENCES "StorageUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadToken" ADD CONSTRAINT "UploadToken_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "MediaContainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
