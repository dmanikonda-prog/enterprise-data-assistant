import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = '/Users/muralidharmanikonda/Documents/cursorprojects/SampleData';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data');

function loadJSON(dir, file) {
  const filePath = path.join(BASE_PATH, dir, file);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeOutput(filename, data) {
  const outputFile = path.join(OUTPUT_PATH, filename);
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(2);
  console.log(`  ✓ ${filename}: ${data.length} records (${sizeKB} KB)`);
}

// ============================================================
// 1. SALES DENORMALIZED
// ============================================================
function generateSales() {
  console.log('\n📦 SALES SCHEMA');
  console.log('─'.repeat(40));

  const orders = loadJSON('sales', 'orders.json');
  const orderLines = loadJSON('sales', 'order_lines.json');
  const customers = loadJSON('sales', 'customers.json');
  const products = loadJSON('sales', 'product_catalog.json');
  const pricingData = loadJSON('sales', 'pricing.json');
  const promotionsData = loadJSON('sales', 'promotions.json');
  const territoriesData = loadJSON('sales', 'territories.json');
  const contractsData = loadJSON('sales', 'contracts.json');
  const commissionsData = loadJSON('sales', 'commissions.json');
  const quotesData = loadJSON('sales', 'quotes.json');

  console.log(`  Loaded: orders(${orders.length}), order_lines(${orderLines.length}), customers(${customers.length}), products(${products.length})`);
  console.log(`  Loaded: pricing(${pricingData.length}), promotions(${promotionsData.length}), territories(${territoriesData.length})`);
  console.log(`  Loaded: contracts(${contractsData.length}), commissions(${commissionsData.length}), quotes(${quotesData.length})`);

  // Build lookup maps
  const orderMap = new Map(orders.map(o => [o.ORDER_ID, o]));
  const customerMap = new Map(customers.map(c => [c.CUSTOMER_ID, c]));
  const productMap = new Map(products.map(p => [p.PRODUCT_ID, p]));

  // Get latest pricing per product
  const latestPricing = new Map();
  pricingData.forEach(p => {
    const existing = latestPricing.get(p.PRODUCT_ID);
    if (!existing || p.EFFECTIVE_FROM > existing.EFFECTIVE_FROM) {
      latestPricing.set(p.PRODUCT_ID, p);
    }
  });

  // Build customer quotes map
  const customerQuotes = new Map();
  quotesData.forEach(q => {
    if (!customerQuotes.has(q.CUSTOMER_ID)) {
      customerQuotes.set(q.CUSTOMER_ID, []);
    }
    customerQuotes.get(q.CUSTOMER_ID).push(q);
  });

  // Denormalize: order_lines as the grain
  const salesDenormalized = orderLines.map(line => {
    const order = orderMap.get(line.ORDER_ID);
    const customer = order ? customerMap.get(order.CUSTOMER_ID) : null;
    const product = productMap.get(line.PRODUCT_ID);
    const latestPrice = latestPricing.get(line.PRODUCT_ID);
    const custQuotes = customer ? customerQuotes.get(customer.CUSTOMER_ID) : null;

    if (!order || !customer || !product) return null;

    return {
      // Order
      ORDER_ID: order.ORDER_ID,
      ORDER_DATE: order.ORDER_DATE,
      ORDER_STATUS: order.STATUS,
      ORDER_TOTAL_AMOUNT: order.TOTAL_AMOUNT,
      // Customer
      CUSTOMER_ID: customer.CUSTOMER_ID,
      CUSTOMER_NAME: customer.CUSTOMER_NAME,
      CUSTOMER_EMAIL: order.CUSTOMER_EMAIL,
      BILLING_ADDRESS: customer.BILLING_ADDRESS,
      TAX_ID: customer.TAX_ID || null,
      // Line Item
      LINE_ID: line.LINE_ID,
      QUANTITY: line.QUANTITY,
      UNIT_PRICE: line.UNIT_PRICE,
      LINE_TOTAL: parseFloat((line.QUANTITY * line.UNIT_PRICE).toFixed(2)),
      // Product
      PRODUCT_ID: product.PRODUCT_ID,
      PRODUCT_NAME: product.PRODUCT_NAME,
      CATEGORY_ID: product.CATEGORY_ID,
      LIST_PRICE: product.LIST_PRICE,
      // Pricing
      LATEST_EFFECTIVE_PRICE: latestPrice ? latestPrice.UNIT_PRICE : null,
      PRICE_EFFECTIVE_FROM: latestPrice ? latestPrice.EFFECTIVE_FROM : null,
      // Customer Quotes
      CUSTOMER_QUOTE_COUNT: custQuotes ? custQuotes.length : 0
    };
  }).filter(Boolean);

  writeOutput('sales_denormalized.json', salesDenormalized);

  // Write reference tables (can't be joined but useful for chatbot)
  writeOutput('sales_territories.json', territoriesData);
  writeOutput('sales_promotions.json', promotionsData);
  writeOutput('sales_contracts.json', contractsData);
  writeOutput('sales_commissions.json', commissionsData);
  writeOutput('sales_quotes.json', quotesData);
}

// ============================================================
// 2. HR DENORMALIZED
// ============================================================
function generateHR() {
  console.log('\n👥 HR SCHEMA');
  console.log('─'.repeat(40));

  const employees = loadJSON('hr', 'employees.json');
  const departments = loadJSON('hr', 'departments.json');
  const jobs = loadJSON('hr', 'jobs.json');
  const locations = loadJSON('hr', 'locations.json');
  const contacts = loadJSON('hr', 'contacts.json');
  const benefits = loadJSON('hr', 'benefits.json');
  const jobHistory = loadJSON('hr', 'job_history.json');
  const empDocuments = loadJSON('hr', 'emp_documents.json');
  const teams = loadJSON('hr', 'teams.json');
  const salaryGrades = loadJSON('hr', 'salary_grades.json');

  console.log(`  Loaded: employees(${employees.length}), departments(${departments.length}), jobs(${jobs.length}), locations(${locations.length})`);
  console.log(`  Loaded: contacts(${contacts.length}), benefits(${benefits.length}), job_history(${jobHistory.length})`);
  console.log(`  Loaded: emp_documents(${empDocuments.length}), teams(${teams.length}), salary_grades(${salaryGrades.length})`);

  // Build lookup maps
  const deptMap = new Map(departments.map(d => [d.DEPARTMENT_ID, d]));
  const jobMap = new Map(jobs.map(j => [j.JOB_ID, j]));
  const locationMap = new Map(locations.map(l => [l.LOCATION_ID, l]));
  const employeeMap = new Map(employees.map(e => [e.EMPLOYEE_ID, e]));

  // Build employee-related maps (1:N relationships)
  const contactMap = new Map();
  contacts.forEach(c => {
    if (!contactMap.has(c.EMPLOYEE_ID)) contactMap.set(c.EMPLOYEE_ID, []);
    contactMap.get(c.EMPLOYEE_ID).push(c);
  });

  const benefitMap = new Map();
  benefits.forEach(b => {
    if (!benefitMap.has(b.EMPLOYEE_ID)) benefitMap.set(b.EMPLOYEE_ID, []);
    benefitMap.get(b.EMPLOYEE_ID).push(b);
  });

  const jobHistoryMap = new Map();
  jobHistory.forEach(jh => {
    if (!jobHistoryMap.has(jh.EMPLOYEE_ID)) jobHistoryMap.set(jh.EMPLOYEE_ID, []);
    jobHistoryMap.get(jh.EMPLOYEE_ID).push(jh);
  });

  const docMap = new Map();
  empDocuments.forEach(d => {
    if (!docMap.has(d.EMPLOYEE_ID)) docMap.set(d.EMPLOYEE_ID, []);
    docMap.get(d.EMPLOYEE_ID).push(d);
  });

  const teamLeadMap = new Map();
  teams.forEach(t => {
    if (!teamLeadMap.has(t.LEAD_ID)) teamLeadMap.set(t.LEAD_ID, []);
    teamLeadMap.get(t.LEAD_ID).push(t);
  });

  // Find salary grade for each employee
  const sortedGrades = [...salaryGrades].sort((a, b) => a.MIN_SAL - b.MIN_SAL);
  function findSalaryGrade(salary) {
    for (const grade of sortedGrades) {
      if (salary >= grade.MIN_SAL && salary <= grade.MAX_SAL) {
        return grade.GRADE_ID;
      }
    }
    return null;
  }

  // Denormalize: employee as the grain
  const hrDenormalized = employees.map(emp => {
    const dept = deptMap.get(emp.DEPARTMENT_ID);
    const job = jobMap.get(emp.JOB_ID);
    const location = dept ? locationMap.get(dept.LOCATION_ID) : null;
    const manager = emp.MANAGER_ID ? employeeMap.get(emp.MANAGER_ID) : null;
    const empContacts = contactMap.get(emp.EMPLOYEE_ID) || [];
    const empBenefits = benefitMap.get(emp.EMPLOYEE_ID) || [];
    const empJobHistory = jobHistoryMap.get(emp.EMPLOYEE_ID) || [];
    const empDocs = docMap.get(emp.EMPLOYEE_ID) || [];
    const empTeams = teamLeadMap.get(emp.EMPLOYEE_ID) || [];

    return {
      // Employee
      EMPLOYEE_ID: emp.EMPLOYEE_ID,
      FIRST_NAME: emp.FIRST_NAME,
      LAST_NAME: emp.LAST_NAME,
      EMAIL: emp.EMAIL,
      PHONE_NUMBER: emp.PHONE_NUMBER,
      HIRE_DATE: emp.HIRE_DATE,
      SALARY: emp.SALARY,
      COMMISSION_PCT: emp.COMMISSION_PCT,
      SALARY_GRADE: findSalaryGrade(emp.SALARY),
      // Job
      JOB_ID: emp.JOB_ID,
      JOB_TITLE: job ? job.JOB_TITLE : null,
      JOB_MIN_SALARY: job ? job.MIN_SALARY : null,
      JOB_MAX_SALARY: job ? job.MAX_SALARY : null,
      // Manager
      MANAGER_ID: emp.MANAGER_ID,
      MANAGER_NAME: manager ? `${manager.FIRST_NAME} ${manager.LAST_NAME}` : null,
      // Department
      DEPARTMENT_ID: emp.DEPARTMENT_ID,
      DEPARTMENT_NAME: dept ? dept.DEPARTMENT_NAME : null,
      // Location
      LOCATION_ID: dept ? dept.LOCATION_ID : null,
      CITY: location ? location.CITY : null,
      STATE_PROVINCE: location ? location.STATE_PROVINCE : null,
      COUNTRY_ID: location ? location.COUNTRY_ID : null,
      STREET_ADDRESS: location ? location.STREET_ADDRESS : null,
      POSTAL_CODE: location ? location.POSTAL_CODE : null,
      // Emergency Contact
      EMERGENCY_CONTACT_NAME: empContacts.length > 0 ? empContacts[0].EMERGENCY_NAME : null,
      EMERGENCY_CONTACT_PHONE: empContacts.length > 0 ? empContacts[0].EMERGENCY_PHONE : null,
      // Benefits summary
      BENEFIT_TYPES: empBenefits.map(b => b.BENEFIT_TYPE).join(', ') || null,
      BENEFIT_COUNT: empBenefits.length,
      // Job history summary
      JOB_HISTORY_COUNT: empJobHistory.length,
      PREVIOUS_JOBS: empJobHistory.map(jh => jh.JOB_ID).join(', ') || null,
      // Documents summary
      DOCUMENT_TYPES: empDocs.map(d => d.DOC_TYPE).join(', ') || null,
      DOCUMENT_COUNT: empDocs.length,
      // Team leadership
      IS_TEAM_LEAD: empTeams.length > 0,
      TEAMS_LED: empTeams.map(t => t.TEAM_NAME).join(', ') || null,
      TEAMS_LED_COUNT: empTeams.length
    };
  });

  writeOutput('hr_denormalized.json', hrDenormalized);
}

// ============================================================
// 3. FINANCE DENORMALIZED
// ============================================================
function generateFinance() {
  console.log('\n💰 FINANCE SCHEMA');
  console.log('─'.repeat(40));

  const transactions = loadJSON('finance', 'transactions.json');
  const ledger = loadJSON('finance', 'ledger.json');
  const invoices = loadJSON('finance', 'invoices.json');
  const payments = loadJSON('finance', 'payments.json');
  const budgets = loadJSON('finance', 'budgets.json');
  const costCenters = loadJSON('finance', 'cost_centers.json');
  const currencyRates = loadJSON('finance', 'currency_rates.json');
  const fiscalPeriods = loadJSON('finance', 'fiscal_periods.json');
  const taxCodes = loadJSON('finance', 'tax_codes.json');
  const reconciliation = loadJSON('finance', 'reconciliation.json');

  console.log(`  Loaded: transactions(${transactions.length}), ledger(${ledger.length}), invoices(${invoices.length}), payments(${payments.length})`);
  console.log(`  Loaded: budgets(${budgets.length}), cost_centers(${costCenters.length}), currency_rates(${currencyRates.length})`);
  console.log(`  Loaded: fiscal_periods(${fiscalPeriods.length}), tax_codes(${taxCodes.length}), reconciliation(${reconciliation.length})`);

  // Build lookup maps
  const costCenterMap = new Map(costCenters.map(cc => [cc.COST_CENTER_ID, cc]));

  // Get latest exchange rates per currency pair
  const latestRates = new Map();
  currencyRates.forEach(r => {
    const key = `${r.FROM_CURRENCY}-${r.TO_CURRENCY}`;
    const existing = latestRates.get(key);
    if (!existing || r.RATE_DATE > existing.RATE_DATE) {
      latestRates.set(key, r);
    }
  });

  // Find fiscal period for a date
  function findFiscalPeriod(dateStr) {
    if (!dateStr) return null;
    for (const fp of fiscalPeriods) {
      if (dateStr >= fp.START_DATE && dateStr <= fp.END_DATE) {
        return fp;
      }
    }
    return null;
  }

  // --- Transactions denormalized ---
  const financeTransactions = transactions.map(txn => {
    const rateKey = `${txn.CURRENCY_CD}-USD`;
    const rate = latestRates.get(rateKey);
    const period = findFiscalPeriod(txn.TRANSACTION_DATE);

    return {
      TRANSACTION_ID: txn.TRANSACTION_ID,
      TRANSACTION_DATE: txn.TRANSACTION_DATE,
      AMOUNT: txn.AMOUNT,
      CURRENCY_CD: txn.CURRENCY_CD,
      ACCOUNT_ID: txn.ACCOUNT_ID,
      POSTING_STATUS: txn.POSTING_STATUS,
      EXCHANGE_RATE_TO_USD: rate ? rate.EXCHANGE_RATE : null,
      AMOUNT_USD: rate ? parseFloat((txn.AMOUNT * rate.EXCHANGE_RATE).toFixed(2)) : txn.CURRENCY_CD === 'USD' ? txn.AMOUNT : null,
      FISCAL_PERIOD: period ? period.PERIOD_NAME : null,
      FISCAL_START: period ? period.START_DATE : null,
      FISCAL_END: period ? period.END_DATE : null
    };
  });

  writeOutput('finance_transactions_denormalized.json', financeTransactions);

  // --- Budgets denormalized with cost centers ---
  const budgetsDenormalized = budgets.map(b => {
    const cc = costCenterMap.get(b.COST_CENTER_ID);
    const parentCC = cc && cc.PARENT_ID ? costCenterMap.get(cc.PARENT_ID) : null;

    return {
      BUDGET_ID: b.BUDGET_ID,
      FISCAL_YEAR: b.FISCAL_YEAR,
      APPROVED_AMOUNT: b.APPROVED_AMOUNT,
      COST_CENTER_ID: b.COST_CENTER_ID,
      COST_CENTER_NAME: cc ? cc.COST_CENTER_NAME : null,
      PARENT_COST_CENTER_ID: cc ? cc.PARENT_ID : null,
      PARENT_COST_CENTER_NAME: parentCC ? parentCC.COST_CENTER_NAME : null
    };
  });

  writeOutput('finance_budgets_denormalized.json', budgetsDenormalized);

  // --- Invoices + Payments (loosely linked) ---
  writeOutput('finance_invoices.json', invoices);
  writeOutput('finance_payments.json', payments);
  writeOutput('finance_ledger.json', ledger);
  writeOutput('finance_tax_codes.json', taxCodes);
  writeOutput('finance_reconciliation.json', reconciliation);
}

// ============================================================
// 4. INVENTORY DENORMALIZED
// ============================================================
function generateInventory() {
  console.log('\n📦 INVENTORY SCHEMA');
  console.log('─'.repeat(40));

  const products = loadJSON('inventory', 'products.json');
  const warehouses = loadJSON('inventory', 'warehouses.json');
  const suppliers = loadJSON('inventory', 'suppliers.json');
  const bins = loadJSON('inventory', 'bins.json');
  const stockMovements = loadJSON('inventory', 'stock_movements.json');
  const purchaseOrders = loadJSON('inventory', 'purchase_orders.json');
  const transfers = loadJSON('inventory', 'transfers.json');
  const cycleCounts = loadJSON('inventory', 'cycle_counts.json');
  const reorderPoints = loadJSON('inventory', 'reorder_points.json');
  const lotTracking = loadJSON('inventory', 'lot_tracking.json');

  console.log(`  Loaded: products(${products.length}), warehouses(${warehouses.length}), suppliers(${suppliers.length}), bins(${bins.length})`);
  console.log(`  Loaded: stock_movements(${stockMovements.length}), purchase_orders(${purchaseOrders.length}), transfers(${transfers.length})`);
  console.log(`  Loaded: cycle_counts(${cycleCounts.length}), reorder_points(${reorderPoints.length}), lot_tracking(${lotTracking.length})`);

  // Build lookup maps
  const productMap = new Map(products.map(p => [p.PRODUCT_ID, p]));
  const warehouseMap = new Map(warehouses.map(w => [w.WAREHOUSE_ID, w]));
  const supplierMap = new Map(suppliers.map(s => [s.SUPPLIER_ID, s]));
  const reorderMap = new Map(reorderPoints.map(r => [r.PRODUCT_ID, r]));

  // --- Stock Movements denormalized ---
  const movementsDenormalized = stockMovements.map(sm => {
    const product = productMap.get(sm.PRODUCT_ID);
    const warehouse = warehouseMap.get(sm.WAREHOUSE_ID);
    const reorder = reorderMap.get(sm.PRODUCT_ID);

    return {
      MOVEMENT_ID: sm.MOVEMENT_ID,
      MOVEMENT_DATE: sm.MOVEMENT_DATE,
      MOVEMENT_TYPE: sm.MOVEMENT_TYPE,
      QUANTITY: sm.QUANTITY,
      // Product
      PRODUCT_ID: sm.PRODUCT_ID,
      SKU: product ? product.SKU : null,
      PRODUCT_DESCRIPTION: product ? product.DESCRIPTION : null,
      UNIT_MEASURE: product ? product.UNIT_MEASURE : null,
      WEIGHT: product ? product.WEIGHT : null,
      // Warehouse
      WAREHOUSE_ID: sm.WAREHOUSE_ID,
      WAREHOUSE_CODE: warehouse ? warehouse.WAREHOUSE_CODE : null,
      WAREHOUSE_LOCATION_ID: warehouse ? warehouse.LOCATION_ID : null,
      WAREHOUSE_CAPACITY: warehouse ? warehouse.CAPACITY : null,
      // Reorder Info
      MIN_QUANTITY: reorder ? reorder.MIN_QUANTITY : null,
      REORDER_QUANTITY: reorder ? reorder.REORDER_QUANTITY : null
    };
  });

  writeOutput('inventory_movements_denormalized.json', movementsDenormalized);

  // --- Purchase Orders denormalized ---
  const poDenormalized = purchaseOrders.map(po => {
    const supplier = supplierMap.get(po.SUPPLIER_ID);

    return {
      PO_ID: po.PO_ID,
      PO_DATE: po.PO_DATE,
      STATUS: po.STATUS,
      SUPPLIER_ID: po.SUPPLIER_ID,
      SUPPLIER_NAME: supplier ? supplier.SUPPLIER_NAME : null,
      SUPPLIER_CODE: supplier ? supplier.SUPPLIER_CODE : null
    };
  });

  writeOutput('inventory_purchase_orders_denormalized.json', poDenormalized);

  // --- Transfers denormalized ---
  const transfersDenormalized = transfers.map(t => {
    const fromWH = warehouseMap.get(t.FROM_WAREHOUSE);
    const toWH = warehouseMap.get(t.TO_WAREHOUSE);

    return {
      TRANSFER_ID: t.TRANSFER_ID,
      TRANSFER_DATE: t.TRANSFER_DATE,
      FROM_WAREHOUSE_ID: t.FROM_WAREHOUSE,
      FROM_WAREHOUSE_CODE: fromWH ? fromWH.WAREHOUSE_CODE : null,
      FROM_WAREHOUSE_CAPACITY: fromWH ? fromWH.CAPACITY : null,
      TO_WAREHOUSE_ID: t.TO_WAREHOUSE,
      TO_WAREHOUSE_CODE: toWH ? toWH.WAREHOUSE_CODE : null,
      TO_WAREHOUSE_CAPACITY: toWH ? toWH.CAPACITY : null
    };
  });

  writeOutput('inventory_transfers_denormalized.json', transfersDenormalized);

  // --- Bins denormalized ---
  const binsDenormalized = bins.map(b => {
    const warehouse = warehouseMap.get(b.WAREHOUSE_ID);

    return {
      BIN_ID: b.BIN_ID,
      BIN_CODE: b.BIN_CODE,
      ZONE: b.ZONE,
      WAREHOUSE_ID: b.WAREHOUSE_ID,
      WAREHOUSE_CODE: warehouse ? warehouse.WAREHOUSE_CODE : null,
      WAREHOUSE_CAPACITY: warehouse ? warehouse.CAPACITY : null
    };
  });

  writeOutput('inventory_bins_denormalized.json', binsDenormalized);

  // --- Cycle Counts denormalized ---
  const cycleCountsDenormalized = cycleCounts.map(cc => {
    const warehouse = warehouseMap.get(cc.WAREHOUSE_ID);

    return {
      COUNT_ID: cc.COUNT_ID,
      COUNT_DATE: cc.COUNT_DATE,
      VARIANCE_QTY: cc.VARIANCE_QTY,
      WAREHOUSE_ID: cc.WAREHOUSE_ID,
      WAREHOUSE_CODE: warehouse ? warehouse.WAREHOUSE_CODE : null,
      WAREHOUSE_CAPACITY: warehouse ? warehouse.CAPACITY : null
    };
  });

  writeOutput('inventory_cycle_counts_denormalized.json', cycleCountsDenormalized);

  // Reference data
  writeOutput('inventory_lot_tracking.json', lotTracking);
  writeOutput('inventory_reorder_points.json', reorderPoints);
}

// ============================================================
// 5. AUDIT DENORMALIZED
// ============================================================
function generateAudit() {
  console.log('\n🔍 AUDIT SCHEMA');
  console.log('─'.repeat(40));

  const accessLog = loadJSON('audit', 'access_log.json');
  const approvalWorkflow = loadJSON('audit', 'approval_workflow.json');
  const changeLog = loadJSON('audit', 'change_log.json');
  const complianceChecks = loadJSON('audit', 'compliance_checks.json');
  const dataQuality = loadJSON('audit', 'data_quality.json');
  const exportLog = loadJSON('audit', 'export_log.json');
  const retentionPolicies = loadJSON('audit', 'retention_policies.json');
  const schemaVersions = loadJSON('audit', 'schema_versions.json');
  const securityEvents = loadJSON('audit', 'security_events.json');
  const versionHistory = loadJSON('audit', 'version_history.json');

  console.log(`  Loaded: access_log(${accessLog.length}), approval_workflow(${approvalWorkflow.length}), change_log(${changeLog.length})`);
  console.log(`  Loaded: compliance_checks(${complianceChecks.length}), data_quality(${dataQuality.length}), export_log(${exportLog.length})`);
  console.log(`  Loaded: retention_policies(${retentionPolicies.length}), schema_versions(${schemaVersions.length}), security_events(${securityEvents.length}), version_history(${versionHistory.length})`);

  // Build retention policy map by table name
  const retentionByTable = new Map();
  retentionPolicies.forEach(rp => {
    if (!retentionByTable.has(rp.TABLE_NAME)) {
      retentionByTable.set(rp.TABLE_NAME, []);
    }
    retentionByTable.get(rp.TABLE_NAME).push(rp);
  });

  // --- Change Log + Retention Policies denormalized ---
  const changeLogDenormalized = changeLog.map(cl => {
    const policies = retentionByTable.get(cl.TABLE_NAME) || [];
    const maxRetention = policies.length > 0 ? Math.max(...policies.map(p => p.RETENTION_DAYS)) : null;

    return {
      LOG_ID: cl.LOG_ID,
      TABLE_NAME: cl.TABLE_NAME,
      MODIFIED_BY: cl.MODIFIED_BY,
      MODIFIED_AT: cl.MODIFIED_AT,
      OLD_VALUE: cl.OLD_VALUE,
      NEW_VALUE: cl.NEW_VALUE,
      RETENTION_DAYS: maxRetention,
      RETENTION_POLICY_COUNT: policies.length
    };
  });

  writeOutput('audit_change_log_denormalized.json', changeLogDenormalized);

  // Write all audit tables (most are event logs, useful as-is)
  writeOutput('audit_access_log.json', accessLog);
  writeOutput('audit_approval_workflow.json', approvalWorkflow);
  writeOutput('audit_compliance_checks.json', complianceChecks);
  writeOutput('audit_data_quality.json', dataQuality);
  writeOutput('audit_export_log.json', exportLog);
  writeOutput('audit_security_events.json', securityEvents);
  writeOutput('audit_schema_versions.json', schemaVersions);
  writeOutput('audit_version_history.json', versionHistory);
}

// ============================================================
// RUN ALL
// ============================================================
console.log('╔════════════════════════════════════════╗');
console.log('║   GENERATING DENORMALIZED TABLES       ║');
console.log('╚════════════════════════════════════════╝');

generateSales();
generateHR();
generateFinance();
generateInventory();
generateAudit();

console.log('\n╔════════════════════════════════════════╗');
console.log('║   ✓ ALL DENORMALIZED TABLES GENERATED  ║');
console.log('╚════════════════════════════════════════╝');
