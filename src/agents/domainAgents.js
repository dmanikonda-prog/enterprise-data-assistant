// ============================================================
// DATA IMPORTS
// ============================================================

// Schema metadata
import testRecords from '../data/test_records.json';

// Sales
import salesDenormalized from '../data/sales_denormalized.json';
import salesTerritories from '../data/sales_territories.json';
import salesPromotions from '../data/sales_promotions.json';
import salesContracts from '../data/sales_contracts.json';
import salesCommissions from '../data/sales_commissions.json';
import salesQuotes from '../data/sales_quotes.json';

// HR
import hrDenormalized from '../data/hr_denormalized.json';

// Finance
import financeTransactions from '../data/finance_transactions_denormalized.json';
import financeBudgets from '../data/finance_budgets_denormalized.json';
import financeInvoices from '../data/finance_invoices.json';
import financePayments from '../data/finance_payments.json';
import financeLedger from '../data/finance_ledger.json';
import financeTaxCodes from '../data/finance_tax_codes.json';
import financeReconciliation from '../data/finance_reconciliation.json';

// Inventory
import inventoryMovements from '../data/inventory_movements_denormalized.json';
import inventoryPurchaseOrders from '../data/inventory_purchase_orders_denormalized.json';
import inventoryTransfers from '../data/inventory_transfers_denormalized.json';
import inventoryBins from '../data/inventory_bins_denormalized.json';
import inventoryCycleCounts from '../data/inventory_cycle_counts_denormalized.json';
import inventoryLotTracking from '../data/inventory_lot_tracking.json';
import inventoryReorderPoints from '../data/inventory_reorder_points.json';

// Audit
import auditChangeLog from '../data/audit_change_log_denormalized.json';
import auditAccessLog from '../data/audit_access_log.json';
import auditApprovalWorkflow from '../data/audit_approval_workflow.json';
import auditComplianceChecks from '../data/audit_compliance_checks.json';
import auditDataQuality from '../data/audit_data_quality.json';
import auditExportLog from '../data/audit_export_log.json';
import auditSecurityEvents from '../data/audit_security_events.json';
import auditSchemaVersions from '../data/audit_schema_versions.json';
import auditVersionHistory from '../data/audit_version_history.json';

// ============================================================
// STOP WORDS (filtered from routing)
// ============================================================

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'if', 'or', 'and', 'but', 'not', 'no', 'so', 'too',
  'very', 'just', 'about', 'all', 'also', 'any', 'because', 'before',
  'between', 'both', 'by', 'each', 'for', 'from', 'get', 'give', 'go',
  'here', 'her', 'him', 'his', 'how', 'in', 'into', 'its', 'let', 'like',
  'make', 'many', 'more', 'most', 'much', 'of', 'on', 'one', 'only',
  'other', 'out', 'over', 'own', 'same', 'show', 'some', 'still', 'such',
  'tell', 'than', 'then', 'there', 'to', 'under', 'up', 'us', 'want',
  'when', 'where', 'with', 'me', 'list', 'find', 'give', 'need', 'know',
]);

// ============================================================
// AGENT DEFINITIONS
// ============================================================

