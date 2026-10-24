import type { ReactNode } from 'react';

import { Button, Checkbox, CopyButton, IconButton, Menu, Popover, Tooltip } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import FilterToolbar from '../../demos/FilterToolbar';
import filterToolbarSource from '../../demos/FilterToolbar.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Glyph } from '../../ui/Glyph';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-19', 'U-20', 'U-21'];

export function UiOverlaysPage({ rest }: PageProps): ReactNode {
  const { nav, uiOverlays: t } = useT();
  const { labels: l, sample: s } = t;
  return (
    <ComponentPage
      path="/ui/overlays"
      rest={rest}
      title={nav.pages.uiOverlays}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="example" title={t.example.title} intro={t.example.intro}>
            <Example
              title={t.example.exampleTitle}
              description={t.example.exampleDescription}
              code={filterToolbarSource}
              demo="filterToolbar"
            >
              <FilterToolbar />
            </Example>
          </Section>

          <Section id="choose" title={t.choose.title}>
            <DataTable
              caption={t.choose.tableCaption}
              head={[t.choose.head.part, t.choose.head.holds, t.choose.head.when]}
              rows={t.choose.rows.map((row) => [row.part, row.holds, row.when])}
            />
          </Section>

          <Section id="tooltip" title={t.tooltip.title} intro={t.tooltip.intro}>
            <Specimens
              caption={t.tooltip.title}
              items={[
                {
                  label: l.icon,
                  render: () => (
                    <Tooltip content={s.settingsHint}>
                      <IconButton label={s.settings}>
                        <Glyph name="gear" />
                      </IconButton>
                    </Tooltip>
                  ),
                },
                {
                  label: l.text,
                  render: () => (
                    <Tooltip content={s.abbrHint}>
                      <button type="button" className="s-link-btn">
                        {s.abbr}
                      </button>
                    </Tooltip>
                  ),
                },
                {
                  label: l.below,
                  render: () => (
                    <Tooltip content={s.statusHint} side="below">
                      <Button size="sm">{s.status}</Button>
                    </Tooltip>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="popover" title={t.popover.title} intro={t.popover.intro}>
            <Specimens
              caption={t.popover.title}
              items={[
                {
                  label: l.filter,
                  render: () => (
                    <Popover trigger={<Button size="sm" iconStart={<Glyph name="filter" />}>{s.filter}</Button>} title={s.filterTitle}>
                      <div className="s-popover-form">
                        <Checkbox defaultChecked>{s.unread}</Checkbox>
                        <Checkbox>{s.mine}</Checkbox>
                      </div>
                    </Popover>
                  ),
                },
                {
                  label: l.share,
                  render: () => (
                    <Popover trigger={<Button size="sm">{s.share}</Button>} title={s.shareTitle}>
                      <p className="s-popover-text">{s.shareBody}</p>
                      <CopyButton value="https://example.com/p/atlas" variant="tonal">
                        {s.copyLink}
                      </CopyButton>
                    </Popover>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="menu" title={t.menu.title} intro={t.menu.intro}>
            <Specimens
              caption={t.menu.title}
              items={[
                {
                  label: l.actions,
                  render: () => (
                    <Menu
                      trigger={<Button size="sm">{s.actions}</Button>}
                      items={[
                        { value: 'edit', label: s.edit, shortcut: '⌘E' },
                        { value: 'duplicate', label: s.duplicate, shortcut: '⌘D' },
                        { value: 'move', label: s.move, disabled: true },
                        { type: 'separator' },
                        { value: 'remove', label: s.remove, tone: 'danger' },
                      ]}
                    />
                  ),
                },
                {
                  label: l.groups,
                  render: () => (
                    <Menu
                      trigger={
                        <IconButton label={s.view}>
                          <Glyph name="more" />
                        </IconButton>
                      }
                      items={[
                        {
                          type: 'group',
                          label: s.sortGroup,
                          items: [
                            { value: 'new', label: s.newest },
                            { value: 'old', label: s.oldest },
                          ],
                        },
                        { type: 'separator' },
                        { value: 'density', label: s.density },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="TooltipProps" title="Tooltip" />
          <ApiTable name="PopoverProps" title="Popover" />
          <ApiTable name="MenuProps" title="Menu" />
          <ApiTable name="MenuItem" />
          <ApiTable name="MenuGroup" />
          <ApiTable name="MenuSeparator" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'I-02', 'V-04']} caption={t.a11yCaption} />}
    />
  );
}
