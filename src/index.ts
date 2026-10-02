/**
 * kasane — native <dialog> based modal shell for React.
 *
 * 設計仕様は modal.skill.md を参照。
 * このファイルは公開面だけを定義する。
 */

import { ModalBody, ModalSection } from './body';
import { ModalChart } from './chart';
import { ModalAlert, ModalChips, ModalField, ModalSwitch, ModalTable } from './fields';
import { ModalButton, ModalFooter } from './footer';
import { ModalConsent, ModalGate, ModalGateStatus } from './gate';
import {
  ModalBack,
  ModalClose,
  ModalControls,
  ModalDescription,
  ModalHeader,
  ModalIndicator,
  ModalTitle,
} from './header';
import { ModalGallery, ModalMedia } from './media';
import { ModalHandle } from './sheet';
import { ModalRoot } from './root';

/* ---------------------------------------------------------------- components */

export { ModalRoot } from './root';
export { ModalHeader, ModalControls, ModalBack, ModalClose, ModalIndicator, ModalTitle, ModalDescription } from './header';
export { ModalBody, ModalSection } from './body';
export { ModalFooter, ModalButton } from './footer';
export { ModalGate, ModalConsent, ModalGateStatus, useGateRegistration } from './gate';
export { ModalMedia, ModalGallery } from './media';
export { ModalField, ModalChips, ModalSwitch, ModalTable, ModalAlert } from './fields';
export { ModalChart } from './chart';
export { ModalHandle } from './sheet';
export { ModalHost, useModals, confirm, resetModalQueue } from './imperative';
export { KasaneProvider, japaneseLabels, englishLabels, useLabels } from './labels';

/* --------------------------------------------------------------------- types */

export type {
  CloseReason,
  ScrimToken,
  SizeToken,
  PlacementToken,
  PlacementOption,
  ModalKind,
  DismissPolicy,
  GateEntry,
  ButtonVariant,
  GateSelector,
} from './types';
export { KIND_DEFAULTS, DEFAULT_BLOCKED_MESSAGE, DEFAULT_UNRESOLVED_GATE_MESSAGE } from './types';

export type { DataAttributes } from './internal/passthrough';
export type { ModalRootProps } from './root';
export type {
  ModalHeaderProps,
  ModalControlsProps,
  ModalIconButtonProps,
  ModalIndicatorProps,
  ModalTitleProps,
  ModalDescriptionProps,
} from './header';
export type { ModalBodyProps, ModalSectionProps } from './body';
export type { ModalFooterProps, ModalButtonProps } from './footer';
export type { ModalGateProps, ModalConsentProps, ModalGateStatusProps } from './gate';
export type { ModalMediaProps, ModalGalleryProps, ModalGalleryItem } from './media';
export type { ModalHandleProps } from './sheet';
export type {
  ModalFieldProps,
  FieldControlProps,
  ModalChipsProps,
  ChipOption,
  ModalSwitchProps,
  ModalTableProps,
  ModalAlertProps,
} from './fields';
export type { ModalChartProps } from './chart';
export type { ConfirmOptions, ModalsApi } from './imperative';
export type { KasaneLabels, KasaneProviderProps } from './labels';

/* ------------------------------------------------------------------ internals */

export { useBlockers, selectBlockers, useModalContext } from './context';
export type { ModalContextValue, ModalIds, GateContextValue, SelectBlockersOptions } from './context';
export { shouldDismissBySwipe } from './internal/swipe';
export {
  resolveDetents,
  snapToDetent,
  detentIndexOf,
  detentHeight,
  DETENT_FRACTION,
} from './internal/detent';
export type { DetentToken, SnapInput, SnapResult } from './internal/detent';
export type { SwipeDecisionInput } from './internal/swipe';

/* ----------------------------------------------------------------- namespace */

/**
 * 名前空間つきの入口。
 *
 * <Modal.Root> のほうが構造を読み取りやすいので、こちらを主として案内する。
 * バンドルサイズを 1 バイト単位で詰めたい場合は、個別の named export を使う。
 */
export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Controls: ModalControls,
  Back: ModalBack,
  Close: ModalClose,
  Indicator: ModalIndicator,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Section: ModalSection,
  Footer: ModalFooter,
  Button: ModalButton,
  Gate: ModalGate,
  Consent: ModalConsent,
  GateStatus: ModalGateStatus,
  Media: ModalMedia,
  Gallery: ModalGallery,
  Field: ModalField,
  Chips: ModalChips,
  Switch: ModalSwitch,
  Table: ModalTable,
  Chart: ModalChart,
  Alert: ModalAlert,
  Handle: ModalHandle,
} as const;