export const AGENTS = {
  sales: {
    id: 'sales',
    name: 'Sales Agent',
    icon: '💰',
    color: '#10b981',
    description: 'Orders, customers, products, revenue, promotions, territories',
    keywords: [
      'order', 'orders', 'customer', 'customers', 'sale', 'sales', 'revenue',
      'product', 'products', 'price', 'pricing', 'discount', 'promotion', 'promo',
      'territory', 'territories', 'region', 'commission', 'commissions', 'contract',
      'contracts', 'quote', 'quotes', 'shipped', 'cancelled', 'confirmed',
      'delivered', 'pending', 'billing', 'purchase', 'bought', 'buying', 'sold',
      'selling', 'total_amount', 'catalog', 'coupon', 'offer',
    ],
  },
  hr: {
    id: 'hr',
    name: 'HR Agent',
    icon: '👥',
    color: '#6366f1',
    description: 'Employees, departments, salaries, benefits, jobs, teams',
    keywords: [
      'employee', 'employees', 'department', 'departments', 'salary', 'salaries',
      'hire', 'hired', 'hiring', 'job', 'jobs', 'manager', 'managers', 'benefit',
      'benefits', 'contact', 'emergency', 'team', 'teams', 'leave', 'attendance',
      'payroll', 'compensation', 'grade', 'headcount', 'staff', 'personnel',
      'workforce', 'document', 'resume', 'certificate', 'location', 'city',
      'country', 'job_history', 'onboarding',
    ],
  },
  finance: {
    id: 'finance',
    name: 'Finance Agent',
    icon: '💵',
    color: '#f59e0b',
    description: 'Transactions, budgets, invoices, payments, ledger, tax',
    keywords: [
      'transaction', 'transactions', 'budget', 'budgets', 'ledger', 'invoice',
      'invoices', 'payment', 'payments', 'cost_center', 'cost center', 'currency',
      'exchange', 'exchange_rate', 'fiscal', 'tax', 'taxes', 'debit', 'credit',
      'account', 'accounts', 'reconciliation', 'posting', 'vendor', 'vendors',
      'approved_amount', 'financial', 'expense', 'expenses', 'balance', 'fiscal_year',
    ],
  },
  inventory: {
    id: 'inventory',
    name: 'Inventory Agent',
    icon: '📦',
    color: '#06b6d4',
    description: 'Warehouses, stock, suppliers, transfers, purchase orders',
    keywords: [
      'warehouse', 'warehouses', 'stock', 'inventory', 'movement', 'movements',
      'supplier', 'suppliers', 'bin', 'bins', 'zone', 'transfer', 'transfers',
      'cycle_count', 'cycle count', 'reorder', 'lot', 'lots', 'sku', 'capacity',
      'purchase_order', 'purchase order', 'weight', 'unit_measure', 'expiry',
      'adjustment', 'receipt', 'shipment', 'storage',
    ],
  },
  audit: {
    id: 'audit',
    name: 'Audit Agent',
    icon: '🔍',
    color: '#ef4444',
    description: 'Access logs, compliance, security, change tracking, data quality',
    keywords: [
      'audit', 'access', 'access_log', 'change', 'change_log', 'compliance',
      'security', 'security_event', 'data_quality', 'export_log', 'retention',
      'schema_version', 'version', 'version_history', 'approval', 'workflow',
      'modified', 'event', 'login', 'logout', 'rule', 'policy', 'policies',
      'pass', 'fail', 'compliant', 'non_compliant', 'gdpr', 'sox',
    ],
  },
  schema: {
    id: 'schema',
    name: 'Schema Agent',
    icon: '📊',
    color: '#8b5cf6',
    description: 'Database tables, columns, data types, Oracle metadata',
    keywords: [
      'table', 'tables', 'column', 'columns', 'schema', 'schemas', 'datatype',
      'datatypes', 'structure', 'field', 'fields', 'database', 'varchar',
      'number', 'date', 'oracle', 'metadata', 'comment', 'comments', 'insight',
      'analyst', 'data_type',
    ],
  },
};

// ============================================================
// ROUTER
// ============================================================

export function routeQuestion(question) {
  const questionLower = question.toLowerCase();
  const words = questionLower.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));

  const scores = {};

  for (const [domainId, agent] of Object.entries(AGENTS)) {
    let score = 0;
    for (const keyword of agent.keywords) {
      if (keyword.includes(' ') || keyword.includes('_')) {
        // Multi-word/compound keywords: check in full question
        if (questionLower.includes(keyword)) score += 3;
      } else {
        // Single word: check against extracted words
        if (words.includes(keyword)) {
          score += keyword.length > 4 ? 2 : 1;
        } else if (questionLower.includes(keyword)) {
          score += 1;
        }
      }
    }
    scores[domainId] = score;
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, s]) => s > 0);

  // No matches at all
  if (sorted.length === 0) {
    return { type: 'uncertain', domains: [], scores };
  }

  const topScore = sorted[0][1];
  const topDomain = sorted[0][0];

  // Very low confidence
  if (topScore < 2) {
    return { type: 'uncertain', domains: [], scores };
  }

  // Check for cross-domain: second domain scores at least 50% of top
  const crossDomains = sorted.filter(([, s]) => s >= topScore * 0.5).map(([d]) => d);

  if (crossDomains.length > 1) {
    return { type: 'cross', domains: crossDomains, scores };
  }

  return { type: 'single', domains: [topDomain], scores };
}

// ============================================================
// CONTEXT BUILDERS
// ============================================================

