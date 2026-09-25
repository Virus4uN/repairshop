const { createClient } = require('@supabase/supabase-js');

const url = 'https://ojuqqaglqtcfpdprclgm.supabase.co';
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdXFxYWdscXRjZnBkcHJjbGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA1NTk0MSwiZXhwIjoyMTA1NjMxOTQxfQ.9jA0zyP5taqvla8W563_STWNThksgjNtzXLBjXc1xNI';

const supabase = createClient(url, serviceKey);

async function seed() {
  console.log('--- SEEDING SUPABASE CLOUD DATABASE ---');

  // 1. Technicians
  const techsToUpsert = [
    {
      name: 'Vikram Singh',
      email: 'tech@smarthub.com',
      phone: '+91 98765 11223',
      specialization: 'Apple & Flagship Devices',
      experience: 6,
      availability: 'available',
    },
    {
      name: 'Rajesh Kumar',
      email: 'rajesh@smarthub.com',
      phone: '+91 98765 22334',
      specialization: 'Laptops & Motherboard Micro-soldering',
      experience: 8,
      availability: 'available',
    },
    {
      name: 'Amit Saxena',
      email: 'amit@smarthub.com',
      phone: '+91 98765 33445',
      specialization: 'Display, Audio & Gaming Consoles',
      experience: 4,
      availability: 'available',
    },
  ];

  for (const t of techsToUpsert) {
    const { data: exist } = await supabase.from('technicians').select('id').eq('email', t.email).maybeSingle();
    if (!exist) {
      await supabase.from('technicians').insert(t);
    }
  }
  const { data: allTechs } = await supabase.from('technicians').select('*');
  console.log('Technicians in DB:', allTechs.length);

  // 2. Customers
  const custsToUpsert = [
    {
      full_name: 'Customer Demo',
      email: 'customer@smarthub.com',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Avenue, Connaught Place, New Delhi',
    },
    {
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98111 22334',
      address: '14 Indiranagar, 100ft Road, Bengaluru',
    },
    {
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 98222 33445',
      address: 'B-702, Sea Breeze Apts, Bandra West, Mumbai',
    },
  ];

  for (const c of custsToUpsert) {
    const { data: exist } = await supabase.from('customers').select('id').eq('email', c.email).maybeSingle();
    if (!exist) {
      await supabase.from('customers').insert(c);
    }
  }
  const { data: allCusts } = await supabase.from('customers').select('*');
  console.log('Customers in DB:', allCusts.length);

  const demoCust = allCusts.find((c) => c.email === 'customer@smarthub.com') || allCusts[0];
  const savanCust = allCusts.find((c) => c.email === 'patelmohan2827217@gmail.com') || demoCust;
  const princeCust = allCusts.find((c) => c.email === 'opsavan30@gmail.com') || demoCust;
  const tech1 = allTechs[0];
  const tech2 = allTechs[1] || tech1;

  const { data: services } = await supabase.from('services').select('*');
  const srv1 = services[0];
  const srv2 = services[1] || srv1;

  // 3. Repairs
  const repairsToInsert = [
    {
      repair_id: 'SHR-2026-00101',
      customer_id: savanCust.id,
      service_id: srv1?.id || null,
      technician_id: tech1?.id || null,
      device_type: 'Mobile Phone',
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      serial_number: 'F2LDK928JN1',
      problem: 'Display cracked after accidental drop, touch responding erratically.',
      diagnosis: 'OLED assembly damaged. Replacing with OEM Super Retina XDR display.',
      status: 'repair_in_progress',
      estimated_completion: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    },
    {
      repair_id: 'SHR-2026-00102',
      customer_id: demoCust.id,
      service_id: srv2?.id || null,
      technician_id: tech2?.id || null,
      device_type: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Pro M2 14"',
      serial_number: 'C02G8712MD6',
      problem: 'Coffee spill near trackpad, system shutting down under heavy load.',
      diagnosis: 'Liquid residue on power rail. Ultrasonic cleaned and power capacitors replaced.',
      status: 'quality_check',
      estimated_completion: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    },
    {
      repair_id: 'SHR-2026-00103',
      customer_id: demoCust.id,
      service_id: srv2?.id || null,
      technician_id: tech2?.id || null,
      device_type: 'Laptop',
      brand: 'Dell',
      model: 'XPS 15 9520',
      serial_number: 'DLXPS827103',
      problem: 'Battery bulging, trackpad is stiff, drains within 25 minutes.',
      diagnosis: 'Battery cell degradation. Swapped with authentic Dell 86Wh battery.',
      status: 'ready_for_pickup',
      estimated_completion: new Date().toISOString().split('T')[0],
    },
    {
      repair_id: 'SHR-2026-00104',
      customer_id: princeCust.id,
      service_id: srv1?.id || null,
      technician_id: tech1?.id || null,
      device_type: 'Mobile Phone',
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      serial_number: 'SM928B10928',
      problem: 'Primary 200MP camera lens glass cracked, blurry focus in daylight.',
      diagnosis: 'Outer sapphire lens replaced. Focus calibration verified.',
      status: 'ready_for_pickup',
      estimated_completion: new Date().toISOString().split('T')[0],
    },
  ];

  for (const r of repairsToInsert) {
    const { data: exist } = await supabase.from('repairs').select('id').eq('repair_id', r.repair_id).maybeSingle();
    if (!exist) {
      await supabase.from('repairs').insert(r);
      console.log('Inserted repair:', r.repair_id);
    }
  }
  const { data: allRepairs } = await supabase.from('repairs').select('*');
  console.log('Repairs in DB:', allRepairs.length);

  // 4. Invoices
  const r1 = allRepairs.find((r) => r.repair_id === 'SHR-2026-00101') || allRepairs[0];
  const r2 = allRepairs.find((r) => r.repair_id === 'SHR-2026-00102') || allRepairs[1];
  const r3 = allRepairs.find((r) => r.repair_id === 'SHR-2026-00103') || allRepairs[2];
  const r4 = allRepairs.find((r) => r.repair_id === 'SHR-2026-00104') || allRepairs[3];

  const invoicesToInsert = [
    {
      invoice_number: 'INV-2026-5001',
      repair_id: r1.id,
      service_charge: 699,
      parts_cost: 900,
      labour_charge: 300,
      discount: 99,
      total_amount: 1800,
      payment_status: 'unpaid',
      payment_method: 'Razorpay',
    },
    {
      invoice_number: 'INV-2026-5002',
      repair_id: r2.id,
      service_charge: 799,
      parts_cost: 2400,
      labour_charge: 300,
      discount: 299,
      total_amount: 3200,
      payment_status: 'unpaid',
      payment_method: 'Razorpay',
    },
    {
      invoice_number: 'INV-2026-5003',
      repair_id: r3.id,
      service_charge: 499,
      parts_cost: 1200,
      labour_charge: 200,
      discount: 100,
      total_amount: 1799,
      payment_status: 'paid',
      payment_method: 'Razorpay',
      transaction_id: 'pay_TEST_982348',
      paid_at: new Date().toISOString(),
    },
    {
      invoice_number: 'INV-2026-5004',
      repair_id: r4.id,
      service_charge: 499,
      parts_cost: 800,
      labour_charge: 200,
      discount: 99,
      total_amount: 1400,
      payment_status: 'unpaid',
      payment_method: 'Razorpay',
    },
  ];

  for (const inv of invoicesToInsert) {
    const { data: exist } = await supabase.from('invoices').select('id').eq('invoice_number', inv.invoice_number).maybeSingle();
    if (!exist) {
      const { data, error } = await supabase.from('invoices').insert(inv).select();
      if (error) console.error('Invoice insert error:', error);
      else console.log('Inserted invoice:', inv.invoice_number);
    }
  }

  const { data: finalInvs } = await supabase.from('invoices').select('id, invoice_number, total_amount, payment_status');
  console.log('Final Invoices in DB:', finalInvs);
  console.log('--- SEEDING COMPLETE! ALL PHONES & DEVICES WILL NOW SEE LIVE DATA! ---');
}

seed();
