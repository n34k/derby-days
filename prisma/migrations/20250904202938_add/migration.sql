-- CreateTable
CREATE TABLE "BrotherEmails" (
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrotherEmails_pkey" PRIMARY KEY ("email")
);
