export interface BudgetModificationDto {
  id?: number;
  modificationDate?: string;
  previousAmount?: number;
  newAmount?: number;
  observation?: string;
  plannedItemId?: number;
}
