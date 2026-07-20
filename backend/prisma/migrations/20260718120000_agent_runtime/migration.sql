ALTER TABLE "Agent"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN "systemPrompt" TEXT NOT NULL DEFAULT 'You are a helpful AI agent.',
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'openai',
ADD COLUMN "model" TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
ADD COLUMN "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Execution"
ADD COLUMN "task" TEXT NOT NULL DEFAULT '',
ADD COLUMN "output" TEXT,
ADD COLUMN "model" TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE "Execution" ALTER COLUMN "latency" SET DEFAULT 0;
ALTER TABLE "Execution" ALTER COLUMN "tokens" SET DEFAULT 0;
ALTER TABLE "Execution" ALTER COLUMN "cost" SET DEFAULT 0;

ALTER TABLE "Execution" DROP CONSTRAINT "Execution_agentId_fkey";
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Execution_agentId_createdAt_idx" ON "Execution"("agentId", "createdAt");
