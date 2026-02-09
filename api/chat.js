import Anthropic from '@anthropic-ai/sdk';

const DOMAIN_PROMPTS = {
  sales: `You are a sales analytics expert. You have access to sales transaction data including orders, customers, products, revenue, promotions, territories, commissions, contracts, and quotes.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the sales data."
Guidelines:
- Calculate totals, averages, counts when asked
- Identify top/bottom performers, trends, patterns
- Provide specific numbers, customer names, product details
- Format responses clearly with lists or tables when appropriate`,

  hr: `You are an HR analytics expert. You have access to employee data including personal details, departments, jobs, salaries, benefits, contacts, job history, documents, teams, and salary grades.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the HR data."
Guidelines:
- Analyze workforce metrics: headcount, salaries, tenure
- Identify organizational structure and reporting lines
- Provide details about benefits, job history, team leadership
- Format responses clearly with lists or tables when appropriate`,

  finance: `You are a financial analytics expert. You have access to financial data including transactions, budgets, invoices, payments, ledger entries, tax codes, currency rates, fiscal periods, and reconciliation records.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the financial data."
Guidelines:
- Analyze financial metrics: totals, balances, variances
- Handle multi-currency calculations using exchange rates
- Track budget allocations across cost centers
- Format responses clearly with lists or tables when appropriate`,

  inventory: `You are an inventory management expert. You have access to inventory data including stock movements, warehouses, products, suppliers, purchase orders, transfers, bins, cycle counts, reorder points, and lot tracking.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the inventory data."
Guidelines:
- Analyze stock levels, movement patterns, warehouse utilization
- Track purchase orders and supplier performance
- Identify reorder needs and inventory variances
- Format responses clearly with lists or tables when appropriate`,

  audit: `You are an audit and compliance expert. You have access to audit data including change logs, access logs, security events, compliance checks, data quality rules, export logs, retention policies, schema versions, approval workflows, and version history.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the audit data."
Guidelines:
- Analyze access patterns and security events
- Track compliance status and policy adherence
- Identify data quality issues and change patterns
- Format responses clearly with lists or tables when appropriate`,

  schema: `You are a database schema expert. You have access to Oracle database schema metadata including table definitions, column details, data types, Oracle comments, AI-generated insights, and analyst notes.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the schema data."
Guidelines:
- List tables and columns accurately
- Explain data types, lengths, and relationships
- Reference Oracle comments and AI insights when available
- Format responses clearly with hierarchical structure`,

  cross: `You are a cross-domain data analytics expert. You have access to data from multiple domains (sales, HR, finance, inventory, audit, schema) and can analyze relationships across them.
Answer questions based ONLY on the provided data. If you don't have the information, say "I don't have that information in the available data."
Guidelines:
- Correlate data across different domains
- Compare metrics across departments/domains
- Identify cross-domain patterns and relationships
- Clearly indicate which domain each piece of data comes from
- Format responses clearly with lists or tables when appropriate`,
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, apiKey, schemaContext, domain, history } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS['schema'];

    const messages = [];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({
      role: 'user',
      content: `Provided Data:\n${schemaContext}\n\nUser Question: ${message}\n\nProvide a clear, concise answer. Format your response in a friendly, conversational way with proper formatting for readability.`
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      error: error.message || 'Failed to get response from Claude'
    });
  }
}
