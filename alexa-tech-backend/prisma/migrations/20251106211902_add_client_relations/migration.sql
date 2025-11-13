-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."commercial_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quotes" ADD CONSTRAINT "quotes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."commercial_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
