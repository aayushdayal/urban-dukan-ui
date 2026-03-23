export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  address: string;
  phone: string;
  role: string; // 'Buyer' | 'Seller'
}