import type { ReactNode, Ref } from 'react';

import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { Brand, PageFooter } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface AuthLayoutProps extends DataAttributes {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** カードの下に置く 1 行（「アカウントをお持ちでない方は …」）。 */
  footer?: ReactNode;
  /** 広い器で横に並べる面（製品の紹介・お客様の声など）。狭い器では出さない。 */
  aside?: ReactNode;
  /** 見出しの ref。画面が切り替わったとき（送信の完了など）に、ここへフォーカスを移す。 */
  headingRef?: Ref<HTMLHeadingElement>;
  /** カードの見出しの前に置くもの（手順の進み具合など）。 */
  lead?: ReactNode;
  className?: string;
}

/**
 * ログイン・登録・再設定などの、中央のカードに 1 つの作業を置く骨組み。P-01。
 *
 * header（ロゴ）・main（カード）・footer（規約などのリンク）のランドマークを持ち、見出し（h1）は 1 つ。
 * aside を渡すと、器が広いときだけカードの横に並べる（狭いときは作業を先に出し、紹介は省く）。
 * 器の幅で決めるので、どこに置いても形が崩れない。
 */
export function AuthLayout({ title, description, children, footer, aside, headingRef, lead, className, ...rest }: AuthLayoutProps): ReactNode {
  const phrase = usePhrase();
  return (
    // 器（.g-page）は container query の基準なので、並べ方は内側の枠（.g-auth-frame）に書く。
    <div {...domPassthrough(rest, 'AuthLayout')} className={cx('g-page g-auth', className)}>
      <div className="g-auth-frame" data-layout={aside ? 'split' : undefined}>
        <div className="g-auth-column">
          <header className="g-auth-header">
            <Brand />
          </header>
          <main className="g-auth-main">
            <div className="g-auth-card">
              {lead ? <div className="g-auth-lead">{lead}</div> : null}
              <h1 ref={headingRef} className="g-auth-title" tabIndex={-1}>
                {phrase(title)}
              </h1>
              {description ? <p className="g-auth-description">{phrase(description)}</p> : null}
              {children}
            </div>
            {footer ? <p className="g-auth-after">{footer}</p> : null}
          </main>
          <PageFooter className="g-auth-footer" />
        </div>
        {aside ? <aside className="g-auth-aside">{phrase(aside)}</aside> : null}
      </div>
    </div>
  );
}

export interface StatusLayoutProps extends DataAttributes {
  /** 大きく出す印（状態コード・絵）。 */
  visual?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 次の一歩（ボタン・リンク）。 */
  actions?: ReactNode;
  /** 見出しと説明の下に置くもの（予定・問い合わせ番号など）。 */
  children?: ReactNode;
  className?: string;
}

/**
 * エラー・メンテナンス・ログアウトなどの、状態を伝える 1 枚のページの骨組み。P-01。
 *
 * 何が起きたか（見出し）・なぜか（説明）・次に何ができるか（操作）を、この順で中央に置く。
 */
export function StatusLayout({ visual, title, description, actions, children, className, ...rest }: StatusLayoutProps): ReactNode {
  const phrase = usePhrase();
  return (
    <div {...domPassthrough(rest, 'StatusLayout')} className={cx('g-page g-status', className)}>
      <header className="g-status-header">
        <Brand />
      </header>
      <main className="g-status-main">
        {visual ? <div className="g-status-visual">{visual}</div> : null}
        <h1 className="g-status-title">{phrase(title)}</h1>
        {description ? <p className="g-status-description">{phrase(description)}</p> : null}
        {children}
        {actions ? <div className="g-status-actions">{actions}</div> : null}
      </main>
      <PageFooter className="g-status-footer" />
    </div>
  );
}
