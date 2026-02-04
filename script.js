// ============================================================
//  FeicoCRM — Deal-Centric Operating Intelligence Platform
//  Architecture: SPA, no framework, in-memory state
// ============================================================

// ────────────────────────────
//  1) CENTRAL DATA STORE
// ────────────────────────────

const GP_THRESHOLD = 3; // GP < 3% = controlled
const COMMISSION_RATE = 0.15;
const STAGE_ORDER = ['Lead','Qualified','Quotation','Negotiation','Won','Lost'];
const STAGE_WEIGHTS = { Lead:0.2, Qualified:0.4, Quotation:0.6, Negotiation:0.8, Won:1.0, Lost:0 };
const STAGE_LABELS = { Lead:'Lead', Qualified:'Qualified', Quotation:'Quotation', Negotiation:'Negotiation', Won:'Won', Lost:'Lost' };

// Products (read-only catalog)
const products = [
  { sku:'SP-450W', name:'Solar Panel 450W', cost:4200, listPrice:5500, unit:'แผง', stock:150 },
  { sku:'SP-550W', name:'Solar Panel 550W', cost:5100, listPrice:6800, unit:'แผง', stock:85 },
  { sku:'INV-5KW', name:'Inverter 5kW', cost:18000, listPrice:24000, unit:'เครื่อง', stock:40 },
  { sku:'INV-10KW', name:'Inverter 10kW', cost:32000, listPrice:42000, unit:'เครื่อง', stock:25 },
  { sku:'BAT-5KWH', name:'Battery 5kWh', cost:45000, listPrice:58000, unit:'ก้อน', stock:20 },
  { sku:'BAT-10KWH', name:'Battery 10kWh', cost:82000, listPrice:105000, unit:'ก้อน', stock:12 },
  { sku:'MNT-KIT', name:'Mounting Kit', cost:3500, listPrice:5000, unit:'ชุด', stock:200 }
];

// Customers
const customers = [
  { id:'CUST-001', name:'Thai Solar Co., Ltd.', contact:'คุณสมศักดิ์', phone:'081-234-5678', channel:'Referral' },
  { id:'CUST-002', name:'Green Energy Plus', contact:'คุณวิภา', phone:'089-876-5432', channel:'Website' },
  { id:'CUST-003', name:'ABC Solar Systems', contact:'คุณอนันต์', phone:'062-345-6789', channel:'Trade Show' },
  { id:'CUST-004', name:'SunPower Thailand', contact:'คุณมาลี', phone:'095-111-2222', channel:'Direct' },
  { id:'CUST-005', name:'EcoTech Solutions', contact:'คุณธนา', phone:'084-333-4444', channel:'Referral' },
  { id:'CUST-006', name:'BrightFuture Corp.', contact:'คุณปรียา', phone:'091-555-6666', channel:'Website' }
];

// Deals — central source of truth
let deals = [
  {
    id:'DEAL-001', name:'Solar Rooftop 100kW', customerId:'CUST-001', owner:'สมชาย',
    stage:'Negotiation',
    items:[
      { sku:'SP-550W', qty:180, sellPrice:6500 },
      { sku:'INV-10KW', qty:3, sellPrice:40000 },
      { sku:'MNT-KIT', qty:180, sellPrice:4800 }
    ],
    gpApproval:null, lostReason:null, lockedSnapshot:null,
    wonAt:null, createdAt:'2025-01-15'
  },
  {
    id:'DEAL-002', name:'Office Building 50kW', customerId:'CUST-002', owner:'วิชัย',
    stage:'Quotation',
    items:[
      { sku:'SP-450W', qty:110, sellPrice:5200 },
      { sku:'INV-5KW', qty:5, sellPrice:23000 },
      { sku:'BAT-5KWH', qty:4, sellPrice:56000 }
    ],
    gpApproval:null, lostReason:null, lockedSnapshot:null,
    wonAt:null, createdAt:'2025-01-20'
  },
  {
    id:'DEAL-003', name:'Factory Rooftop 200kW', customerId:'CUST-003', owner:'สมชาย',
    stage:'Lead',
    items:[
      { sku:'SP-550W', qty:360, sellPrice:6400 },
      { sku:'INV-10KW', qty:6, sellPrice:41000 }
    ],
    gpApproval:null, lostReason:null, lockedSnapshot:null,
    wonAt:null, createdAt:'2025-02-01'
  },
  {
    id:'DEAL-004', name:'Warehouse Solar', customerId:'CUST-004', owner:'วิชัย',
    stage:'Won',
    items:[
      { sku:'SP-450W', qty:200, sellPrice:5300 },
      { sku:'INV-10KW', qty:2, sellPrice:41000 },
      { sku:'MNT-KIT', qty:200, sellPrice:4700 }
    ],
    gpApproval:null, lostReason:null,
    lockedSnapshot:{
      totalSell:2082000, totalCost:1787000, gpAmount:295000, gpPercent:14.17, commission:44250,
      items:[
        { sku:'SP-450W', qty:200, sellPrice:5300 },
        { sku:'INV-10KW', qty:2, sellPrice:41000 },
        { sku:'MNT-KIT', qty:200, sellPrice:4700 }
      ]
    },
    wonAt:'2025-01-28', createdAt:'2025-01-05'
  },
  {
    id:'DEAL-005', name:'Residential Package', customerId:'CUST-005', owner:'สมชาย',
    stage:'Lost',
    items:[
      { sku:'SP-450W', qty:20, sellPrice:5400 },
      { sku:'INV-5KW', qty:1, sellPrice:23500 },
      { sku:'BAT-5KWH', qty:1, sellPrice:57000 }
    ],
    gpApproval:null, lostReason:'ลูกค้าเลือกคู่แข่งที่ราคาต่ำกว่า',
    lockedSnapshot:null,
    wonAt:null, createdAt:'2025-01-10'
  },
  {
    id:'DEAL-006', name:'School Solar Project', customerId:'CUST-006', owner:'วิชัย',
    stage:'Qualified',
    items:[
      { sku:'SP-450W', qty:80, sellPrice:5100 },
      { sku:'INV-5KW', qty:4, sellPrice:23000 }
    ],
    gpApproval:null, lostReason:null, lockedSnapshot:null,
    wonAt:null, createdAt:'2025-02-03'
  }
];

// Activity log
let activities = [
  { id:'ACT-001', dealId:'DEAL-001', type:'stage-change', message:'Stage: Lead → Qualified', user:'สมชาย', timestamp:'2025-01-16 09:00' },
  { id:'ACT-002', dealId:'DEAL-001', type:'stage-change', message:'Stage: Qualified → Quotation', user:'สมชาย', timestamp:'2025-01-20 14:30' },
  { id:'ACT-003', dealId:'DEAL-001', type:'stage-change', message:'Stage: Quotation → Negotiation', user:'สมชาย', timestamp:'2025-01-25 11:00' },
  { id:'ACT-004', dealId:'DEAL-004', type:'stage-change', message:'Stage: Negotiation → Won 🎉', user:'วิชัย', timestamp:'2025-01-28 16:00' },
  { id:'ACT-005', dealId:'DEAL-004', type:'system', message:'Deal locked — snapshot saved', user:'System', timestamp:'2025-01-28 16:00' },
  { id:'ACT-006', dealId:'DEAL-004', type:'po', message:'PO-001 created (Pending)', user:'System', timestamp:'2025-01-28 16:01' },
  { id:'ACT-007', dealId:'DEAL-005', type:'stage-change', message:'Stage → Lost: ลูกค้าเลือกคู่แข่งที่ราคาต่ำกว่า', user:'สมชาย', timestamp:'2025-01-22 10:00' }
];

// Purchase Orders
let purchaseOrders = [
  { id:'PO-001', dealId:'DEAL-004', supplier:'Jinko Solar / Growatt', items:[ {sku:'SP-450W',qty:200,unitCost:4200},{sku:'INV-10KW',qty:2,unitCost:32000},{sku:'MNT-KIT',qty:200,unitCost:3500} ], total:1787000, status:'Confirmed', eta:'2025-02-15', statusHistory:['Pending','Confirmed'] }
];

// PEAK sync records
let peakSyncs = [
  { id:'PEAK-001', dealId:'DEAL-004', docType:'Invoice', amount:2082000, status:'Synced', peakRef:'INV-2025-0042', syncedAt:'2025-01-29 09:00' }
];

// Deal Comments (collaboration layer)
let dealComments = [
  { id:'CMT-001', dealId:'DEAL-001', user:'วิชัย', message:'ลูกค้าขอ discount เพิ่ม 3% สำหรับ panel', timestamp:'2025-01-26 10:30', tags:['สมชาย'] },
  { id:'CMT-002', dealId:'DEAL-001', user:'สมชาย', message:'รอยืนยันจาก supplier ก่อนลดราคาได้', timestamp:'2025-01-26 14:00', tags:[] },
  { id:'CMT-003', dealId:'DEAL-004', user:'วิชัย', message:'ลูกค้า confirm PO แล้ว รอจัดส่ง', timestamp:'2025-01-28 09:00', tags:[] },
  { id:'CMT-004', dealId:'DEAL-002', user:'สมชาย', message:'เสนอ Battery เพิ่มแต่ลูกค้ายังไม่ตัดสินใจ', timestamp:'2025-01-22 11:15', tags:['วิชัย'] }
];

// Team Members (for tagging & assignment)
const teamMembers = [
  { id:'USR-001', name:'สมชาย', role:'Sales', team:'Sales A', avatar:'👨‍💼' },
  { id:'USR-002', name:'วิชัย', role:'Sales', team:'Sales A', avatar:'👨‍💻' },
  { id:'USR-003', name:'สมศรี', role:'Sales', team:'Sales B', avatar:'👩‍💼' },
  { id:'USR-004', name:'Manager', role:'Manager', team:'Management', avatar:'👔' },
  { id:'USR-005', name:'Marketing', role:'Marketing', team:'Marketing', avatar:'📣' },
  { id:'USR-006', name:'Admin', role:'Admin', team:'Management', avatar:'👑' }
];

// Tasks (assignment system)
let tasks = [
  { id:'TSK-001', title:'ติดตามใบเสนอราคา Solar Rooftop 100kW', description:'ลูกค้ายังไม่ตอบกลับ ติดตามภายในสัปดาห์นี้', assignedTo:'สมชาย', assignedBy:'Manager', dealId:'DEAL-001', dueDate:'2025-02-10', status:'In Progress', priority:'High', createdAt:'2025-02-01' },
  { id:'TSK-002', title:'เตรียมข้อมูล Technical Spec', description:'เตรียม spec สำหรับ Office Building 50kW', assignedTo:'วิชัย', assignedBy:'Manager', dealId:'DEAL-002', dueDate:'2025-02-08', status:'Open', priority:'Medium', createdAt:'2025-02-02' },
  { id:'TSK-003', title:'สำรวจหน้างาน Factory Rooftop', description:'นัดสำรวจหน้างานกับลูกค้า', assignedTo:'สมชาย', assignedBy:'Manager', dealId:'DEAL-003', dueDate:'2025-02-15', status:'Open', priority:'High', createdAt:'2025-02-03' },
  { id:'TSK-004', title:'ส่ง Campaign Report Q1', description:'สรุปผล campaign Q1 ส่ง management', assignedTo:'Marketing', assignedBy:'Manager', dealId:null, dueDate:'2025-02-20', status:'Open', priority:'Low', createdAt:'2025-02-05' }
];

// Targets (org → team → individual)
let targets = [
  { id:'TGT-001', type:'org', name:'Revenue Target Q1', metric:'revenue', targetValue:15000000, period:'2025-Q1', owner:'Organization' },
  { id:'TGT-002', type:'org', name:'Win Rate Target', metric:'winRate', targetValue:35, period:'2025-Q1', owner:'Organization' },
  { id:'TGT-003', type:'team', name:'Sales A Revenue', metric:'revenue', targetValue:8000000, period:'2025-Q1', owner:'Sales A' },
  { id:'TGT-004', type:'team', name:'Sales B Revenue', metric:'revenue', targetValue:7000000, period:'2025-Q1', owner:'Sales B' },
  { id:'TGT-005', type:'individual', name:'สมชาย Revenue', metric:'revenue', targetValue:5000000, period:'2025-Q1', owner:'สมชาย' },
  { id:'TGT-006', type:'individual', name:'วิชัย Revenue', metric:'revenue', targetValue:4000000, period:'2025-Q1', owner:'วิชัย' },
  { id:'TGT-007', type:'individual', name:'สมชาย Deals Won', metric:'dealsWon', targetValue:5, period:'2025-Q1', owner:'สมชาย' }
];

// Campaign attachments
let campaignAttachments = [
  { id:'ATT-001', campaignId:'CMP-001', name:'Banner_FB_1080x1080.jpg', type:'image', size:'245 KB', uploadedBy:'Marketing', uploadedAt:'2025-01-06' },
  { id:'ATT-002', campaignId:'CMP-001', name:'Ad_Copy_v2.pdf', type:'file', size:'1.2 MB', uploadedBy:'Marketing', uploadedAt:'2025-01-07' }
];

// HR data (preserved from original)
let leaveRequests = [
  { id:'LV-001', employee:'สมชาย วงศ์ดี', type:'ลาพักร้อน', startDate:'2025-02-10', endDate:'2025-02-12', days:3, status:'Approved', reason:'พักผ่อนกับครอบครัว' },
  { id:'LV-002', employee:'วิภา สุขใจ', type:'ลาป่วย', startDate:'2025-02-05', endDate:'2025-02-05', days:1, status:'Approved', reason:'ไม่สบาย' },
  { id:'LV-003', employee:'อนันต์ ชัยศรี', type:'ลากิจ', startDate:'2025-02-15', endDate:'2025-02-15', days:1, status:'Pending', reason:'ธุระส่วนตัว' },
  { id:'LV-004', employee:'มาลี ดีใจ', type:'ลาพักร้อน', startDate:'2025-02-20', endDate:'2025-02-21', days:2, status:'Pending', reason:'ท่องเที่ยว' }
];
const lateCheckins = [
  { employee:'วิชัย รักดี', date:'2025-02-03', checkIn:'09:15', minutes:15 },
  { employee:'สมชาย วงศ์ดี', date:'2025-02-01', checkIn:'09:22', minutes:22 },
  { employee:'อนันต์ ชัยศรี', date:'2025-01-30', checkIn:'09:08', minutes:8 },
  { employee:'มาลี ดีใจ', date:'2025-01-28', checkIn:'09:35', minutes:35 }
];
const announcements = [
  { title:'🎉 Company Trip 2025', detail:'บริษัทจัดทริปประจำปี 2025 ที่เขาใหญ่ วันที่ 15-17 มีนาคม 2025 สมัครได้ที่ HR' },
  { title:'📋 Policy Update', detail:'อัพเดทนโยบาย Work From Home เริ่มใช้ 1 มีนาคม 2025 — WFH ได้ 2 วัน/สัปดาห์' },
  { title:'🏆 Top Performer', detail:'ขอแสดงความยินดีกับ คุณสมชาย ยอดขายอันดับ 1 ประจำเดือนมกราคม 2025' }
];
const companyPolicies = [
  { title:'📌 Leave Policy', detail:'ลาพักร้อน 10 วัน/ปี, ลาป่วย 30 วัน/ปี, ลากิจ 5 วัน/ปี' },
  { title:'📌 WFH Policy', detail:'Work From Home ได้ 2 วัน/สัปดาห์ ต้องแจ้งล่วงหน้า 1 วัน' },
  { title:'📌 Expense Policy', detail:'เบิกค่าใช้จ่ายได้ไม่เกิน 5,000 บาท/เดือน ต้องมีใบเสร็จ' },
  { title:'📌 Dress Code', detail:'แต่งกาย Smart Casual วันจันทร์-พฤหัส, Casual วันศุกร์' }
];
let approvalItems = [
  { id:'APR-001', type:'Leave', title:'ลาพักร้อน — สมชาย วงศ์ดี', detail:'10-12 ก.พ. 2025 (3 วัน)', status:'Approved', date:'2025-02-01' },
  { id:'APR-002', type:'Leave', title:'ลาป่วย — วิภา สุขใจ', detail:'5 ก.พ. 2025 (1 วัน)', status:'Approved', date:'2025-02-04' },
  { id:'APR-003', type:'Leave', title:'ลากิจ — อนันต์ ชัยศรี', detail:'15 ก.พ. 2025 (1 วัน)', status:'Pending', date:'2025-02-06' },
  { id:'APR-004', type:'Leave', title:'ลาพักร้อน — มาลี ดีใจ', detail:'20-21 ก.พ. 2025 (2 วัน)', status:'Pending', date:'2025-02-08' },
  { id:'APR-005', type:'GP Approval', title:'GP ต่ำกว่า 3% — รอดำเนินการ', detail:'ตัวอย่างรายการ GP approval', status:'Pending', date:'2025-02-09' }
];

