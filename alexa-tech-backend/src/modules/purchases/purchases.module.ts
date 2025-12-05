import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchaseReceiptsService } from './purchase-receipts.service';
import { PurchasesController } from './controllers/purchases.controller';
import { PurchaseReceiptsController } from './controllers/purchase-receipts.controller';

@Module({
  controllers: [PurchasesController, PurchaseReceiptsController],
  providers: [PurchasesService, PurchaseReceiptsService],
  exports: [PurchasesService, PurchaseReceiptsService],
})
export class PurchasesModule {}
