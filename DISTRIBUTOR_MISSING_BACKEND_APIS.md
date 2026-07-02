# Distributor Module - Missing Backend APIs Documentation

This document lists all backend APIs that are missing or incomplete for the Distributor module to function correctly.

---

## Priority: HIGH

### 1. Dispute Comment Endpoint

**Status:** Frontend implemented, backend missing

**Frontend Location:** `src/app/services/dispute.service.ts`
```typescript
addComment(id: string, comment: string): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/disputes/${id}/reply`, { comment });
}
```

**Frontend Usage:** `src/app/pages/distributor/disputes/dispute-detail/dispute-detail.ts`
- Used by non-SUPER_ADMIN users to add comments to disputes
- Called when user submits a comment on dispute detail page

**Required Backend Endpoint:**
```
POST /api/disputes/:id/reply
```

**Expected Payload:**
```json
{
  "comment": "string (required)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "disputeId": "string",
    "comment": "string",
    "userId": "string",
    "userName": "string",
    "createdAt": "ISO date string"
  },
  "message": "Comment added successfully"
}
```

**Authentication:** Required (Distributor, Merchant, Super Admin)

**Notes:**
- Similar to support ticket reply endpoint structure
- Should log audit trail for dispute comments
- Should notify relevant parties when comment is added

---

### 2. Webhook Management Endpoints

**Status:** Frontend UI exists, backend missing

**Frontend Location:** `src/app/pages/distributor/settings/api-settings/api-settings.ts`
- UI for managing webhooks exists but uses client-side only

**Required Backend Endpoints:**

#### 2.1 List Webhooks
```
GET /api/settings/webhooks
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "string",
        "url": "string",
        "events": ["string"],
        "status": "Active|Inactive",
        "secret": "string (masked)",
        "createdAt": "ISO date string",
        "lastTriggered": "ISO date string|null"
      }
    ]
  }
}
```

#### 2.2 Create Webhook
```
POST /api/settings/webhooks
```

**Expected Payload:**
```json
{
  "url": "string (required, valid URL)",
  "events": ["string[] (required, e.g., shipment.created, shipment.delivered)"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "url": "string",
    "events": ["string"],
    "secret": "string",
    "status": "Active",
    "createdAt": "ISO date string"
  },
  "message": "Webhook created successfully"
}
```

#### 2.3 Delete Webhook
```
DELETE /api/settings/webhooks/:id
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook deleted successfully"
}
```

**Authentication:** Required (Distributor, Super Admin)

**Notes:**
- Should generate secret key automatically on creation
- Should validate webhook URL format
- Should support retry logic for failed webhook deliveries
- Should provide webhook delivery logs

---

### 3. Recharge Request Endpoints

**Status:** Frontend uses mock data (FinancialStore), backend missing

**Frontend Location:** `src/app/shared/financial-store.ts`
- Mock data for recharge requests
- Used by wallet page (now replaced with Razorpay, but may need for offline/manual recharge)

**Required Backend Endpoints:**

#### 3.1 List Recharge Requests
```
GET /api/finance/recharge-requests
Query params: page, limit, status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "string",
        "distributorId": "string",
        "distributorName": "string",
        "amount": "number",
        "method": "string",
        "status": "Pending|Approved|Rejected",
        "reference": "string",
        "createdAt": "ISO date string",
        "processedAt": "ISO date string|null",
        "processedBy": "string|null"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 3.2 Submit Recharge Request
```
POST /api/finance/recharge-requests
```

**Expected Payload:**
```json
{
  "amount": "number (required)",
  "method": "string (required)",
  "reference": "string (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "distributorId": "string",
    "amount": "number",
    "method": "string",
    "status": "Pending",
    "reference": "string",
    "createdAt": "ISO date string"
  },
  "message": "Recharge request submitted successfully"
}
```

#### 3.3 Approve Recharge Request (Super Admin)
```
POST /api/finance/recharge-requests/:id/approve
```

