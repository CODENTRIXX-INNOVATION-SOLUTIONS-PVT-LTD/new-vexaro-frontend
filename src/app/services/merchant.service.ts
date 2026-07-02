import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MerchantUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangeCredentials: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  address: string;
  invitedBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  fullName?: string;
  warehouse?: MerchantWarehouse;
}

export interface MerchantWarehouse {
  warehouseId: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  contactPerson: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  gstNo: string | null;
  isActive: boolean;
  velocityWarehouseId: string | null;
}

// Backend meta uses 'limit' and 'pages' (not pageSize / totalPages)
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MerchantListResponse {
  success: boolean;
  message: string;
  data: { users: MerchantUser[] };
  meta: PaginationMeta;
}

export interface MerchantDetailResponse {
  success: boolean;
  message: string;
  data: MerchantUser;
}

export interface MerchantListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class MerchantService {
  private readonly baseUrl = (window as any).__env?.apiUrl ?? 'http://localhost:5000/api/v1';
  private http = inject(HttpClient);

  /**
   * GET /users?role=MERCHANT&search=...&page=...&limit=...
   */
  listMerchants(query: MerchantListQuery = {}): Observable<MerchantListResponse> {
    let params = new HttpParams().set('role', 'MERCHANT');
    if (query.search) params = params.set('search', query.search);
    if (query.page)   params = params.set('page', query.page.toString());
    if (query.limit)  params = params.set('limit', query.limit.toString());
    return this.http.get<MerchantListResponse>(`${this.baseUrl}/users`, { params });
  }

  /**
   * GET /users/:id
   * Returns user profile + nested warehouse if the user is a MERCHANT.
   */
  getMerchantById(id: string): Observable<MerchantDetailResponse> {
    return this.http.get<MerchantDetailResponse>(`${this.baseUrl}/users/${id}`);
  }

  /**
   * GET /users?role=DISTRIBUTOR&search=...&page=...&limit=...
   */
  listDistributors(query: MerchantListQuery = {}): Observable<MerchantListResponse> {
    let params = new HttpParams().set('role', 'DISTRIBUTOR');
    if (query.search) params = params.set('search', query.search);
    if (query.page)   params = params.set('page', query.page.toString());
    if (query.limit)  params = params.set('limit', query.limit.toString());
    return this.http.get<MerchantListResponse>(`${this.baseUrl}/users`, { params });
  }

  /**
   * GET /users/:id  (works for both MERCHANT and DISTRIBUTOR)
   */
  getDistributorById(id: string): Observable<MerchantDetailResponse> {
    return this.http.get<MerchantDetailResponse>(`${this.baseUrl}/users/${id}`);
  }
}
