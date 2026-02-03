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

// ===== Mock Data for HR Module =====
const leaveRequests = [
  { id: 'LV-001', employee: 'สมชาย วงศ์ดี', type: 'ลาพักร้อน', from: '2024-02-12', to: '2024-02-14', days: 3, reason: 'พักผ่อนกับครอบครัว', status: 'Approved' },
  { id: 'LV-002', employee: 'นัทพงศ์ แก้วใส', type: 'ลาป่วย', from: '2024-02-08', to: '2024-02-08', days: 1, reason: 'ไม่สบาย มีไข้', status: 'Approved' },
  { id: 'LV-003', employee: 'วิภา สุขสมบูรณ์', type: 'ลากิจ', from: '2024-02-20', to: '2024-02-21', days: 2, reason: 'ธุระส่วนตัว', status: 'Pending' },
  { id: 'LV-004', employee: 'สมชาย วงศ์ดี', type: 'ลาป่วย', from: '2024-02-25', to: '2024-02-25', days: 1, reason: 'ปวดหัวมาก', status: 'Pending' }
];

const lateCheckins = [
  { date: '2024-02-07', employee: 'นัทพงศ์ แก้วใส', scheduled: '08:30', actual: '09:15', minutes: 45, reason: 'รถติด' },
  { date: '2024-02-05', employee: 'สมชาย วงศ์ดี', scheduled: '08:30', actual: '08:50', minutes: 20, reason: 'ฝนตกหนัก' },
  { date: '2024-02-03', employee: 'วิภา สุขสมบูรณ์', scheduled: '08:30', actual: '09:00', minutes: 30, reason: 'BTS ขัดข้อง' },
  { date: '2024-02-01', employee: 'นัทพงศ์ แก้วใส', scheduled: '08:30', actual: '09:30', minutes: 60, reason: 'นอนไม่หลับ' }
];

const announcements = [
  { id: 1, title: '🎉 ประกาศหยุดสงกรานต์ 2024', date: '2024-02-01', detail: 'บริษัทหยุดวันที่ 12-16 เมษายน 2567 รวม 5 วัน พนักงานที่ต้องปฏิบัติงานพิเศษจะได้ OT 2 เท่า' },
  { id: 2, title: '📋 อัปเดตนโยบาย Work From Home', date: '2024-01-25', detail: 'เริ่มตั้งแต่ 1 มีนาคม 2567 พนักงานสามารถ WFH ได้ 2 วัน/สัปดาห์ ต้องแจ้งหัวหน้าล่วงหน้า 1 วัน' },
  { id: 3, title: '🏆 กิจกรรม Team Building Q1', date: '2024-01-20', detail: 'จัดกิจกรรม Team Building วันที่ 15 มีนาคม 2567 ที่ เขาใหญ่ ออกเดินทาง 07:00 น. บริษัทออกค่าใช้จ่ายทั้งหมด' }
];

const companyPolicies = [
  { id: 1, title: '📅 นโยบายวันลา', detail: 'ลาพักร้อน 10 วัน/ปี, ลาป่วย 30 วัน/ปี (มีใบรับรองแพทย์หลัง 3 วัน), ลากิจ 5 วัน/ปี, ลาคลอด 98 วัน' },
  { id: 2, title: '⏰ เวลาทำงาน', detail: 'จันทร์-ศุกร์ 08:30-17:30 น. พักเที่ยง 12:00-13:00 น. สายเกิน 15 นาทีนับเป็นมาสาย สาย 3 ครั้ง/เดือน = หักเงิน 1 วัน' },
  { id: 3, title: '👔 Dress Code', detail: 'จันทร์-พฤหัส: ชุดสุภาพ, ศุกร์: Casual Friday, ห้ามสวมรองเท้าแตะและกางเกงขาสั้น ยกเว้นวัน Team Event' },
  { id: 4, title: '💰 สวัสดิการ', detail: 'ประกันสังคม, ประกันสุขภาพกลุ่ม, กองทุนสำรองเลี้ยงชีพ 3-5%, ค่าโทรศัพท์ 500 บาท/เดือน, ค่าน้ำมัน (เฉพาะ Sales)' }
];