// ────────────────────────────
//  2) COMPUTED HELPERS
// ────────────────────────────

function getProduct(sku) { return products.find(p => p.sku === sku); }
function getCustomer(id) { return customers.find(c => c.id === id); }

function computeDeal(deal) {
  // If locked (Won), return snapshot
  if (deal.lockedSnapshot) {
    return { ...deal.lockedSnapshot };
  }
  let totalSell = 0, totalCost = 0;
  deal.items.forEach(item => {
    const prod = getProduct(item.sku);
    const cost = prod ? prod.cost : 0;
    totalSell += item.sellPrice * item.qty;
    totalCost += cost * item.qty;
  });
  const gpAmount = totalSell - totalCost;
  const gpPercent = totalSell > 0 ? (gpAmount / totalSell) * 100 : 0;
  const commission = gpAmount * COMMISSION_RATE;
  return { totalSell, totalCost, gpAmount, gpPercent, commission };
}

function formatBaht(n) {
  if (n >= 1000000) return '฿' + (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return '฿' + (n/1000).toFixed(0) + 'K';
  return '฿' + n.toLocaleString();
}
function formatBahtFull(n) { return '฿' + n.toLocaleString('th-TH', {minimumFractionDigits:0}); }

function gpClass(gp) {
  if (gp < GP_THRESHOLD) return 'controlled';
  if (gp < 10) return 'warn';
  return 'ok';
}

function stageStatusClass(stage) {
  if (stage === 'Won') return 'won';
  if (stage === 'Lost') return 'lost';
  if (stage === 'Negotiation') return 'progress';
  return 'new';
}

function nextId(prefix, arr) {
  const max = arr.reduce((m, item) => {
    const num = parseInt(item.id.replace(prefix + '-', ''));
    return num > m ? num : m;
  }, 0);
  return prefix + '-' + String(max + 1).padStart(3, '0');
}

// ────────────────────────────
//  3) STATE MUTATION FUNCTIONS
// ────────────────────────────

function logActivity(dealId, type, message, user) {
  user = user || 'สมชาย';
  activities.push({
    id: nextId('ACT', activities),
    dealId, type, message, user,
    timestamp: new Date().toLocaleString('sv-SE').replace(',','')
  });
}

function changeStage(dealId, newStage, extra) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return false;
  const oldStage = deal.stage;
  if (oldStage === 'Won' || oldStage === 'Lost') return false; // locked

  // GP guard for Won
  if (newStage === 'Won') {
    const comp = computeDeal(deal);
    if (comp.gpPercent < GP_THRESHOLD) {
      if (!deal.gpApproval || deal.gpApproval.status !== 'Approved') {
        return 'GP_BLOCKED';
      }
    }
    // Lock deal
    deal.stage = 'Won';
    deal.wonAt = new Date().toISOString().slice(0,10);
    deal.lockedSnapshot = { ...computeDeal(deal), items: JSON.parse(JSON.stringify(deal.items)) };
    logActivity(dealId, 'stage-change', `Stage: ${oldStage} → Won 🎉`, extra?.user);
    logActivity(dealId, 'system', 'Deal locked — snapshot saved', 'System');
    // Create PO
    createPOFromDeal(deal);
    // Create PEAK record
    createPeakSync(deal);
    return true;
  }

  if (newStage === 'Lost') {
    if (!extra?.lostReason) return 'NEED_REASON';
    deal.stage = 'Lost';
    deal.lostReason = extra.lostReason;
    logActivity(dealId, 'stage-change', `Stage → Lost: ${extra.lostReason}`, extra?.user);
    return true;
  }

  deal.stage = newStage;
  logActivity(dealId, 'stage-change', `Stage: ${oldStage} → ${newStage}`, extra?.user);
  return true;
}

function createPOFromDeal(deal) {
  const po = {
    id: nextId('PO', purchaseOrders),
    dealId: deal.id,
    supplier: 'Auto-assigned Supplier',
    items: deal.items.map(i => {
      const p = getProduct(i.sku);
      return { sku:i.sku, qty:i.qty, unitCost: p ? p.cost : 0 };
    }),
    total: computeDeal(deal).totalCost,
    status: 'Pending',
    eta: '', 
    statusHistory: ['Pending']
  };
  purchaseOrders.push(po);
  logActivity(deal.id, 'po', `${po.id} created (Pending)`, 'System');
}

function createPeakSync(deal) {
  const comp = computeDeal(deal);
  peakSyncs.push({
    id: nextId('PEAK', peakSyncs),
    dealId: deal.id,
    docType: 'Invoice',
    amount: comp.totalSell,
    status: 'Pending',
    peakRef: null,
    syncedAt: null
  });
  logActivity(deal.id, 'peak', 'PEAK sync record created (Pending)', 'System');
}

function requestGPApproval(dealId, reason) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  deal.gpApproval = {
    status: 'Pending',
    reason: reason,
    approvedBy: null,
    approvedAt: null,
    threshold: GP_THRESHOLD
  };
  logActivity(dealId, 'approval', `GP Approval requested (GP < ${GP_THRESHOLD}%)`, 'สมชาย');
  // Also add to approvalItems for Approvals page
  approvalItems.push({
    id: nextId('APR', approvalItems),
    type: 'GP Approval',
    title: `GP < ${GP_THRESHOLD}% — ${deal.name}`,
    detail: `${deal.name} | Reason: ${reason}`,
    status: 'Pending',
    date: new Date().toISOString().slice(0,10),
    dealId: dealId
  });
}

function approveGP(dealId) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal || !deal.gpApproval) return;
  deal.gpApproval.status = 'Approved';
  deal.gpApproval.approvedBy = 'Manager';
  deal.gpApproval.approvedAt = new Date().toISOString().slice(0,10);
  logActivity(dealId, 'approval', 'GP Approval: Approved by Manager', 'Manager');
  // Update approval items
  const apr = approvalItems.find(a => a.dealId === dealId && a.type === 'GP Approval' && a.status === 'Pending');
  if (apr) apr.status = 'Approved';
}

function updateDealItems(dealId, items) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal || deal.stage === 'Won' || deal.stage === 'Lost') return;
  deal.items = items;
}

function addComment(dealId, message, user, tags) {
  user = user || 'สมชาย';
  tags = tags || [];
  const cmt = {
    id: nextId('CMT', dealComments),
    dealId, user, message, tags,
    timestamp: new Date().toLocaleString('sv-SE').replace(',','')
  };
  dealComments.push(cmt);
  const tagText = tags.length > 0 ? ` (tagged: ${tags.join(', ')})` : '';
  logActivity(dealId, 'comment', `💬 ${user}: ${message}${tagText}`, user);
  return cmt;
}

// Dynamic notifications from real data
function getNotifications() {
  const notifs = [];
  // Pending GP approvals
  deals.filter(d => d.gpApproval && d.gpApproval.status === 'Pending').forEach(d => {
    notifs.push({ icon:'🚨', text:`GP Approval pending — ${d.name}`, dealId:d.id, priority:1 });
  });
  // Pending leave approvals
  approvalItems.filter(a => a.status === 'Pending' && a.type === 'Leave').forEach(a => {
    notifs.push({ icon:'📝', text:`Leave pending — ${a.title}`, priority:2 });
  });
  // Low stock warnings
  const committed = {};
  deals.filter(d => d.stage !== 'Lost').forEach(d => {
    d.items.forEach(i => { committed[i.sku] = (committed[i.sku]||0) + i.qty; });
  });
  products.forEach(p => {
    const avail = p.stock - (committed[p.sku]||0);
    if (avail < 20) notifs.push({ icon:'⚠️', text:`Low stock: ${p.name} (${avail} available)`, priority:3 });
  });
  // Recent won deals (last 7 days)
  deals.filter(d => d.stage === 'Won' && d.wonAt).forEach(d => {
    notifs.push({ icon:'🎉', text:`Deal Won — ${d.name}`, dealId:d.id, priority:4 });
  });
  // Pending POs
  purchaseOrders.filter(po => po.status === 'Pending').forEach(po => {
    notifs.push({ icon:'📦', text:`PO ${po.id} pending confirmation`, dealId:po.dealId, priority:2 });
  });
  // Failed PEAK syncs
  peakSyncs.filter(ps => ps.status === 'Failed').forEach(ps => {
    notifs.push({ icon:'⚡', text:`PEAK sync failed — retry needed`, dealId:ps.dealId, priority:1 });
  });
  // Open support tickets
  tickets.filter(t => t.status === 'Open').forEach(t => {
    notifs.push({ icon:'🎧', text:`Open ticket: ${t.subject}`, dealId:t.dealId, priority:2 });
  });
  return notifs.sort((a,b) => a.priority - b.priority);
}

function updateNotifBadge() {
  const notifs = getNotifications();
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.textContent = '🔔 ' + notifs.length;
}

function renderNotifPanel() {
  const notifs = getNotifications();
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.innerHTML = `
    <h3>Notifications (${notifs.length})</h3>
    ${notifs.length === 0 ? '<p style="color:#666;font-size:12px;padding:10px">No notifications</p>' :
      notifs.map(n => `
        <div class="notif-item" ${n.dealId ? `style="cursor:pointer" onclick="openDealDetail('${n.dealId}');document.getElementById('notifPanel').classList.add('hidden')"` : ''}>
          ${n.icon} ${n.text}
        </div>
      `).join('')}
  `;
}

// ────────────────────────────
//  4) NAVIGATION (PRESERVED)
// ────────────────────────────

const titles = {
  dashboard:'Dashboard', kanban:'Kanban Board', deals:'Deals', customers:'Customers',
  products:'Products', pricebook:'Pricebook', inventory:'Inventory', purchasing:'Purchasing',
  marketing:'Campaigns', support:'Support', hr:'HR Portal', leave:'Leave Request',
  approvals:'Approvals', calendar:'Calendar', activity:'Activity', peak:'Peak Sync',
  tasks:'Tasks', targets:'Targets', performance:'Performance'
};

let currentPage = 'dashboard';
function showPage(page) {
  currentPage = page;
  document.getElementById('pageTitle').textContent = titles[page] || page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => { if (n.textContent.toLowerCase().includes(page === 'hr' ? 'hr portal' : titles[page]?.toLowerCase())) n.classList.add('active'); });
  document.getElementById('mainContent').innerHTML = content[page] ? content[page]() : '<p>Module coming soon</p>';
  // Close notif panel + refresh badge
  document.getElementById('notifPanel').classList.add('hidden');
  updateNotifBadge();
  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.add('hidden');
  // Clear global search
  const gs = document.getElementById('globalSearch');
  if (gs) gs.value = '';
  document.getElementById('globalSearchResults')?.classList.add('hidden');
}

function toggleNotif() {
  renderNotifPanel();
  document.getElementById('notifPanel').classList.toggle('hidden');
}
function openModal(html, wide) {
  document.getElementById('modalBody').innerHTML = html;
  const mc = document.querySelector('.modal-content');
  if (wide) mc.classList.add('wide'); else mc.classList.remove('wide');
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.querySelector('.modal-content').classList.remove('wide');
}

// ────────────────────────────
//  5) DASHBOARD (REAL DATA)
// ────────────────────────────

function dashboardKPIs() {
  const active = deals.filter(d => d.stage !== 'Lost');
  const won = deals.filter(d => d.stage === 'Won');
  const lost = deals.filter(d => d.stage === 'Lost');
  const pipeline = active.reduce((s,d) => s + computeDeal(d).totalSell, 0);
  const closedWon = won.reduce((s,d) => s + computeDeal(d).totalSell, 0);
  const forecast = deals.filter(d => d.stage !== 'Lost').reduce((s,d) => s + computeDeal(d).totalSell * (STAGE_WEIGHTS[d.stage]||0), 0);
  const winRate = (won.length + lost.length) > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  return { pipeline, closedWon, forecast, winRate, activeCount: active.length, wonCount: won.length, lostCount: lost.length };
}