function filterByKeywords(records, keywords, searchFields) {
  return records.filter(record => {
    const text = searchFields.map(f => String(record[f] || '')).join(' ').toLowerCase();
    return keywords.some(kw => text.includes(kw));
  });
}

function formatTable(records, columns, limit = 50) {
  const subset = records.slice(0, limit);
  const header = columns.map(c => c.label).join(' | ');
  const separator = columns.map(c => '-'.repeat(c.label.length)).join('-|-');
  const rows = subset.map(r =>
    columns.map(c => {
      const val = r[c.key];
      return val == null ? '-' : String(val);
    }).join(' | ')
  );

  return `${header}\n${separator}\n${rows.join('\n')}`;
}

function formatCompact(name, records, limit = 30) {
  const subset = records.slice(0, limit);
  let ctx = `\n=== ${name} (${records.length} total, showing ${subset.length}) ===\n`;
  subset.forEach((item, i) => {
    ctx += `${i + 1}. ${JSON.stringify(item)}\n`;
  });
  return ctx;
}

// --- SALES CONTEXT ---
function buildSalesContext(question) {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  let context = '';

  // Primary: denormalized sales transactions
  const matched = filterByKeywords(salesDenormalized, keywords, [
    'ORDER_STATUS', 'CUSTOMER_NAME', 'PRODUCT_NAME', 'ORDER_DATE',
    'CUSTOMER_EMAIL', 'CUSTOMER_ID', 'PRODUCT_ID', 'BILLING_ADDRESS',
  ]);
  const toUse = matched.length > 0 ? matched.slice(0, 80) : salesDenormalized.slice(0, 30);

  context += `=== SALES TRANSACTIONS (${toUse.length} of ${salesDenormalized.length} total) ===\n`;
  context += formatTable(toUse, [
    { key: 'ORDER_DATE', label: 'Date' },
    { key: 'ORDER_STATUS', label: 'Status' },
    { key: 'CUSTOMER_NAME', label: 'Customer' },
    { key: 'PRODUCT_NAME', label: 'Product' },
    { key: 'QUANTITY', label: 'Qty' },
    { key: 'UNIT_PRICE', label: 'Price' },
    { key: 'LINE_TOTAL', label: 'LineTotal' },
    { key: 'ORDER_TOTAL_AMOUNT', label: 'OrderTotal' },
  ], 80);

  // Reference data based on keywords
  if (questionLower.match(/promoti|promo|discount|coupon|offer/))
    context += formatCompact('PROMOTIONS', salesPromotions);
  if (questionLower.match(/territor|region|area|geography/))
    context += formatCompact('TERRITORIES', salesTerritories);
  if (questionLower.match(/commission|rep|sales.?rep|earning/))
    context += formatCompact('COMMISSIONS', salesCommissions);
  if (questionLower.match(/contract|agreement|signed/))
    context += formatCompact('CONTRACTS', salesContracts);
  if (questionLower.match(/quote|estimate|proposal/))
    context += formatCompact('QUOTES', salesQuotes);

  return context;
}

// --- HR CONTEXT ---
function buildHRContext(question) {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const matched = filterByKeywords(hrDenormalized, keywords, [
    'FIRST_NAME', 'LAST_NAME', 'DEPARTMENT_NAME', 'JOB_TITLE', 'CITY',
    'COUNTRY_ID', 'BENEFIT_TYPES', 'EMAIL', 'JOB_ID', 'TEAMS_LED',
  ]);
  const toUse = matched.length > 0 ? matched.slice(0, 60) : hrDenormalized.slice(0, 30);

  let context = `=== HR EMPLOYEE DATA (${toUse.length} of ${hrDenormalized.length} total) ===\n`;
  context += formatTable(toUse, [
    { key: 'EMPLOYEE_ID', label: 'EmpID' },
    { key: 'FIRST_NAME', label: 'First' },
    { key: 'LAST_NAME', label: 'Last' },
    { key: 'JOB_TITLE', label: 'Job' },
    { key: 'DEPARTMENT_NAME', label: 'Department' },
    { key: 'SALARY', label: 'Salary' },
    { key: 'HIRE_DATE', label: 'HireDate' },
    { key: 'CITY', label: 'City' },
    { key: 'COUNTRY_ID', label: 'Country' },
    { key: 'MANAGER_NAME', label: 'Manager' },
    { key: 'BENEFIT_TYPES', label: 'Benefits' },
    { key: 'IS_TEAM_LEAD', label: 'TeamLead' },
  ], 60);

  return context;
}

