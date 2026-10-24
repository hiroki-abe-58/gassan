import type ja from '../ja/uiData';

export default {
  lead: 'Page headers and data tables. A list screen is made up of a heading, actions, filters, a table and pagination, and the table itself takes care of sorting and row selection.',
  example: {
    title: 'Putting them together',
    intro: 'A member list. The page header holds one main action; you search by name, and sort and select in the table. Open the details from the “…” on a row, and they appear in a panel that slides in from the side (placement="end"), so you can check them while keeping the list in view.',
    exampleTitle: 'Members',
    exampleDescription: 'Press a column header to sort by it, and the new order is announced. Select rows, and the number selected and the bulk actions appear above the table.',
  },
  pageHeader: {
    title: 'Page header',
    intro: 'Lays out the breadcrumbs, heading, description and actions, in that order. It stands out through the size of the heading and the spacing, not through a box or a background color. When the container gets narrow, the actions move below the heading.',
  },
  table: {
    title: 'Data table',
    intro: 'Drawn as a real table element, named by its caption, with column and row headers. Numbers and amounts align to the end, so their digits line up. With no rows, it shows a sentence or an empty state; while loading, it shows skeletons. Only when the table is wider than its container does the region that scrolls it sideways become focusable.',
  },
  codeblock: {
    title: 'Code block',
    intro: 'Shows examples of API calls and configuration. A bar along the top holds the title and the copy button, and the code scrolls sideways instead of wrapping (the code container is a Tab stop, and the arrow keys scroll it too). It does no syntax highlighting of its own; you can pass elements highlighted with Shiki, Prism or the like as children. What gets copied is always the original string. The code on this site is drawn by this component too, with the highlighting passed in.',
    exampleTitle: 'API examples',
    exampleDescription: 'Copy with the button at the top right, and its icon turns into a check mark and “Copied” is announced.',
  },
  labels: {
    full: 'Breadcrumbs and actions',
    narrow: 'Narrow container',
    compact: 'Dense rows (compact)',
    loading: 'Loading',
    empty: 'No rows',
  },
  sample: {
    settings: 'Settings',
    billing: 'Billing',
    billingDescription: 'Your plan, payment method and invoices. Invoices can be saved as PDFs.',
    download: 'Download all invoices',
    changePlan: 'Change plan',
    invoices: 'Invoices',
    number: 'Number',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    paid: 'Paid',
    due: 'Unpaid',
  },
  codeCaption: 'Usage',
  code: "import { DataTable, PageHeader, Button } from '@genelab/gassan';\n\n<PageHeader title=\"Members\" actions={<Button variant=\"primary\">Invite</Button>} />\n<DataTable\n  label=\"Members\"\n  rows={members}\n  getRowId={(m) => m.id}\n  columns={[\n    { key: 'name', header: 'Name', cell: (m) => m.name, sortValue: (m) => m.name },\n    { key: 'seats', header: 'Seats', cell: (m) => m.seats, sortValue: (m) => m.seats, align: 'end' },\n  ]}\n  selectable\n  bulkActions={(ids) => <Button onClick={() => remove(ids)}>Remove</Button>}\n/>",
  a11yCaption: 'How the page header and the data table behave',
} satisfies typeof ja;