**Expected Payload:**
```json
{}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "Approved",
    "processedAt": "ISO date string",
    "processedBy": "string"
  },
  "message": "Recharge request approved"
}
```

#### 3.4 Reject Recharge Request (Super Admin)
```
POST /api/finance/recharge-requests/:id/reject
```

**Expected Payload:**
```json
{
  "reason": "string (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "Rejected",
    "reason": "string",
    "processedAt": "ISO date string",
    "processedBy": "string"
  },
  "message": "Recharge request rejected"
}
```

**Authentication:** Required (Distributor for submit, Super Admin for approve/reject)

**Notes:**
- Razorpay integration may replace this for online payments
- Still needed for offline/manual recharge requests
- Should credit wallet immediately on approval

---

### 4. Onboarding Request Endpoints

**Status:** Frontend uses mock data (FinancialStore), backend missing

**Frontend Location:** `src/app/shared/financial-store.ts`
- Mock data for onboarding requests
- Dashboard shows approval requests but no backend integration

**Required Backend Endpoints:**

#### 4.1 List Onboarding Requests
```
GET /api/onboarding-requests
Query params: page, limit, status, distributorId
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "string",
        "merchantId": "string",
        "merchantName": "string",
        "merchantEmail": "string",
        "merchantPhone": "string",
        "businessName": "string",
        "warehouseAddress": "object",
        "distributorId": "string",
        "distributorName": "string",
        "status": "Pending|Approved|Rejected",
        "submittedAt": "ISO date string",
        "processedAt": "ISO date string|null",
        "processedBy": "string|null",
        "rejectionReason": "string|null"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

#### 4.2 Submit Onboarding Request (Merchant)
```
POST /api/onboarding-requests
```

**Expected Payload:**
```json
{
  "merchantId": "string (required)",
  "warehouseAddress": "object (required)",
  "documents": ["string[] (optional, file URLs)"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "merchantId": "string",
    "distributorId": "string",
    "status": "Pending",
    "submittedAt": "ISO date string"
  },
  "message": "Onboarding request submitted successfully"
}
```

#### 4.3 Approve Onboarding Request (Distributor)
```
POST /api/onboarding-requests/:id/approve
```

**Expected Payload:**
```json
{
  "assignedCreditLimit": "number (optional)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "Approved",
    "processedAt": "ISO date string",
    "processedBy": "string",
    "assignedCreditLimit": "number"
  },
  "message": "Onboarding request approved"
}
```

#### 4.4 Reject Onboarding Request (Distributor)
```
POST /api/onboarding-requests/:id/reject
```

**Expected Payload:**
```json
{
  "reason": "string (required)"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "Rejected",
    "reason": "string",
    "processedAt": "ISO date string",
    "processedBy": "string"
  },
  "message": "Onboarding request rejected"
}
```

**Authentication:** Required (Merchant for submit, Distributor for approve/reject)

**Notes:**
- Should activate merchant account on approval
- Should send email notifications to merchant
- Should link merchant to distributor on approval
- Dashboard should show pending requests count

---

## Priority: MEDIUM

### 5. Report Endpoints (COD, Wallet, Payment)

**Status:** Frontend report pages exist, backend missing specialized report endpoints

**Frontend Locations:**
- COD Report: Not yet implemented as dedicated page
- Wallet Report: Not yet implemented as dedicated page
- Payment Report: Not yet implemented as dedicated page

**Required Backend Endpoints:**

#### 5.1 COD Report
```
GET /api/reports/cod
Query params: startDate, endDate, merchantId, distributorId, status
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCOD": "number",
      "remittedCOD": "number",
      "pendingCOD": "number",
      "totalAmount": "number"
    },
    "records": [
      {
        "id": "string",
        "awb": "string",
        "merchantId": "string",
        "merchantName": "string",
        "codAmount": "number",
        "status": "Pending|Remitted",
        "remittedAt": "ISO date string|null",
        "remittedBy": "string|null"
      }
    ]
  }
}
```

#### 5.2 Wallet Report
```
GET /api/reports/wallet
Query params: startDate, endDate, userId, distributorId
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "openingBalance": "number",
      "totalCredits": "number",
      "totalDebits": "number",
      "closingBalance": "number"
    },
    "transactions": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "type": "Credit|Debit",
        "amount": "number",
        "category": "string",
        "balanceAfter": "number",
        "createdAt": "ISO date string"
      }
    ]
  }
}
```

#### 5.3 Payment Report
```
GET /api/reports/payments
Query params: startDate, endDate, status, paymentMethod
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPayments": "number",
      "successfulPayments": "number",
      "failedPayments": "number",
      "totalAmount": "number"
    },
    "payments": [
      {
        "id": "string",
        "orderId": "string",
        "razorpayPaymentId": "string",
        "amount": "number",
        "status": "Success|Failed|Pending",
        "paymentMethod": "string",
        "userId": "string",
        "userName": "string",
        "createdAt": "ISO date string"
      }
    ]
  }
}
```

**Authentication:** Required (Distributor, Super Admin)

**Notes:**
- Should support CSV export
- Should support PDF export
- Should support filtering by date range
- Should aggregate data by merchant/distributor

---

## Priority: LOW

### 6. Warehouse Change Request Endpoints

**Status:** Backend has partial implementation (address change requests), may need expansion

**Frontend Location:** Not yet implemented as dedicated Distributor page

**Current Backend:** `src/modules/users/warehouse-change-request.service.js`
- Address change requests exist for merchants
- May need distributor approval workflow

**Potential Additional Endpoints:**
```
GET /api/warehouses/change-requests (for distributor to view)
POST /api/warehouses/change-requests/:id/approve (distributor approval)
POST /api/warehouses/change-requests/:id/reject (distributor rejection)
```

**Notes:**
- Backend already has warehouse change request service
- May need to expose to Distributor role
- May need dedicated UI in Distributor module

---

### 7. Async Export Job Endpoints

**Status:** Not implemented in frontend or backend

**Use Case:** Large report exports should be async with job polling

**Required Backend Endpoints:**
```
POST /api/reports/export (start async export job)
GET /api/reports/export/:jobId (poll job status)
GET /api/reports/export/:jobId/download (download completed export)
```

**Notes:**
- For large datasets, synchronous export may timeout
- Should support email notification when export is ready
- Should maintain job history

---

### 8. Bulk Upload Status Polling

**Status:** Not implemented in frontend or backend

**Use Case:** Track bulk shipment upload progress

**Required Backend Endpoints:**
```
GET /api/shipments/bulk-upload/:jobId (poll upload status)
```

**Notes:**
- Should show progress percentage
- Should show error details for failed rows
- Should support partial success handling

---

## Summary

### Critical for Distributor Module Functionality:
1. **Dispute Comment Endpoint** - HIGH - Users cannot add comments to disputes
2. **Webhook Management** - HIGH - Webhook UI exists but non-functional
3. **Recharge Request Endpoints** - HIGH - Manual recharge workflow missing
4. **Onboarding Request Endpoints** - HIGH - Merchant onboarding approval missing

### Nice to Have:
5. **Report Endpoints (COD, Wallet, Payment)** - MEDIUM - Specialized reports
6. **Warehouse Change Request** - LOW - Partially exists
7. **Async Export Jobs** - LOW - Performance optimization
8. **Bulk Upload Status** - LOW - UX improvement

---

## Implementation Priority Recommendation

1. **Phase 1:** Implement Dispute Comment Endpoint (blocks dispute collaboration)
2. **Phase 2:** Implement Onboarding Request Endpoints (blocks merchant onboarding)
3. **Phase 3:** Implement Webhook Management (blocks integration features)
4. **Phase 4:** Implement Recharge Request Endpoints (alternative to Razorpay)
5. **Phase 5:** Implement Report Endpoints (enhanced reporting)
6. **Phase 6:** Implement Async Export & Bulk Upload (performance/UX)