// --- FINANCE CONTEXT ---
function buildFinanceContext(question) {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  let context = '';

  // Transactions
  if (questionLower.match(/transaction|posting|currency|exchange|account|amount/)) {
    const matched = filterByKeywords(financeTransactions, keywords, [
      'POSTING_STATUS', 'CURRENCY_CD', 'FISCAL_PERIOD', 'ACCOUNT_ID', 'TRANSACTION_DATE',
    ]);
    const toUse = matched.length > 0 ? matched.slice(0, 50) : financeTransactions.slice(0, 30);

    context += `=== FINANCIAL TRANSACTIONS (${toUse.length} of ${financeTransactions.length} total) ===\n`;
    context += formatTable(toUse, [
      { key: 'TRANSACTION_DATE', label: 'Date' },
      { key: 'AMOUNT', label: 'Amount' },
      { key: 'CURRENCY_CD', label: 'Currency' },
      { key: 'AMOUNT_USD', label: 'AmountUSD' },
      { key: 'POSTING_STATUS', label: 'Status' },
      { key: 'ACCOUNT_ID', label: 'Account' },
      { key: 'FISCAL_PERIOD', label: 'FiscalPeriod' },
    ], 50);
  }

  // Budgets
  if (questionLower.match(/budget|cost.?center|approved|fiscal.?year|allocation/)) {
    const matched = filterByKeywords(financeBudgets, keywords, [
      'COST_CENTER_NAME', 'FISCAL_YEAR', 'PARENT_COST_CENTER_NAME',
    ]);
    const toUse = matched.length > 0 ? matched.slice(0, 40) : financeBudgets.slice(0, 20);

    context += `\n=== BUDGETS (${toUse.length} of ${financeBudgets.length} total) ===\n`;
    context += formatTable(toUse, [
      { key: 'BUDGET_ID', label: 'BudgetID' },
      { key: 'FISCAL_YEAR', label: 'Year' },
      { key: 'APPROVED_AMOUNT', label: 'Amount' },
      { key: 'COST_CENTER_NAME', label: 'CostCenter' },
      { key: 'PARENT_COST_CENTER_NAME', label: 'ParentCC' },
    ], 40);
  }

  // Reference data
  if (questionLower.match(/invoice|vendor|bill/))
    context += formatCompact('INVOICES', financeInvoices);
  if (questionLower.match(/payment|paid|pay|check|wire|ach|cash/))
    context += formatCompact('PAYMENTS', financePayments);
  if (questionLower.match(/ledger|debit|credit|account.?code/))
    context += formatCompact('LEDGER', financeLedger);
  if (questionLower.match(/tax|rate.?percent/))
    context += formatCompact('TAX CODES', financeTaxCodes);
  if (questionLower.match(/reconcil|match|exception|source.?system/))
    context += formatCompact('RECONCILIATION', financeReconciliation);

  // If nothing matched, provide a general overview
  if (!context) {
    context += `=== FINANCIAL TRANSACTIONS (30 of ${financeTransactions.length}) ===\n`;
    context += formatTable(financeTransactions.slice(0, 30), [
      { key: 'TRANSACTION_DATE', label: 'Date' },
      { key: 'AMOUNT', label: 'Amount' },
      { key: 'CURRENCY_CD', label: 'Currency' },
      { key: 'POSTING_STATUS', label: 'Status' },
      { key: 'ACCOUNT_ID', label: 'Account' },
    ], 30);
    context += `\n=== BUDGETS (20 of ${financeBudgets.length}) ===\n`;
    context += formatTable(financeBudgets.slice(0, 20), [
      { key: 'FISCAL_YEAR', label: 'Year' },
      { key: 'APPROVED_AMOUNT', label: 'Amount' },
      { key: 'COST_CENTER_NAME', label: 'CostCenter' },
    ], 20);
  }

  return context;
}

