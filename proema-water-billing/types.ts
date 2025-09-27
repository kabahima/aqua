
// FIX: Removed self-import of Customer which caused a conflict with the local declaration.
export interface Customer {
  id: string;
  name: string;
  address: string;
  createdAt: number;
}

export interface Meter {
  id: string;
  customerId: string;
  serialNumber: string;
  createdAt: number;
}

export interface Reading {
  id: string;
  meterId: string;
  date: string; // YYYY-MM-DD
  value: number;
  createdAt: number;
}

export type BillStatus = 'Pending' | 'Partially Paid' | 'Paid';

export interface Bill {
  id: string;
  customerId: string;
  period: string;
  consumption: number;
  amountDue: number;
  previousReading: Reading;
  currentReading: Reading;
  generatedAt: number;
  dueDate: string; // YYYY-MM-DD
  status: BillStatus;
  amountPaid: number;
  balanceDue: number;
}

export type PaymentMethod = 'Cash' | 'Mobile Money' | 'Card';

export interface Payment {
    id: string;
    billId: string;
    customerId: string;
    amountPaid: number;
    paymentDate: string; // YYYY-MM-DD
    method: PaymentMethod;
    createdAt: number;
}

export type UserRole = 
  | 'Super Admin (Platform)'
  | 'Utility Admin'
  | 'Billing Officer'
  | 'Cashier/Collections'
  | 'Field Agent'
  | 'Customer (Portal/App)'
  | 'Auditor/Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: number;
}
