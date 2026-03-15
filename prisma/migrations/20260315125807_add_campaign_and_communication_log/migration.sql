-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_log" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "communication_log_customerId_idx" ON "communication_log"("customerId");

-- CreateIndex
CREATE INDEX "communication_log_campaignId_idx" ON "communication_log"("campaignId");

-- CreateIndex
CREATE INDEX "communication_log_sentAt_idx" ON "communication_log"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "communication_log_campaignId_customerId_key" ON "communication_log"("campaignId", "customerId");

-- AddForeignKey
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
