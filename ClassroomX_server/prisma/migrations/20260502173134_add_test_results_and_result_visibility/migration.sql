-- AlterTable
ALTER TABLE "CodeSubmission" ADD COLUMN     "testResults" JSONB;

-- AlterTable
ALTER TABLE "LiveCodingSession" ADD COLUMN     "showResultsImmediately" BOOLEAN NOT NULL DEFAULT true;