// --- INVENTORY CONTEXT ---
function buildInventoryContext(question) {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  let context = '';

  // Stock Movements
  if (questionLower.match(/movement|stock|sku|product|adjust|receipt|quantity/)) {
    const matched = filterByKeywords(inventoryMovements, keywords, [
      'MOVEMENT_TYPE', 'SKU', 'PRODUCT_DESCRIPTION', 'WAREHOUSE_CODE', 'MOVEMENT_DATE',
    ]);
    const toUse = matched.length > 0 ? matched.slice(0, 50) : inventoryMovements.slice(0, 30);

    context += `=== STOCK MOVEMENTS (${toUse.length} of ${inventoryMovements.length} total) ===\n`;
    context += formatTable(toUse, [
      { key: 'MOVEMENT_DATE', label: 'Date' },
      { key: 'MOVEMENT_TYPE', label: 'Type' },
      { key: 'SKU', label: 'SKU' },
      { key: 'PRODUCT_DESCRIPTION', label: 'Product' },
      { key: 'QUANTITY', label: 'Qty' },
      { key: 'WAREHOUSE_CODE', label: 'Warehouse' },
      { key: 'MIN_QUANTITY', label: 'MinQty' },
      { key: 'REORDER_QUANTITY', label: 'ReorderQty' },
    ], 50);
  }

  // Purchase Orders
  if (questionLower.match(/purchase|po|supplier|procure/)) {
    const matched = filterByKeywords(inventoryPurchaseOrders, keywords, [
      'STATUS', 'SUPPLIER_NAME', 'SUPPLIER_CODE', 'PO_DATE',
    ]);
    const toUse = matched.length > 0 ? matched.slice(0, 30) : inventoryPurchaseOrders.slice(0, 20);

    context += `\n=== PURCHASE ORDERS (${toUse.length} of ${inventoryPurchaseOrders.length} total) ===\n`;
    context += formatTable(toUse, [
      { key: 'PO_ID', label: 'PO_ID' },
      { key: 'PO_DATE', label: 'Date' },
      { key: 'STATUS', label: 'Status' },
      { key: 'SUPPLIER_NAME', label: 'Supplier' },
      { key: 'SUPPLIER_CODE', label: 'SupplierCode' },
    ], 30);
  }

  // Transfers
  if (questionLower.match(/transfer|from.?warehouse|to.?warehouse/)) {
    context += `\n=== WAREHOUSE TRANSFERS (30 of ${inventoryTransfers.length} total) ===\n`;
    context += formatTable(inventoryTransfers.slice(0, 30), [
      { key: 'TRANSFER_DATE', label: 'Date' },
      { key: 'FROM_WAREHOUSE_CODE', label: 'From' },
      { key: 'TO_WAREHOUSE_CODE', label: 'To' },
      { key: 'FROM_WAREHOUSE_CAPACITY', label: 'FromCap' },
      { key: 'TO_WAREHOUSE_CAPACITY', label: 'ToCap' },
    ], 30);
  }

  // Bins
  if (questionLower.match(/bin|zone|storage/))
    context += formatCompact('WAREHOUSE BINS', inventoryBins);

  // Cycle Counts
  if (questionLower.match(/cycle|count|variance/))
    context += formatCompact('CYCLE COUNTS', inventoryCycleCounts);

  // Lot Tracking
  if (questionLower.match(/lot|batch|expir/))
    context += formatCompact('LOT TRACKING', inventoryLotTracking);

  // Reorder
  if (questionLower.match(/reorder|min.?quantity|replenish/))
    context += formatCompact('REORDER POINTS', inventoryReorderPoints);

  // Default overview
  if (!context) {
    context += `=== STOCK MOVEMENTS (30 of ${inventoryMovements.length}) ===\n`;
    context += formatTable(inventoryMovements.slice(0, 30), [
      { key: 'MOVEMENT_DATE', label: 'Date' },
      { key: 'MOVEMENT_TYPE', label: 'Type' },
      { key: 'SKU', label: 'SKU' },
      { key: 'PRODUCT_DESCRIPTION', label: 'Product' },
      { key: 'QUANTITY', label: 'Qty' },
      { key: 'WAREHOUSE_CODE', label: 'Warehouse' },
    ], 30);
  }

  return context;
}