content = {};
content.dashboard = function() {
  const kpi = dashboardKPIs();
  // Pipeline by stage
  const stageData = ['Lead','Qualified','Quotation','Negotiation','Won'].map(s => {
    const stageDeals = deals.filter(d => d.stage === s);
    const total = stageDeals.reduce((sum,d) => sum + computeDeal(d).totalSell, 0);
    return { stage:s, count:stageDeals.length, total };
  });
  const maxTotal = Math.max(...stageData.map(s => s.total), 1);
  const stageColors = { Lead:'#60a5fa', Qualified:'#818cf8', Quotation:'#fbbf24', Negotiation:'#c084fc', Won:'#4ade80' };

  // Recent activity
  const recentActs = [...activities].sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0,8);
  const actIcons = { 'stage-change':'🔄', comment:'💬', system:'⚙️', approval:'✅', po:'📦', peak:'⚡' };

  // Owner performance
  const owners = [...new Set(deals.map(d => d.owner))];
  const ownerData = owners.map(o => {
    const ownDeals = deals.filter(d => d.owner === o && d.stage !== 'Lost');
    return { owner:o, total:ownDeals.reduce((s,d) => s + computeDeal(d).totalSell, 0), count:ownDeals.length };
  });
  const maxOwner = Math.max(...ownerData.map(o => o.total), 1);

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
      <div style="font-size:12px;color:#888">Role: <span style="color:#4ade80">${rolePermissions[currentRole].label}</span></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" style="font-size:11px;padding:6px 12px" onclick="exportDashboardCSV()">📤 Export CSV</button>
        <button class="btn btn-secondary" style="font-size:11px;padding:6px 12px" onclick="resetOnboarding()">❓ Tour</button>
      </div>
    </div>
    <div class="cards">
      <div class="card"><h3>Pipeline Value</h3><div class="value">${formatBaht(kpi.pipeline)}</div><div class="sub">${kpi.activeCount} active deals</div></div>
      <div class="card"><h3>Closed Won</h3><div class="value">${formatBaht(kpi.closedWon)}</div><div class="sub">${kpi.wonCount} deals</div></div>
      <div class="card"><h3>Weighted Forecast</h3><div class="value">${formatBaht(kpi.forecast)}</div><div class="sub">By stage probability</div></div>
      <div class="card"><h3>Win Rate</h3><div class="value">${kpi.winRate}%</div><div class="sub">${kpi.wonCount}W / ${kpi.lostCount}L</div></div>
    </div>
    <div class="chart-grid">
      <div class="chart-box">
        <h4>Pipeline by Stage</h4>
        ${stageData.map(s => `
          <div class="pipeline-bar">
            <div class="bar-label">${s.stage} (${s.count})</div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max((s.total/maxTotal)*100,2)}%;background:${stageColors[s.stage]}"></div></div>
            <div class="bar-value">${formatBaht(s.total)}</div>
          </div>
        `).join('')}
      </div>
      <div class="chart-box">
        <h4>Owner Performance</h4>
        ${ownerData.map(o => `
          <div class="pipeline-bar">
            <div class="bar-label">${o.owner} (${o.count})</div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max((o.total/maxOwner)*100,2)}%;background:#4ade80"></div></div>
            <div class="bar-value">${formatBaht(o.total)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="chart-grid" style="margin-top:15px">
      <div class="chart-box">
        <h4>Lost Reasons</h4>
        ${deals.filter(d=>d.stage==='Lost'&&d.lostReason).length === 0 ? '<p style="color:#666;font-size:12px">No lost deals yet</p>' :
          deals.filter(d=>d.stage==='Lost'&&d.lostReason).map(d => `<div style="padding:6px 0;border-bottom:1px solid #2a2a4e;font-size:12px"><span style="color:#ef4444">✗</span> ${d.name}: ${d.lostReason}</div>`).join('')
        }
      </div>
      <div class="chart-box">
        <h4>Recent Activity</h4>
        ${recentActs.map(a => `
          <div style="padding:6px 0;border-bottom:1px solid #2a2a4e;font-size:12px">
            <span>${actIcons[a.type]||'📝'}</span> ${a.message}
            <div style="color:#666;font-size:10px;margin-top:2px">${a.dealId} · ${a.user} · ${a.timestamp}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// ────────────────────────────
//  6) KANBAN (DRAG & DROP)
// ────────────────────────────

content.kanban = function() {
  const stages = ['Lead','Qualified','Quotation','Negotiation','Won','Lost'];
  return `
    <div class="kanban" id="kanbanBoard">
      ${stages.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const isLost = stage === 'Lost';
        return `
          <div class="kanban-col ${isLost ? 'lost-col':''}" data-stage="${stage}"
               ondragover="kanbanDragOver(event)" ondragleave="kanbanDragLeave(event)" ondrop="kanbanDrop(event)">
            <h4>${stage.toUpperCase()} <span class="kanban-count">${stageDeals.length}</span></h4>
            ${stageDeals.map(d => {
              const comp = computeDeal(d);
              const isDraggable = stage !== 'Won' && stage !== 'Lost';
              return `
                <div class="kanban-card" draggable="${isDraggable}" data-deal-id="${d.id}"
                     ondragstart="kanbanDragStart(event)" ondragend="kanbanDragEnd(event)"
                     onclick="openDealDetail('${d.id}')">
                  <h5>${d.name}</h5>
                  <p>${getCustomer(d.customerId)?.name || ''}</p>
                  <p>${formatBaht(comp.totalSell)}</p>
                  <span class="kanban-gp ${gpClass(comp.gpPercent)}">GP ${comp.gpPercent.toFixed(1)}%</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
};

// Drag-and-drop handlers
function kanbanDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.dealId);
  e.target.classList.add('dragging');
}
function kanbanDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
}
function kanbanDragOver(e) {
  e.preventDefault();
  const col = e.target.closest('.kanban-col');
  if (col) col.classList.add('drag-over');
}
function kanbanDragLeave(e) {
  const col = e.target.closest('.kanban-col');
  if (col) col.classList.remove('drag-over');
}
function kanbanDrop(e) {
  e.preventDefault();
  const col = e.target.closest('.kanban-col');
  if (!col) return;
  col.classList.remove('drag-over');
  const dealId = e.dataTransfer.getData('text/plain');
  const newStage = col.dataset.stage;
  const deal = deals.find(d => d.id === dealId);
  if (!deal || deal.stage === newStage) return;

  if (newStage === 'Lost') {
    // Show lost reason prompt
    openModal(lostReasonModal(dealId), false);
    return;
  }

  const result = changeStage(dealId, newStage);
  if (result === 'GP_BLOCKED') {
    const comp = computeDeal(deal);
    openModal(gpBlockedModal(dealId, comp.gpPercent), false);
    return;
  }
  if (result === true) {
    showPage('kanban');
  }
}

function lostReasonModal(dealId) {
  return `
    <h3 style="margin-bottom:15px;color:#ef4444">❌ Mark as Lost</h3>
    <div class="form-group">
      <label>Lost Reason (required)</label>
      <textarea id="lostReasonInput" placeholder="เหตุผลที่ Deal นี้แพ้..."></textarea>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-danger" onclick="confirmLost('${dealId}')">Confirm Lost</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
}
function confirmLost(dealId) {
  const reason = document.getElementById('lostReasonInput')?.value?.trim();
  if (!reason) { alert('กรุณาระบุเหตุผล'); return; }
  changeStage(dealId, 'Lost', { lostReason: reason });
  closeModal();
  showPage('kanban');
}

function gpBlockedModal(dealId, gpPercent) {
  return `
    <h3 style="margin-bottom:15px;color:#ef4444">⚠️ GP Control — Cannot Win</h3>
    <p style="font-size:13px;margin-bottom:15px">GP ${gpPercent.toFixed(1)}% is below ${GP_THRESHOLD}% threshold. This deal requires GP Approval before it can move to Won.</p>
    <div style="display:flex;gap:8px">
      <button class="btn btn-primary" onclick="closeModal();openDealDetail('${dealId}')">Open Deal to Request Approval</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
}

// ────────────────────────────
//  7) DEAL DIAGNOSTIC CENTER
// ────────────────────────────

function openDealDetail(dealId) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  const cust = getCustomer(deal.customerId);
  const comp = computeDeal(deal);
  const isLocked = deal.stage === 'Won' || deal.stage === 'Lost';
  const dealActs = activities.filter(a => a.dealId === dealId).sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  const dealPOs = purchaseOrders.filter(p => p.dealId === dealId);
  const dealPeaks = peakSyncs.filter(p => p.dealId === dealId);
  const actIcons = { 'stage-change':'🔄', comment:'💬', system:'⚙️', approval:'✅', po:'📦', peak:'⚡' };

  // Items table
  let itemsHTML;
  if (isLocked) {
    const displayItems = deal.lockedSnapshot ? deal.lockedSnapshot.items : deal.items;
    itemsHTML = `<table>
      <tr><th>Product</th><th>Qty</th><th>Sell Price</th><th>Cost</th><th>Line Total</th></tr>
      ${displayItems.map(i => {
        const p = getProduct(i.sku);
        return `<tr>
          <td>${p?.name||i.sku}</td><td>${i.qty}</td>
          <td>${formatBahtFull(i.sellPrice)}</td><td>${formatBahtFull(p?.cost||0)}</td>
          <td>${formatBahtFull(i.sellPrice * i.qty)}</td>
        </tr>`;
      }).join('')}
    </table>`;
  } else {
    itemsHTML = `<table>
      <tr><th>Product</th><th>Qty</th><th>Sell Price</th><th>Cost</th><th>Line Total</th><th></th></tr>
      ${deal.items.map((item, idx) => {
        const p = getProduct(item.sku);
        return `<tr>
          <td>${p?.name||item.sku}</td>
          <td><input type="number" class="item-input" value="${item.qty}" min="1" onchange="dealItemChanged('${dealId}',${idx},'qty',this.value)"></td>
          <td><input type="number" class="item-input" value="${item.sellPrice}" min="0" onchange="dealItemChanged('${dealId}',${idx},'sellPrice',this.value)"></td>
          <td>${formatBahtFull(p?.cost||0)}</td>
          <td>${formatBahtFull(item.sellPrice * item.qty)}</td>
          <td><button class="item-remove" onclick="removeItem('${dealId}',${idx})">✕</button></td>
        </tr>`;
      }).join('')}
    </table>
    <div class="add-item-row">
      <select id="addItemSku">${products.map(p=>`<option value="${p.sku}">${p.name} (${formatBahtFull(p.listPrice)})</option>`).join('')}</select>
      <input type="number" id="addItemQty" value="1" min="1" style="width:60px" placeholder="Qty">
      <button class="btn btn-secondary" onclick="addItemToDeal('${dealId}')">+ Add</button>
    </div>`;
  }

  // GP Approval section
  let gpApprovalHTML = '';
  if (comp.gpPercent < GP_THRESHOLD && !isLocked) {
    if (deal.gpApproval && deal.gpApproval.status === 'Pending') {
      gpApprovalHTML = `<div class="approval-box"><h4>⏳ GP Approval Pending</h4><p style="font-size:12px;color:#888">Reason: ${deal.gpApproval.reason}</p>
        <button class="btn btn-primary" style="margin-top:8px" ${hasPermission('canApprove') ? `onclick="approveGP('${dealId}');openDealDetail('${dealId}')"` : 'disabled title="ต้องใช้ Role Manager หรือ Admin"'}>✅ Approve (Manager)</button></div>`;
    } else if (deal.gpApproval && deal.gpApproval.status === 'Approved') {
      gpApprovalHTML = `<div class="approval-box" style="border-color:#4ade80"><h4 style="color:#4ade80">✅ GP Approved</h4><p style="font-size:12px;color:#888">By ${deal.gpApproval.approvedBy} on ${deal.gpApproval.approvedAt}</p></div>`;
    } else {
      gpApprovalHTML = `<div class="approval-box"><h4>🚨 GP < ${GP_THRESHOLD}% — Approval Required</h4>
        <div class="form-group"><label>Reason for low GP</label><input type="text" id="gpApprovalReason" placeholder="อธิบายเหตุผลที่ GP ต่ำ..."></div>
        <button class="btn btn-danger" onclick="submitGPApproval('${dealId}')">Request GP Approval</button></div>`;
    }
  }

  // Stage action buttons
  let stageHTML = '';
  if (!isLocked) {
    const currentIdx = STAGE_ORDER.indexOf(deal.stage);
    const nextStage = currentIdx < 3 ? STAGE_ORDER[currentIdx + 1] : null;
    const canWin = comp.gpPercent >= GP_THRESHOLD || (deal.gpApproval && deal.gpApproval.status === 'Approved');
    stageHTML = `<div class="stage-actions">
      <span style="color:#888;font-size:12px;margin-right:8px">Current: <strong>${deal.stage}</strong></span>
      ${nextStage ? `<button class="stage-btn next" onclick="doStageChange('${dealId}','${nextStage}')">→ ${nextStage}</button>` : ''}
      <button class="stage-btn win" ${!canWin?'disabled title="GP Approval required"':''} onclick="doStageChange('${dealId}','Won')">✓ Win</button>
      <button class="stage-btn lose" onclick="doStageLost('${dealId}')">✗ Lost</button>
    </div>`;
  }

  const html = `
    ${isLocked ? `<div class="deal-locked-banner">${deal.stage === 'Won' ? '🔒 Deal Won — Locked' : '❌ Deal Lost'} ${deal.stage === 'Won' ? '('+deal.wonAt+')' : ''}</div>` : ''}
    <div class="deal-header">
      <h2>${deal.name}</h2>
      <span class="status ${stageStatusClass(deal.stage)}">${deal.stage}</span>
    </div>
    <div class="deal-meta">
      <div class="deal-meta-item">Customer<span>${cust?.name||'—'}</span></div>
      <div class="deal-meta-item">Contact<span>${cust?.contact||'—'} ${cust?.phone||''}</span></div>
      <div class="deal-meta-item">Owner<span>${deal.owner}</span></div>
      <div class="deal-meta-item">Created<span>${deal.createdAt}</span></div>
      <div class="deal-meta-item">Channel<span>${cust?.channel||'—'}</span></div>
      <div class="deal-meta-item">Deal ID<span>${deal.id}</span></div>
    </div>

    <div class="deal-section">
      <div class="deal-section-title">Items & Pricing</div>
      ${itemsHTML}
    </div>

    <div class="calc-result">
      <div class="calc-row"><span class="calc-label">Total Sell</span><span class="calc-value">${formatBahtFull(comp.totalSell)}</span></div>
      <div class="calc-row"><span class="calc-label">Total Cost</span><span class="calc-value">${formatBahtFull(comp.totalCost)}</span></div>
      <div class="calc-row"><span class="calc-label">GP Amount</span><span class="calc-value ${comp.gpPercent<GP_THRESHOLD?'danger':comp.gpPercent<10?'warning':'positive'}">${formatBahtFull(comp.gpAmount)}</span></div>
      <div class="calc-row"><span class="calc-label">GP %</span><span class="calc-value ${comp.gpPercent<GP_THRESHOLD?'danger':comp.gpPercent<10?'warning':'positive'}">${comp.gpPercent.toFixed(2)}% <span class="gp-badge ${gpClass(comp.gpPercent)}">${comp.gpPercent<GP_THRESHOLD?'CONTROLLED':'OK'}</span></span></div>
      <div class="calc-row"><span class="calc-label">Commission (${COMMISSION_RATE*100}%)</span><span class="calc-value positive">${formatBahtFull(comp.commission)}</span></div>
    </div>
    ${gpApprovalHTML}
    ${stageHTML}

    ${dealPOs.length ? `<div class="deal-section"><div class="deal-section-title">Purchase Orders</div>
      <table><tr><th>PO #</th><th>Supplier</th><th>Total</th><th>Status</th><th>ETA</th></tr>
      ${dealPOs.map(po => `<tr><td>${po.id}</td><td>${po.supplier}</td><td>${formatBahtFull(po.total)}</td><td><span class="status ${po.status==='Delivered'?'won':'progress'}">${po.status}</span></td><td>${po.eta||'—'}</td></tr>`).join('')}
      </table></div>` : ''}

    ${dealPeaks.length ? `<div class="deal-section"><div class="deal-section-title">PEAK Sync</div>
      <table><tr><th>Doc</th><th>Amount</th><th>Status</th><th>Ref</th><th>Synced</th><th></th></tr>
      ${dealPeaks.map(ps => `<tr><td>${ps.docType}</td><td>${formatBahtFull(ps.amount)}</td><td><span class="status ${ps.status==='Synced'?'won':ps.status==='Failed'?'lost':'progress'}">${ps.status}</span></td><td>${ps.peakRef||'—'}</td><td>${ps.syncedAt||'—'}</td>
      <td>${ps.status==='Pending'?`<button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="simulatePeakSync('${ps.id}')">Sync Now</button>`:ps.status==='Failed'?`<button class="btn btn-danger" style="font-size:11px;padding:4px 8px" onclick="simulatePeakSync('${ps.id}')">Retry</button>`:''}</td></tr>`).join('')}
      </table></div>` : ''}

    <div class="deal-section">
      <div class="deal-section-title">💬 Chat / Comments</div>
      ${!isLocked ? `
        <div class="chat-mini-input">
          <select id="commentUser" class="chat-user-select">
            ${teamMembers.map(m => `<option value="${m.name}">${m.avatar} ${m.name}</option>`).join('')}
          </select>
          <div class="chat-input-wrap">
            <input type="text" id="commentInput" placeholder="พิมพ์ข้อความ... ใช้ @ชื่อ เพื่อ tag" style="flex:1;padding:8px 12px;background:var(--bg-primary,#1a1a2e);border:1px solid #2a2a4e;border-radius:20px;color:#fff;font-size:12px"
                   onkeydown="if(event.key==='Enter')submitComment('${dealId}')">
            <button class="btn btn-primary" style="font-size:11px;padding:6px 14px;border-radius:20px" onclick="submitComment('${dealId}')">Send</button>
          </div>
        </div>
        <div class="chat-quick-tags">
          ${teamMembers.slice(0,5).map(m => `<span class="quick-tag" onclick="document.getElementById('commentInput').value+=' @${m.name} '">${m.avatar} ${m.name}</span>`).join('')}
        </div>
      ` : ''}
      <div class="chat-messages">
      ${dealComments.filter(c => c.dealId === dealId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).length === 0
        ? '<p style="color:#666;font-size:12px;padding:10px">ยังไม่มีข้อความ</p>'
        : dealComments.filter(c => c.dealId === dealId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(c => {
          const member = teamMembers.find(m => m.name === c.user);
          const highlightedMsg = c.message.replace(/@(\S+)/g, '<span class="chat-tag-mention">@$1</span>');
          return `<div class="chat-bubble">
            <div class="chat-bubble-header">
              <span class="chat-avatar">${member?.avatar||'👤'}</span>
              <span class="chat-name">${c.user}</span>
              <span class="chat-time">${c.timestamp}</span>
            </div>
            <div class="chat-bubble-body">${highlightedMsg}</div>
            ${c.tags && c.tags.length > 0 ? `<div class="chat-bubble-tags">${c.tags.map(t => `<span class="chat-tag-chip">@${t}</span>`).join('')}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="deal-section">
      <div class="deal-section-title">Activity Timeline</div>
      ${dealActs.length ? dealActs.map(a => `
        <div class="timeline-item">
          <div class="tl-msg">${actIcons[a.type]||'📝'} ${a.message}</div>
          <div class="tl-time">${a.user} · ${a.timestamp}</div>
        </div>
      `).join('') : '<p style="color:#666;font-size:12px">No activity yet</p>'}
    </div>
  `;
  openModal(html, true);
}

// Deal detail helper functions
function dealItemChanged(dealId, idx, field, value) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  deal.items[idx][field] = parseFloat(value) || 0;
  openDealDetail(dealId); // re-render
}
function removeItem(dealId, idx) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal || deal.items.length <= 1) return;
  deal.items.splice(idx, 1);
  openDealDetail(dealId);
}
function addItemToDeal(dealId) {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return;
  const sku = document.getElementById('addItemSku').value;
  const qty = parseInt(document.getElementById('addItemQty').value) || 1;
  const prod = getProduct(sku);
  deal.items.push({ sku, qty, sellPrice: prod?.listPrice || 0 });
  openDealDetail(dealId);
}
function submitGPApproval(dealId) {
  const reason = document.getElementById('gpApprovalReason')?.value?.trim();
  if (!reason) { alert('กรุณาระบุเหตุผล'); return; }
  requestGPApproval(dealId, reason);
  openDealDetail(dealId);
}
function submitComment(dealId) {
  const msg = document.getElementById('commentInput')?.value?.trim();
  if (!msg) return;
  const user = document.getElementById('commentUser')?.value || 'สมชาย';
  // Extract @tags from message
  const tagMatches = msg.match(/@(\S+)/g) || [];
  const tags = tagMatches.map(t => t.replace('@',''));
  addComment(dealId, msg, user, tags);
  openDealDetail(dealId);
}
function doStageChange(dealId, stage) {
  const result = changeStage(dealId, stage);
  if (result === 'GP_BLOCKED') {
    alert('❌ GP < ' + GP_THRESHOLD + '% — ต้องได้รับ GP Approval ก่อน');
    return;
  }
  if (result === true) { closeModal(); showPage('kanban'); }
}
function doStageLost(dealId) {
  closeModal();
  openModal(lostReasonModal(dealId), false);
}
function simulatePeakSync(peakId) {
  const ps = peakSyncs.find(p => p.id === peakId);
  if (!ps) return;
  // Simulate: 80% success
  if (Math.random() > 0.2) {
    ps.status = 'Synced';
    ps.peakRef = 'INV-2025-' + String(Math.floor(Math.random()*9000)+1000);
    ps.syncedAt = new Date().toLocaleString('sv-SE').replace(',','');
    logActivity(ps.dealId, 'peak', `PEAK synced: ${ps.peakRef}`, 'System');
  } else {
    ps.status = 'Failed';
    logActivity(ps.dealId, 'peak', 'PEAK sync failed — retry available', 'System');
  }
  // re-render modal
  openDealDetail(ps.dealId);
}

// ────────────────────────────
//  8) DEALS LIST PAGE
// ────────────────────────────

content.deals = function() {
  const filteredDeals = filterByDate(deals, 'createdAt');
  return `
    ${renderDateFilter('deals')}
    <div class="search-box">
      <input type="text" placeholder="Search deals..." onkeyup="filterDeals(this.value)">
      <button class="btn btn-secondary" style="font-size:11px" onclick="exportDealsCSV()">📤 Export CSV</button>
      <button class="btn btn-primary" onclick="openNewDealModal()">+ New Deal</button>
    </div>
    ${hasPermission('canBulk') ? `
    <div id="bulkBar" class="bulk-bar hidden">
      <span id="bulkCount">0 selected</span>
      <select id="bulkStage" style="padding:6px;background:#1a1a2e;border:1px solid #2a2a4e;border-radius:4px;color:#fff;font-size:12px">
        <option value="">— Change Stage —</option>
        <option value="Lead">Lead</option><option value="Qualified">Qualified</option><option value="Quotation">Quotation</option><option value="Negotiation">Negotiation</option>
      </select>
      <select id="bulkOwner" style="padding:6px;background:#1a1a2e;border:1px solid #2a2a4e;border-radius:4px;color:#fff;font-size:12px">
        <option value="">— Assign Owner —</option>
        <option>สมชาย</option><option>วิชัย</option>
      </select>
      <button class="btn btn-primary" style="font-size:11px;padding:6px 12px" onclick="applyBulkAction()">Apply</button>
      <button class="btn btn-secondary" style="font-size:11px;padding:6px 12px" onclick="clearBulkSelection()">Clear</button>
    </div>` : ''}
    <div class="table-container">
      <table id="dealsTable">
        <tr>
          ${hasPermission('canBulk') ? '<th><input type="checkbox" onchange="toggleAllDeals(this.checked)"></th>' : ''}
          <th>Deal</th><th>Customer</th><th>Value</th><th>GP%</th><th>Stage</th><th>Owner</th><th>Created</th>
        </tr>
        ${filteredDeals.map(d => {
          const comp = computeDeal(d);
          const cust = getCustomer(d.customerId);
          return `<tr>
            ${hasPermission('canBulk') ? `<td onclick="event.stopPropagation()"><input type="checkbox" class="deal-checkbox" value="${d.id}" onchange="updateBulkBar()"></td>` : ''}
            <td style="cursor:pointer" onclick="openDealDetail('${d.id}')"><strong>${d.name}</strong><br><span style="color:#666;font-size:11px">${d.id}</span></td>
            <td>${cust?.name||'—'}</td>
            <td>${formatBaht(comp.totalSell)}</td>
            <td><span class="gp-badge ${gpClass(comp.gpPercent)}">${comp.gpPercent.toFixed(1)}%</span></td>
            <td><span class="status ${stageStatusClass(d.stage)}">${d.stage}</span></td>
            <td>${d.owner}</td>
            <td>${d.createdAt}</td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  `;
};

function filterDeals(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#dealsTable tr:not(:first-child)').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// Bulk actions
function toggleAllDeals(checked) {
  document.querySelectorAll('.deal-checkbox').forEach(cb => cb.checked = checked);
  updateBulkBar();
}
function updateBulkBar() {
  const checked = document.querySelectorAll('.deal-checkbox:checked');
  const bar = document.getElementById('bulkBar');
  if (!bar) return;
  if (checked.length > 0) {
    bar.classList.remove('hidden');
    document.getElementById('bulkCount').textContent = checked.length + ' selected';
  } else {
    bar.classList.add('hidden');
  }
}
function getSelectedDealIds() {
  return [...document.querySelectorAll('.deal-checkbox:checked')].map(cb => cb.value);
}
function applyBulkAction() {
  const ids = getSelectedDealIds();
  if (ids.length === 0) return;
  const newStage = document.getElementById('bulkStage').value;
  const newOwner = document.getElementById('bulkOwner').value;
  let changes = 0;
  ids.forEach(id => {
    const deal = deals.find(d => d.id === id);
    if (!deal || deal.stage === 'Won' || deal.stage === 'Lost') return;
    if (newStage) { changeStage(id, newStage); changes++; }
    if (newOwner) { deal.owner = newOwner; logActivity(id, 'system', `Owner changed to ${newOwner}`, currentRole); changes++; }
  });
  if (changes > 0) showPage('deals');
  else alert('ไม่สามารถเปลี่ยน Deal ที่ Won/Lost ได้');
}
function clearBulkSelection() {
  document.querySelectorAll('.deal-checkbox').forEach(cb => cb.checked = false);
  updateBulkBar();
}

function openNewDealModal() {
  openModal(`
    <h3 style="margin-bottom:15px">➕ New Deal</h3>
    <div class="form-group"><label>Deal Name</label><input type="text" id="newDealName" placeholder="ชื่อ Deal"></div>
    <div class="form-group"><label>Customer</label><select id="newDealCustomer">${customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Owner</label><select id="newDealOwner"><option>สมชาย</option><option>วิชัย</option></select></div>
    <div class="form-group"><label>First Product</label><select id="newDealProduct">${products.map(p=>`<option value="${p.sku}">${p.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Qty</label><input type="number" id="newDealQty" value="10" min="1"></div>
    <button class="btn btn-primary" onclick="createNewDeal()">Create Deal</button>
  `, false);
}

function createNewDeal() {
  const name = document.getElementById('newDealName').value.trim();
  if (!name) { alert('กรุณากรอกชื่อ Deal'); return; }
  const customerId = document.getElementById('newDealCustomer').value;
  const owner = document.getElementById('newDealOwner').value;
  const sku = document.getElementById('newDealProduct').value;
  const qty = parseInt(document.getElementById('newDealQty').value) || 10;
  const prod = getProduct(sku);
  const deal = {
    id: nextId('DEAL', deals), name, customerId, owner,
    stage: 'Lead',
    items: [{ sku, qty, sellPrice: prod?.listPrice || 0 }],
    gpApproval: null, lostReason: null, lockedSnapshot: null,
    wonAt: null, createdAt: new Date().toISOString().slice(0,10)
  };
  deals.push(deal);
  logActivity(deal.id, 'system', 'Deal created', owner);
  closeModal();
  showPage('deals');
}

// ────────────────────────────
//  9) CUSTOMERS PAGE
// ────────────────────────────

content.customers = function() {
  return `
    <div class="search-box">
      <input type="text" placeholder="Search customers..." onkeyup="filterCustomers(this.value)">
      <button class="btn btn-primary" onclick="openNewCustomerModal()">+ New Customer</button>
    </div>
    <div class="table-container">
      <table id="customersTable">
        <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Channel</th><th>Deals</th></tr>
        ${customers.map(c => {
          const custDeals = deals.filter(d => d.customerId === c.id);
          return `<tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.contact}</td>
            <td>${c.phone}</td>
            <td>${c.channel}</td>
            <td>${custDeals.length} deal${custDeals.length!==1?'s':''}</td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  `;
};

function filterCustomers(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#customersTable tr:not(:first-child)').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openNewCustomerModal() {
  openModal(`
    <h3 style="margin-bottom:15px">➕ New Customer</h3>
    <div class="form-group"><label>Company Name</label><input type="text" id="newCustName"></div>
    <div class="form-group"><label>Contact Person</label><input type="text" id="newCustContact"></div>
    <div class="form-group"><label>Phone</label><input type="text" id="newCustPhone"></div>
    <div class="form-group"><label>Channel</label><select id="newCustChannel"><option>Direct</option><option>Referral</option><option>Website</option><option>Trade Show</option></select></div>
    <button class="btn btn-primary" onclick="createNewCustomer()">Create Customer</button>
  `, false);
}

function createNewCustomer() {
  const name = document.getElementById('newCustName').value.trim();
  if (!name) { alert('กรุณากรอกชื่อบริษัท'); return; }
  customers.push({
    id: 'CUST-' + String(customers.length + 1).padStart(3,'0'),
    name,
    contact: document.getElementById('newCustContact').value.trim() || '—',
    phone: document.getElementById('newCustPhone').value.trim() || '—',
    channel: document.getElementById('newCustChannel').value
  });
  closeModal();
  showPage('customers');
}

// ────────────────────────────
// 10) PRODUCTS & PRICEBOOK
// ────────────────────────────

content.products = function() {
  return `
    <div class="search-box">
      <input type="text" placeholder="Search products..." onkeyup="filterProducts(this.value)">
    </div>
    <div class="table-container">
      <table id="productsTable">
        <tr><th>SKU</th><th>Product Name</th><th>Cost</th><th>List Price</th><th>Unit</th><th>Stock</th></tr>
        ${products.map(p => `
          <tr>
            <td>${p.sku}</td><td>${p.name}</td>
            <td>${formatBahtFull(p.cost)}</td><td>${formatBahtFull(p.listPrice)}</td>
            <td>${p.unit}</td>
            <td><span style="color:${p.stock<20?'#ef4444':p.stock<50?'#fbbf24':'#4ade80'}">${p.stock}</span></td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
};

function filterProducts(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#productsTable tr:not(:first-child)').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

content.pricebook = function() {
  return `
    <div class="search-box">
      <input type="text" placeholder="Search pricebook..." onkeyup="filterPricebook(this.value)">
    </div>
    <div class="table-container">
      <table id="pricebookTable">
        <tr><th>Product</th><th>Cost</th><th>List Price</th><th>Min GP</th><th>Action</th></tr>
        ${products.map(p => {
          const minSell = p.cost / (1 - GP_THRESHOLD/100);
          return `<tr>
            <td>${p.name}</td><td>${formatBahtFull(p.cost)}</td><td>${formatBahtFull(p.listPrice)}</td>
            <td>${GP_THRESHOLD}%</td>
            <td><button class="btn btn-secondary" onclick="openPriceCalc('${p.sku}')">Calculator</button></td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  `;
};

function filterPricebook(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#pricebookTable tr:not(:first-child)').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openPriceCalc(sku) {
  const p = getProduct(sku);
  if (!p) return;
  openModal(`
    <h3 style="margin-bottom:15px">💲 Price Calculator — ${p.name}</h3>
    <div class="form-group"><label>Quantity</label><input type="number" id="pcQty" value="10" min="1" onchange="recalcPrice('${sku}')"></div>
    <div class="form-group"><label>Selling Price / Unit</label><input type="number" id="pcSellPrice" value="${p.listPrice}" min="0" onchange="recalcPrice('${sku}')"></div>
    <div id="pcResult"></div>
  `, false);
  setTimeout(() => recalcPrice(sku), 50);
}

function recalcPrice(sku) {
  const p = getProduct(sku);
  const qty = parseInt(document.getElementById('pcQty').value) || 1;
  const sell = parseFloat(document.getElementById('pcSellPrice').value) || 0;
  const totalSell = sell * qty;
  const totalCost = p.cost * qty;
  const gpAmt = totalSell - totalCost;
  const gpPct = totalSell > 0 ? (gpAmt / totalSell) * 100 : 0;
  const comm = gpAmt * COMMISSION_RATE;
  const cls = gpClass(gpPct);
  document.getElementById('pcResult').innerHTML = `
    <div class="calc-result">
      <div class="calc-row"><span class="calc-label">Total Sell</span><span class="calc-value">${formatBahtFull(totalSell)}</span></div>
      <div class="calc-row"><span class="calc-label">Total Cost</span><span class="calc-value">${formatBahtFull(totalCost)}</span></div>
      <div class="calc-row"><span class="calc-label">GP Amount</span><span class="calc-value ${cls==='controlled'?'danger':cls==='warn'?'warning':'positive'}">${formatBahtFull(gpAmt)}</span></div>
      <div class="calc-row"><span class="calc-label">GP %</span><span class="calc-value ${cls==='controlled'?'danger':cls==='warn'?'warning':'positive'}">${gpPct.toFixed(2)}% <span class="gp-badge ${cls}">${gpPct<GP_THRESHOLD?'CONTROLLED':'OK'}</span></span></div>
      <div class="calc-row"><span class="calc-label">Commission</span><span class="calc-value positive">${formatBahtFull(comm)}</span></div>
    </div>
    ${gpPct < GP_THRESHOLD ? '<p style="color:#ef4444;font-size:12px;margin-top:10px">⚠️ GP below '+GP_THRESHOLD+'% — Manager approval required if used in a Deal</p>' : ''}
  `;
}

// ────────────────────────────
// 11) INVENTORY (CONNECTED)
// ────────────────────────────

content.inventory = function() {
  // Calculate committed qty per product from active (non-Lost) deals
  const committed = {};
  deals.filter(d => d.stage !== 'Lost').forEach(d => {
    d.items.forEach(i => { committed[i.sku] = (committed[i.sku]||0) + i.qty; });
  });
  return `
    <div class="cards">
      <div class="card"><h3>Total SKUs</h3><div class="value">${products.length}</div></div>
      <div class="card"><h3>Low Stock Items</h3><div class="value" style="color:#ef4444">${products.filter(p=>p.stock<20).length}</div></div>
      <div class="card"><h3>Total Stock Units</h3><div class="value">${products.reduce((s,p)=>s+p.stock,0).toLocaleString()}</div></div>
      <div class="card"><h3>Active Deals Using Stock</h3><div class="value">${deals.filter(d=>!['Won','Lost'].includes(d.stage)).length}</div></div>
    </div>
    <div class="table-container">
      <table>
        <tr><th>SKU</th><th>Product</th><th>In Stock</th><th>Committed (Deals)</th><th>Available</th><th>Status</th></tr>
        ${products.map(p => {
          const comm = committed[p.sku] || 0;
          const avail = p.stock - comm;
          const statusCls = avail < 0 ? 'lost' : avail < 20 ? 'progress' : 'won';
          const statusTxt = avail < 0 ? 'Over-committed' : avail < 20 ? 'Low' : 'OK';
          return `<tr>
            <td>${p.sku}</td><td>${p.name}</td>
            <td>${p.stock}</td><td>${comm}</td>
            <td style="color:${avail<0?'#ef4444':avail<20?'#fbbf24':'#4ade80'}">${avail}</td>
            <td><span class="status ${statusCls}">${statusTxt}</span></td>
          </tr>`;
        }).join('')}
      </table>
    </div>
  `;
};

// ────────────────────────────
// 12) PURCHASING (CONNECTED)
// ────────────────────────────

content.purchasing = function() {
  const totalPO = purchaseOrders.reduce((s,p) => s + p.total, 0);
  const pending = purchaseOrders.filter(p => p.status === 'Pending').length;
  return `
    <div class="cards">
      <div class="card"><h3>Total POs</h3><div class="value">${purchaseOrders.length}</div></div>
      <div class="card"><h3>Pending</h3><div class="value" style="color:#fbbf24">${pending}</div></div>
      <div class="card"><h3>Total Value</h3><div class="value">${formatBaht(totalPO)}</div></div>
      <div class="card"><h3>Delivered</h3><div class="value">${purchaseOrders.filter(p=>p.status==='Delivered').length}</div></div>
    </div>
    <div class="table-container">
      <table>
        <tr><th>PO #</th><th>Deal</th><th>Supplier</th><th>Total</th><th>Status</th><th>ETA</th></tr>
        ${purchaseOrders.map(po => {
          const deal = deals.find(d => d.id === po.dealId);
          return `<tr style="cursor:pointer" onclick="openDealDetail('${po.dealId}')">
            <td>${po.id}</td><td>${deal?.name||po.dealId}</td>
            <td>${po.supplier}</td><td>${formatBahtFull(po.total)}</td>
            <td><span class="status ${po.status==='Delivered'?'won':po.status==='Confirmed'?'progress':'new'}">${po.status}</span></td>
            <td>${po.eta||'—'}</td>
          </tr>`;
        }).join('')}
        ${purchaseOrders.length===0 ? '<tr><td colspan="6" style="color:#666;text-align:center">No purchase orders yet — POs are created when deals are Won</td></tr>' : ''}
      </table>
    </div>
  `;
};

// ────────────────────────────
// 13) MARKETING — KANBAN + ATTACHMENTS + COMMENTS + TAGGING
// ────────────────────────────

let campaigns = [
  { id:'CMP-001', name:'Solar Rooftop Promotion Q1', stage:'Published', channel:'Facebook Ads', budget:50000, leads:12, owner:'Marketing', createdAt:'2025-01-05', description:'โปรโมท Solar Rooftop สำหรับบ้านพักอาศัย ผ่าน FB Ads targeting กลุ่มเจ้าของบ้าน อายุ 30-55' },
  { id:'CMP-002', name:'Trade Show 2025 March', stage:'Scheduled', channel:'Event', budget:150000, leads:0, owner:'Marketing', createdAt:'2025-01-15', description:'บูธงาน ASEAN Sustainable Energy Week 2025 — แสดง Inverter 10kW + Battery System' },
  { id:'CMP-003', name:'Google Ads — Inverter', stage:'Draft', channel:'Google Ads', budget:30000, leads:0, owner:'Marketing', createdAt:'2025-02-01', description:'Search Ads สำหรับ keyword: solar inverter, อินเวอร์เตอร์, ระบบโซลาร์เซลล์' }
];
const campaignStages = ['Draft','Technical Review','Approval','Scheduled','Published','Result Analysis'];
let campaignComments = [
  { id:'CCMT-001', campaignId:'CMP-001', user:'Marketing', message:'Creative ready — 3 variants for A/B test', timestamp:'2025-01-06 10:00', tags:['Manager'] },
  { id:'CCMT-002', campaignId:'CMP-001', user:'Manager', message:'Approved. Budget OK @Marketing เริ่มได้เลย', timestamp:'2025-01-07 14:00', tags:['Marketing'] }
];

let mktViewMode = 'kanban'; // 'kanban' or 'table'

content.marketing = function() {
  const totalLeads = campaigns.reduce((s,c)=>s+c.leads,0);
  const totalBudget = campaigns.reduce((s,c)=>s+c.budget,0);
  return `
    <div class="cards">
      <div class="card"><h3>Active Campaigns</h3><div class="value">${campaigns.length}</div></div>
      <div class="card"><h3>Total Budget</h3><div class="value">${formatBaht(totalBudget)}</div></div>
      <div class="card"><h3>Total Leads</h3><div class="value">${totalLeads}</div></div>
      <div class="card"><h3>Cost per Lead</h3><div class="value">${totalLeads > 0 ? formatBaht(Math.round(totalBudget/totalLeads)) : '—'}</div></div>
    </div>
    <div class="search-box">
      <input type="text" placeholder="Search campaigns..." onkeyup="filterCampaigns(this.value)">
      <select onchange="mktViewMode=this.value;showPage('marketing')" style="padding:8px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:6px;color:var(--text-primary,#fff);font-size:12px">
        <option value="kanban" ${mktViewMode==='kanban'?'selected':''}>📋 Kanban</option>
        <option value="table" ${mktViewMode==='table'?'selected':''}>📊 Table</option>
      </select>
      <button class="btn btn-primary" onclick="openNewCampaignModal()">+ New Campaign</button>
    </div>
    ${mktViewMode === 'kanban' ? renderMktKanban() : renderMktTable()}
  `;
};

function renderMktKanban() {
  const stageColors = { Draft:'#60a5fa', 'Technical Review':'#818cf8', Approval:'#fbbf24', Scheduled:'#c084fc', Published:'#4ade80', 'Result Analysis':'#f97316' };
  return `<div class="kanban">
    ${campaignStages.map(stage => {
      const stageCmps = campaigns.filter(c => c.stage === stage);
      return `<div class="kanban-col" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="dropCampaign(event,'${stage}');this.classList.remove('drag-over')">
        <h4 style="border-left:3px solid ${stageColors[stage]};padding-left:8px">${stage} <span class="kanban-count">${stageCmps.length}</span></h4>
        ${stageCmps.map(c => `
          <div class="kanban-card" draggable="true" ondragstart="event.dataTransfer.setData('cmpId','${c.id}')" onclick="openCampaignDetail('${c.id}')">
            <h5>${c.name}</h5>
            <p>${c.channel} · ${formatBaht(c.budget)}</p>
            <div style="display:flex;justify-content:space-between;margin-top:6px">
              <span style="font-size:10px;color:#888">📈 ${c.leads} leads</span>
              <span style="font-size:10px;color:#888">📎 ${(campaignAttachments||[]).filter(a=>a.campaignId===c.id).length}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }).join('')}
  </div>`;
}

function renderMktTable() {
  return `<div class="table-container">
    <table id="campaignsTable">
      <tr><th>Campaign</th><th>Channel</th><th>Budget</th><th>Leads</th><th>Stage</th><th>Attachments</th><th>Action</th></tr>
      ${campaigns.map(c => `<tr>
        <td style="cursor:pointer" onclick="openCampaignDetail('${c.id}')"><strong>${c.name}</strong><br><span style="color:#666;font-size:11px">${c.id}</span></td>
        <td>${c.channel}</td>
        <td>${formatBahtFull(c.budget)}</td>
        <td>${c.leads}</td>
        <td><span class="status ${c.stage==='Published'?'won':c.stage==='Draft'?'new':'progress'}">${c.stage}</span></td>
        <td>📎 ${(campaignAttachments||[]).filter(a=>a.campaignId===c.id).length}</td>
        <td><button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="openCampaignDetail('${c.id}')">Detail</button></td>
      </tr>`).join('')}
    </table>
  </div>`;
}

function dropCampaign(event, newStage) {
  event.preventDefault();
  const cmpId = event.dataTransfer.getData('cmpId');
  const cmp = campaigns.find(c => c.id === cmpId);
  if (cmp) { cmp.stage = newStage; showPage('marketing'); }
}

function filterCampaigns(q) {
  if (mktViewMode === 'table') {
    q = q.toLowerCase();
    document.querySelectorAll('#campaignsTable tr:not(:first-child)').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  } else {
    q = q.toLowerCase();
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
}

function openNewCampaignModal() {
  openModal(`
    <h3 style="margin-bottom:15px">➕ New Campaign</h3>
    <div class="form-group"><label>Campaign Name</label><input type="text" id="newCmpName" placeholder="ชื่อ Campaign"></div>
    <div class="form-group"><label>Channel</label><select id="newCmpChannel"><option>Facebook Ads</option><option>Google Ads</option><option>LINE OA</option><option>Event</option><option>Email</option><option>Referral Program</option></select></div>
    <div class="form-group"><label>Budget (฿)</label><input type="number" id="newCmpBudget" value="50000" min="0"></div>
    <div class="form-group"><label>Description</label><textarea id="newCmpDesc" placeholder="รายละเอียด Campaign"></textarea></div>
    <button class="btn btn-primary" onclick="createNewCampaign()">Create Campaign</button>
  `, false);
}

function createNewCampaign() {
  const name = document.getElementById('newCmpName').value.trim();
  if (!name) { alert('กรุณากรอกชื่อ Campaign'); return; }
  campaigns.push({
    id: 'CMP-' + String(campaigns.length + 1).padStart(3,'0'),
    name,
    stage: 'Draft',
    channel: document.getElementById('newCmpChannel').value,
    budget: parseInt(document.getElementById('newCmpBudget').value) || 0,
    leads: 0,
    owner: 'Marketing',
    createdAt: new Date().toISOString().slice(0,10),
    description: document.getElementById('newCmpDesc')?.value || ''
  });
  closeModal();
  showPage('marketing');
}

function advanceCampaign(id) {
  const cmp = campaigns.find(c => c.id === id);
  if (!cmp) return;
  const idx = campaignStages.indexOf(cmp.stage);
  if (idx < campaignStages.length - 1) cmp.stage = campaignStages[idx + 1];
  openCampaignDetail(id);
}

function openCampaignDetail(id) {
  const cmp = campaigns.find(c => c.id === id);
  if (!cmp) return;
  const currentIdx = campaignStages.indexOf(cmp.stage);
  const atts = (campaignAttachments||[]).filter(a => a.campaignId === id);
  const cmts = campaignComments.filter(c => c.campaignId === id).sort((a,b) => b.timestamp.localeCompare(a.timestamp));

  openModal(`
    <div class="deal-header">
      <h2>📣 ${cmp.name}</h2>
      <span class="status ${cmp.stage==='Published'?'won':cmp.stage==='Draft'?'new':'progress'}">${cmp.stage}</span>
    </div>
    <div class="deal-meta" style="grid-template-columns:repeat(3,1fr)">
      <div class="deal-meta-item">Channel<span>${cmp.channel}</span></div>
      <div class="deal-meta-item">Budget<span>${formatBahtFull(cmp.budget)}</span></div>
      <div class="deal-meta-item">Leads<span>${cmp.leads}</span></div>
      <div class="deal-meta-item">Cost/Lead<span>${cmp.leads > 0 ? formatBahtFull(Math.round(cmp.budget/cmp.leads)) : '—'}</span></div>
      <div class="deal-meta-item">Owner<span>${cmp.owner}</span></div>
      <div class="deal-meta-item">Created<span>${cmp.createdAt}</span></div>
    </div>
    ${cmp.description ? `<div style="padding:12px;background:var(--bg-primary,#1a1a2e);border-radius:8px;font-size:13px;color:#ccc;margin-bottom:15px;line-height:1.6">${cmp.description}</div>` : ''}

    <div class="deal-section">
      <div class="deal-section-title">Stage Progression</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
        ${campaignStages.map((s,i) => `<span style="padding:6px 12px;background:${i<=currentIdx?'#166534':'var(--bg-primary,#1a1a2e)'};color:${i<=currentIdx?'#4ade80':'#666'};border-radius:12px;font-size:11px;font-weight:${i===currentIdx?'bold':'normal'}">${s}</span>`).join('<span style="color:#666;padding:0 2px">→</span>')}
      </div>
      ${currentIdx < campaignStages.length - 1 ?
        `<button class="btn btn-primary" style="font-size:12px" onclick="advanceCampaign('${id}')">→ Advance to ${campaignStages[currentIdx+1]}</button>` :
        '<p style="color:#4ade80;font-size:12px">✅ Campaign completed all stages</p>'}
    </div>

    <div class="deal-section">
      <div class="deal-section-title">📎 Attachments (${atts.length})</div>
      ${atts.map(a => `
        <div class="att-item">
          <span class="att-icon">${a.type==='image'?'🖼️':'📄'}</span>
          <div class="att-info"><div class="att-name">${a.name}</div><div class="att-meta">${a.size} · ${a.uploadedBy} · ${a.uploadedAt}</div></div>
        </div>
      `).join('')}
      ${atts.length === 0 ? '<p style="color:#666;font-size:12px">ยังไม่มีไฟล์แนบ</p>' : ''}
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-secondary" style="font-size:11px" onclick="addMockAttachment('${id}','image')">🖼️ + รูปภาพ</button>
        <button class="btn btn-secondary" style="font-size:11px" onclick="addMockAttachment('${id}','file')">📄 + ไฟล์</button>
      </div>
    </div>

    ${cmp.stage === 'Published' || cmp.stage === 'Result Analysis' ? `
    <div class="deal-section">
      <div class="deal-section-title">📈 Add Leads</div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="number" id="addLeadsCount" value="1" min="1" style="width:60px;padding:6px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:4px;color:var(--text-primary,#fff);font-size:12px">
        <button class="btn btn-secondary" style="font-size:11px" onclick="addCampaignLeads('${id}')">+ Add Leads</button>
      </div>
    </div>` : ''}

    <div class="deal-section">
      <div class="deal-section-title">💬 Comments & Discussion</div>
      <div class="chat-mini-input">
        <select id="cmpCommentUser" class="chat-user-select">
          ${teamMembers.map(m => `<option value="${m.name}">${m.avatar} ${m.name}</option>`).join('')}
        </select>
        <div class="chat-input-wrap">
          <input type="text" id="cmpCommentInput" placeholder="พิมพ์ข้อความ... ใช้ @ชื่อ เพื่อ tag" style="flex:1;padding:8px 12px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:20px;color:var(--text-primary,#fff);font-size:12px"
                 onkeydown="if(event.key==='Enter')submitCmpComment('${id}')">
          <button class="btn btn-primary" style="font-size:11px;padding:6px 14px;border-radius:20px" onclick="submitCmpComment('${id}')">Send</button>
        </div>
      </div>
      <div class="chat-quick-tags">
        ${teamMembers.slice(0,5).map(m => `<span class="quick-tag" onclick="document.getElementById('cmpCommentInput').value+=' @${m.name} '">${m.avatar} ${m.name}</span>`).join('')}
      </div>
      <div class="chat-messages">
      ${cmts.length === 0 ? '<p style="color:#666;font-size:12px;padding:10px">ยังไม่มีข้อความ</p>' :
        cmts.map(c => {
          const member = teamMembers.find(m => m.name === c.user);
          const highlightedMsg = c.message.replace(/@(\S+)/g, '<span class="chat-tag-mention">@$1</span>');
          return `<div class="chat-bubble">
            <div class="chat-bubble-header">
              <span class="chat-avatar">${member?.avatar||'👤'}</span>
              <span class="chat-name">${c.user}</span>
              <span class="chat-time">${c.timestamp}</span>
            </div>
            <div class="chat-bubble-body">${highlightedMsg}</div>
            ${c.tags?.length > 0 ? `<div class="chat-bubble-tags">${c.tags.map(t => `<span class="chat-tag-chip">@${t}</span>`).join('')}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `, true);
}

function submitCmpComment(campaignId) {
  const msg = document.getElementById('cmpCommentInput')?.value?.trim();
  if (!msg) return;
  const user = document.getElementById('cmpCommentUser')?.value || 'Marketing';
  const tagMatches = msg.match(/@(\S+)/g) || [];
  const tags = tagMatches.map(t => t.replace('@',''));
  campaignComments.push({
    id: 'CCMT-' + String(campaignComments.length + 1).padStart(3,'0'),
    campaignId, user, message: msg, tags,
    timestamp: new Date().toLocaleString('sv-SE').replace(',','')
  });
  openCampaignDetail(campaignId);
}

function addMockAttachment(campaignId, type) {
  const names = type === 'image'
    ? ['Banner_1080x1080.jpg','Story_IG_v2.png','Cover_FB.jpg','Photo_product.jpg']
    : ['Brief_v3.pdf','Report_leads.xlsx','Budget_plan.pdf','Creative_deck.pptx'];
  const sizes = type === 'image' ? ['245 KB','380 KB','520 KB','190 KB'] : ['1.2 MB','340 KB','890 KB','2.1 MB'];
  const idx = (campaignAttachments||[]).filter(a => a.campaignId === campaignId).length % 4;
  campaignAttachments.push({
    id: 'ATT-' + String(campaignAttachments.length + 1).padStart(3,'0'),
    campaignId, name: names[idx], type, size: sizes[idx],
    uploadedBy: currentRole === 'sales' ? 'สมชาย' : 'Marketing',
    uploadedAt: new Date().toISOString().slice(0,10)
  });
  openCampaignDetail(campaignId);
}

function addCampaignLeads(id) {
  const cmp = campaigns.find(c => c.id === id);
  if (!cmp) return;
  const count = parseInt(document.getElementById('addLeadsCount')?.value) || 1;
  cmp.leads += count;
  openCampaignDetail(id);
}

// ────────────────────────────
// 14) SUPPORT (CONNECTED)
// ────────────────────────────

let tickets = [
  { id:'TKT-001', subject:'Inverter Error Code E05', product:'INV-10KW', dealId:'DEAL-004', customerId:'CUST-004', status:'Open', priority:'High', created:'2025-02-01', description:'Inverter แสดง Error E05 หลังติดตั้ง 3 วัน' },
  { id:'TKT-002', subject:'Panel Mounting Issue', product:'MNT-KIT', dealId:'DEAL-004', customerId:'CUST-004', status:'In Progress', priority:'Medium', created:'2025-02-03', description:'Mounting kit ไม่พอดีกับหลังคาลูกค้า ต้องปรับแต่ง' }
];

content.support = function() {
  const filteredTickets = filterByDate(tickets, 'created');
  return `
    <div class="cards">
      <div class="card"><h3>Open Tickets</h3><div class="value" style="color:#ef4444">${filteredTickets.filter(t=>t.status==='Open').length}</div></div>
      <div class="card"><h3>In Progress</h3><div class="value" style="color:#fbbf24">${filteredTickets.filter(t=>t.status==='In Progress').length}</div></div>
      <div class="card"><h3>Resolved</h3><div class="value" style="color:#4ade80">${filteredTickets.filter(t=>t.status==='Resolved').length}</div></div>
      <div class="card"><h3>Avg Response (sim)</h3><div class="value">${filteredTickets.length > 0 ? '2.4h' : '—'}</div></div>
    </div>
    ${renderDateFilter('support')}
    <div class="search-box">
      <input type="text" placeholder="Search tickets..." onkeyup="filterTickets(this.value)">
      <button class="btn btn-primary" onclick="openNewTicketModal()">+ New Ticket</button>
    </div>
    <div class="table-container">
      <table id="ticketsTable">
        <tr><th>Ticket</th><th>Subject</th><th>Product</th><th>Deal</th><th>Priority</th><th>Status</th><th>Action</th></tr>
        ${filteredTickets.map(t => {
          const deal = deals.find(d => d.id === t.dealId);
          const prod = getProduct(t.product);
          return `<tr>
            <td>${t.id}</td>
            <td style="cursor:pointer" onclick="openTicketDetail('${t.id}')"><strong>${t.subject}</strong></td>
            <td>${prod?.name || t.product}</td>
            <td ${t.dealId ? `style="cursor:pointer;color:#4ade80" onclick="openDealDetail('${t.dealId}')"` : ''}>${deal?.name || '—'}</td>
            <td><span class="status ${t.priority==='High'?'lost':t.priority==='Medium'?'progress':'new'}">${t.priority}</span></td>
            <td><span class="status ${t.status==='Resolved'?'won':t.status==='Open'?'lost':'progress'}">${t.status}</span></td>
            <td>
              ${t.status === 'Open' ? `<button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="changeTicketStatus('${t.id}','In Progress')">→ Progress</button>` : ''}
              ${t.status === 'In Progress' ? `<button class="btn btn-primary" style="font-size:11px;padding:4px 8px" onclick="changeTicketStatus('${t.id}','Resolved')">✓ Resolve</button>` : ''}
              ${t.status === 'Resolved' ? '<span style="color:#4ade80;font-size:11px">✓ Done</span>' : ''}
            </td>
          </tr>`;
        }).join('')}
        ${tickets.length === 0 ? '<tr><td colspan="7" style="color:#666;text-align:center">No tickets yet</td></tr>' : ''}
      </table>
    </div>
  `;
};

function filterTickets(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#ticketsTable tr:not(:first-child)').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openNewTicketModal() {
  const wonDeals = deals.filter(d => d.stage === 'Won');
  openModal(`
    <h3 style="margin-bottom:15px">🎧 New Support Ticket</h3>
    <div class="form-group"><label>Subject</label><input type="text" id="newTktSubject" placeholder="ปัญหาที่พบ..."></div>
    <div class="form-group"><label>Linked Deal</label><select id="newTktDeal"><option value="">— ไม่ระบุ —</option>${wonDeals.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Product</label><select id="newTktProduct"><option value="">— ไม่ระบุ —</option>${products.map(p=>`<option value="${p.sku}">${p.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Priority</label><select id="newTktPriority"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
    <div class="form-group"><label>Description</label><textarea id="newTktDesc" placeholder="รายละเอียดปัญหา..."></textarea></div>
    <button class="btn btn-primary" onclick="createNewTicket()">Create Ticket</button>
  `, false);
}

function createNewTicket() {
  const subject = document.getElementById('newTktSubject').value.trim();
  if (!subject) { alert('กรุณากรอกหัวข้อ'); return; }
  const dealId = document.getElementById('newTktDeal').value || null;
  const deal = dealId ? deals.find(d => d.id === dealId) : null;
  tickets.push({
    id: 'TKT-' + String(tickets.length + 1).padStart(3,'0'),
    subject,
    product: document.getElementById('newTktProduct').value || '',
    dealId: dealId,
    customerId: deal ? deal.customerId : null,
    status: 'Open',
    priority: document.getElementById('newTktPriority').value,
    created: new Date().toISOString().slice(0,10),
    description: document.getElementById('newTktDesc').value.trim() || ''
  });
  if (dealId) {
    logActivity(dealId, 'system', `Support ticket created: ${subject}`, 'System');
  }
  closeModal();
  showPage('support');
  updateNotifBadge();
}

function changeTicketStatus(id, newStatus) {
  const tkt = tickets.find(t => t.id === id);
  if (!tkt) return;
  tkt.status = newStatus;
  if (tkt.dealId) {
    logActivity(tkt.dealId, 'system', `Ticket ${tkt.id}: ${newStatus}`, 'System');
  }
  showPage('support');
  updateNotifBadge();
}

function openTicketDetail(id) {
  const tkt = tickets.find(t => t.id === id);
  if (!tkt) return;
  const deal = tkt.dealId ? deals.find(d => d.id === tkt.dealId) : null;
  const cust = tkt.customerId ? getCustomer(tkt.customerId) : (deal ? getCustomer(deal.customerId) : null);
  const prod = tkt.product ? getProduct(tkt.product) : null;

  openModal(`
    <div class="deal-header">
      <h2>${tkt.subject}</h2>
      <span class="status ${tkt.status==='Resolved'?'won':tkt.status==='Open'?'lost':'progress'}">${tkt.status}</span>
    </div>
    <div class="deal-meta">
      <div class="deal-meta-item">Ticket ID<span>${tkt.id}</span></div>
      <div class="deal-meta-item">Priority<span style="color:${tkt.priority==='High'?'#ef4444':tkt.priority==='Medium'?'#fbbf24':'#60a5fa'}">${tkt.priority}</span></div>
      <div class="deal-meta-item">Product<span>${prod?.name || '—'}</span></div>
      <div class="deal-meta-item">Deal<span ${deal ? `style="cursor:pointer;color:#4ade80" onclick="openDealDetail('${deal.id}')"` : ''}>${deal?.name || '—'}</span></div>
      <div class="deal-meta-item">Customer<span>${cust?.name || '—'}</span></div>
      <div class="deal-meta-item">Created<span>${tkt.created}</span></div>
    </div>
    ${tkt.description ? `<div class="deal-section"><div class="deal-section-title">Description</div><p style="font-size:13px;color:#ccc;line-height:1.6">${tkt.description}</p></div>` : ''}
    <div class="stage-actions" style="margin-top:15px">
      ${tkt.status === 'Open' ? `<button class="stage-btn next" onclick="changeTicketStatus('${tkt.id}','In Progress');openTicketDetail('${tkt.id}')">→ In Progress</button>` : ''}
      ${tkt.status === 'In Progress' ? `<button class="stage-btn win" onclick="changeTicketStatus('${tkt.id}','Resolved');openTicketDetail('${tkt.id}')">✓ Resolve</button>` : ''}
      ${tkt.status === 'Resolved' ? '<span style="color:#4ade80;font-size:13px">✅ Ticket Resolved</span>' : ''}
      ${tkt.status !== 'Resolved' ? `<button class="stage-btn lose" onclick="changeTicketStatus('${tkt.id}','Resolved');closeModal();showPage('support')">✕ Close</button>` : ''}
    </div>
  `, true);
}

// ────────────────────────────
// 15) HR MODULE (PRESERVED)
// ────────────────────────────

content.hr = function() {
  if (!hasPermission('canViewHR') && currentRole === 'sales') {
    return `<div style="text-align:center;padding:60px 20px">
      <div style="font-size:48px;margin-bottom:15px">🔒</div>
      <h3 style="margin-bottom:10px">Access Restricted</h3>
      <p style="color:#888;font-size:13px">หน้า HR Portal สำหรับ Manager / Admin เท่านั้น<br>ลองสลับ Role ที่มุมขวาบน</p>
    </div>`;
  }
  const pending = leaveRequests.filter(l => l.status === 'Pending').length;
  return `
    <div class="cards">
      <div class="card" style="cursor:pointer" onclick="showPage('leave')"><h3>📝 Leave Requests</h3><div class="value">${pending}</div><div class="sub">Pending requests</div></div>
      <div class="card" style="cursor:pointer" onclick="showPage('approvals')"><h3>✅ Approvals</h3><div class="value">${approvalItems.filter(a=>a.status==='Pending').length}</div><div class="sub">Awaiting approval</div></div>
      <div class="card"><h3>👥 Employees</h3><div class="value">6</div><div class="sub">Active</div></div>
      <div class="card"><h3>📢 Announcements</h3><div class="value">${announcements.length}</div><div class="sub">Active</div></div>
    </div>
    <div class="chart-grid">
      <div class="chart-box">
        <h4>📢 Announcements</h4>
        ${announcements.map(a => `<div style="padding:10px;border-bottom:1px solid #2a2a4e;cursor:pointer" onclick="openModal('<h3>${a.title}</h3><p style=\\'margin-top:10px;font-size:13px\\'>${a.detail}</p>')">
          <div style="font-size:13px">${a.title}</div>
        </div>`).join('')}
      </div>
      <div class="chart-box">
        <h4>📌 Company Policies</h4>
        ${companyPolicies.map(p => `<div style="padding:10px;border-bottom:1px solid #2a2a4e;cursor:pointer" onclick="openModal('<h3>${p.title}</h3><p style=\\'margin-top:10px;font-size:13px\\'>${p.detail}</p>')">
          <div style="font-size:13px">${p.title}</div>
        </div>`).join('')}
      </div>
    </div>
  `;
};

content.leave = function() {
  const used = leaveRequests.filter(l => l.status === 'Approved').reduce((s,l) => s + l.days, 0);
  const pending = leaveRequests.filter(l => l.status === 'Pending').reduce((s,l) => s + l.days, 0);
  return `
    <div class="cards">
      <div class="card"><h3>Annual Leave</h3><div class="value">${10 - used}/${10}</div><div class="sub">วันคงเหลือ</div></div>
      <div class="card"><h3>Used</h3><div class="value">${used} วัน</div></div>
      <div class="card"><h3>Pending</h3><div class="value" style="color:#fbbf24">${pending} วัน</div></div>
      <div class="card"><h3>Late Check-in</h3><div class="value" style="color:#ef4444">${lateCheckins.length}</div><div class="sub">This month</div></div>
    </div>
    <div style="display:flex;gap:15px;margin-bottom:15px">
      <button class="btn btn-primary" onclick="openLeaveForm()">📝 New Leave Request</button>
    </div>
    <div class="table-container">
      <table>
        <tr><th>ID</th><th>Employee</th><th>Type</th><th>Date</th><th>Days</th><th>Status</th></tr>
        ${leaveRequests.map(l => `<tr>
          <td>${l.id}</td><td>${l.employee}</td><td>${l.type}</td>
          <td>${l.startDate} → ${l.endDate}</td><td>${l.days}</td>
          <td><span class="status ${l.status==='Approved'?'won':l.status==='Pending'?'progress':'lost'}">${l.status}</span></td>
        </tr>`).join('')}
      </table>
    </div>
    <div class="deal-section" style="margin-top:20px">
      <div class="deal-section-title">Late Check-in Log</div>
      <div class="table-container">
        <table><tr><th>Employee</th><th>Date</th><th>Check-in</th><th>Late (min)</th></tr>
        ${lateCheckins.map(l => `<tr><td>${l.employee}</td><td>${l.date}</td><td>${l.checkIn}</td><td style="color:#ef4444">${l.minutes}</td></tr>`).join('')}
        </table>
      </div>
    </div>
  `;
};

function openLeaveForm() {
  openModal(`
    <h3 style="margin-bottom:15px">📝 New Leave Request</h3>
    <div class="form-group"><label>Leave Type</label><select id="leaveType"><option>ลาพักร้อน</option><option>ลาป่วย</option><option>ลากิจ</option></select></div>
    <div class="form-group"><label>Start Date</label><input type="date" id="leaveStart"></div>
    <div class="form-group"><label>End Date</label><input type="date" id="leaveEnd"></div>
    <div class="form-group"><label>Reason</label><textarea id="leaveReason" placeholder="เหตุผล..."></textarea></div>
    <button class="btn btn-primary" onclick="submitLeave()">Submit</button>
  `, false);
}

function submitLeave() {
  const type = document.getElementById('leaveType').value;
  const start = document.getElementById('leaveStart').value;
  const end = document.getElementById('leaveEnd').value;
  const reason = document.getElementById('leaveReason').value.trim();
  if (!start || !end) { alert('กรุณาเลือกวันที่'); return; }
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
  const lr = {
    id: nextId('LV', leaveRequests),
    employee: 'สมชาย วงศ์ดี', type, startDate: start, endDate: end, days, status: 'Pending', reason
  };
  leaveRequests.push(lr);
  approvalItems.push({
    id: nextId('APR', approvalItems),
    type: 'Leave', title: `${type} — ${lr.employee}`,
    detail: `${start} → ${end} (${days} วัน)`,
    status: 'Pending', date: new Date().toISOString().slice(0,10)
  });
  closeModal();
  showPage('leave');
}

content.approvals = function() {
  const tabs = ['Pending','Approved','Rejected'];
  return `
    <div style="display:flex;gap:8px;margin-bottom:15px">
      ${tabs.map(t => `<button class="btn ${t==='Pending'?'btn-primary':'btn-secondary'}" onclick="filterApprovals('${t}',this)">${t}</button>`).join('')}
    </div>
    <div class="table-container">
      <table id="approvalsTable">
        <tr><th>ID</th><th>Type</th><th>Title</th><th>Detail</th><th>Status</th><th>Action</th></tr>
        ${approvalItems.map(a => `
          <tr data-status="${a.status}">
            <td>${a.id}</td><td>${a.type}</td><td>${a.title}</td><td>${a.detail}</td>
            <td><span class="status ${a.status==='Approved'?'won':a.status==='Pending'?'progress':'lost'}">${a.status}</span></td>
            <td>${a.status === 'Pending' ? `
              <button class="btn btn-primary" style="font-size:11px;padding:4px 8px" onclick="handleApproval('${a.id}','Approved')">✓</button>
              <button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="handleApproval('${a.id}','Rejected')">✗</button>
            ` : ''}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
};

function filterApprovals(status, btn) {
  document.querySelectorAll('#approvalsTable tr[data-status]').forEach(row => {
    row.style.display = row.dataset.status === status ? '' : 'none';
  });
  btn.parentElement.querySelectorAll('.btn').forEach(b => { b.className = 'btn btn-secondary'; });
  btn.className = 'btn btn-primary';
}

function handleApproval(id, newStatus) {
  const item = approvalItems.find(a => a.id === id);
  if (!item) return;
  item.status = newStatus;
  // Sync to leave requests
  if (item.type === 'Leave') {
    const lr = leaveRequests.find(l => item.title.includes(l.employee) && l.status === 'Pending');
    if (lr) lr.status = newStatus;
  }
  // Sync GP approval to deal
  if (item.type === 'GP Approval' && item.dealId) {
    const deal = deals.find(d => d.id === item.dealId);
    if (deal && deal.gpApproval) {
      if (newStatus === 'Approved') approveGP(item.dealId);
      else if (newStatus === 'Rejected') {
        deal.gpApproval.status = 'Rejected';
        logActivity(item.dealId, 'approval', 'GP Approval: Rejected', 'Manager');
      }
    }
  }
  showPage('approvals');
}

// ────────────────────────────
// 16) REMAINING PAGES
// ────────────────────────────

content.calendar = function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthName = today.toLocaleDateString('th-TH', {month:'long', year:'numeric'});

  const events = {};
  function addEvt(dateStr, icon, text) {
    if (!dateStr) return;
    const parts = dateStr.split('-');
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    if (m === month && parseInt(parts[0]) === year) {
      events[d] = events[d] || [];
      events[d].push(icon + ' ' + text);
    }
  }

  // Deal events
  deals.forEach(d => {
    addEvt(d.createdAt, '📋', d.name + ' created');
    if (d.wonAt) addEvt(d.wonAt, '🎉', d.name + ' Won');
  });
  // PO ETAs
  purchaseOrders.forEach(po => {
    if (po.eta) addEvt(po.eta, '📦', po.id + ' ETA');
  });
  // Leave requests (approved)
  leaveRequests.filter(l => l.status === 'Approved').forEach(l => {
    addEvt(l.startDate, '🏖️', l.employee);
  });
  // Campaign events
  campaigns.forEach(c => {
    addEvt(c.createdAt, '📣', c.name);
  });
  // Support tickets
  tickets.forEach(t => {
    addEvt(t.created, '🎧', t.id);
  });

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate();
    const evts = events[d] || [];
    cells += `<div class="cal-day ${isToday?'today':''}">
      <span class="cal-day-num">${d}</span>
      ${evts.slice(0, 3).map(e=>`<div class="cal-event">${e}</div>`).join('')}
      ${evts.length > 3 ? `<div style="font-size:9px;color:#888;margin-top:2px">+${evts.length-3} more</div>` : ''}
    </div>`;
  }

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
      <div style="font-size:16px;font-weight:bold">${monthName}</div>
      <div style="display:flex;gap:6px">
        <span style="padding:3px 8px;background:#166534;color:#4ade80;border-radius:8px;font-size:10px">🎉 Won</span>
        <span style="padding:3px 8px;background:#1e40af;color:#60a5fa;border-radius:8px;font-size:10px">📋 Deal</span>
        <span style="padding:3px 8px;background:#854d0e;color:#fbbf24;border-radius:8px;font-size:10px">📦 PO</span>
        <span style="padding:3px 8px;background:#4a1d7a;color:#c084fc;border-radius:8px;font-size:10px">🏖️ Leave</span>
      </div>
    </div>
    <div class="calendar-grid">
      <div class="cal-header">Sun</div><div class="cal-header">Mon</div><div class="cal-header">Tue</div>
      <div class="cal-header">Wed</div><div class="cal-header">Thu</div><div class="cal-header">Fri</div><div class="cal-header">Sat</div>
      ${cells}
    </div>
  `;
};

content.activity = function() {
  const sorted = [...activities].sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  const actIcons = { 'stage-change':'🔄', comment:'💬', system:'⚙️', approval:'✅', po:'📦', peak:'⚡' };
  return `
    <div class="activity-feed">
      ${sorted.map(a => {
        const deal = deals.find(d => d.id === a.dealId);
        return `
          <div class="activity-item" ${a.dealId ? `style="cursor:pointer" onclick="openDealDetail('${a.dealId}')"` : ''}>
            <div class="activity-icon">${actIcons[a.type]||'📝'}</div>
            <div class="activity-content">
              <h5>${a.message}</h5>
              <p>${deal?.name||a.dealId} · ${a.user}</p>
            </div>
            <div class="activity-time">${a.timestamp}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

content.peak = function() {
  return `
    <div class="cards">
      <div class="card"><h3>Total Records</h3><div class="value">${peakSyncs.length}</div></div>
      <div class="card"><h3>Synced</h3><div class="value">${peakSyncs.filter(p=>p.status==='Synced').length}</div></div>
      <div class="card"><h3>Pending</h3><div class="value" style="color:#fbbf24">${peakSyncs.filter(p=>p.status==='Pending').length}</div></div>
      <div class="card"><h3>Failed</h3><div class="value" style="color:#ef4444">${peakSyncs.filter(p=>p.status==='Failed').length}</div></div>
    </div>
    <div class="table-container">
      <table>
        <tr><th>ID</th><th>Deal</th><th>Doc Type</th><th>Amount</th><th>Status</th><th>PEAK Ref</th><th>Synced At</th><th>Action</th></tr>
        ${peakSyncs.map(ps => {
          const deal = deals.find(d => d.id === ps.dealId);
          return `<tr>
            <td>${ps.id}</td>
            <td style="cursor:pointer;color:#4ade80" onclick="openDealDetail('${ps.dealId}')">${deal?.name||ps.dealId}</td>
            <td>${ps.docType}</td><td>${formatBahtFull(ps.amount)}</td>
            <td><span class="status ${ps.status==='Synced'?'won':ps.status==='Failed'?'lost':'progress'}">${ps.status}</span></td>
            <td>${ps.peakRef||'—'}</td><td>${ps.syncedAt||'—'}</td>
            <td>${ps.status==='Pending'||ps.status==='Failed' ? `<button class="btn btn-secondary" style="font-size:11px;padding:4px 8px" onclick="simulatePeakSync('${ps.id}');showPage('peak')">Sync</button>` : '✓'}</td>
          </tr>`;
        }).join('')}
        ${peakSyncs.length===0 ? '<tr><td colspan="8" style="color:#666;text-align:center">No sync records — records are created when deals are Won</td></tr>' : ''}
      </table>
    </div>
    <div style="margin-top:15px;padding:15px;background:#16213e;border-radius:10px">
      <h4 style="font-size:12px;color:#888;margin-bottom:8px">ℹ️ PEAK Integration Rules</h4>
      <p style="font-size:12px;color:#666">This system does NOT perform accounting. It sends finalized records to PEAK and tracks sync status only. No ledger logic, no tax calculation.</p>
    </div>
  `;
};

// ────────────────────────────
// 16) DATE FILTER UTILITY
// ────────────────────────────
let dateFilterFrom = '';
let dateFilterTo = '';

function renderDateFilter(module) {
  return `<div class="date-filter-row">
    <label style="font-size:11px;color:var(--text-muted,#888)">จาก:</label>
    <input type="date" id="dateFrom_${module}" value="${dateFilterFrom}" onchange="dateFilterFrom=this.value;showPage('${module}')" style="padding:6px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:4px;color:var(--text-primary,#fff);font-size:12px">
    <label style="font-size:11px;color:var(--text-muted,#888)">ถึง:</label>
    <input type="date" id="dateTo_${module}" value="${dateFilterTo}" onchange="dateFilterTo=this.value;showPage('${module}')" style="padding:6px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:4px;color:var(--text-primary,#fff);font-size:12px">
    <button class="btn btn-secondary" style="font-size:11px;padding:5px 10px" onclick="dateFilterFrom='';dateFilterTo='';showPage('${module}')">Reset</button>
    <select onchange="applyQuickDateFilter(this.value,'${module}')" style="padding:6px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:4px;color:var(--text-primary,#fff);font-size:12px">
      <option value="">— Quick —</option>
      <option value="7d">7 วัน</option>
      <option value="30d">30 วัน</option>
      <option value="90d">90 วัน</option>
      <option value="thisMonth">เดือนนี้</option>
      <option value="lastMonth">เดือนที่แล้ว</option>
      <option value="thisQ">ไตรมาสนี้</option>
    </select>
  </div>`;
}

function applyQuickDateFilter(preset, module) {
  const now = new Date();
  let from = new Date();
  if (preset === '7d') from.setDate(now.getDate() - 7);
  else if (preset === '30d') from.setDate(now.getDate() - 30);
  else if (preset === '90d') from.setDate(now.getDate() - 90);
  else if (preset === 'thisMonth') from = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (preset === 'lastMonth') { from = new Date(now.getFullYear(), now.getMonth()-1, 1); now.setDate(0); }
  else if (preset === 'thisQ') { const q = Math.floor(now.getMonth()/3)*3; from = new Date(now.getFullYear(), q, 1); }
  else { dateFilterFrom=''; dateFilterTo=''; showPage(module); return; }
  dateFilterFrom = from.toISOString().slice(0,10);
  dateFilterTo = (preset === 'lastMonth' ? now : new Date()).toISOString().slice(0,10);
  showPage(module);
}

function filterByDate(items, dateField) {
  if (!dateFilterFrom && !dateFilterTo) return items;
  return items.filter(item => {
    const d = item[dateField];
    if (!d) return true;
    if (dateFilterFrom && d < dateFilterFrom) return false;
    if (dateFilterTo && d > dateFilterTo) return false;
    return true;
  });
}

// ────────────────────────────
// 17) TASKS — Assignment System
// ────────────────────────────
const taskStatuses = ['Open','In Progress','Done'];

content.tasks = function() {
  const filteredTasks = filterByDate(tasks, 'dueDate');
  const open = filteredTasks.filter(t=>t.status==='Open').length;
  const inProg = filteredTasks.filter(t=>t.status==='In Progress').length;
  const done = filteredTasks.filter(t=>t.status==='Done').length;
  const overdue = filteredTasks.filter(t=>t.status!=='Done' && t.dueDate < new Date().toISOString().slice(0,10)).length;

  return `
    <div class="cards">
      <div class="card"><h3>Open</h3><div class="value">${open}</div></div>
      <div class="card"><h3>In Progress</h3><div class="value" style="color:#fbbf24">${inProg}</div></div>
      <div class="card"><h3>Done</h3><div class="value" style="color:#4ade80">${done}</div></div>
      <div class="card"><h3>Overdue</h3><div class="value" style="color:#ef4444">${overdue}</div></div>
    </div>
    ${renderDateFilter('tasks')}
    <div class="search-box" style="margin-top:12px">
      <input type="text" placeholder="Search tasks..." onkeyup="filterTasksUI(this.value)">
      <select id="taskFilterOwner" onchange="showPage('tasks')" style="padding:8px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:6px;color:var(--text-primary,#fff);font-size:12px">
        <option value="">ทุกคน</option>
        ${teamMembers.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
      </select>
      ${hasPermission('canApprove') ? `<button class="btn btn-primary" onclick="openNewTaskModal()">+ มอบหมายงาน</button>` : ''}
    </div>
    <div class="kanban" style="margin-top:15px">
      ${taskStatuses.map(status => {
        const statusTasks = filteredTasks.filter(t => t.status === status);
        const color = status==='Open'?'#60a5fa':status==='In Progress'?'#fbbf24':'#4ade80';
        return `<div class="kanban-col">
          <h4 style="border-left:3px solid ${color};padding-left:8px">${status} <span class="kanban-count">${statusTasks.length}</span></h4>
          ${statusTasks.map(t => {
            const isOverdue = t.status!=='Done' && t.dueDate < new Date().toISOString().slice(0,10);
            return `<div class="kanban-card" onclick="openTaskDetail('${t.id}')" style="${isOverdue?'border-left:3px solid #ef4444':''}">
              <h5>${t.title}</h5>
              <p>👤 ${t.assignedTo} · 📅 ${t.dueDate}</p>
              <div style="display:flex;justify-content:space-between;margin-top:6px">
                <span class="status ${t.priority==='High'?'lost':t.priority==='Medium'?'progress':'new'}" style="font-size:10px">${t.priority}</span>
                ${t.dealId ? `<span style="font-size:10px;color:#4ade80;cursor:pointer" onclick="event.stopPropagation();openDealDetail('${t.dealId}')">💰 ${t.dealId}</span>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>
  `;
};

function filterTasksUI(q) {
  q = q.toLowerCase();
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function openNewTaskModal() {
  openModal(`
    <h3 style="margin-bottom:15px">📋 มอบหมายงานใหม่</h3>
    <div class="form-group"><label>หัวข้องาน</label><input type="text" id="newTaskTitle" placeholder="ระบุสิ่งที่ต้องทำ"></div>
    <div class="form-group"><label>รายละเอียด</label><textarea id="newTaskDesc" placeholder="อธิบายรายละเอียดเพิ่มเติม"></textarea></div>
    <div class="form-group"><label>มอบหมายให้</label><select id="newTaskAssign">${teamMembers.map(m => `<option value="${m.name}">${m.avatar} ${m.name} (${m.role})</option>`).join('')}</select></div>
    <div class="form-group"><label>เกี่ยวข้องกับ Deal</label><select id="newTaskDeal"><option value="">— ไม่ระบุ —</option>${deals.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
    <div class="form-group"><label>Deadline</label><input type="date" id="newTaskDue" value="${new Date(Date.now()+7*86400000).toISOString().slice(0,10)}"></div>
    <div class="form-group"><label>Priority</label><select id="newTaskPri"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
    <button class="btn btn-primary" onclick="createNewTask()">สร้างงาน</button>
  `, false);
}

function createNewTask() {
  const title = document.getElementById('newTaskTitle').value.trim();
  if (!title) { alert('กรุณากรอกหัวข้องาน'); return; }
  tasks.push({
    id: 'TSK-' + String(tasks.length + 1).padStart(3,'0'),
    title,
    description: document.getElementById('newTaskDesc')?.value || '',
    assignedTo: document.getElementById('newTaskAssign').value,
    assignedBy: rolePermissions[currentRole].label,
    dealId: document.getElementById('newTaskDeal').value || null,
    dueDate: document.getElementById('newTaskDue').value,
    status: 'Open',
    priority: document.getElementById('newTaskPri').value,
    createdAt: new Date().toISOString().slice(0,10)
  });
  closeModal();
  showPage('tasks');
}

function openTaskDetail(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const deal = t.dealId ? deals.find(d => d.id === t.dealId) : null;
  const isOverdue = t.status !== 'Done' && t.dueDate < new Date().toISOString().slice(0,10);

  openModal(`
    <div class="deal-header">
      <h2>📋 ${t.title}</h2>
      <span class="status ${t.status==='Done'?'won':t.status==='Open'?'new':'progress'}">${t.status}</span>
    </div>
    ${isOverdue ? '<div class="deal-locked-banner" style="background:#7f1d1d;color:#ef4444">⚠️ เกินกำหนด!</div>' : ''}
    <div class="deal-meta">
      <div class="deal-meta-item">มอบหมายให้<span>👤 ${t.assignedTo}</span></div>
      <div class="deal-meta-item">มอบหมายโดย<span>${t.assignedBy}</span></div>
      <div class="deal-meta-item">Deadline<span>📅 ${t.dueDate}</span></div>
      <div class="deal-meta-item">Priority<span>${t.priority}</span></div>
      <div class="deal-meta-item">Created<span>${t.createdAt}</span></div>
      <div class="deal-meta-item">Deal<span>${deal ? `<a style="color:#4ade80;cursor:pointer" onclick="closeModal();openDealDetail('${t.dealId}')">${deal.name}</a>` : '—'}</span></div>
    </div>
    ${t.description ? `<div style="padding:12px;background:var(--bg-primary,#1a1a2e);border-radius:8px;font-size:13px;color:#ccc;line-height:1.6;margin-bottom:15px">${t.description}</div>` : ''}
    <div class="stage-actions">
      ${t.status === 'Open' ? `<button class="stage-btn next" onclick="changeTaskStatus('${id}','In Progress')">▶ เริ่มทำ</button>` : ''}
      ${t.status === 'In Progress' ? `<button class="stage-btn win" onclick="changeTaskStatus('${id}','Done')">✅ เสร็จแล้ว</button>` : ''}
      ${t.status === 'Done' ? '<span style="color:#4ade80;font-size:13px">✅ งานเสร็จสมบูรณ์</span>' : ''}
      ${t.status !== 'Done' && hasPermission('canApprove') ? `<button class="stage-btn lose" onclick="changeTaskStatus('${id}','Open')">↩ Reset</button>` : ''}
    </div>
  `, true);
}

function changeTaskStatus(id, newStatus) {
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.status = newStatus;
    if (t.dealId) logActivity(t.dealId, 'system', `📋 Task "${t.title}" → ${newStatus}`, t.assignedTo);
  }
  openTaskDetail(id);
}

// ────────────────────────────
// 18) TARGETS — Org / Team / Individual
// ────────────────────────────

content.targets = function() {
  const typeLabels = { org:'🏢 องค์กร', team:'👥 ทีม', individual:'👤 บุคคล' };
  return `
    <div class="search-box">
      <select id="targetTypeFilter" onchange="showPage('targets')" style="padding:8px;background:var(--bg-primary,#1a1a2e);border:1px solid var(--border,#2a2a4e);border-radius:6px;color:var(--text-primary,#fff);font-size:12px">
        <option value="">ทุกระดับ</option>
        <option value="org">🏢 องค์กร</option>
        <option value="team">👥 ทีม</option>
        <option value="individual">👤 บุคคล</option>
      </select>
      ${hasPermission('canApprove') ? '<button class="btn btn-primary" onclick="openNewTargetModal()">+ ตั้งเป้า</button>' : ''}
    </div>
    ${['org','team','individual'].map(type => {
      const typeTargets = targets.filter(t => t.type === type);
      if (typeTargets.length === 0) return '';
      return `
        <div class="chart-box" style="margin-top:15px">
          <h4>${typeLabels[type]} Targets</h4>
          ${typeTargets.map(t => {
            const actual = computeTargetActual(t);
            const pct = t.targetValue > 0 ? Math.min((actual / t.targetValue) * 100, 150) : 0;
            const pctDisplay = t.targetValue > 0 ? (actual / t.targetValue * 100).toFixed(1) : '0';
            const barColor = pct >= 100 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#ef4444';
            return `<div style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:13px;font-weight:bold">${t.name}</span>
                <span style="font-size:12px;color:${barColor}">${pctDisplay}%</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:11px;color:var(--text-muted,#888)">${t.owner} · ${t.period}</span>
                <span style="font-size:11px;color:var(--text-dim,#666)">${formatTargetValue(actual, t.metric)} / ${formatTargetValue(t.targetValue, t.metric)}</span>
              </div>
              <div class="bar-track" style="height:16px"><div class="bar-fill" style="width:${Math.min(pct,100)}%;background:${barColor}"></div></div>
            </div>`;
          }).join('')}
        </div>`;
    }).join('')}
  `;
};

function computeTargetActual(target) {
  if (target.metric === 'revenue') {
    const wonDeals = deals.filter(d => d.stage === 'Won');
    if (target.type === 'org') return wonDeals.reduce((s,d) => s + computeDeal(d).totalSell, 0);
    if (target.type === 'team') {
      const teamMems = teamMembers.filter(m => m.team === target.owner).map(m => m.name);
      return wonDeals.filter(d => teamMems.includes(d.owner)).reduce((s,d) => s + computeDeal(d).totalSell, 0);
    }
    return wonDeals.filter(d => d.owner === target.owner).reduce((s,d) => s + computeDeal(d).totalSell, 0);
  }
  if (target.metric === 'winRate') {
    const total = deals.filter(d => ['Won','Lost'].includes(d.stage)).length;
    return total > 0 ? (deals.filter(d => d.stage === 'Won').length / total * 100) : 0;
  }
  if (target.metric === 'dealsWon') {
    return deals.filter(d => d.stage === 'Won' && d.owner === target.owner).length;
  }
  return 0;
}

function formatTargetValue(val, metric) {
  if (metric === 'revenue') return formatBaht(val);
  if (metric === 'winRate') return val.toFixed(1) + '%';
  return String(Math.round(val));
}

function openNewTargetModal() {
  openModal(`
    <h3 style="margin-bottom:15px">🎯 ตั้งเป้าหมายใหม่</h3>
    <div class="form-group"><label>ชื่อเป้าหมาย</label><input type="text" id="newTgtName" placeholder="เช่น Revenue Target Q2"></div>
    <div class="form-group"><label>ระดับ</label><select id="newTgtType"><option value="org">🏢 องค์กร</option><option value="team">👥 ทีม</option><option value="individual">👤 บุคคล</option></select></div>
    <div class="form-group"><label>ตัวชี้วัด</label><select id="newTgtMetric"><option value="revenue">Revenue (฿)</option><option value="dealsWon">Deals Won (#)</option><option value="winRate">Win Rate (%)</option></select></div>
    <div class="form-group"><label>เป้าหมาย</label><input type="number" id="newTgtValue" value="5000000" min="0"></div>
    <div class="form-group"><label>ช่วงเวลา</label><input type="text" id="newTgtPeriod" value="2025-Q1" placeholder="เช่น 2025-Q1"></div>
    <div class="form-group"><label>เจ้าของเป้า</label><select id="newTgtOwner">
      <option value="Organization">Organization</option>
      <option value="Sales A">Sales A</option><option value="Sales B">Sales B</option>
      ${teamMembers.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
    </select></div>
    <button class="btn btn-primary" onclick="createNewTarget()">ตั้งเป้า</button>
  `, false);
}

function createNewTarget() {
  const name = document.getElementById('newTgtName').value.trim();
  if (!name) { alert('กรุณากรอกชื่อเป้าหมาย'); return; }
  targets.push({
    id: 'TGT-' + String(targets.length + 1).padStart(3,'0'),
    type: document.getElementById('newTgtType').value,
    name,
    metric: document.getElementById('newTgtMetric').value,
    targetValue: parseFloat(document.getElementById('newTgtValue').value) || 0,
    period: document.getElementById('newTgtPeriod').value,
    owner: document.getElementById('newTgtOwner').value
  });
  closeModal();
  showPage('targets');
}

// ────────────────────────────
// 19) PERFORMANCE — Multi-Dimension Analytics
// ────────────────────────────

content.performance = function() {
  const filtered = filterByDate(deals, 'createdAt');
  const wonFiltered = filtered.filter(d => d.stage === 'Won');
  const lostFiltered = filtered.filter(d => d.stage === 'Lost');

  // By Owner
  const owners = [...new Set(deals.map(d => d.owner))];
  const ownerPerf = owners.map(o => {
    const own = filtered.filter(d => d.owner === o);
    const won = own.filter(d => d.stage === 'Won');
    const lost = own.filter(d => d.stage === 'Lost');
    const revenue = won.reduce((s,d) => s + computeDeal(d).totalSell, 0);
    const avgGP = own.length > 0 ? own.reduce((s,d) => s + computeDeal(d).gpPercent, 0) / own.length : 0;
    const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length) * 100) : 0;
    const tasksDone = tasks.filter(t => t.assignedTo === o && t.status === 'Done').length;
    const tasksTotal = tasks.filter(t => t.assignedTo === o).length;
    return { owner:o, deals:own.length, won:won.length, lost:lost.length, revenue, avgGP, winRate, tasksDone, tasksTotal };
  });

  // By Product
  const productPerf = products.map(p => {
    let totalQty = 0, totalRev = 0;
    filtered.forEach(d => {
      d.items.filter(i => i.sku === p.sku).forEach(i => { totalQty += i.qty; totalRev += i.qty * i.sellPrice; });
    });
    return { product:p.name, sku:p.sku, qty:totalQty, revenue:totalRev };
  }).filter(p => p.qty > 0).sort((a,b) => b.revenue - a.revenue);

  // By Channel
  const channelMap = {};
  filtered.forEach(d => {
    const cust = getCustomer(d.customerId);
    const ch = cust?.channel || 'Unknown';
    if (!channelMap[ch]) channelMap[ch] = { deals:0, won:0, revenue:0 };
    channelMap[ch].deals++;
    if (d.stage === 'Won') { channelMap[ch].won++; channelMap[ch].revenue += computeDeal(d).totalSell; }
  });
  const channelPerf = Object.entries(channelMap).map(([ch,data]) => ({ channel:ch, ...data, winRate: data.deals > 0 ? (data.won/data.deals*100) : 0 }));

  // By Stage Time (avg days in each stage)
  const totalRevenue = wonFiltered.reduce((s,d) => s + computeDeal(d).totalSell, 0);
  const totalDeals = filtered.length;
  const avgDealSize = wonFiltered.length > 0 ? totalRevenue / wonFiltered.length : 0;

  return `
    <div class="cards">
      <div class="card"><h3>Total Revenue</h3><div class="value">${formatBaht(totalRevenue)}</div><div class="sub">${wonFiltered.length} deals won</div></div>
      <div class="card"><h3>Avg Deal Size</h3><div class="value">${formatBaht(avgDealSize)}</div></div>
      <div class="card"><h3>Total Deals</h3><div class="value">${totalDeals}</div></div>
      <div class="card"><h3>Win Rate</h3><div class="value">${(wonFiltered.length+lostFiltered.length)>0 ? (wonFiltered.length/(wonFiltered.length+lostFiltered.length)*100).toFixed(1) : '0'}%</div></div>
    </div>
    ${renderDateFilter('performance')}
    <div class="chart-grid" style="margin-top:15px">
      <div class="chart-box">
        <h4>👤 Performance by Person</h4>
        <table style="width:100%;font-size:12px">
          <tr><th>Owner</th><th>Deals</th><th>Won</th><th>Win%</th><th>Revenue</th><th>Avg GP%</th><th>Tasks</th></tr>
          ${ownerPerf.map(o => `<tr>
            <td><strong>${o.owner}</strong></td>
            <td>${o.deals}</td>
            <td style="color:#4ade80">${o.won}</td>
            <td>${o.winRate.toFixed(1)}%</td>
            <td>${formatBaht(o.revenue)}</td>
            <td><span class="gp-badge ${gpClass(o.avgGP)}">${o.avgGP.toFixed(1)}%</span></td>
            <td>${o.tasksDone}/${o.tasksTotal}</td>
          </tr>`).join('')}
        </table>
      </div>

      <div class="chart-box">
        <h4>📦 Performance by Product</h4>
        ${productPerf.length === 0 ? '<p style="color:#666;font-size:12px">ไม่มีข้อมูลในช่วงเวลานี้</p>' :
          productPerf.map(p => {
            const maxRev = Math.max(...productPerf.map(x => x.revenue), 1);
            return `<div class="pipeline-bar">
              <div class="bar-label" style="width:130px">${p.product}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${Math.max(p.revenue/maxRev*100,3)}%;background:#818cf8"></div></div>
              <div class="bar-value">${formatBaht(p.revenue)} (${p.qty} ${products.find(x=>x.sku===p.sku)?.unit||'pcs'})</div>
            </div>`;
          }).join('')}
      </div>

      <div class="chart-box">
        <h4>📡 Performance by Channel</h4>
        <table style="width:100%;font-size:12px">
          <tr><th>Channel</th><th>Deals</th><th>Won</th><th>Win%</th><th>Revenue</th></tr>
          ${channelPerf.map(c => `<tr>
            <td><strong>${c.channel}</strong></td>
            <td>${c.deals}</td>
            <td style="color:#4ade80">${c.won}</td>
            <td>${c.winRate.toFixed(1)}%</td>
            <td>${formatBaht(c.revenue)}</td>
          </tr>`).join('')}
          ${channelPerf.length === 0 ? '<tr><td colspan="5" style="color:#666">ไม่มีข้อมูล</td></tr>' : ''}
        </table>
      </div>

      <div class="chart-box">
        <h4>🎯 Target Achievement</h4>
        ${targets.slice(0,6).map(t => {
          const actual = computeTargetActual(t);
          const pct = t.targetValue > 0 ? Math.min(actual/t.targetValue*100, 150) : 0;
          const barColor = pct >= 100 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#ef4444';
          return `<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
              <span>${t.name}</span>
              <span style="color:${barColor}">${(actual/t.targetValue*100).toFixed(1)}%</span>
            </div>
            <div class="bar-track" style="height:12px"><div class="bar-fill" style="width:${Math.min(pct,100)}%;background:${barColor}"></div></div>
          </div>`;
        }).join('')}
        <p style="font-size:11px;color:var(--text-dim,#666);margin-top:8px;cursor:pointer" onclick="showPage('targets')">ดูเป้าหมายทั้งหมด →</p>
      </div>
    </div>
  `;
};

// ────────────────────────────
// INIT
// ────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  showPage('dashboard');
  updateNotifBadge();
  initTheme();
  initRole();
  if (!localStorage.getItem('feicoOnboarded')) startOnboarding();
});

// ========================================
// MOBILE SIDEBAR
// ========================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
}

// ========================================
// THEME TOGGLE (Dark / Light)
// ========================================
let currentTheme = 'dark';
function initTheme() {
  currentTheme = localStorage.getItem('feicoTheme') || 'dark';
  applyTheme(currentTheme);
}
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('feicoTheme', currentTheme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// ========================================
// ROLE SIMULATION
// ========================================
let currentRole = 'sales';
const rolePermissions = {
  admin:   { canApprove:true, canDelete:true, canExport:true, canViewHR:true, canBulk:true, label:'👑 Admin' },
  manager: { canApprove:true, canDelete:false, canExport:true, canViewHR:true, canBulk:true, label:'👔 Manager' },
  sales:   { canApprove:false, canDelete:false, canExport:true, canViewHR:false, canBulk:false, label:'💼 Sales' }
};
function initRole() {
  currentRole = localStorage.getItem('feicoRole') || 'sales';
  const sel = document.getElementById('roleSelector');
  if (sel) sel.value = currentRole;
}
function switchRole(role) {
  currentRole = role;
  localStorage.setItem('feicoRole', role);
  showPage(currentPage || 'dashboard');
}
function hasPermission(perm) { return rolePermissions[currentRole]?.[perm] || false; }

// ========================================
// GLOBAL SEARCH
// ========================================
function globalSearch(q) {
  const resultsEl = document.getElementById('globalSearchResults');
  if (!q || q.length < 2) { resultsEl.classList.add('hidden'); return; }
  q = q.toLowerCase();
  const results = [];

  // Search deals
  deals.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
    .slice(0,3).forEach(d => results.push({ icon:'💰', text:d.name, sub:d.stage + ' — ' + formatBaht(computeDeal(d).totalSell), action:`openDealDetail('${d.id}')` }));
  // Search customers
  customers.filter(c => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
    .slice(0,3).forEach(c => results.push({ icon:'👥', text:c.name, sub:c.company || c.type, action:`showPage('customers')` }));
  // Search products
  products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .slice(0,3).forEach(p => results.push({ icon:'📦', text:p.name, sub:p.sku + ' — ' + formatBahtFull(p.sellPrice), action:`showPage('products')` }));
  // Search tickets
  tickets.filter(t => t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    .slice(0,2).forEach(t => results.push({ icon:'🎧', text:t.subject, sub:t.status, action:`openTicketDetail('${t.id}')` }));
  // Search campaigns
  campaigns.filter(c => c.name.toLowerCase().includes(q))
    .slice(0,2).forEach(c => results.push({ icon:'📣', text:c.name, sub:c.stage, action:`openCampaignDetail('${c.id}')` }));

  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="gsr-item" style="color:#666">ไม่พบผลลัพธ์</div>';
  } else {
    resultsEl.innerHTML = results.map(r => `
      <div class="gsr-item" onmousedown="${r.action}">
        <span class="gsr-icon">${r.icon}</span>
        <div class="gsr-text"><div class="gsr-title">${r.text}</div><div class="gsr-sub">${r.sub}</div></div>
      </div>
    `).join('');
  }
  resultsEl.classList.remove('hidden');
}

// ========================================
// EXPORT CSV
// ========================================
function exportDealsCSV() {
  const headers = ['Deal ID','Name','Customer','Stage','Total Sell','GP%','Owner','Won At'];
  const rows = deals.map(d => {
    const calc = computeDeal(d);
    const cust = getCustomer(d.customerId);
    return [d.id, d.name, cust?.name||'', d.stage, calc.totalSell, calc.gpPercent.toFixed(2)+'%', d.owner, d.wonAt||''];
  });
  let csv = headers.join(',') + '\n' + rows.map(r => r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  downloadFile(csv, 'deals-export.csv', 'text/csv');
}
function exportDashboardCSV() {
  const activeDeals = deals.filter(d => !['Won','Lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const lines = [
    'Metric,Value',
    'Pipeline Value,' + activeDeals.reduce((s,d)=>s+computeDeal(d).totalSell,0),
    'Closed Won,' + wonDeals.reduce((s,d)=>s+computeDeal(d).totalSell,0),
    'Win Rate,' + (deals.length>0?(wonDeals.length/deals.length*100).toFixed(1)+'%':'0%'),
    'Active Deals,' + activeDeals.length,
    'Won Deals,' + wonDeals.length,
    'Lost Deals,' + deals.filter(d=>d.stage==='Lost').length,
    '',
    'Deal ID,Name,Stage,Value,GP%'
  ];
  deals.forEach(d => {
    const calc = computeDeal(d);
    lines.push(`${d.id},${d.name},${d.stage},${calc.totalSell},${calc.gpPercent.toFixed(2)}%`);
  });
  downloadFile(lines.join('\n'), 'dashboard-export.csv', 'text/csv');
}
function downloadFile(content, filename, type) {
  const blob = new Blob(['\uFEFF'+content], { type: type+';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ========================================
// ONBOARDING TOUR
// ========================================
let onboardStep = 0;
const onboardSteps = [
  { title:'👋 ยินดีต้อนรับสู่ FeicoCRM!', body:'ระบบ CRM ที่ออกแบบมาสำหรับธุรกิจ Solar & Energy<br><br>มาดูฟีเจอร์หลักกันเลย' },
  { title:'📋 Kanban Board', body:'ลาก-วาง Deal ผ่าน stage ได้เลย<br>Lead → Qualified → Quotation → Negotiation → Won<br><br>ระบบจะ <b>บล็อกถ้า GP ต่ำกว่า 3%</b>' },
  { title:'💰 Deal Diagnostic Center', body:'คลิกที่ Deal card ใดๆ เพื่อเปิดศูนย์วิเคราะห์<br>แก้ไขรายการ ดู GP ข้ออนุมัติ ดู PO และ PEAK ได้ครบ' },
  { title:'🔍 Global Search', body:'ค้นหาข้ามทุก module ได้เลย — deals, ลูกค้า, สินค้า, ticket, campaign<br>พิมพ์ที่ช่องค้นหาด้านบน' },
  { title:'👤 Role Simulation', body:'ลองสลับ Role ที่มุมขวาบน<br><b>Admin</b> = เห็นทุกอย่าง + approve ได้<br><b>Manager</b> = approve + bulk actions<br><b>Sales</b> = จัดการ deal ตัวเอง' },
  { title:'🌙 Dark/Light Mode', body:'กดปุ่ม 🌙 ที่ topbar เพื่อสลับธีม<br>ระบบจะจำค่าที่เลือกไว้' },
  { title:'📤 Export Data', body:'กดปุ่ม Export ในหน้า Dashboard หรือ Deals เพื่อดาวน์โหลด CSV<br>เปิดใน Excel ได้เลย' },
  { title:'✅ พร้อมใช้งาน!', body:'ลองสำรวจแต่ละ module ได้เลยครับ<br>ทุกข้อมูลเป็น demo data — ทดลองได้อย่างอิสระ' }
];
function startOnboarding() {
  onboardStep = 0;
  renderOnboardStep();
  document.getElementById('onboardingOverlay').classList.remove('hidden');
}
function nextOnboardStep() {
  onboardStep++;
  if (onboardStep >= onboardSteps.length) { endOnboarding(); return; }
  renderOnboardStep();
}
function endOnboarding() {
  document.getElementById('onboardingOverlay').classList.add('hidden');
  localStorage.setItem('feicoOnboarded', '1');
}
function renderOnboardStep() {
  const step = onboardSteps[onboardStep];
  document.getElementById('onboardingContent').innerHTML = `
    <h2 style="margin-bottom:12px">${step.title}</h2>
    <p style="font-size:14px;line-height:1.8;color:#ccc">${step.body}</p>
  `;
  document.getElementById('onboardingDots').innerHTML = onboardSteps.map((_, i) =>
    `<span class="ob-dot ${i===onboardStep?'active':''}""></span>`
  ).join('');
  document.getElementById('onboardNext').textContent = onboardStep === onboardSteps.length-1 ? 'เริ่มใช้งาน 🚀' : 'ถัดไป →';
}
function resetOnboarding() { localStorage.removeItem('feicoOnboarded'); startOnboarding(); }
