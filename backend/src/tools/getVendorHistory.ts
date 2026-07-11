import type { Expense, Vendor, VendorHistoryResult } from '../agent/types';

/**
 * Structured lookup against vendors.json — exact match on vendorId, no
 * semantic search needed. Tells the agent whether this is a first-time
 * vendor and whether the current amount is unusual relative to that
 * vendor's typical transaction size.
 *
 * @param expense - the expense record being evaluated (needs vendorId, amount)
 * @param vendors - the loaded vendors.json array
 * @returns vendor history summary, or throws if vendorId is not found
 */
export function getVendorHistory(
  expense: Expense,
  vendors: Vendor[]
): VendorHistoryResult {
  throw new Error('Not implemented');
}
