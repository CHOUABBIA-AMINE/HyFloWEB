/**
 * File Service - System Utility Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.system.utility.service.FileService
 * 
 * Provides file upload, download, and management operations.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-08-2026
 * @updated 01-20-2026 - Added getFileBlob for authenticated image viewing
 * @updated 01-19-2026 - Fixed getFileUrl to return full API URL
 */

import axiosInstance from '@/shared/config/axios';
import type { FileDTO } from '../dto/FileDTO';
import type { Page, Pageable } from '@/types/pagination';

const BASE_URL = '/system/utility/file';

export class FileService {
  /**
   * Get all files with pagination
   */
  static async getAll(pageable: Pageable): Promise<Page<FileDTO>> {
    const response = await axiosInstance.get<Page<FileDTO>>(BASE_URL, {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  }

  /**
   * Get file by ID
   */
  static async getById(id: number): Promise<FileDTO> {
    const response = await axiosInstance.get<FileDTO>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Upload a file
   */
  static async upload(file: File, category?: string): Promise<FileDTO> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    const response = await axiosInstance.post<FileDTO>(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Download a file
   */
  static async download(id: number): Promise<Blob> {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Delete file by ID
   */
  static async delete(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }

  /**
   * Get file URL for display (direct URL - requires public endpoint)
   * Returns full API URL including baseURL from axios instance
   * Note: This won't work if endpoint requires authentication
   */
  static getFileUrl(id: number): string {
    const baseURL = axiosInstance.defaults.baseURL || 'http://localhost:8080/hyflo/api';
    return `${baseURL}${BASE_URL}/${id}/view`;
  }

  /**
   * Get file as blob with authentication, then create object URL
   * Use this for displaying authenticated images in <img> tags
   * 
   * @param id - File ID
   * @returns Promise<string> - Blob URL (e.g., blob:http://localhost:3000/abc-123)
   * 
   * Usage:
   * const blobUrl = await FileService.getFileBlob(123);
   * // Use in img tag: <img src={blobUrl} />
   * // Don't forget to revoke when unmounting: URL.revokeObjectURL(blobUrl)
   */
  static async getFileBlob(id: number): Promise<string> {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/view`, {
      responseType: 'blob',
    });
    
    // Create blob URL from response
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'image/jpeg' 
    });
    
    return URL.createObjectURL(blob);
  }
}
