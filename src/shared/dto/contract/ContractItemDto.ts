export interface ContractItemDto {
  id?: number;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  deliveryDeadline?: string;
  observation?: string;
  contractId?: number;
  plannedItemId?: number;
}
