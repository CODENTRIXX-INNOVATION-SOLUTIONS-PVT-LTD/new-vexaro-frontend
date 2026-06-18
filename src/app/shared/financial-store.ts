export interface RechargeRequest {
  requestId: string;
  distributorId: number;
  distributorName: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
}

export interface OnboardingRequest {
  requestId: string;
  distributorName: string;
  email: string;
  phone: string;
  region: string;
  date: string;
  status: string;
}

export class FinancialStore {
  public static requests: RechargeRequest[] = [
    {
      requestId: 'REQ1001',
      distributorId: 1,
      distributorName: 'Express Distributors Ltd',
      date: '15 Jun 2026',
      amount: 10000,
      method: 'UPI',
      status: 'Approved',
      reference: 'Ref #1029402'
    },
    {
      requestId: 'REQ1002',
      distributorId: 2,
      distributorName: 'Rapid Delivery Services',
      date: '15 Jun 2026',
      amount: 25000,
      method: 'Bank Transfer',
      status: 'Approved',
      reference: 'Ref #992810'
    },
    {
      requestId: 'REQ1003',
      distributorId: 2,
      distributorName: 'Rapid Delivery Services',
      date: '17 Jun 2026',
      amount: 10000,
      method: 'UPI',
      status: 'Pending',
      reference: 'Ref #338102'
    }
  ];

  public static onboardingRequests: OnboardingRequest[] = [
    {
      requestId: 'ONB1001',
      distributorName: 'Ketan Logistics Hub',
      email: 'ketan@gmail.com',
      phone: '9876543210',
      region: 'North Zone',
      date: '17 Jun 2026',
      status: 'Pending'
    }
  ];
}
