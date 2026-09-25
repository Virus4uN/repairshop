import { supabase } from './supabase';
import { generateRepairId, DEFAULT_SERVICES } from './helpers';

// Storage keys
const KEYS = {
  REPAIRS: 'smarthub_repairs',
  INVOICES: 'smarthub_invoices',
  SERVICES: 'smarthub_services',
  TECHNICIANS: 'smarthub_technicians',
  CUSTOMERS: 'smarthub_customers',
  PARTS: 'smarthub_spare_parts',
  FEEDBACK: 'smarthub_feedback',
  HISTORY: 'smarthub_repair_history',
};

// Seed dataset
const SEED_CUSTOMERS = [
  {
    id: 'cust-demo',
    user_id: 'customer-user-id',
    full_name: 'Customer Demo',
    email: 'customer@smarthub.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Avenue, Connaught Place, New Delhi',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'cust-1',
    user_id: 'cust-user-1',
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98111 22334',
    address: '14 Indiranagar, 100ft Road, Bengaluru',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    user_id: 'cust-user-2',
    full_name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98222 33445',
    address: 'B-702, Sea Breeze Apts, Bandra West, Mumbai',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    user_id: 'cust-user-3',
    full_name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    phone: '+91 98444 55667',
    address: 'Tower 4, Amanora Park Town, Hadapsar, Pune',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const SEED_TECHNICIANS = [
  {
    id: 'tech-1',
    user_id: 'tech-user-id',
    name: 'Vikram Singh',
    email: 'tech@smarthub.com',
    phone: '+91 98765 11223',
    specialization: 'Apple & Flagship Devices',
    experience: 6,
    availability: 'available',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'tech-2',
    user_id: 'tech-user-2',
    name: 'Rajesh Kumar',
    email: 'rajesh@smarthub.com',
    phone: '+91 98765 22334',
    specialization: 'Laptops & Motherboard Micro-soldering',
    experience: 8,
    availability: 'available',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'tech-3',
    user_id: 'tech-user-3',
    name: 'Amit Saxena',
    email: 'amit@smarthub.com',
    phone: '+91 98765 33445',
    specialization: 'Display, Audio & Gaming Consoles',
    experience: 4,
    availability: 'available',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const SEED_SERVICES = DEFAULT_SERVICES.map((s) => ({
  ...s,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
}));

const SEED_PARTS = [
  { id: 'part-1', part_name: 'iPhone 15 Pro OLED Display Assembly', category: 'Displays', quantity: 6, price: 6500, supplier: 'Apex Spares', min_stock: 3 },
  { id: 'part-2', part_name: 'MacBook Pro M2 Battery 58.2Wh', category: 'Batteries', quantity: 4, price: 4200, supplier: 'iFix Tech', min_stock: 2 },
  { id: 'part-3', part_name: 'Dell XPS 15 86Wh Genuine Battery', category: 'Batteries', quantity: 2, price: 2400, supplier: 'Dell OEM Distributor', min_stock: 3 },
  { id: 'part-4', part_name: 'Universal Type-C Fast Charging Port', category: 'Connectors', quantity: 18, price: 450, supplier: 'ElectroHub', min_stock: 5 },
  { id: 'part-5', part_name: 'Thermal Grizzly Kryonaut Paste (1g)', category: 'Consumables', quantity: 22, price: 650, supplier: 'Thermal Supplies', min_stock: 5 },
  { id: 'part-6', part_name: 'Samsung S24 Ultra Sapphire Lens Glass', category: 'Cameras', quantity: 5, price: 1200, supplier: 'Optics Direct', min_stock: 2 },
  { id: 'part-7', part_name: 'Crucial P3 1TB NVMe PCIe 4.0 SSD', category: 'Storage', quantity: 8, price: 4800, supplier: 'Micron Tech', min_stock: 3 },
  { id: 'part-8', part_name: '16GB DDR5 4800MHz SODIMM Laptop RAM', category: 'Memory', quantity: 7, price: 3100, supplier: 'Kingston Reps', min_stock: 3 },
];

const SEED_REPAIRS = [
  {
    id: 'rep-1',
    repair_id: 'SHR-2026-00101',
    customer_id: 'cust-1',
    service_id: 'srv-1',
    technician_id: 'tech-1',
    device_type: 'Mobile Phone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    serial_number: 'F2LDK928JN1',
    problem: 'Screen cracked after drop, touch response is lagging in lower half.',
    diagnosis: 'OLED digitizer cracked. Frame and chassis intact. Needs genuine screen replacement.',
    status: 'repair_in_progress',
    preferred_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    preferred_time: 'Morning (9 AM - 12 PM)',
    estimated_completion: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rep-2',
    repair_id: 'SHR-2026-00102',
    customer_id: 'cust-2',
    service_id: 'srv-2',
    technician_id: 'tech-2',
    device_type: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro M2 14"',
    serial_number: 'C02G8712MD6',
    problem: 'Coffee spill near trackpad, system does not boot up.',
    diagnosis: 'Corrosion detected on power rails. Cleaned with ultrasonic bath, replacing logic gate capacitors.',
    status: 'quality_check',
    preferred_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    preferred_time: 'Afternoon (12 PM - 4 PM)',
    estimated_completion: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rep-3',
    repair_id: 'SHR-2026-00103',
    customer_id: 'cust-demo',
    service_id: 'srv-2',
    technician_id: 'tech-2',
    device_type: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15 9520',
    serial_number: 'DLXPS827103',
    problem: 'Battery bulging, trackpad is stiff, battery drains within 25 minutes.',
    diagnosis: 'Battery cell degradation. Swapped with authentic Dell 86Wh battery, thermal repasting done.',
    status: 'ready_for_pickup',
    preferred_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    preferred_time: 'Evening (4 PM - 8 PM)',
    estimated_completion: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-4',
    repair_id: 'SHR-2026-00104',
    customer_id: 'cust-demo',
    service_id: 'srv-4',
    technician_id: 'tech-1',
    device_type: 'Tablet',
    brand: 'Apple',
    model: 'iPad Air 5th Gen',
    serial_number: 'DMQP91823KC',
    problem: 'USB-C charging port loose, charges only at specific angled bends.',
    diagnosis: 'Micro-pins inside connector were bent. Soldered replacement USB-C connector board.',
    status: 'completed',
    preferred_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    preferred_time: 'Morning (9 AM - 12 PM)',
    estimated_completion: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'rep-5',
    repair_id: 'SHR-2026-00105',
    customer_id: 'cust-3',
    service_id: 'srv-1',
    technician_id: 'tech-3',
    device_type: 'Mobile Phone',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    serial_number: 'SM928B10928',
    problem: 'Primary 200MP camera lens glass cracked.',
    diagnosis: 'Camera optical sensor verified clean. Outer sapphire glass replacement pending.',
    status: 'device_received',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: 'Afternoon (12 PM - 4 PM)',
    estimated_completion: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_INVOICES = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2026-5001',
    repair_id: 'rep-4',
    service_charge: 699,
    parts_cost: 900,
    labour_charge: 300,
    discount: 99,
    total_amount: 1800,
    payment_status: 'unpaid',
    payment_method: 'Razorpay',
    transaction_id: null,
    paid_at: null,
    invoice_date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2026-5002',
    repair_id: 'rep-3',
    service_charge: 799,
    parts_cost: 2400,
    labour_charge: 300,
    discount: 299,
    total_amount: 3200,
    payment_status: 'paid',
    payment_method: 'Razorpay',
    transaction_id: 'pay_ONv9823kL01',
    paid_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    invoice_date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2026-5003',
    repair_id: 'rep-1',
    service_charge: 499,
    parts_cost: 6500,
    labour_charge: 500,
    discount: 499,
    total_amount: 7000,
    payment_status: 'unpaid',
    payment_method: 'Razorpay',
    transaction_id: null,
    paid_at: null,
    invoice_date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_FEEDBACK = [
  {
    id: 'fb-1',
    customer_id: 'cust-demo',
    repair_id: 'rep-4',
    rating: 5,
    service_quality: 'Excellent',
    comments: 'Super quick turnaround on my iPad Air! Works like brand new now.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'fb-2',
    customer_id: 'cust-2',
    repair_id: 'rep-2',
    rating: 5,
    service_quality: 'Excellent',
    comments: 'Saved my MacBook after coffee spill. Incredible micro-soldering skill by Rajesh!',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fb-3',
    customer_id: 'cust-1',
    repair_id: 'rep-1',
    rating: 4,
    service_quality: 'Good',
    comments: 'Clean repair and transparent pricing. Highly recommended.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Helper to access LocalStorage safely
function getStorage(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch (e) {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// Initializer
export function initStore() {
  getStorage(KEYS.CUSTOMERS, SEED_CUSTOMERS);
  getStorage(KEYS.TECHNICIANS, SEED_TECHNICIANS);
  getStorage(KEYS.SERVICES, SEED_SERVICES);
  getStorage(KEYS.PARTS, SEED_PARTS);
  getStorage(KEYS.REPAIRS, SEED_REPAIRS);
  getStorage(KEYS.INVOICES, SEED_INVOICES);
  getStorage(KEYS.FEEDBACK, SEED_FEEDBACK);
}

// Enriched repair joiner for consistent frontend consumption
function enrichRepair(r) {
  if (!r) return null;
  const customers = getStorage(KEYS.CUSTOMERS, SEED_CUSTOMERS);
  const services = getStorage(KEYS.SERVICES, SEED_SERVICES);
  const technicians = getStorage(KEYS.TECHNICIANS, SEED_TECHNICIANS);

  const cust = customers.find((c) => c.id === r.customer_id) || r.customers || {
    full_name: 'Customer Demo',
    email: 'customer@smarthub.com',
    phone: '+91 98765 43210',
    address: 'Connaught Place, New Delhi',
  };

  const srv = services.find((s) => s.id === r.service_id) || r.services || {
    service_name: r.device_type ? `${r.device_type} Service` : 'Standard Repair',
  };

  const tech = technicians.find((t) => t.id === r.technician_id) || r.technicians || null;

  return {
    ...r,
    customers: cust,
    services: srv,
    technicians: tech,
  };
}

export const dataService = {
  // Test connection to Supabase
  async checkSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('repairs').select('id').limit(1);
      if (error) {
        return { isConnected: false, message: error.message };
      }
      return { isConnected: true, message: 'Connected to Supabase PostgreSQL' };
    } catch (e) {
      return { isConnected: false, message: e.message };
    }
  },

  // REPAIRS
  async getRepairs() {
    initStore();
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('*, customers(full_name, phone, email, address), services(service_name, price), technicians(name, specialization)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {}
    const local = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    return local.map(enrichRepair);
  },

  async getRepairById(idOrRepairId) {
    initStore();
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('*, customers(full_name, phone, email, address), services(service_name, price), technicians(name, specialization)')
        .or(`id.eq.${idOrRepairId},repair_id.eq.${idOrRepairId}`)
        .maybeSingle();
      if (!error && data) {
        return data;
      }
    } catch (e) {}

    const local = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    const found = local.find((r) => r.id === idOrRepairId || r.repair_id?.toUpperCase() === idOrRepairId?.toUpperCase());
    return enrichRepair(found);
  },

  async getRepairsByCustomer(userOrEmailOrCustId) {
    const all = await this.getRepairs();
    if (!userOrEmailOrCustId) return all;
    return all.filter((r) => {
      const cust = r.customers;
      return (
        r.customer_id === userOrEmailOrCustId ||
        cust?.id === userOrEmailOrCustId ||
        cust?.email?.toLowerCase() === userOrEmailOrCustId?.toLowerCase() ||
        cust?.user_id === userOrEmailOrCustId
      );
    });
  },

  async getRepairsByTechnician(techIdOrEmail) {
    const all = await this.getRepairs();
    if (!techIdOrEmail) return all;
    return all.filter((r) => {
      const tech = r.technicians;
      return (
        r.technician_id === techIdOrEmail ||
        tech?.id === techIdOrEmail ||
        tech?.email?.toLowerCase() === techIdOrEmail?.toLowerCase() ||
        tech?.user_id === techIdOrEmail ||
        techIdOrEmail === 'tech@smarthub.com' // Map default demo tech
      );
    });
  },

  async createRepair(repairData) {
    initStore();
    const repairId = repairData.repair_id || generateRepairId();
    const newRecord = {
      id: 'rep-' + Date.now(),
      ...repairData,
      repair_id: repairId,
      status: repairData.status || 'request_received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase insert
    try {
      const { data, error } = await supabase.from('repairs').insert(newRecord).select().maybeSingle();
      if (!error && data) {
        newRecord.id = data.id;
      }
    } catch (e) {}

    // Save locally
    const current = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    const updated = [newRecord, ...current];
    setStorage(KEYS.REPAIRS, updated);

    return enrichRepair(newRecord);
  },

  async updateRepair(id, updates) {
    initStore();
    try {
      await supabase.from('repairs').update(updates).eq('id', id);
    } catch (e) {}

    const current = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    const index = current.findIndex((r) => r.id === id || r.repair_id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updated_at: new Date().toISOString() };
      setStorage(KEYS.REPAIRS, current);
      return enrichRepair(current[index]);
    }
    return null;
  },

  async deleteRepair(id) {
    initStore();
    try {
      await supabase.from('repairs').delete().eq('id', id);
    } catch (e) {}

    const current = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    const filtered = current.filter((r) => r.id !== id && r.repair_id !== id);
    setStorage(KEYS.REPAIRS, filtered);
  },

  // INVOICES
  async getInvoices() {
    initStore();
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, repairs(repair_id, device_type, brand, model, customer_id, customers(full_name, email, phone))')
        .order('invoice_date', { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {}

    const localInvs = getStorage(KEYS.INVOICES, SEED_INVOICES);
    const localReps = await this.getRepairs();

    return localInvs.map((inv) => {
      const rep = localReps.find((r) => r.id === inv.repair_id || r.repair_id === inv.repair_id);
      return {
        ...inv,
        repairs: rep || null,
        repair: rep || null,
      };
    });
  },

  async getInvoiceByRepairId(repairId) {
    const all = await this.getInvoices();
    return (
      all.find(
        (i) =>
          i.repair_id === repairId ||
          i.repairs?.repair_id === repairId ||
          i.repairs?.id === repairId
      ) || null
    );
  },

  async createInvoice(invoiceData) {
    initStore();
    const invNumber = invoiceData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = {
      id: 'inv-' + Date.now(),
      ...invoiceData,
      invoice_number: invNumber,
      payment_status: invoiceData.payment_status || 'unpaid',
      payment_method: invoiceData.payment_method || 'Razorpay',
      invoice_date: new Date().toISOString(),
    };

    try {
      await supabase.from('invoices').insert(newInv);
    } catch (e) {}

    const current = getStorage(KEYS.INVOICES, SEED_INVOICES);
    setStorage(KEYS.INVOICES, [newInv, ...current]);
    return newInv;
  },

  async updateInvoice(id, updates) {
    initStore();
    try {
      await supabase.from('invoices').update(updates).eq('id', id);
    } catch (e) {}

    const current = getStorage(KEYS.INVOICES, SEED_INVOICES);
    const idx = current.findIndex((i) => i.id === id || i.invoice_number === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setStorage(KEYS.INVOICES, current);
      return current[idx];
    }
    return null;
  },

  async markInvoicePaid(idOrNumber, razorpayResponse = {}) {
    const updates = {
      payment_status: 'paid',
      payment_method: 'Razorpay',
      transaction_id: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
      paid_at: new Date().toISOString(),
    };
    return this.updateInvoice(idOrNumber, updates);
  },

  // SERVICES
  async getServices() {
    initStore();
    try {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    return getStorage(KEYS.SERVICES, SEED_SERVICES);
  },

  async saveService(serviceData) {
    initStore();
    const current = getStorage(KEYS.SERVICES, SEED_SERVICES);
    if (serviceData.id && current.some((s) => s.id === serviceData.id)) {
      try {
        await supabase.from('services').update(serviceData).eq('id', serviceData.id);
      } catch (e) {}
      const updated = current.map((s) => (s.id === serviceData.id ? { ...s, ...serviceData } : s));
      setStorage(KEYS.SERVICES, updated);
      return serviceData;
    } else {
      const newService = {
        id: 'srv-' + Date.now(),
        ...serviceData,
        created_at: new Date().toISOString(),
      };
      try {
        await supabase.from('services').insert(newService);
      } catch (e) {}
      setStorage(KEYS.SERVICES, [newService, ...current]);
      return newService;
    }
  },

  async deleteService(id) {
    initStore();
    try {
      await supabase.from('services').delete().eq('id', id);
    } catch (e) {}
    const current = getStorage(KEYS.SERVICES, SEED_SERVICES);
    setStorage(KEYS.SERVICES, current.filter((s) => s.id !== id));
  },

  // TECHNICIANS
  async getTechnicians() {
    initStore();
    try {
      const { data, error } = await supabase.from('technicians').select('*, repairs(id)').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    const local = getStorage(KEYS.TECHNICIANS, SEED_TECHNICIANS);
    const repairs = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    return local.map((t) => ({
      ...t,
      repairs: repairs.filter((r) => r.technician_id === t.id),
    }));
  },

  async saveTechnician(techData) {
    initStore();
    const current = getStorage(KEYS.TECHNICIANS, SEED_TECHNICIANS);
    if (techData.id && current.some((t) => t.id === techData.id)) {
      try {
        await supabase.from('technicians').update(techData).eq('id', techData.id);
      } catch (e) {}
      const updated = current.map((t) => (t.id === techData.id ? { ...t, ...techData } : t));
      setStorage(KEYS.TECHNICIANS, updated);
      return techData;
    } else {
      const newTech = {
        id: 'tech-' + Date.now(),
        ...techData,
        created_at: new Date().toISOString(),
      };
      try {
        await supabase.from('technicians').insert(newTech);
      } catch (e) {}
      setStorage(KEYS.TECHNICIANS, [newTech, ...current]);
      return newTech;
    }
  },

  async deleteTechnician(id) {
    initStore();
    try {
      await supabase.from('technicians').delete().eq('id', id);
    } catch (e) {}
    const current = getStorage(KEYS.TECHNICIANS, SEED_TECHNICIANS);
    setStorage(KEYS.TECHNICIANS, current.filter((t) => t.id !== id));
  },

  // CUSTOMERS
  async getCustomers() {
    initStore();
    try {
      const { data, error } = await supabase.from('customers').select('*, repairs(id)').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    const local = getStorage(KEYS.CUSTOMERS, SEED_CUSTOMERS);
    const repairs = getStorage(KEYS.REPAIRS, SEED_REPAIRS);
    return local.map((c) => ({
      ...c,
      repairs: repairs.filter((r) => r.customer_id === c.id),
    }));
  },

  async saveCustomer(custData) {
    initStore();
    const current = getStorage(KEYS.CUSTOMERS, SEED_CUSTOMERS);
    if (custData.id && current.some((c) => c.id === custData.id)) {
      try {
        await supabase.from('customers').update(custData).eq('id', custData.id);
      } catch (e) {}
      const updated = current.map((c) => (c.id === custData.id ? { ...c, ...custData } : c));
      setStorage(KEYS.CUSTOMERS, updated);
      return custData;
    } else {
      const newCust = {
        id: 'cust-' + Date.now(),
        ...custData,
        created_at: new Date().toISOString(),
      };
      try {
        await supabase.from('customers').insert(newCust);
      } catch (e) {}
      setStorage(KEYS.CUSTOMERS, [newCust, ...current]);
      return newCust;
    }
  },

  async deleteCustomer(id) {
    initStore();
    try {
      await supabase.from('customers').delete().eq('id', id);
    } catch (e) {}
    const current = getStorage(KEYS.CUSTOMERS, SEED_CUSTOMERS);
    setStorage(KEYS.CUSTOMERS, current.filter((c) => c.id !== id));
  },

  // SPARE PARTS
  async getSpareParts() {
    initStore();
    try {
      const { data, error } = await supabase.from('spare_parts').select('*').order('part_name');
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    return getStorage(KEYS.PARTS, SEED_PARTS);
  },

  async saveSparePart(partData) {
    initStore();
    const current = getStorage(KEYS.PARTS, SEED_PARTS);
    if (partData.id && current.some((p) => p.id === partData.id)) {
      try {
        await supabase.from('spare_parts').update(partData).eq('id', partData.id);
      } catch (e) {}
      const updated = current.map((p) => (p.id === partData.id ? { ...p, ...partData } : p));
      setStorage(KEYS.PARTS, updated);
      return partData;
    } else {
      const newPart = {
        id: 'part-' + Date.now(),
        ...partData,
        created_at: new Date().toISOString(),
      };
      try {
        await supabase.from('spare_parts').insert(newPart);
      } catch (e) {}
      setStorage(KEYS.PARTS, [newPart, ...current]);
      return newPart;
    }
  },

  async deleteSparePart(id) {
    initStore();
    try {
      await supabase.from('spare_parts').delete().eq('id', id);
    } catch (e) {}
    const current = getStorage(KEYS.PARTS, SEED_PARTS);
    setStorage(KEYS.PARTS, current.filter((p) => p.id !== id));
  },

  // FEEDBACK
  async getFeedback() {
    initStore();
    try {
      const { data, error } = await supabase.from('feedback').select('*, customers(full_name), repairs(repair_id)').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
    return getStorage(KEYS.FEEDBACK, SEED_FEEDBACK);
  },

  async createFeedback(fbData) {
    initStore();
    const newFb = {
      id: 'fb-' + Date.now(),
      ...fbData,
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from('feedback').insert(newFb);
    } catch (e) {}
    const current = getStorage(KEYS.FEEDBACK, SEED_FEEDBACK);
    setStorage(KEYS.FEEDBACK, [newFb, ...current]);
    return newFb;
  },

  // REPAIR HISTORY
  async getRepairHistory(repairId) {
    try {
      const { data } = await supabase.from('repair_history').select('*').eq('repair_id', repairId).order('created_at', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (e) {}

    // Mock history from repair created date to current status
    return [
      {
        id: 'hist-1',
        repair_id: repairId,
        status: 'request_received',
        notes: 'Repair booking placed online and received by service hub.',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'hist-2',
        repair_id: repairId,
        status: 'device_received',
        notes: 'Device checked in at reception, physical inspection completed.',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
  },

  async addRepairHistory(repairId, status, notes = '', updatedBy = null) {
    const entry = {
      id: 'hist-' + Date.now(),
      repair_id: repairId,
      status,
      notes,
      updated_by: updatedBy,
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from('repair_history').insert(entry);
    } catch (e) {}
    return entry;
  },
};
