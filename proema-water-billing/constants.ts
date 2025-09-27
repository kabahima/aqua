import { UserRole } from "./types";

export const RATE_PER_UNIT = 500; // Example rate: UGX 500 per unit of water

export const USER_ROLES: UserRole[] = [
  'Super Admin (Platform)',
  'Utility Admin',
  'Billing Officer',
  'Cashier/Collections',
  'Field Agent',
  'Customer (Portal/App)',
  'Auditor/Viewer',
];