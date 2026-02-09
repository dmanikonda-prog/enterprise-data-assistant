import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to sales data files
const salesDataPath = '/Users/muralidharmanikonda/Documents/cursorprojects/SampleData/sales';

console.log('Loading sales data files...');

// Load source files
const orders = JSON.parse(fs.readFileSync(path.join(salesDataPath, 'orders.json'), 'utf-8'));
const orderLines = JSON.parse(fs.readFileSync(path.join(salesDataPath, 'order_lines.json'), 'utf-8'));
const customers = JSON.parse(fs.readFileSync(path.join(salesDataPath, 'customers.json'), 'utf-8'));
const products = JSON.parse(fs.readFileSync(path.join(salesDataPath, 'product_catalog.json'), 'utf-8'));

console.log(`Loaded ${orders.length} orders`);
console.log(`Loaded ${orderLines.length} order lines`);
console.log(`Loaded ${customers.length} customers`);
console.log(`Loaded ${products.length} products`);

console.log('\nCreating denormalized sales transactions...');

// Create indexes for faster lookups
const orderMap = new Map(orders.map(o => [o.ORDER_ID, o]));
const customerMap = new Map(customers.map(c => [c.CUSTOMER_ID, c]));
const productMap = new Map(products.map(p => [p.PRODUCT_ID, p]));

// Create denormalized view
let successCount = 0;
let failedCount = 0;

const salesTransactions = orderLines.map((line, idx) => {
  if (idx % 1000 === 0) {
    console.log(`Processing line ${idx + 1}/${orderLines.length}...`);
  }

  const order = orderMap.get(line.ORDER_ID);
  const customer = order ? customerMap.get(order.CUSTOMER_ID) : null;
  const product = productMap.get(line.PRODUCT_ID);

  // Handle missing data gracefully
  if (!order || !customer || !product) {
    failedCount++;
    return null;
  }

  successCount++;

  return {
    TRANSACTION_ID: `${line.ORDER_ID}-${line.LINE_ID}`,
    ORDER_ID: order.ORDER_ID,
    ORDER_DATE: order.ORDER_DATE,
    ORDER_STATUS: order.STATUS,
    ORDER_TOTAL_AMOUNT: order.TOTAL_AMOUNT,
    CUSTOMER_ID: customer.CUSTOMER_ID,
    CUSTOMER_NAME: customer.CUSTOMER_NAME,
    CUSTOMER_EMAIL: order.CUSTOMER_EMAIL,
    CUSTOMER_BILLING_ADDRESS: customer.BILLING_ADDRESS,
    CUSTOMER_TAX_ID: customer.TAX_ID || null,
    LINE_ID: line.LINE_ID,
    PRODUCT_ID: line.PRODUCT_ID,
    PRODUCT_NAME: product.PRODUCT_NAME,
    PRODUCT_CATEGORY_ID: product.CATEGORY_ID,
    PRODUCT_LIST_PRICE: product.LIST_PRICE,
    LINE_QUANTITY: line.QUANTITY,
    LINE_UNIT_PRICE: line.UNIT_PRICE,
    LINE_TOTAL: parseFloat((line.QUANTITY * line.UNIT_PRICE).toFixed(2))
  };
}).filter(Boolean); // Remove nulls

console.log(`\n✓ Successfully processed ${successCount} transactions`);
if (failedCount > 0) {
  console.log(`⚠ Failed to process ${failedCount} transactions (missing references)`);
}

// Write output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'sales_transactions.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(salesTransactions, null, 2)
);

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
console.log(`\n✓ Generated ${salesTransactions.length} sales transaction records`);
console.log(`✓ Output file: ${outputPath}`);
console.log(`✓ File size: ${fileSizeKB} KB`);
