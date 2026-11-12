-- AlterTable
ALTER TABLE "CodingQuestion" ADD COLUMN     "aiMaxUses" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiUsage_sessionId_questionId_studentId_key" ON "AiUsage"("sessionId", "questionId", "studentId");

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;
