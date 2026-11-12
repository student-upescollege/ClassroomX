-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('CODING', 'DESCRIPTIVE', 'MCQ');

-- AlterTable
ALTER TABLE "CodingQuestion" ADD COLUMN     "options" TEXT[],
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'CODING';
