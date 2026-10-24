import type { ReactNode } from 'react';

import { Carousel } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function CarouselCases(): ReactNode {
  const t = useDemoText('carouselCases');
  const cases = [
    { id: 'finance', quote: t.financeQuote, name: t.financeName, company: t.financeCompany },
    { id: 'sales', quote: t.salesQuote, name: t.salesName, company: t.salesCompany },
    { id: 'support', quote: t.supportQuote, name: t.supportName, company: t.supportCompany },
    { id: 'product', quote: t.productQuote, name: t.productName, company: t.productCompany },
    { id: 'hr', quote: t.hrQuote, name: t.hrName, company: t.hrCompany },
  ];

  return (
    // t:fit
    <Carousel
      label={t.label}
      minSlideWidth={260}
      items={cases.map((item) => ({
        id: item.id,
        label: item.company,
        content: (
          <figure className="s-case-card">
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.company}</span>
            </figcaption>
          </figure>
        ),
      }))}
    />
  );
}
