/**
 * Military Category Service
 * Provides list of military categories for dependent rank selection.
 *
 * @author CHOUABBIA Amine
 * @created 01-01-2026
 */

import axiosInstance from '../../../../shared/config/axios';
import { MilitaryCategoryDTO } from '../dto';

const BASE_URL = '/common/administration/militaryCategory';

export const militaryCategoryService = {
  getAllList: async (): Promise<MilitaryCategoryDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/list`);
    return response.data;
  },

  getById: async (id: number): Promise<MilitaryCategoryDTO> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },
};
