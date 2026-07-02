export type RefundRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RefundRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  shipmentId: string;
  awb: string;
  amount: number;
  reason: string;
  status: RefundRequestStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface RefundRequestParams {
  status?: RefundRequestStatus;
  merchantId?: string;
  page?: number;
  limit?: number;
}

export interface RefundRequestResponse {
  success: boolean;
  data: {
    requests: RefundRequest[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface RefundActionPayload {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface RefundActionResponse {
  success: boolean;
  data: RefundRequest;
  message: string;
}