// ===== Mock Data for Approvals =====
const approvalItems = [
  { id: 'APR-001', type: 'special-price', title: 'ขออนุมัติราคาพิเศษ - Green Mall', requestor: 'สมชาย วงศ์ดี', date: '2024-02-07', detail: 'Solar Panel 450W x 200 แผง ราคา ฿4,300/แผง (GP 2.3%)', status: 'Pending' },
  { id: 'APR-002', type: 'leave', title: 'ขอลากิจ - วิภา สุขสมบูรณ์', requestor: 'วิภา สุขสมบูรณ์', date: '2024-02-06', detail: '20-21 ก.พ. 2567 (2 วัน) เหตุผล: ธุระส่วนตัว', status: 'Pending' },
  { id: 'APR-003', type: 'leave', title: 'ขอลาป่วย - สมชาย วงศ์ดี', requestor: 'สมชาย วงศ์ดี', date: '2024-02-05', detail: '25 ก.พ. 2567 (1 วัน) เหตุผล: ปวดหัวมาก', status: 'Pending' },
  { id: 'APR-004', type: 'special-price', title: 'ขออนุมัติราคาพิเศษ - Bright Future', requestor: 'นัทพงศ์ แก้วใส', date: '2024-02-03', detail: 'Inverter 10kW x 5 ตัว ราคา ฿32,500/ตัว (GP 1.5%)', status: 'Approved' },
  { id: 'APR-005', type: 'leave', title: 'ขอลาพักร้อน - สมชาย วงศ์ดี', requestor: 'สมชาย วงศ์ดี', date: '2024-02-01', detail: '12-14 ก.พ. 2567 (3 วัน) เหตุผล: พักผ่อนกับครอบครัว', status: 'Approved' }
];

