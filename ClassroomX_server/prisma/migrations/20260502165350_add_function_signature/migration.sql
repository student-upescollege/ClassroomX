-- AlterTable
ALTER TABLE "BankQuestion" ADD COLUMN     "functionName" TEXT,
ADD COLUMN     "parameters" JSONB,
ADD COLUMN     "returnType" TEXT;

-- AlterTable
ALTER TABLE "CodingQuestion" ADD COLUMN     "functionName" TEXT,
ADD COLUMN     "parameters" JSONB,
ADD COLUMN     "returnType" TEXT;
