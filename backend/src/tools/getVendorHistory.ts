import type { Expense, Vendor, VendorHistoryResult } from '../agent/types';

export function getVendorHistory(
  expense: Expense,
  vendors: Vendor[]
): VendorHistoryResult {
  const vendor = vendors.find((v) => v.vendorId === expense.vendorId);
  if (!vendor) {
    throw new Error(`Vendor not found: ${expense.vendorId}`);
  }

  const isFirstTimeVendor = vendor.transactionCount <= 1;

  const amountDeviatesFromAvg =
    vendor.avgAmount > 0 &&
    (expense.amount > vendor.avgAmount * 2 || expense.amount < vendor.avgAmount * 0.5);

  return {
    vendorId: vendor.vendorId,
    vendorName: vendor.name,
    isFirstTimeVendor,
    transactionCount: vendor.transactionCount,
    avgAmount: vendor.avgAmount,
    amountDeviatesFromAvg,
  };
}