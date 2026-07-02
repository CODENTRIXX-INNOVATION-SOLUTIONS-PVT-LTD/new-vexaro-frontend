export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type WarehouseRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WarehouseChangeRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  warehouseId: string;
  currentAddress: Address;
  newAddress: Address;
  status: WarehouseRequestStatus;
  submittedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface WarehouseChangeRequestParams {
  status?: WarehouseRequestStatus;
  page?: number;
  limit?: number;
}

export interface WarehouseChangeRequestResponse {
  success: boolean;
  data: {
    requests: WarehouseChangeRequest[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface WarehouseActionResponse {
  success: boolean;
  data: WarehouseChangeRequest;
  message: string;
}
