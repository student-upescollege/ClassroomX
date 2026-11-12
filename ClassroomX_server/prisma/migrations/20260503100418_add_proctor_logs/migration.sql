-- CreateEnum
CREATE TYPE "ProctorEventType" AS ENUM ('TAB_SWITCH', 'COPY', 'PASTE', 'CUT', 'WINDOW_BLUR');

-- CreateTable
CREATE TABLE "ProctorLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "type" "ProctorEventType" NOT NULL,

    CONSTRAINT "ProctorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProctorLog_sessionId_studentId_idx" ON "ProctorLog"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "ProctorLog" ADD CONSTRAINT "ProctorLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorLog" ADD CONSTRAINT "ProctorLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;
