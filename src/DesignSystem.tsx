import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, Search, Upload, BarChart2, FileText,
  Settings, Home, Layers, Hash, Activity, Package,
  Users, LogOut, User, Bell, Edit2, Trash2, Download,
  Plus, ChevronRight, Info, CheckCircle2, Star
} from 'lucide-react'

// Design System imports
import { Button, IconButton }            from './design-system/components/Button'
import { Input, PasswordInput, Textarea }from './design-system/components/Input'
import { SearchBar }                     from './design-system/components/SearchBar'
import { Badge, StatusChip }             from './design-system/components/Badge'
import { Card, CardHeader, CardDivider, CardFooter, StatsCard } from './design-system/components/Card'
import { Modal, ConfirmModal }           from './design-system/components/Modal'
import { Table, Column }                 from './design-system/components/Table'
import { Dropdown, Select }              from './design-system/components/Dropdown'
import { NavigationMenu, Sidebar }       from './design-system/components/Navigation'
import { Breadcrumbs }                   from './design-system/components/Breadcrumbs'
import { ChartContainer, InlineBarChart } from './design-system/components/ChartContainer'
import { DatasetCard }                   from './design-system/components/DatasetCard'
import { AIChatBubble, ChatInput }       from './design-system/components/AIChatBubble'
import { SQLCodeBlock }                  from './design-system/components/SQLCodeBlock'
import {
  Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart
}                                        from './design-system/components/Skeleton'
import { EmptyState }                    from './design-system/components/EmptyState'
import { ToastProvider, useToast }       from './design-system/components/Toast'
import { Pagination }                    from './design-system/components/Pagination'
import { Tabs }                          from './design-system/components/Tabs'
import { Accordion }                     from './design-system/components/Accordion'
import { Avatar, AvatarMenu }            from './design-system/components/AvatarMenu'

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-10 border-b border-white/5 last:border-0">
      <h2 className="text-[22px] font-bold text-white mb-1">{title}</h2>
      <p className="text-[13px] text-zinc-600 mb-8">Component demonstrations</p>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">{children}</p>
}

// ─── Table data ───────────────────────────────────────────────────────────────
interface QueryRow {
  id:     string
  query:  string
  rows:   number
  time:   string
  status: 'success' | 'error' | 'running'
  [key:   string]: unknown
}
const tableData: QueryRow[] = [
  { id: '1', query: 'SELECT category, SUM(sales) FROM orders GROUP BY category', rows: 12,  time: '0.28s', status: 'success' },
  { id: '2', query: 'SELECT month, COUNT(*) FROM sales_2025 WHERE region = \'West\'', rows: 6, time: '0.14s', status: 'success' },
  { id: '3', query: 'SELECT product, AVG(price) FROM products ORDER BY price DESC', rows: 0, time: '—',     status: 'error'   },
  { id: '4', query: 'SELECT * FROM returns WHERE quarter = \'Q1 2025\'',             rows: 0, time: '—',     status: 'running' },
]

const tableCols: Column<QueryRow>[] = [
  { key: 'query',  header: 'Query',   width: '50%', cell: r => <code className="text-[11px] font-mono text-zinc-300 truncate block max-w-xs">{r.query}</code> },
  { key: 'rows',   header: 'Rows',    align: 'right', sortable: true },
  { key: 'time',   header: 'Time',    align: 'center' },
  { key: 'status', header: 'Status',  align: 'center', cell: r => (
    <StatusChip
      status={r.status === 'success' ? 'ready' : r.status === 'error' ? 'error' : 'processing'}
      label={r.status === 'success' ? 'Success' : r.status === 'error' ? 'Error' : 'Running'}
    />
  )},
]

