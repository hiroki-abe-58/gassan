import type { ReactNode } from 'react';

import { Button, RegistrationPresetPage, toast, type PostalAddress, type RegistrationPresetId } from '@genelab/gassan';

import { BANK_SAMPLES, BRANCH_SAMPLES, COMPANY_SAMPLES, POSTAL_SAMPLES } from '../data/japan';
import { useT } from '../i18n';
import { go, wait } from './shared';

/** 見本の郵便番号と法人番号の表から引く（日本の入力の見本と同じ。待ち時間を真似る）。 */
const lookupAddress = (postalCode: string): Promise<readonly PostalAddress[]> => wait(300).then(() => POSTAL_SAMPLES[postalCode] ?? []);
const lookupCompany = async (corporateNumber: string): Promise<{ name: string } | null> => {
  await wait(300);
  const name = COMPANY_SAMPLES[corporateNumber];
  return name ? { name } : null;
};

/**
 * 業種ごとの本登録（P-31）の見本（#/preview/industry-<業種>）。名前の一覧は TemplatePreview の PREVIEWS にある。
 * 保存・本人確認・登録は少し待ってから通す（本人確認のサービスにはつながない）。
 */
export function RegistrationPresetPreview({ preset }: { preset: RegistrationPresetId }): ReactNode {
  const a = useT().registrationPresets.samples;
  return (
    <RegistrationPresetPage
      preset={preset}
      lookupAddress={lookupAddress}
      lookupCompany={lookupCompany}
      banks={BANK_SAMPLES}
      branchesOf={() => BRANCH_SAMPLES}
      onSave={() => wait(300)}
      onSaveAndExit={() => toast(a.savedExit)}
      onVerifyIdentity={() => wait(900)}
      onSubmit={() => wait(900)}
      done={
        <Button variant="primary" block onClick={() => go('app-dashboard')}>
          {a.doneNext}
        </Button>
      }
    />
  );
}
