/*
  Warnings:

  - You are about to drop the `campaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `communication_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "communication_log" DROP CONSTRAINT "communication_log_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "communication_log" DROP CONSTRAINT "communication_log_customerId_fkey";

-- DropTable
DROP TABLE "campaign";

-- DropTable
DROP TABLE "communication_log";
