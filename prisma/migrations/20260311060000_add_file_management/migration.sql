-- CreateTable
CREATE TABLE "file_group" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_entry" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT '',
    "size" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_link" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_group_customerId_idx" ON "file_group"("customerId");

-- CreateIndex
CREATE INDEX "file_entry_groupId_idx" ON "file_entry"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_token_key" ON "magic_link"("token");

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_groupId_key" ON "magic_link"("groupId");

-- CreateIndex
CREATE INDEX "magic_link_token_idx" ON "magic_link"("token");

-- AddForeignKey
ALTER TABLE "file_group" ADD CONSTRAINT "file_group_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_entry" ADD CONSTRAINT "file_entry_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "file_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_link" ADD CONSTRAINT "magic_link_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "file_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
