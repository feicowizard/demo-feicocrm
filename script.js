const products = [
  { sku: 'SP-450W', name: 'Solar Panel 450W', cost: 4200, unit: 'แผง' },
  { sku: 'SP-550W', name: 'Solar Panel 550W', cost: 5100, unit: 'แผง' },
  { sku: 'INV-5KW', name: 'Inverter 5kW', cost: 18500, unit: 'ตัว' },
  { sku: 'INV-10KW', name: 'Inverter 10kW', cost: 32000, unit: 'ตัว' },
  { sku: 'BAT-5KWH', name: 'Battery 5kWh', cost: 45000, unit: 'ลูก' },
  { sku: 'MNT-ROOF', name: 'Mounting Kit Roof', cost: 3500, unit: 'ชุด' },
  { sku: 'CBL-6MM', name: 'Solar Cable 6mm (100m)', cost: 2800, unit: 'ม้วน' }
];

const commissionRate = 0.15;
const minGP = 10;

function showPage(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if(event && event.target) event.target.classList.add('active');
  
  const titles = {
    dashboard: 'Dashboard', kanban: 'Sales Pipeline', deals: 'Deals', customers: 'Customers',
    pricebook: 'Pricebook & Calculator', inventory: 'Inventory', purchasing: 'Purchase Orders',
    marketing: 'Marketing Campaigns', support: 'Support Tickets', calendar: 'Calendar',
    activity: 'Activity Feed', peak: 'Peak Accounting Sync'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  
  const content = {
    dashboard: `
      <div class="cards">
        <div class="card"><h3>Total Pipeline</h3><div class="value">฿18.9M</div><div class="sub">23 active deals</div></div>
        <div class="card"><h3>Closed Won (MTD)</h3><div class="value">฿11.8M</div><div class="sub">↑ 12% vs last month</div></div>
        <div class="card"><h3>Avg Deal Size</h3><div class="value">฿520K</div><div class="sub">฿485K last month</div></div>
        <div class="card"><h3>My Commission (MTD)</h3><div class="value">฿45,200</div><div class="sub">from 8 closed deals</div></div>
      </div>
      <div class="table-container">
        <h3 style="margin-bottom:15px;">Recent Deals</h3>
        <table>
          <tr><th>Company</th><th>Value</th><th>GP%</th><th>Commission</th><th>Status</th></tr>
          <tr><td>Thai Solar Co.</td><td>฿1,250,000</td><td>18.5%</td><td>฿34,687</td><td><span class="status won">Won</span></td></tr>
          <tr><td>Green Power Ltd.</td><td>฿890,000</td><td>15.2%</td><td>฿20,292</td><td><span class="status progress">Negotiation</span></td></tr>
          <tr><td>Eco Factory</td><td>฿2,100,000</td><td>12.8%</td><td>฿40,320</td><td><span class="status progress">Quotation</span></td></tr>
        </table>
      </div>`,
      
    pricebook: `
      <div class="search-box">
        <input type="text" placeholder="🔍 Search product..." id="searchProduct" onkeyup="filterProducts()">
        <button class="btn btn-primary" onclick="openCalculator()">🧮 Price Calculator</button>
      </div>
      <div class="table-container">
        <table id="productTable">
          <tr><th>SKU</th><th>Product Name</th><th>Unit Cost</th><th>Unit</th><th>Min Sell (10% GP)</th><th>Action</th></tr>
          ${products.map(p => `
            <tr>
              <td>${p.sku}</td>
              <td>${p.name}</td>
              <td>฿${p.cost.toLocaleString()}</td>
              <td>${p.unit}</td>
              <td>฿${Math.ceil(p.cost/0.9).toLocaleString()}</td>
              <td><button class="btn btn-primary" onclick="calcProduct('${p.sku}')">Calculate</button></td>
            </tr>
          `).join('')}
        </table>
      </div>`,
      
    kanban: `
      <div class="kanban">
        <div class="kanban-col"><h4>CONTACTED (3)</h4>
          <div class="kanban-card" onclick="openDeal(1)"><h5>ABC Solar</h5><p>฿450,000 • 2 days ago</p></div>
          <div class="kanban-card"><h5>XYZ Energy</h5><p>฿320,000 • 5 days ago</p></div>
          <div class="kanban-card"><h5>Power Plus</h5><p>฿180,000 • 1 week ago</p></div>
        </div>
        <div class="kanban-col"><h4>QUOTATION (4)</h4>
          <div class="kanban-card"><h5>Eco Factory</h5><p>฿2,100,000 • Sent 3 days ago</p></div>
          <div class="kanban-card"><h5>Smart Building</h5><p>฿890,000 • Sent yesterday</p></div>
          <div class="kanban-card"><h5>Green Mall</h5><p>฿1,500,000 • Sent today</p></div>
        </div>
        <div class="kanban-col"><h4>NEGOTIATION (2)</h4>
          <div class="kanban-card"><h5>Green Power Ltd.</h5><p>฿890,000 • Counter offer</p></div>
          <div class="kanban-card"><h5>Bright Future</h5><p>฿650,000 • Final review</p></div>
        </div>
        <div class="kanban-col"><h4>WON (5)</h4>
          <div class="kanban-card"><h5>Thai Solar Co.</h5><p>฿1,250,000 • Closed today</p></div>
          <div class="kanban-card"><h5>Clean Energy</h5><p>฿780,000 • Closed 2 days ago</p></div>
        </div>
      </div>`,
      
    deals: `
      <div class="search-box"><input type="text" placeholder="🔍 Search deals..."><button class="btn btn-primary">+ New Deal</button></div>
      <div class="table-container">
        <table>
          <tr><th>Deal Name</th><th>Company</th><th>Value</th><th>GP%</th><th>Stage</th><th>Owner</th></tr>
          <tr onclick="openDeal(1)" style="cursor:pointer"><td>Solar Rooftop Project</td><td>Thai Solar Co.</td><td>฿1,250,000</td><td>18.5%</td><td><span class="status won">Won</span></td><td>Somchai</td></tr>
          <tr><td>Factory Installation</td><td>Eco Factory</td><td>฿2,100,000</td><td>12.8%</td><td><span class="status progress">Quotation</span></td><td>Somchai</td></tr>
          <tr><td>Office Building</td><td>Green Power Ltd.</td><td>฿890,000</td><td>15.2%</td><td><span class="status progress">Negotiation</span></td><td>Nattapong</td></tr>
        </table>
      </div>`,
      
    customers: `
      <div class="search-box"><input type="text" placeholder="🔍 Search customers..."><button class="btn btn-primary">+ New Customer</button></div>
      <div class="table-container">
        <table>
          <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Total Deals</th><th>Lifetime Value</th></tr>
          <tr><td>Thai Solar Co.</td><td>คุณสมชาย</td><td>081-234-5678</td><td>3</td><td>฿3,450,000</td></tr>
          <tr><td>Green Power Ltd.</td><td>คุณวิภา</td><td>089-876-5432</td><td>2</td><td>฿1,670,000</td></tr>
          <tr><td>Eco Factory</td><td>คุณประยุทธ์</td><td>062-111-2222</td><td>1</td><td>฿2,100,000</td></tr>
        </table>
      </div>`,
      
    inventory: `
      <div class="cards">
        <div class="card"><h3>Total SKUs</h3><div class="value">48</div></div>
        <div class="card"><h3>Stock Value</h3><div class="value">฿45.2M</div></div>
        <div class="card"><h3>Low Stock Items</h3><div class="value" style="color:#fbbf24">7</div></div>
        <div class="card"><h3>Pending Delivery</h3><div class="value">12</div></div>
      </div>
      <div class="table-container">
        <table>
          <tr><th>SKU</th><th>Product</th><th>Warehouse</th><th>Qty</th><th>Reserved</th><th>Available</th><th>Status</th></tr>
          <tr><td>SP-450W</td><td>Solar Panel 450W</td><td>BKK Main</td><td>250</td><td>45</td><td>205</td><td><span class="status won">OK</span></td></tr>
          <tr><td>SP-550W</td><td>Solar Panel 550W</td><td>BKK Main</td><td>15</td><td>10</td><td>5</td><td><span class="status progress">Low</span></td></tr>
          <tr><td>INV-10KW</td><td>Inverter 10kW</td><td>Rayong</td><td>8</td><td>3</td><td>5</td><td><span class="status won">OK</span></td></tr>
        </table>
      </div>`,
      
    purchasing: `
      <div class="cards">
        <div class="card"><h3>Pending POs</h3><div class="value">12</div></div>
        <div class="card"><h3>Total Value</h3><div class="value">฿8.5M</div></div>
        <div class="card"><h3>Awaiting Delivery</h3><div class="value">5</div></div>
        <div class="card"><h3>This Month</h3><div class="value">฿12.3M</div></div>
      </div>
      <div class="table-container">
        <table>
          <tr><th>PO Number</th><th>Supplier</th><th>Items</th><th>Total</th><th>ETA</th><th>Status</th></tr>
          <tr><td>PO-2024-089</td><td>Jinko Solar</td><td>Solar Panel 450W x 500</td><td>฿2,100,000</td><td>15 Feb 2024</td><td><span class="status progress">In Transit</span></td></tr>
          <tr><td>PO-2024-088</td><td>Growatt</td><td>Inverter 10kW x 20</td><td>฿640,000</td><td>20 Feb 2024</td><td><span class="status new">Confirmed</span></td></tr>
        </table>
      </div>`,
      
    marketing: `
      <div class="cards">
        <div class="card"><h3>Active Campaigns</h3><div class="value">4</div></div>
        <div class="card"><h3>Total Leads</h3><div class="value">156</div></div>
        <div class="card"><h3>Conversion Rate</h3><div class="value">12.8%</div></div>
        <div class="card"><h3>Cost per Lead</h3><div class="value">฿245</div></div>
      </div>
      <div class="table-container">
        <table>
          <tr><th>Campaign</th><th>Channel</th><th>Budget</th><th>Spent</th><th>Leads</th><th>Status</th></tr>
          <tr><td>Solar Rooftop 2024</td><td>Facebook Ads</td><td>฿50,000</td><td>฿32,500</td><td>89</td><td><span class="status won">Active</span></td></tr>
          <tr><td>Industrial Solar</td><td>Google Ads</td><td>฿80,000</td><td>฿45,200</td><td>45</td><td><span class="status won">Active</span></td></tr>
        </table>
      </div>`,
      
    support: `
      <div class="cards">
        <div class="card"><h3>Open Tickets</h3><div class="value">8</div></div>
        <div class="card"><h3>Avg Response</h3><div class="value">2.5h</div></div>
        <div class="card"><h3>Resolved (MTD)</h3><div class="value">45</div></div>
        <div class="card"><h3>CSAT Score</h3><div class="value">4.6/5</div></div>
      </div>
      <div class="table-container">
        <table>
          <tr><th>Ticket ID</th><th>Customer</th><th>Subject</th><th>Priority</th><th>Status</th></tr>
          <tr><td>#1089</td><td>Thai Solar Co.</td><td>Inverter error E-05</td><td><span class="status" style="background:#7f1d1d">High</span></td><td><span class="status progress">In Progress</span></td></tr>
          <tr><td>#1088</td><td>Green Power</td><td>Warranty claim</td><td><span class="status progress">Medium</span></td><td><span class="status new">Open</span></td></tr>
        </table>
      </div>`,
      
    calendar: `
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <h3>February 2024</h3>
        <div><button class="btn btn-secondary">Sync Google Calendar</button> <button class="btn btn-primary">+ New Event</button></div>
      </div>
      <div class="calendar-grid">
        <div class="cal-header">Sun</div><div class="cal-header">Mon</div><div class="cal-header">Tue</div><div class="cal-header">Wed</div><div class="cal-header">Thu</div><div class="cal-header">Fri</div><div class="cal-header">Sat</div>
        <div class="cal-day"></div><div class="cal-day"></div><div class="cal-day"></div><div class="cal-day"></div><div class="cal-day">1</div><div class="cal-day">2</div><div class="cal-day">3</div>
        <div class="cal-day">4</div><div class="cal-day">5<div class="cal-event">Meeting: Thai Solar</div></div><div class="cal-day">6</div><div class="cal-day">7</div><div class="cal-day today">8<div class="cal-event">Site Visit</div></div><div class="cal-day">9</div><div class="cal-day">10</div>
      </div>`,
      
    activity: `
      <div class="table-container">
        <div class="activity-item"><div class="activity-icon">💰</div><div class="activity-content"><h5>Deal Won: Thai Solar Co.</h5><p>฿1,250,000 - Commission: ฿34,687</p></div><div class="activity-time">2 hours ago</div></div>
        <div class="activity-item"><div class="activity-icon">📧</div><div class="activity-content"><h5>Quote sent to Eco Factory</h5><p>฿2,100,000</p></div><div class="activity-time">5 hours ago</div></div>
        <div class="activity-item"><div class="activity-icon">📞</div><div class="activity-content"><h5>Call logged: Green Power</h5><p>Discussed pricing</p></div><div class="activity-time">Yesterday</div></div>
        <div class="activity-item"><div class="activity-icon">🔗</div><div class="activity-content"><h5>Peak Sync completed</h5><p>15 invoices synced</p></div><div class="activity-time">2 days ago</div></div>
      </div>`,
      
    peak: `
      <div class="sync-status"><div class="sync-dot connected"></div><div><strong>Connected to Peak</strong><br><span style="font-size:12px;color:#888">Last sync: 10 mins ago</span></div><button class="btn btn-secondary" style="margin-left:auto">Sync Now</button></div>
      <div class="cards">
        <div class="card"><h3>Pending Invoices</h3><div class="value">8</div></div>
        <div class="card"><h3>Synced Today</h3><div class="value">15</div></div>
        <div class="card"><h3>Failed</h3><div class="value" style="color:#ef4444">2</div></div>
        <div class="card"><h3>Total Synced</h3><div class="value">1,245</div></div>
      </div>
      <div class="table-container">
        <table>
          <tr><th>Document</th><th>Type</th><th>Amount</th><th>Peak Ref</th><th>Status</th></tr>
          <tr><td>INV-2024-156</td><td>Invoice</td><td>฿1,250,000</td><td>PK-89012</td><td><span class="status won">Synced</span></td></tr>
          <tr><td>INV-2024-155</td><td>Invoice</td><td>฿450,000</td><td>-</td><td><span class="status" style="background:#7f1d1d">Failed</span></td></tr>
        </table>
      </div>`
  };
  
  document.getElementById('mainContent').innerHTML = content[page] || '<p>Page not found</p>';
}

function calcProduct(sku) {
  const product = products.find(p => p.sku === sku);
  if (!product) return;
  
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">💰 Price Calculator</h2>
    <div class="form-group"><label>Product</label><input value="${product.name} (${product.sku})" disabled></div>
    <div class="form-group"><label>Unit Cost (ต้นทุน)</label><input value="฿${product.cost.toLocaleString()}" disabled id="costInput" data-cost="${product.cost}"></div>
    <div class="form-group"><label>Quantity (จำนวน)</label><input type="number" id="qtyInput" value="1" min="1" onchange="updateCalc()"></div>
    <div class="form-group"><label>Selling Price per Unit (ราคาขาย/หน่วย)</label><input type="number" id="sellInput" placeholder="กรอกราคาขาย..." onkeyup="updateCalc()"></div>
    <div class="calc-result" id="calcResult"><p style="color:#888;text-align:center;">กรอกราคาขายเพื่อคำนวณ</p></div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function updateCalc() {
  const cost = parseFloat(document.getElementById('costInput').dataset.cost);
  const qty = parseInt(document.getElementById('qtyInput').value) || 1;
  const sell = parseFloat(document.getElementById('sellInput').value) || 0;
  
  if (sell <= 0) {
    document.getElementById('calcResult').innerHTML = '<p style="color:#888;text-align:center;">กรอกราคาขายเพื่อคำนวณ</p>';
    return;
  }
  
  const totalCost = cost * qty;
  const totalSell = sell * qty;
  const gp = totalSell - totalCost;
  const gpPercent = (gp / totalSell) * 100;
  const commission = gp * commissionRate;
  
  let gpClass = 'positive';
  let warning = '';
  if (gpPercent < minGP) {
    gpClass = 'danger';
    warning = '<div style="background:#7f1d1d;padding:10px;border-radius:6px;margin-bottom:15px;font-size:12px;">⚠️ GP ต่ำกว่า 10% - ต้องขออนุมัติราคาพิเศษ</div>';
  } else if (gpPercent < 15) {
    gpClass = 'warning';
  }
  
  document.getElementById('calcResult').innerHTML = `
    ${warning}
    <div class="calc-row"><span class="calc-label">Total Cost</span><span class="calc-value">฿${totalCost.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">Total Sell</span><span class="calc-value">฿${totalSell.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">Gross Profit</span><span class="calc-value ${gpClass}">฿${gp.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">GP %</span><span class="calc-value ${gpClass}">${gpPercent.toFixed(1)}%</span></div>
    <div class="commission-highlight"><p>Your Commission (15% of GP)</p><h3>฿${Math.round(commission).toLocaleString()}</h3></div>
  `;
}

function openCalculator() {
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">🧮 Quick Calculator</h2>
    <div class="form-group"><label>Select Product</label>
      <select id="productSelect" onchange="if(this.value)calcProduct(this.value)">
        <option value="">-- เลือกสินค้า --</option>
        ${products.map(p => `<option value="${p.sku}">${p.name} - ฿${p.cost.toLocaleString()}</option>`).join('')}
      </select>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function openDeal(id) {
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">Deal: Thai Solar Co.</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
      <div class="form-group"><label>Company</label><input value="Thai Solar Co." disabled></div>
      <div class="form-group"><label>Contact</label><input value="คุณสมชาย" disabled></div>
      <div class="form-group"><label>Deal Value</label><input value="฿1,250,000" disabled></div>
      <div class="form-group"><label>GP%</label><input value="18.5%" disabled></div>
    </div>
    <div class="calc-result">
      <div class="calc-row"><span class="calc-label">Gross Profit</span><span class="calc-value positive">฿231,250</span></div>
      <div class="calc-row"><span class="calc-label">GP%</span><span class="calc-value positive">18.5%</span></div>
    </div>
    <div class="commission-highlight"><p>Your Commission</p><h3>฿34,687</h3></div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function filterProducts() {
  const search = document.getElementById('searchProduct').value.toLowerCase();
  document.querySelectorAll('#productTable tr').forEach((row, i) => {
    if (i === 0) return;
    row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
  });
}

function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

showPage('dashboard');
