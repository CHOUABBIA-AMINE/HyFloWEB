/**
 * ShelfFloor Service
 * Matches: dz.mdn.iaas.common.environment.service.ShelfFloorService.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-28-2025
 * @updated 12-28-2025
 */

import axiosInstance from '../../../../shared/config/axios';
import { ShelfFloorDTO } from '../dto';

class ShelfFloorService {
  private readonly BASE_URL = '/common/environment/shelfFloor';

  async getAll(): Promise<ShelfFloorDTO[]> {
    const response = await axiosInstance.get<ShelfFloorDTO[]>(`${this.BASE_URL}/all`);
    return response.data;
  }

  async getById(id: number): Promise<ShelfFloorDTO> {
    const response = await axiosInstance.get<ShelfFloorDTO>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async getByShelf(shelfId: number): Promise<ShelfFloorDTO[]> {
    const response = await axiosInstance.get<ShelfFloorDTO[]>(`${this.BASE_URL}/shelf/${shelfId}`);
    return response.data;
  }
}

export default new ShelfFloorService();