// ─── Toast trigger section ────────────────────────────────────────────────────
function ToastSection() {
  const { add } = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary"     size="sm" onClick={() => add({ variant: 'success', title: 'Query succeeded', description: '12 rows returned in 0.28s'  })}>Success Toast</Button>
      <Button variant="destructive" size="sm" onClick={() => add({ variant: 'error',   title: 'Query failed',    description: 'Syntax error near WHERE clause' })}>Error Toast</Button>
      <Button variant="ghost"       size="sm" onClick={() => add({ variant: 'warning', title: 'Large dataset',   description: 'This query will scan 4.8M rows' })}>Warning Toast</Button>
      <Button variant="outline"     size="sm" onClick={() => add({ variant: 'info',    title: 'Schema updated',  description: 'sales_2025.csv columns refreshed',
        action: { label: 'View changes', onClick: () => {} }
      })}>Info Toast</Button>
    </div>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────
export function DesignSystemShowcase() {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [searchVal,   setSearchVal]   = useState('')
  const [inputVal,    setInputVal]    = useState('')
  const [selectVal,   setSelectVal]   = useState('')
  const [tabPage,     setTabPage]     = useState(1)
  const [sidebarKey,  setSidebarKey]  = useState('queries')

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/6 bg-[#09090B]/90 backdrop-blur-[12px]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px]">SelectAI <span className="text-zinc-600 font-normal">/ Design System</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="primary" dot>v1.0</Badge>
            <AvatarMenu name="Alex Chen" email="alex@selectai.io" role="Designer" notifCount={3} size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-0">
        {/* Intro */}
        <div className="pb-10 border-b border-white/5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-4xl font-bold text-white mb-3">SelectAI Design System</h1>
            <p className="text-zinc-500 text-[15px] max-w-xl leading-relaxed">
              A comprehensive library of 23 reusable, accessible UI components following a unified dark design language — glassmorphism, Framer Motion, and Tailwind CSS.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['23 Components', 'Dark Theme', 'Framer Motion', 'TypeScript', 'Accessible', 'Responsive'].map(t => (
                <Badge key={t} variant="neutral" size="sm">{t}</Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Buttons ── */}
        <Section title="Buttons" id="buttons">
          <div className="space-y-8">
            <div>
              <Label>Variants</Label>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <Label>States & Icons</Label>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary"  loading>Loading</Button>
                <Button variant="primary"  leftIcon={<Upload className="w-4 h-4" />}>Upload CSV</Button>
                <Button variant="outline"  rightIcon={<ChevronRight className="w-4 h-4" />}>Continue</Button>
                <Button variant="primary"  disabled>Disabled</Button>
                <Button variant="primary"  fullWidth>Full Width</Button>
              </div>
            </div>
            <div>
              <Label>Icon Buttons</Label>
              <div className="flex gap-3">
                <IconButton icon={<Search className="w-4 h-4" />} label="Search" variant="ghost" />
                <IconButton icon={<Edit2 className="w-4 h-4" />} label="Edit" variant="outline" />
                <IconButton icon={<Download className="w-4 h-4" />} label="Download" variant="primary" />
                <IconButton icon={<Trash2 className="w-4 h-4" />} label="Delete" variant="destructive" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Inputs ── */}
        <Section title="Input Fields" id="inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <Input label="Dataset Name" placeholder="e.g. sales_2025.csv" inputSize="md" />
            <Input label="Required Field" placeholder="Enter value" required />
            <Input label="With Left Icon" leftIcon={<Database className="w-4 h-4" />} placeholder="Connect database" />
            <Input label="Error State" placeholder="Enter query" error="Invalid SQL syntax near WHERE" value={inputVal} onChange={e => setInputVal(e.target.value)} />
            <Input label="Success State" placeholder="Dataset name" success="Name is available" value="sales_2025" readOnly />
            <PasswordInput label="Password" placeholder="Enter password" />
            <div className="md:col-span-2">
              <Textarea label="SQL Query" placeholder="Write your SQL here…" rows={4} hint="Press Ctrl+Enter to run" />
            </div>
          </div>
        </Section>

        {/* ── Search Bar ── */}
        <Section title="Search Bar" id="search">
          <div className="space-y-4 max-w-md">
            <SearchBar value={searchVal} onChange={setSearchVal} placeholder="Search datasets…" shortcut="⌘K" />
            <SearchBar value="" placeholder="Loading state…" loading />
            <SearchBar searchSize="sm" placeholder="Small search" />
            <SearchBar searchSize="lg" placeholder="Large search" shortcut="⌘F" />
          </div>
        </Section>

        {/* ── Badges ── */}
        <Section title="Badges & Status Chips" id="badges">
          <div className="space-y-6">
            <div>
              <Label>Badge Variants</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary"   size="md">Primary</Badge>
                <Badge variant="secondary" size="md">Secondary</Badge>
                <Badge variant="accent"    size="md">Accent</Badge>
                <Badge variant="success"   size="md">Success</Badge>
                <Badge variant="warning"   size="md">Warning</Badge>
                <Badge variant="error"     size="md">Error</Badge>
                <Badge variant="neutral"   size="md">Neutral</Badge>
                <Badge variant="outline"   size="md">Outline</Badge>
              </div>
            </div>
            <div>
              <Label>With Dot</Label>
              <div className="flex flex-wrap gap-2">
                {(['primary','secondary','success','warning','error'] as const).map(v => (
                  <Badge key={v} variant={v} dot>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Status Chips</Label>
              <div className="flex flex-wrap gap-3">
                <StatusChip status="online" />
                <StatusChip status="offline" />
                <StatusChip status="processing" />
                <StatusChip status="error" />
                <StatusChip status="idle" />
                <StatusChip status="ready" />
                <StatusChip status="warning" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Cards ── */}
        <Section title="Cards" id="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card variant="default" padding="md">
              <CardHeader title="Default Card" description="Standard surface card" icon={<Database className="w-4 h-4" />} />
              <CardDivider />
              <p className="text-[13px] text-zinc-500">Card body content goes here. This can contain any components.</p>
              <CardFooter>
                <Button size="sm" variant="ghost">Cancel</Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
            <Card variant="glass" padding="md">
              <CardHeader title="Glass Card" description="Glassmorphism variant" />
              <CardDivider />
              <p className="text-[13px] text-zinc-500">Uses backdrop-blur and semi-transparent background.</p>
            </Card>
            <Card variant="elevated" padding="md">
              <CardHeader title="Elevated Card" description="With drop shadow" />
              <CardDivider />
              <p className="text-[13px] text-zinc-500">Higher elevation shadow for focus areas.</p>
            </Card>
            <StatsCard label="Total Queries" value="1,248" delta="↑ 18 today" deltaDir="up" icon={<Activity className="w-4 h-4" />} />
            <StatsCard label="Active Datasets" value="7" delta="1 processing" deltaDir="neutral" icon={<FileText className="w-4 h-4" />} />
            <StatsCard label="Avg Query Time" value="0.31s" delta="↓ 12ms faster" deltaDir="up" icon={<Hash className="w-4 h-4" />} />
          </div>
        </Section>

        {/* ── Table ── */}
        <Section title="Table" id="table">
          <Table
            data={tableData}
            columns={tableCols}
            keyExtractor={r => r.id}
            selectable
            striped
          />
          <div className="flex justify-end mt-4">
            <Pagination page={tabPage} pageSize={10} total={48} onChange={setTabPage} />
          </div>
        </Section>

        {/* ── Dropdowns ── */}
        <Section title="Dropdowns & Selects" id="dropdowns">
          <div className="flex flex-wrap gap-4 items-start">
            <Dropdown
              trigger={<Button variant="outline" rightIcon={<ChevronRight className="w-4 h-4 rotate-90" />}>Actions</Button>}
              items={[
                { key: 'query',    label: 'Run Query',    icon: <Activity className="w-4 h-4" /> },
                { key: 'export',   label: 'Export CSV',   icon: <Download className="w-4 h-4" /> },
                { key: 'delete',   label: 'Delete Dataset', icon: <Trash2  className="w-4 h-4" />, danger: true, divider: true },
              ]}
            />
            <Dropdown
              trigger={<Button variant="primary">Grouped Menu</Button>}
              groups={[
                { label: 'Dataset', items: [
                  { key: 'rename', label: 'Rename', icon: <Edit2 className="w-4 h-4" /> },
                  { key: 'share',  label: 'Share',  icon: <Users className="w-4 h-4" /> },
                ]},
                { label: 'Danger', items: [
                  { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
                ]},
              ]}
            />
            <Select
              label="Chart Type"
              value={selectVal}
              onChange={setSelectVal}
              placeholder="Choose visualization"
              options={[
                { value: 'bar',     label: 'Bar Chart'  },
                { value: 'line',    label: 'Line Chart' },
                { value: 'pie',     label: 'Pie Chart'  },
                { value: 'scatter', label: 'Scatter'    },
              ]}
              fullWidth={false}
            />
          </div>
        </Section>

        {/* ── Navigation ── */}
        <Section title="Navigation Menu & Sidebar" id="navigation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>Navigation Menu</Label>
              <div className="rounded-2xl bg-[#18181B] border border-white/6 p-3">
                <NavigationMenu
                  activeKey={sidebarKey}
                  onSelect={setSidebarKey}
                  items={[
                    { key: 'workspace', label: 'Workspace',    icon: <Home     className="w-4 h-4" /> },
                    { key: 'datasets',  label: 'Datasets',     icon: <FileText className="w-4 h-4" />, badge: '7' },
                    { key: 'queries',   label: 'Query Editor', icon: <Hash     className="w-4 h-4" /> },
                    { key: 'charts',    label: 'Charts',       icon: <BarChart2 className="w-4 h-4" /> },
                    { key: 'settings',  label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
                  ]}
                />
              </div>
            </div>
            <div>
              <Label>Sidebar (Expanded)</Label>
              <div className="rounded-2xl overflow-hidden border border-white/6" style={{ height: 260 }}>
                <Sidebar
                  activeKey={sidebarKey}
                  onSelect={setSidebarKey}
                  sections={[
                    { label: 'Main', items: [
                      { key: 'workspace', label: 'Workspace',    icon: <Home     className="w-4 h-4" /> },
                      { key: 'datasets',  label: 'Datasets',     icon: <FileText className="w-4 h-4" />, badge: '7' },
                      { key: 'queries',   label: 'Query Editor', icon: <Hash     className="w-4 h-4" /> },
                    ]},
                    { label: 'Misc', items: [
                      { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                    ]},
                  ]}
                  header={
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
                      <span className="text-[13px] font-bold text-white">SelectAI</span>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Breadcrumbs ── */}
        <Section title="Breadcrumbs" id="breadcrumbs">
          <div className="space-y-4">
            <Breadcrumbs showHome items={[{ label: 'Datasets' }, { label: 'sales_2025.csv' }, { label: 'Query Results' }]} />
            <Breadcrumbs items={[{ label: 'Workspace' }, { label: 'Charts' }, { label: 'Monthly Sales' }]} size="md" />
          </div>
        </Section>

        {/* ── Tabs ── */}
        <Section title="Tabs" id="tabs">
          <div className="space-y-8">
            <div>
              <Label>Underline (default)</Label>
              <Tabs
                variant="underline"
                items={[
                  { key: 'results', label: 'Results',     icon: <Hash     className="w-4 h-4" />, badge: '12' },
                  { key: 'sql',     label: 'SQL',         icon: <FileText className="w-4 h-4" /> },
                  { key: 'chart',   label: 'Chart',       icon: <BarChart2 className="w-4 h-4" /> },
                  { key: 'insight', label: 'AI Insight',  icon: <Star     className="w-4 h-4" /> },
                ]}
                defaultKey="results"
              />
            </div>
            <div>
              <Label>Pills</Label>
              <Tabs variant="pills" items={[
                { key: 'all',    label: 'All Datasets' },
                { key: 'ready', label: 'Ready' },
                { key: 'error', label: 'Error' },
              ]} defaultKey="all" />
            </div>
            <div>
              <Label>Boxed</Label>
              <Tabs variant="boxed" items={[
                { key: 'day',   label: 'Day'   },
                { key: 'week',  label: 'Week'  },
                { key: 'month', label: 'Month' },
              ]} defaultKey="week" />
            </div>
          </div>
        </Section>

        {/* ── Accordion ── */}
        <Section title="Accordion" id="accordion">
          <div className="max-w-2xl space-y-8">
            <div>
              <Label>Default (single)</Label>
              <Accordion
                defaultOpen="q1"
                items={[
                  { key: 'q1', trigger: 'What file formats are supported?', content: 'SelectAI currently supports CSV and TSV files. Excel (.xlsx) and Parquet support is coming soon.', icon: <FileText className="w-4 h-4" /> },
                  { key: 'q2', trigger: 'How does AI SQL generation work?', content: 'The AI reads your column names and types, then translates your natural language question into a SQL query. You can review the SQL before running.', icon: <Hash className="w-4 h-4" /> },
                  { key: 'q3', trigger: 'Is my data encrypted?', content: 'Yes — all data is encrypted at rest (AES-256) and in transit (TLS 1.3). Queries run in isolated, read-only sandboxes.' },
                ]}
              />
            </div>
            <div>
              <Label>Separated (multiple)</Label>
              <Accordion
                variant="separated"
                multiple
                items={[
                  { key: 'a', trigger: 'Upload Dataset', content: 'Drag and drop any CSV file up to 500MB. Columns are auto-detected.',
                    badge: <Badge variant="success" size="xs" dot>Ready</Badge> },
                  { key: 'b', trigger: 'Ask a Question', content: 'Type your question in plain English. The AI will generate the SQL.' },
                ]}
              />
            </div>
          </div>
        </Section>

        {/* ── Modal ── */}
        <Section title="Modals" id="modals">
          <div className="flex gap-4">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Export Query Results"
            description="Choose a format and destination for your data."
            size="md"
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button size="sm" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Select label="Format" options={[{ value: 'csv', label: 'CSV' }, { value: 'json', label: 'JSON' }, { value: 'xlsx', label: 'Excel' }]} fullWidth />
              <Input label="Filename" placeholder="query_results" fullWidth />
            </div>
          </Modal>

          <ConfirmModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => setConfirmOpen(false)}
            title="Delete Dataset"
            description="This will permanently remove sales_2025.csv and all associated queries. This action cannot be undone."
            confirmLabel="Delete"
            destructive
          />
        </Section>

        {/* ── Charts ── */}
        <Section title="Chart Container" id="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChartContainer
              title="Monthly Sales by Category"
              description="Jan – Jun 2025"
              height={200}
              legend={[{ label: 'Electronics', color: '#3B82F6' }, { label: 'Apparel', color: '#8B5CF6' }]}
              onExport={() => {}}
              onRefresh={() => {}}
            >
              <InlineBarChart
                data={[
                  { label: 'Jan', value: 62,  color: '#3B82F6' },
                  { label: 'Feb', value: 54,  color: '#3B82F6' },
                  { label: 'Mar', value: 79,  color: '#3B82F6' },
                  { label: 'Apr', value: 68,  color: '#3B82F6' },
                  { label: 'May', value: 91,  color: '#3B82F6' },
                  { label: 'Jun', value: 83,  color: '#3B82F6' },
                ]}
              />
            </ChartContainer>
            <ChartContainer title="No Data State" height={200} empty emptyText="Run a query to generate a chart." />
          </div>
        </Section>

        {/* ── Dataset Cards ── */}
        <Section title="Dataset Cards" id="datasets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DatasetCard
              name="sales_2025.csv"
              rows={4820}
              columns={['month', 'category', 'units_sold', 'total_sales', 'region']}
              size="312 KB"
              status="ready"
              uploadedAt="2 hours ago"
              onQuery={() => {}}
              onMore={() => {}}
            />
            <DatasetCard name="returns_q1.csv" rows={2140} columns={['order_id', 'product', 'reason', 'status']} size="88 KB" status="processing" uploadedAt="Just now" />
            <DatasetCard name="inventory.csv" status="error" uploadedAt="Yesterday" onMore={() => {}} />
          </div>
        </Section>

        {/* ── AI Chat ── */}
        <Section title="AI Chat Bubbles" id="chat">
          <div className="max-w-xl space-y-4 bg-[#0F0F12] rounded-2xl p-5 border border-white/6">
            <AIChatBubble role="user" content="Show monthly sales by category." timestamp="12:04 PM" />
            <AIChatBubble role="ai" content={
              <p className="text-[13px] leading-relaxed">I've analysed your <code className="text-accent font-mono">sales_2025.csv</code> dataset. Here's a breakdown of monthly sales by category for the available date range.</p>
            } timestamp="12:04 PM" />
            <AIChatBubble role="ai" content="Generating your SQL query…" streaming />
            <ChatInput placeholder="Ask a question about your data…" />
          </div>
        </Section>

        {/* ── SQL Code Block ── */}
        <Section title="SQL Code Block" id="sql">
          <div className="max-w-2xl">
            <SQLCodeBlock
              title="Generated SQL · sales_2025.csv"
              code={`SELECT  month,
        category,
        SUM(total_sales)  AS total_sales,
        SUM(units_sold)   AS units_sold
FROM    sales_2025
WHERE   region IN ('West', 'Northeast')
GROUP   BY month, category
ORDER   BY month ASC, total_sales DESC;`}
            />
          </div>
        </Section>

        {/* ── Skeletons ── */}
        <Section title="Loading Skeletons" id="skeletons">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Card Skeleton</Label>
              <SkeletonCard />
            </div>
            <div>
              <Label>Dataset Card Skeleton</Label>
              <SkeletonChart />
            </div>
            <div className="md:col-span-2">
              <Label>Table Skeleton</Label>
              <SkeletonTable rows={4} cols={4} />
            </div>
          </div>
        </Section>

        {/* ── Empty States ── */}
        <Section title="Empty States" id="empty">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#18181B] border border-white/6">
              <EmptyState
                variant="upload"
                title="No Datasets Yet"
                description="Upload a CSV file to start asking questions about your data."
                action={{ label: 'Upload CSV', onClick: () => {}, icon: <Upload className="w-4 h-4" /> }}
              />
            </div>
            <div className="rounded-2xl bg-[#18181B] border border-white/6">
              <EmptyState
                variant="search"
                title="No Results Found"
                description="Try different search terms or filters."
                action={{ label: 'Clear Search', onClick: () => {} }}
                size="sm"
              />
            </div>
            <div className="rounded-2xl bg-[#18181B] border border-white/6">
              <EmptyState
                variant="chart"
                title="No Chart Yet"
                description="Run a query to visualize results."
                size="sm"
              />
            </div>
          </div>
        </Section>

        {/* ── Toasts ── */}
        <Section title="Toast Notifications" id="toasts">
          <ToastSection />
        </Section>

        {/* ── Pagination ── */}
        <Section title="Pagination" id="pagination">
          <div className="space-y-4">
            <Pagination page={tabPage} pageSize={10} total={248} onChange={setTabPage} />
            <Pagination page={3} pageSize={20} total={100} onChange={() => {}} showFirst={false} showLast={false} />
          </div>
        </Section>

        {/* ── Avatar Menu ── */}
        <Section title="Avatar & Avatar Menu" id="avatar">
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <Label>Avatar Sizes</Label>
              <div className="flex items-center gap-3">
                {(['xs','sm','md','lg','xl'] as const).map(s => (
                  <Avatar key={s} name="Alex Chen" size={s} />
                ))}
              </div>
            </div>
            <div>
              <Label>Avatar Menu</Label>
              <AvatarMenu
                name="Alex Chen"
                email="alex@selectai.io"
                role="Admin"
                notifCount={5}
                actions={[
                  { key: 'profile',  label: 'Profile',  icon: <User     className="w-4 h-4" /> },
                  { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                  { key: 'billing',  label: 'Billing',  icon: <Star     className="w-4 h-4" /> },
                  { key: 'logout',   label: 'Sign Out', icon: <LogOut   className="w-4 h-4" />, divider: true, danger: true },
                ]}
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

// ─── Wrapped with ToastProvider ───────────────────────────────────────────────
export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <DesignSystemShowcase />
    </ToastProvider>
  )
}