function showPage(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if(event && event.target) event.target.classList.add('active');
  
  const titles = {
    dashboard: 'Dashboard', kanban: 'Sales Pipeline', deals: 'Deals', customers: 'Customers',
    products: 'Products', pricebook: 'Pricebook & Calculator', inventory: 'Inventory', purchasing: 'Purchase Orders',
    marketing: 'Marketing Campaigns', support: 'Support Tickets', calendar: 'Calendar',
    activity: 'Activity Feed', peak: 'Peak Accounting Sync',
    hr: 'HR Portal', leave: 'Leave Request', approvals: 'Approvals'
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

    products: `
      <div class="search-box">
        <input type="text" placeholder="🔍 Search products..." id="searchProductList" onkeyup="filterProductList()">
      </div>
      <div class="table-container">
        <table id="productListTable">
          <tr><th>SKU</th><th>Product Name</th><th>Unit Cost</th><th>Unit</th><th>Category</th></tr>
          ${products.map(p => {
            let cat = 'Accessories';
            if (p.sku.startsWith('SP')) cat = 'Solar Panel';
            else if (p.sku.startsWith('INV')) cat = 'Inverter';
            else if (p.sku.startsWith('BAT')) cat = 'Battery';
            else if (p.sku.startsWith('MNT')) cat = 'Mounting';
            else if (p.sku.startsWith('CBL')) cat = 'Cable';
            return `<tr><td>${p.sku}</td><td>${p.name}</td><td>฿${p.cost.toLocaleString()}</td><td>${p.unit}</td><td>${cat}</td></tr>`;
          }).join('')}
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

    // ===== HR Portal =====
    hr: `
      <div class="cards">
        <div class="card" onclick="showPage('leave')" style="cursor:pointer"><h3>📝 Leave Request</h3><div class="value">2</div><div class="sub">Pending requests</div></div>
        <div class="card"><h3>⏰ Late This Month</h3><div class="value" style="color:#fbbf24">4</div><div class="sub">ครั้ง (Feb 2024)</div></div>
        <div class="card"><h3>📅 วันลาคงเหลือ</h3><div class="value">7</div><div class="sub">จาก 10 วัน (พักร้อน)</div></div>
        <div class="card" onclick="showPage('approvals')" style="cursor:pointer"><h3>✅ Pending Approvals</h3><div class="value" style="color:#fbbf24">3</div><div class="sub">รอดำเนินการ</div></div>
      </div>

      <div class="table-container" style="margin-bottom:20px;">
        <h3 style="margin-bottom:15px;">📣 Announcements</h3>
        ${announcements.map(a => `
          <div class="activity-item" onclick="showAnnouncement(${a.id})" style="cursor:pointer">
            <div class="activity-content"><h5>${a.title}</h5><p>${a.date}</p></div>
            <div class="activity-time">ดูรายละเอียด →</div>
          </div>
        `).join('')}
      </div>

      <div class="table-container">
        <h3 style="margin-bottom:15px;">📋 Company Policies</h3>
        ${companyPolicies.map(p => `
          <div class="activity-item" onclick="showPolicy(${p.id})" style="cursor:pointer">
            <div class="activity-content"><h5>${p.title}</h5></div>
            <div class="activity-time">ดูรายละเอียด →</div>
          </div>
        `).join('')}
      </div>`,

    // ===== Leave Request =====
    leave: `
      <div class="cards">
        <div class="card"><h3>ลาพักร้อน</h3><div class="value">7 / 10</div><div class="sub">วันคงเหลือ</div></div>
        <div class="card"><h3>ลาป่วย</h3><div class="value">28 / 30</div><div class="sub">วันคงเหลือ</div></div>
        <div class="card"><h3>ลากิจ</h3><div class="value">3 / 5</div><div class="sub">วันคงเหลือ</div></div>
        <div class="card"><h3>Pending</h3><div class="value" style="color:#fbbf24">2</div><div class="sub">รออนุมัติ</div></div>
      </div>
      <div class="search-box">
        <div></div>
        <button class="btn btn-primary" onclick="openLeaveForm()">📝 ขอลางาน</button>
      </div>
      <div class="table-container">
        <table>
          <tr><th>ID</th><th>ประเภท</th><th>วันที่</th><th>จำนวน</th><th>เหตุผล</th><th>สถานะ</th></tr>
          ${leaveRequests.filter(l => l.employee === 'สมชาย วงศ์ดี').map(l => `
            <tr>
              <td>${l.id}</td>
              <td>${l.type}</td>
              <td>${l.from}${l.from !== l.to ? ' → ' + l.to : ''}</td>
              <td>${l.days} วัน</td>
              <td>${l.reason}</td>
              <td><span class="status ${l.status === 'Approved' ? 'won' : l.status === 'Rejected' ? 'lost' : 'progress'}">${l.status}</span></td>
            </tr>
          `).join('')}
        </table>
      </div>

      <div class="table-container" style="margin-top:20px;">
        <h3 style="margin-bottom:15px;">⏰ Late Check-in (สถิติมาสาย - Feb 2024)</h3>
        <table>
          <tr><th>วันที่</th><th>เวลาเข้างาน</th><th>สาย (นาที)</th><th>เหตุผล</th></tr>
          ${lateCheckins.filter(l => l.employee === 'สมชาย วงศ์ดี').map(l => `
            <tr>
              <td>${l.date}</td>
              <td>${l.actual} <span style="color:#888;font-size:12px;">(ปกติ ${l.scheduled})</span></td>
              <td><span style="color:#fbbf24">${l.minutes} นาที</span></td>
              <td>${l.reason}</td>
            </tr>
          `).join('')}
        </table>
      </div>`,

    // ===== Approvals =====
    approvals: `
      <div class="cards">
        <div class="card"><h3>Pending</h3><div class="value" style="color:#fbbf24">${approvalItems.filter(a => a.status === 'Pending').length}</div><div class="sub">รออนุมัติ</div></div>
        <div class="card"><h3>Approved</h3><div class="value">${approvalItems.filter(a => a.status === 'Approved').length}</div><div class="sub">อนุมัติแล้ว</div></div>
        <div class="card"><h3>Rejected</h3><div class="value">${approvalItems.filter(a => a.status === 'Rejected').length}</div><div class="sub">ไม่อนุมัติ</div></div>
        <div class="card"><h3>Total</h3><div class="value">${approvalItems.length}</div><div class="sub">รายการทั้งหมด</div></div>
      </div>
      <div class="table-container" style="margin-bottom:20px;">
        <h3 style="margin-bottom:15px;">🔴 Pending Approvals</h3>
        <table>
          <tr><th>ID</th><th>ประเภท</th><th>รายละเอียด</th><th>ผู้ขอ</th><th>วันที่</th><th>Action</th></tr>
          ${approvalItems.filter(a => a.status === 'Pending').map(a => `
            <tr>
              <td>${a.id}</td>
              <td><span class="status ${a.type === 'special-price' ? 'progress' : 'new'}">${a.type === 'special-price' ? '💲 ราคาพิเศษ' : '📝 ลางาน'}</span></td>
              <td>${a.detail}</td>
              <td>${a.requestor}</td>
              <td>${a.date}</td>
              <td>
                <button class="btn btn-primary" onclick="approveItem('${a.id}')" style="margin-right:5px;padding:4px 10px;font-size:12px;">✅ Approve</button>
                <button class="btn btn-secondary" onclick="rejectItem('${a.id}')" style="padding:4px 10px;font-size:12px;">❌ Reject</button>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div class="table-container">
        <h3 style="margin-bottom:15px;">📋 History</h3>
        <table>
          <tr><th>ID</th><th>ประเภท</th><th>รายละเอียด</th><th>ผู้ขอ</th><th>สถานะ</th></tr>
          ${approvalItems.filter(a => a.status !== 'Pending').map(a => `
            <tr>
              <td>${a.id}</td>
              <td>${a.type === 'special-price' ? '💲 ราคาพิเศษ' : '📝 ลางาน'}</td>
              <td>${a.detail}</td>
              <td>${a.requestor}</td>
              <td><span class="status ${a.status === 'Approved' ? 'won' : 'lost'}">${a.status}</span></td>
            </tr>
          `).join('')}
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

// ===== Pricebook Functions =====
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
  let submitBtn = '';

  if (gpPercent < 3) {
    gpClass = 'danger';
    warning = '<div style="background:#7f1d1d;padding:10px;border-radius:6px;margin-bottom:15px;font-size:12px;">⚠️ GP ต่ำกว่า 3% — ต้องขออนุมัติราคาพิเศษ</div>';
    submitBtn = `<button class="btn btn-secondary" onclick="submitSpecialApproval()" style="width:100%;margin-top:10px;background:#92400e;border-color:#92400e;">📩 ขออนุมัติราคาพิเศษ</button>`;
  } else if (gpPercent < 10) {
    gpClass = 'warning';
    warning = '<div style="background:#713f12;padding:10px;border-radius:6px;margin-bottom:15px;font-size:12px;">⚠️ GP ต่ำกว่า 10% — กำไรค่อนข้างน้อย</div>';
    submitBtn = `<button class="btn btn-primary" onclick="submitQuotation()" style="width:100%;margin-top:10px;">📄 Submit Quotation</button>`;
  } else if (gpPercent < 15) {
    gpClass = 'warning';
    submitBtn = `<button class="btn btn-primary" onclick="submitQuotation()" style="width:100%;margin-top:10px;">📄 Submit Quotation</button>`;
  } else {
    submitBtn = `<button class="btn btn-primary" onclick="submitQuotation()" style="width:100%;margin-top:10px;">📄 Submit Quotation</button>`;
  }
  
  document.getElementById('calcResult').innerHTML = `
    ${warning}
    <div class="calc-row"><span class="calc-label">Total Cost</span><span class="calc-value">฿${totalCost.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">Total Sell</span><span class="calc-value">฿${totalSell.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">Gross Profit</span><span class="calc-value ${gpClass}">฿${gp.toLocaleString()}</span></div>
    <div class="calc-row"><span class="calc-label">GP %</span><span class="calc-value ${gpClass}">${gpPercent.toFixed(1)}%</span></div>
    <div class="commission-highlight"><p>Your Commission (15% of GP)</p><h3>฿${Math.round(commission).toLocaleString()}</h3></div>
    ${submitBtn}
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

function submitQuotation() {
  alert('✅ Quotation submitted successfully!');
  closeModal();
}

function submitSpecialApproval() {
  approvalItems.unshift({
    id: 'APR-' + String(approvalItems.length + 1).padStart(3, '0'),
    type: 'special-price',
    title: 'ขออนุมัติราคาพิเศษ (จาก Pricebook)',
    requestor: 'สมชาย วงศ์ดี',
    date: new Date().toISOString().split('T')[0],
    detail: 'สร้างจาก Price Calculator',
    status: 'Pending'
  });
  alert('📩 ส่งคำขออนุมัติราคาพิเศษเรียบร้อย! ดูสถานะได้ที่หน้า Approvals');
  closeModal();
}

// ===== HR Functions =====
function openLeaveForm() {
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">📝 ขอลางาน</h2>
    <div class="form-group"><label>ประเภทการลา</label>
      <select id="leaveType">
        <option value="ลาพักร้อน">ลาพักร้อน (เหลือ 7 วัน)</option>
        <option value="ลาป่วย">ลาป่วย (เหลือ 28 วัน)</option>
        <option value="ลากิจ">ลากิจ (เหลือ 3 วัน)</option>
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
      <div class="form-group"><label>วันที่เริ่ม</label><input type="date" id="leaveFrom"></div>
      <div class="form-group"><label>วันที่สิ้นสุด</label><input type="date" id="leaveTo"></div>
    </div>
    <div class="form-group"><label>เหตุผล</label><textarea id="leaveReason" rows="3" style="width:100%;background:#0d1b3e;border:1px solid #1e3a5f;color:#e2e8f0;border-radius:6px;padding:10px;font-size:14px;" placeholder="ระบุเหตุผล..."></textarea></div>
    <button class="btn btn-primary" onclick="submitLeave()" style="width:100%;margin-top:10px;">📩 ส่งคำขอลา</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function submitLeave() {
  const type = document.getElementById('leaveType').value;
  const from = document.getElementById('leaveFrom').value;
  const to = document.getElementById('leaveTo').value;
  const reason = document.getElementById('leaveReason').value;

  if (!from || !to || !reason) {
    alert('⚠️ กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const days = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;

  leaveRequests.unshift({
    id: 'LV-' + String(leaveRequests.length + 1).padStart(3, '0'),
    employee: 'สมชาย วงศ์ดี',
    type: type,
    from: from,
    to: to,
    days: days,
    reason: reason,
    status: 'Pending'
  });

  approvalItems.unshift({
    id: 'APR-' + String(approvalItems.length + 1).padStart(3, '0'),
    type: 'leave',
    title: type + ' - สมชาย วงศ์ดี',
    requestor: 'สมชาย วงศ์ดี',
    date: new Date().toISOString().split('T')[0],
    detail: `${from} → ${to} (${days} วัน) เหตุผล: ${reason}`,
    status: 'Pending'
  });

  alert('✅ ส่งคำขอลาเรียบร้อย! รอการอนุมัติ');
  closeModal();
  showPage('leave');
}

function showAnnouncement(id) {
  const a = announcements.find(x => x.id === id);
  if (!a) return;
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">${a.title}</h2>
    <p style="color:#888;margin-bottom:15px;">📅 ${a.date}</p>
    <p style="line-height:1.8;">${a.detail}</p>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function showPolicy(id) {
  const p = companyPolicies.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalBody').innerHTML = `
    <h2 style="margin-bottom:20px;">${p.title}</h2>
    <p style="line-height:1.8;">${p.detail}</p>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ===== Approval Functions =====
function approveItem(id) {
  const item = approvalItems.find(a => a.id === id);
  if (!item) return;
  item.status = 'Approved';

  if (item.type === 'leave') {
    const lr = leaveRequests.find(l => l.status === 'Pending' && l.employee === item.requestor);
    if (lr) lr.status = 'Approved';
  }

  alert('✅ Approved: ' + item.title);
  showPage('approvals');
}

function rejectItem(id) {
  const reason = prompt('ระบุเหตุผลที่ไม่อนุมัติ:');
  if (reason === null) return;

  const item = approvalItems.find(a => a.id === id);
  if (!item) return;
  item.status = 'Rejected';
  item.detail += ' | เหตุผลไม่อนุมัติ: ' + reason;

  if (item.type === 'leave') {
    const lr = leaveRequests.find(l => l.status === 'Pending' && l.employee === item.requestor);
    if (lr) lr.status = 'Rejected';
  }

  alert('❌ Rejected: ' + item.title);
  showPage('approvals');
}

// ===== Deal & Utility Functions =====
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

function filterProductList() {
  const search = document.getElementById('searchProductList').value.toLowerCase();
  document.querySelectorAll('#productListTable tr').forEach((row, i) => {
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
