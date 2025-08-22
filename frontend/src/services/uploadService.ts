import api from "./api";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class UploadService {
  static async uploadWithProgress<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void,
    timeout: number = 180000 // 3 minutes default
  ): Promise<T> {
    try {
      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            onProgress(progress);
          }
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - please check your internet connection and try again');
      }
      
      if (error.response?.status === 413) {
        throw new Error('Files are too large - please reduce file sizes and try again');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      
      throw error;
    }
  }
}