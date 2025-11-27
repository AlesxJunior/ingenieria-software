-- CreateTable
CREATE TABLE "public"."sale_payments" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "metodoPago" "public"."SalePaymentMethod" NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "referencia" TEXT,
    "observaciones" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."sale_payments" ADD CONSTRAINT "sale_payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
