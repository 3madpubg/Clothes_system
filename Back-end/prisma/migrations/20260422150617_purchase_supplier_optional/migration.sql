-- DropForeignKey
ALTER TABLE "purchase_invoices" DROP CONSTRAINT "purchase_invoices_supplier_id_fkey";

-- AlterTable
ALTER TABLE "purchase_invoices" ALTER COLUMN "supplier_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
