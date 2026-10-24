import type { ReactNode } from 'react';

import { CodeBlock } from '@genelab/gassan';

const REQUEST = `curl https://api.atlas.example/v1/projects \\
  -H "Authorization: Bearer $ATLAS_API_KEY"`;

const PAYLOAD = JSON.stringify({ event: 'invoice.paid', data: { id: 'in_2026_10', amount: 9000, currency: 'jpy' } }, null, 2);

export default function CodeSnippet(): ReactNode {
  return (
    <div className="s-code-demo">
      <CodeBlock title="curl" language="bash" code={REQUEST} />
      <CodeBlock title="webhook.json" language="json" code={PAYLOAD} />
    </div>
  );
}
