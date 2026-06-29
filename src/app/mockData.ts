import type { Workspace } from './types'

export const WORKSPACE_COLORS = [
  { label: 'Blue',    value: '#3B82F6' },
  { label: 'Violet',  value: '#8B5CF6' },
  { label: 'Cyan',    value: '#06B6D4' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber',   value: '#F59E0B' },
  { label: 'Rose',    value: '#F43F5E' },
  { label: 'Indigo',  value: '#6366F1' },
  { label: 'Orange',  value: '#F97316' },
]

export const initialWorkspaces: Workspace[] = [
  // ── 1. Marketing Analytics ────────────────────────────────────────────────
  {
    id: 'ws-marketing', name: 'Marketing Analytics',
    description: 'Campaign performance, customer data, and sales analysis.',
    color: '#3B82F6', createdAt: '2025-03-10T09:00:00Z',

    datasets: [
      { id: 'ds-sales',     name: 'sales_2025.csv',    rows: 4820,   columns: ['month','category','product','units_sold','unit_price','total_sales','region'],                      size: '312 KB',  uploadedAt: '2 days ago',  status: 'ready'      },
      { id: 'ds-customers', name: 'customers.csv',      rows: 11_240, columns: ['customer_id','name','email','region','segment','signup_date','last_active'],                        size: '1.1 MB',  uploadedAt: '2 days ago',  status: 'ready'      },
      { id: 'ds-campaigns', name: 'campaigns_q2.csv',   rows: 320,    columns: ['campaign_id','name','channel','start_date','end_date','budget','impressions','clicks'],             size: '48 KB',   uploadedAt: '5 hours ago', status: 'processing' },
    ],

    sessions: [
      {
        id: 'sess-qs2', name: 'Q2 Sales Deep Dive', description: 'Analysing monthly sales trends and category performance for Q2 2025.',
        datasetIds: ['ds-sales', 'ds-customers'], createdAt: '2025-06-28T10:00:00Z', updatedAt: '2025-06-29T14:30:00Z',
        messages: [
          { id: 'm1', role: 'user', content: 'Show monthly sales distribution by category.' },
          { id: 'm2', role: 'ai',   content: 'Analysed **sales_2025.csv**. Here is the aggregate query:', sql: `SELECT  month, category,\n        SUM(total_sales)  AS total_sales,\n        SUM(units_sold)   AS units_sold\nFROM    sales_2025\nGROUP   BY month, category\nORDER   BY month ASC, total_sales DESC;` },
          { id: 'm3', role: 'user', content: 'Which month had the highest total across all categories?' },
          { id: 'm4', role: 'ai',   content: 'Based on the query results, May 2025 had the highest aggregate. You can save this chart or drill down by product.' },
        ],
        queries: [
          { id: 'sq1', title: 'Monthly sales by category', sql: `SELECT month, category, SUM(total_sales) AS total_sales\nFROM sales_2025 GROUP BY month, category ORDER BY month ASC;`, ranAt: '2 days ago' },
          { id: 'sq2', title: 'Top products by units',     sql: `SELECT product, SUM(units_sold) AS total_units\nFROM sales_2025 GROUP BY product ORDER BY total_units DESC LIMIT 10;`, ranAt: '1 day ago' },
        ],
        charts: [
          { id: 'sc1', title: 'Sales Distribution by Category', type: 'bar', data: [{ label:'Electronics',value:82,color:'#3B82F6'},{label:'Apparel',value:61,color:'#8B5CF6'},{label:'Home',value:45,color:'#06B6D4'},{label:'Sports',value:38,color:'#10B981'}] },
        ],
        insights: [
          'Electronics leads all categories across the analysed period, with consistent dominance month-over-month. The gap between Electronics and Apparel narrowed by 14% from January to June.',
        ],
      },
      {
        id: 'sess-camp', name: 'Campaign Performance Review', description: 'Evaluating Q2 campaign efficiency by channel and click-through rates.',
        datasetIds: ['ds-campaigns'], createdAt: '2025-06-26T09:00:00Z', updatedAt: '2025-06-27T16:00:00Z',
        messages: [
          { id: 'cm1', role: 'user', content: 'How many campaigns are active per channel?' },
          { id: 'cm2', role: 'ai',   content: 'Here is the channel breakdown:', sql: `SELECT channel, COUNT(campaign_id) AS campaigns\nFROM campaigns_q2 GROUP BY channel ORDER BY campaigns DESC;` },
        ],
        queries: [
          { id: 'cq1', title: 'Campaigns by channel', sql: `SELECT channel, COUNT(campaign_id) AS campaigns\nFROM campaigns_q2 GROUP BY channel ORDER BY campaigns DESC;`, ranAt: '3 days ago' },
        ],
        charts: [],
        insights: [
          'Email and social channels account for the majority of campaign volume. Paid search has the fewest campaigns but highest average budget allocation.',
        ],
      },
    ],

    savedQueries: [
      { id: 'q1', title: 'Monthly sales by category', datasetName: 'sales_2025.csv', runCount: 8, createdAt: '3 days ago', sessionId: 'sess-qs2',
        sql: `SELECT month, category, SUM(total_sales) AS total_sales\nFROM sales_2025\nGROUP BY month, category ORDER BY month ASC;` },
      { id: 'q2', title: 'Top products by units sold', datasetName: 'sales_2025.csv', runCount: 5, createdAt: '2 days ago', sessionId: 'sess-qs2',
        sql: `SELECT product, SUM(units_sold) AS total_units\nFROM sales_2025\nGROUP BY product ORDER BY total_units DESC LIMIT 10;` },
      { id: 'q3', title: 'Customers by region',       datasetName: 'customers.csv',  runCount: 3, createdAt: '1 day ago',
        sql: `SELECT region, COUNT(customer_id) AS count\nFROM customers GROUP BY region ORDER BY count DESC;` },
    ],

    savedCharts: [
      { id: 'ch1', title: 'Sales Distribution by Category', datasetName: 'sales_2025.csv', createdAt: '2 days ago', sessionId: 'sess-qs2',
        description: 'Total sales per category across Jan–Jun 2025', type: 'bar',
        data: [{label:'Electronics',value:82,color:'#3B82F6'},{label:'Apparel',value:61,color:'#8B5CF6'},{label:'Home',value:45,color:'#06B6D4'},{label:'Sports',value:38,color:'#10B981'}] },
      { id: 'ch2', title: 'Monthly Sales Trend',         datasetName: 'sales_2025.csv', createdAt: '1 day ago', sessionId: 'sess-qs2',
        description: 'Aggregate monthly sales Jan–Jun 2025',       type: 'bar',
        data: [{label:'Jan',value:62,color:'#3B82F6'},{label:'Feb',value:54,color:'#3B82F6'},{label:'Mar',value:79,color:'#3B82F6'},{label:'Apr',value:68,color:'#3B82F6'},{label:'May',value:91,color:'#3B82F6'},{label:'Jun',value:83,color:'#3B82F6'}] },
    ],

    history: [
      { id: 'h1', type: 'upload',   description: 'Uploaded campaigns_q2.csv',                  detail: '320 rows · 8 cols',         createdAt: '5 hours ago', status: 'success' },
      { id: 'h2', type: 'session',  description: 'Created session: Campaign Performance Review', detail: 'campaigns_q2.csv',          createdAt: '3 days ago',  status: 'success' },
      { id: 'h3', type: 'query',    description: 'Saved to library: Top products by units sold', detail: 'sales_2025.csv · 0.18s',    createdAt: '2 days ago',  status: 'success' },
      { id: 'h4', type: 'chart',    description: 'Saved chart: Monthly Sales Trend',             detail: 'sales_2025.csv',            createdAt: '1 day ago',   status: 'success' },
      { id: 'h5', type: 'session',  description: 'Created session: Q2 Sales Deep Dive',          detail: 'sales_2025.csv + customers', createdAt: '2 days ago',  status: 'success' },
    ],
  },

  // ── 2. HR Analytics ───────────────────────────────────────────────────────
  {
    id: 'ws-hr', name: 'HR Analytics',
    description: 'Employee data, payroll structure, and performance reviews.',
    color: '#10B981', createdAt: '2025-04-01T08:00:00Z',

    datasets: [
      { id: 'ds-emp',     name: 'employees.csv',          rows: 842,  columns: ['employee_id','name','department','role','hire_date','tenure_years','location'], size: '98 KB',  uploadedAt: '1 week ago',  status: 'ready' },
      { id: 'ds-payroll', name: 'payroll_q1.csv',         rows: 842,  columns: ['employee_id','period','base_salary','bonus','deductions','net_pay'],           size: '112 KB', uploadedAt: '1 week ago',  status: 'ready' },
      { id: 'ds-perf',    name: 'performance_reviews.csv', rows: 780,  columns: ['employee_id','review_date','reviewer_id','rating','goals_met','comments'],      size: '76 KB',  uploadedAt: '3 days ago',  status: 'ready' },
    ],

    sessions: [
      {
        id: 'sess-hr1', name: 'Workforce Distribution Study', description: 'Headcount and tenure analysis by department.',
        datasetIds: ['ds-emp'], createdAt: '2025-06-25T11:00:00Z', updatedAt: '2025-06-26T15:30:00Z',
        messages: [
          { id: 'hm1', role: 'user', content: 'Show headcount by department.' },
          { id: 'hm2', role: 'ai',   content: 'Here is the query:', sql: `SELECT  department, COUNT(employee_id) AS headcount\nFROM    employees\nGROUP   BY department ORDER BY headcount DESC;` },
          { id: 'hm3', role: 'user', content: 'Which roles have the longest average tenure?' },
          { id: 'hm4', role: 'ai',   content: 'Here is the tenure query:', sql: `SELECT  role, ROUND(AVG(tenure_years),1) AS avg_tenure\nFROM    employees\nGROUP   BY role ORDER BY avg_tenure DESC;` },
        ],
        queries: [
          { id: 'hq1', title: 'Headcount by department', sql: `SELECT department, COUNT(employee_id) AS headcount\nFROM employees GROUP BY department ORDER BY headcount DESC;`, ranAt: '1 week ago' },
          { id: 'hq2', title: 'Average tenure by role',  sql: `SELECT role, ROUND(AVG(tenure_years),1) AS avg_tenure\nFROM employees GROUP BY role ORDER BY avg_tenure DESC;`, ranAt: '4 days ago' },
        ],
        charts: [
          { id: 'hc1', title: 'Headcount by Department', type: 'bar', data: [{label:'Eng',value:74,color:'#10B981'},{label:'Sales',value:58,color:'#10B981'},{label:'Ops',value:41,color:'#10B981'},{label:'HR',value:22,color:'#10B981'},{label:'Fin',value:18,color:'#10B981'}] },
        ],
        insights: [
          'Engineering has the highest headcount, followed by Sales and Operations. The average tenure across all roles is 3.4 years, with senior engineering roles showing the longest retention.',
        ],
      },
    ],

    savedQueries: [
      { id: 'hq1', title: 'Headcount by department', datasetName: 'employees.csv', runCount: 6, createdAt: '1 week ago', sessionId: 'sess-hr1',
        sql: `SELECT department, COUNT(employee_id) AS headcount\nFROM employees GROUP BY department ORDER BY headcount DESC;` },
      { id: 'hq2', title: 'Average tenure by role',  datasetName: 'employees.csv', runCount: 2, createdAt: '4 days ago', sessionId: 'sess-hr1',
        sql: `SELECT role, ROUND(AVG(tenure_years), 1) AS avg_tenure\nFROM employees GROUP BY role ORDER BY avg_tenure DESC;` },
    ],

    savedCharts: [
      { id: 'hch1', title: 'Headcount by Department', datasetName: 'employees.csv', createdAt: '1 week ago', sessionId: 'sess-hr1',
        description: 'Employee distribution across departments', type: 'bar',
        data: [{label:'Eng',value:74,color:'#10B981'},{label:'Sales',value:58,color:'#10B981'},{label:'Ops',value:41,color:'#10B981'},{label:'HR',value:22,color:'#10B981'},{label:'Fin',value:18,color:'#10B981'}] },
    ],

    history: [
      { id: 'hh1', type: 'upload',  description: 'Uploaded performance_reviews.csv',          detail: '780 rows · 6 cols',    createdAt: '3 days ago', status: 'success' },
      { id: 'hh2', type: 'session', description: 'Created session: Workforce Distribution Study', detail: 'employees.csv',        createdAt: '1 week ago', status: 'success' },
      { id: 'hh3', type: 'chart',   description: 'Saved chart: Headcount by Department',         detail: 'employees.csv',        createdAt: '1 week ago', status: 'success' },
    ],
  },

  // ── 3. Operations ─────────────────────────────────────────────────────────
  {
    id: 'ws-ops', name: 'Operations',
    description: 'Inventory levels, supplier data, and fulfilment tracking.',
    color: '#F59E0B', createdAt: '2025-05-15T10:00:00Z',

    datasets: [
      { id: 'ds-inv', name: 'inventory.csv', rows: 2_140, columns: ['sku','product_name','category','warehouse','quantity_on_hand','reorder_level','last_updated'], size: '248 KB', uploadedAt: '3 days ago', status: 'ready' },
      { id: 'ds-sup', name: 'suppliers.csv', rows: 88,    columns: ['supplier_id','name','country','lead_time_days','min_order_qty','contact_email'],              size: '12 KB',  uploadedAt: '3 days ago', status: 'error' },
    ],

    sessions: [
      {
        id: 'sess-inv', name: 'Inventory Reorder Analysis', description: 'Identifying SKUs at or below reorder threshold.',
        datasetIds: ['ds-inv'], createdAt: '2025-06-26T09:00:00Z', updatedAt: '2025-06-27T11:00:00Z',
        messages: [
          { id: 'om1', role: 'user', content: 'Which SKUs are below their reorder level?' },
          { id: 'om2', role: 'ai',   content: 'Here is the reorder query:', sql: `SELECT  sku, product_name,\n        quantity_on_hand, reorder_level\nFROM    inventory\nWHERE   quantity_on_hand <= reorder_level\nORDER   BY quantity_on_hand ASC;` },
        ],
        queries: [
          { id: 'oq1', title: 'Items below reorder level', sql: `SELECT sku, product_name, quantity_on_hand, reorder_level\nFROM inventory WHERE quantity_on_hand <= reorder_level ORDER BY quantity_on_hand ASC;`, ranAt: '3 days ago' },
        ],
        charts: [
          { id: 'oc1', title: 'Inventory by Category', type: 'bar', data: [{label:'Electronics',value:88,color:'#F59E0B'},{label:'Apparel',value:64,color:'#F59E0B'},{label:'Home',value:52,color:'#F59E0B'},{label:'Sports',value:39,color:'#F59E0B'}] },
        ],
        insights: [],
      },
    ],

    savedQueries: [
      { id: 'oq1', title: 'Items below reorder level', datasetName: 'inventory.csv', runCount: 4, createdAt: '3 days ago', sessionId: 'sess-inv',
        sql: `SELECT sku, product_name, quantity_on_hand, reorder_level FROM inventory WHERE quantity_on_hand <= reorder_level ORDER BY quantity_on_hand ASC;` },
      { id: 'oq2', title: 'Inventory by category',     datasetName: 'inventory.csv', runCount: 2, createdAt: '2 days ago',
        sql: `SELECT category, SUM(quantity_on_hand) AS total_qty FROM inventory GROUP BY category ORDER BY total_qty DESC;` },
    ],

    savedCharts: [
      { id: 'och1', title: 'Inventory by Category', datasetName: 'inventory.csv', createdAt: '2 days ago', sessionId: 'sess-inv',
        description: 'Total units on hand per product category', type: 'bar',
        data: [{label:'Electronics',value:88,color:'#F59E0B'},{label:'Apparel',value:64,color:'#F59E0B'},{label:'Home',value:52,color:'#F59E0B'},{label:'Sports',value:39,color:'#F59E0B'}] },
    ],

    history: [
      { id: 'oh1', type: 'upload',  description: 'Uploaded suppliers.csv (parse error)', detail: 'Encoding issue on row 88', createdAt: '3 days ago', status: 'error'   },
      { id: 'oh2', type: 'upload',  description: 'Uploaded inventory.csv',               detail: '2,140 rows · 7 cols',     createdAt: '3 days ago', status: 'success' },
      { id: 'oh3', type: 'session', description: 'Created session: Inventory Reorder Analysis', detail: 'inventory.csv',   createdAt: '3 days ago', status: 'success' },
    ],
  },
]
