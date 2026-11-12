-- AlterTable
ALTER TABLE "BankQuestion" ADD COLUMN     "options" TEXT[],
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'CODING';