// --- AUDIT CONTEXT ---
function buildAuditContext(question) {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  let context = '';

  // Change Log (always include if audit domain)
  const matchedChanges = filterByKeywords(auditChangeLog, keywords, [
    'TABLE_NAME', 'MODIFIED_BY', 'MODIFIED_AT',
  ]);
  const changesToUse = matchedChanges.length > 0 ? matchedChanges.slice(0, 40) : auditChangeLog.slice(0, 20);

  context += `=== CHANGE LOG (${changesToUse.length} of ${auditChangeLog.length} total) ===\n`;
  context += formatTable(changesToUse, [
    { key: 'LOG_ID', label: 'LogID' },
    { key: 'TABLE_NAME', label: 'Table' },
    { key: 'MODIFIED_BY', label: 'ModifiedBy' },
    { key: 'MODIFIED_AT', label: 'ModifiedAt' },
    { key: 'RETENTION_DAYS', label: 'RetentionDays' },
  ], 40);

  // Selective reference data
  if (questionLower.match(/access|user|object/))
    context += formatCompact('ACCESS LOG', auditAccessLog);
  if (questionLower.match(/approval|workflow|approv/))
    context += formatCompact('APPROVAL WORKFLOW', auditApprovalWorkflow);
  if (questionLower.match(/compliance|gdpr|sox|pol/))
    context += formatCompact('COMPLIANCE CHECKS', auditComplianceChecks);
  if (questionLower.match(/quality|rule|pass|fail/))
    context += formatCompact('DATA QUALITY', auditDataQuality);
  if (questionLower.match(/export/))
    context += formatCompact('EXPORT LOG', auditExportLog);
  if (questionLower.match(/security|login|logout|event/))
    context += formatCompact('SECURITY EVENTS', auditSecurityEvents);
  if (questionLower.match(/schema.?version|migration|script/))
    context += formatCompact('SCHEMA VERSIONS', auditSchemaVersions);
  if (questionLower.match(/version.?history|release/))
    context += formatCompact('VERSION HISTORY', auditVersionHistory);

  return context;
}

// --- SCHEMA CONTEXT ---
function buildSchemaContext(question) {
  const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const matched = testRecords.filter(record => {
    const text = [
      record.OracleSchema, record.Tables, record.ColumName,
      record.DataType, record.OracleComments, record.AI_Commnet, record.AnalystComment,
    ].join(' ').toLowerCase();
    return keywords.some(kw => text.includes(kw));
  }).slice(0, 50);

  const recordsToUse = matched.length > 0 ? matched : testRecords.slice(0, 30);

  // Format as hierarchical structure
  const schemas = {};
  recordsToUse.forEach(record => {
    if (!schemas[record.OracleSchema]) schemas[record.OracleSchema] = {};
    if (!schemas[record.OracleSchema][record.Tables]) schemas[record.OracleSchema][record.Tables] = [];
    schemas[record.OracleSchema][record.Tables].push({
      column: record.ColumName,
      type: record.DataType,
      length: record.length,
      comment: record.OracleComments,
      aiInsight: record.AI_Commnet,
      analystNote: record.AnalystComment,
    });
  });

  let context = `=== DATABASE SCHEMA METADATA (${recordsToUse.length} of ${testRecords.length} records) ===\n\n`;
  Object.entries(schemas).forEach(([schema, tables]) => {
    context += `Schema: ${schema}\n`;
    Object.entries(tables).forEach(([table, columns]) => {
      context += `  Table: ${table}\n`;
      columns.forEach(col => {
        context += `    - ${col.column} (${col.type}${col.length ? `(${col.length})` : ''})\n`;
        if (col.comment) context += `      Oracle: ${col.comment}\n`;
        if (col.aiInsight) context += `      AI: ${col.aiInsight}\n`;
        if (col.analystNote) context += `      Analyst: ${col.analystNote}\n`;
      });
    });
    context += '\n';
  });

  return context;
}

// ============================================================
// UNIFIED CONTEXT BUILDER
// ============================================================

const CONTEXT_BUILDERS = {
  sales: buildSalesContext,
  hr: buildHRContext,
  finance: buildFinanceContext,
  inventory: buildInventoryContext,
  audit: buildAuditContext,
  schema: buildSchemaContext,
};

export function buildContext(domains, question) {
  const isCross = domains.length > 1;
  let context = '';

  for (const domain of domains) {
    const builder = CONTEXT_BUILDERS[domain];
    if (builder) {
      if (isCross) {
        context += `\n\n--- ${AGENTS[domain].name.toUpperCase()} DATA ---\n`;
      }
      context += builder(question);
    }
  }

  return context;
}
