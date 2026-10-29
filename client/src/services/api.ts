import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Types ---

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface UserAuthResponse {
  message?: string;
  user_id?: number;
  id?: number;
  username: string;
  email?: string;
}

export interface Product {
  id: number;
  name: string;
  category?: string;
  unit: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_alert: number;
  is_low_stock: boolean;
  created_at: string;
}

export interface ProductCreatePayload {
  name: string;
  category?: string;
  unit: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_alert?: number;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  udhari_balance: number;
  created_at: string;
}

export interface CustomerCreatePayload {
  name: string;
  phone?: string;
  address?: string;
}

export interface UdhariPayment {
  id: number;
  customer_id: number;
  amount_paid: number;
  note?: string;
  payment_date: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
}

export interface Sale {
  id: number;
  customer_id?: number;
  total_amount: number;
  payment_type: 'cash' | 'udhari';
  note?: string;
  sale_date: string;
  items: SaleItem[];
}

export interface SaleCreatePayload {
  customer_id?: number | null;
  payment_type: 'cash' | 'udhari';
  items: SaleItemCreate[];
  note?: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  company_name?: string;
  created_at: string;
}

export interface SupplierCreatePayload {
  name: string;
  phone?: string;
  company_name?: string;
}

export interface PurchaseItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface PurchaseItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  supplier_id?: number;
  total_amount: number;
  note?: string;
  purchase_date: string;
  items: PurchaseItem[];
}

export interface PurchaseCreatePayload {
  supplier_id?: number | null;
  items: PurchaseItemCreate[];
  note?: string;
}

// --- API Services ---

export const authService = {
  login: async (payload: UserLoginPayload): Promise<UserAuthResponse> => {
    const res = await api.post<UserAuthResponse>('/auth/login', payload);
    return res.data;
  },
  register: async (payload: UserRegisterPayload): Promise<UserAuthResponse> => {
    const res = await api.post<UserAuthResponse>('/auth/register', payload);
    return res.data;
  },
};

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get<Product[]>('/products/');
    return res.data;
  },
  getLowStock: async (): Promise<Product[]> => {
    const res = await api.get<Product[]>('/products/low-stock');
    return res.data;
  },
  create: async (data: ProductCreatePayload): Promise<Product> => {
    const res = await api.post<Product>('/products/', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ProductCreatePayload>): Promise<Product> => {
    const res = await api.patch<Product>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<Customer[]>('/customers/');
    return res.data;
  },
  getWithUdhari: async (): Promise<Customer[]> => {
    const res = await api.get<Customer[]>('/customers/udhari');
    return res.data;
  },
  create: async (data: CustomerCreatePayload): Promise<Customer> => {
    const res = await api.post<Customer>('/customers/', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
  payUdhari: async (customerId: number, amount_paid: number, note?: string): Promise<UdhariPayment> => {
    const res = await api.post<UdhariPayment>(`/customers/${customerId}/pay-udhari`, {
      customer_id: customerId,
      amount_paid,
      note,
    });
    return res.data;
  },
  getUdhariHistory: async (customerId: number): Promise<UdhariPayment[]> => {
    const res = await api.get<UdhariPayment[]>(`/customers/${customerId}/udhari-history`);
    return res.data;
  },
};

export const salesService = {
  create: async (data: SaleCreatePayload): Promise<Sale> => {
    const res = await api.post<Sale>('/sales/', data);
    return res.data;
  },
  getAll: async (): Promise<Sale[]> => {
    const res = await api.get<Sale[]>('/sales/');
    return res.data;
  },
  getById: async (id: number): Promise<Sale> => {
    const res = await api.get<Sale>(`/sales/${id}`);
    return res.data;
  },
};

export const suppliersService = {
  getAll: async (): Promise<Supplier[]> => {
    const res = await api.get<Supplier[]>('/suppliers/');
    return res.data;
  },
  create: async (data: SupplierCreatePayload): Promise<Supplier> => {
    const res = await api.post<Supplier>('/suppliers/', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};

export const purchasesService = {
  create: async (data: PurchaseCreatePayload): Promise<Purchase> => {
    const res = await api.post<Purchase>('/purchases/', data);
    return res.data;
  },
  getAll: async (): Promise<Purchase[]> => {
    const res = await api.get<Purchase[]>('/purchases/');
    return res.data;
  },
};
