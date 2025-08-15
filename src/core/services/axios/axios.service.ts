import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { injectable } from "inversify";

/**
 * Just a wrapper class for axios.
 * It provides methods for making HTTP requests.
 * This class is used to make HTTP requests to external APIs or services.
 * It is a simple wrapper around the axios library,
 */
@injectable()
export class AxiosService {
  constructor() {}

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.get<T>(url, config);
  }

  public async post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.post<T>(url, data, config);
  }

  public async put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.put<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.delete<T>(url, config);
  }

  public async patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return axios.patch<T>(url, data, config);
  }
}
