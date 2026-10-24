import type { ReactNode } from 'react';

import { ButtonLink, Carousel } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function CarouselNews(): ReactNode {
  const t = useDemoText('carouselNews');
  const slides = [
    { id: 'dashboard', title: t.dashboardTitle, body: t.dashboardBody, action: t.dashboardAction },
    { id: 'invoices', title: t.invoicesTitle, body: t.invoicesBody, action: t.invoicesAction },
    { id: 'invites', title: t.invitesTitle, body: t.invitesBody, action: t.invitesAction },
  ];

  return (
    // t:autoplay
    <Carousel
      label={t.label}
      autoplay
      items={slides.map((slide) => ({
        id: slide.id,
        label: slide.title,
        content: (
          <div className="s-news-slide">
            <h3>{slide.title}</h3>
            <p>{slide.body}</p>
            <ButtonLink href="#/ui/carousel" variant="primary">
              {slide.action}
            </ButtonLink>
          </div>
        ),
      }))}
    />
  );
}
