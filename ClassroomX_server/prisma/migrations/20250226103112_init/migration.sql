-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT');

-- CreateTable
CREATE TABLE "Faculty" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("employeeID")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "course" TEXT NOT NULL,
    "semester" "Semester" NOT NULL,
    "facultyID" INTEGER NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "semester" "Semester" NOT NULL,
    "batchId" INTEGER NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("semester","batchId")
);

-- CreateTable
CREATE TABLE "BatchOnClassroom" (
    "classroomId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,
    "semester" "Semester" NOT NULL,

    CONSTRAINT "BatchOnClassroom_pkey" PRIMARY KEY ("classroomId","batchId","semester")
);

-- CreateTable
CREATE TABLE "Student" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sap" INTEGER NOT NULL,
    "roll" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "semester" "Semester" NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("sap")
);

-- CreateTable
CREATE TABLE "LiveCodingSession" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LiveCodingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingQuestion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "CodingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSession" (
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "StudentSession_pkey" PRIMARY KEY ("sessionId","studentId")
);

-- CreateTable
CREATE TABLE "CodeSubmission" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "output" TEXT,
    "error" TEXT,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION,
    "executionTime" DOUBLE PRECISION,
    "rank" INTEGER,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_roll_key" ON "Student"("roll");

-- CreateIndex
CREATE INDEX "Student_batchId_semester_idx" ON "Student"("batchId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "Student_batchId_semester_key" ON "Student"("batchId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "CodeSubmission_sessionId_studentId_questionId_key" ON "CodeSubmission"("sessionId", "studentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_sessionId_studentId_key" ON "LeaderboardEntry"("sessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_sessionId_studentId_key" ON "Result"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_facultyID_fkey" FOREIGN KEY ("facultyID") REFERENCES "Faculty"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchOnClassroom" ADD CONSTRAINT "BatchOnClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchOnClassroom" ADD CONSTRAINT "BatchOnClassroom_batchId_semester_fkey" FOREIGN KEY ("batchId", "semester") REFERENCES "Batch"("batchId", "semester") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_batchId_semester_fkey" FOREIGN KEY ("batchId", "semester") REFERENCES "Batch"("batchId", "semester") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveCodingSession" ADD CONSTRAINT "LiveCodingSession_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveCodingSession" ADD CONSTRAINT "LiveCodingSession_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingQuestion" ADD CONSTRAINT "CodingQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveCodingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("sap") ON DELETE CASCADE ON UPDATE CASCADE;
