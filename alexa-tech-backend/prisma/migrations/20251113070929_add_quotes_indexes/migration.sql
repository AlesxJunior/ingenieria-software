-- CreateIndex
CREATE INDEX "quotes_estado_idx" ON "public"."quotes"("estado");

-- CreateIndex
CREATE INDEX "quotes_fechaEmision_idx" ON "public"."quotes"("fechaEmision");

-- CreateIndex
CREATE INDEX "quotes_clienteId_idx" ON "public"."quotes"("clienteId");
