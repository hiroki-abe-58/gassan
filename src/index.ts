/**
 * gassan — native <dialog> based modal shell for React.
 *
 * 設計仕様は modal.skill.md を参照。
 * このファイルは公開面だけを定義する。
 */

import { ModalBody, ModalSection } from './body';
import { ModalChart } from './chart';
import { ModalCheckbox, ModalRadioGroup, ModalRating, ModalSegmented } from './choices';
import { ModalDatePicker } from './date-picker';
import { ModalAlert, ModalChips, ModalField, ModalFieldset, ModalSwitch, ModalTable } from './fields';
import { ModalFileDrop } from './file-drop';
import {
  ModalCodeInput,
  ModalInput,
  ModalNumberField,
  ModalPasswordInput,
  ModalSearchInput,
  ModalTextarea,
} from './inputs';
import { ModalCombobox, ModalSelect } from './select';
import { ModalRangeSlider, ModalSlider } from './slider';
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
export { ModalField, ModalFieldset, ModalChips, ModalSwitch, ModalTable, ModalAlert } from './fields';
export {
  ModalInput,
  ModalPasswordInput,
  ModalSearchInput,
  ModalTextarea,
  ModalNumberField,
  ModalCodeInput,
} from './inputs';
export { ModalCheckbox, ModalRadioGroup, ModalSegmented, ModalRating } from './choices';
export { ModalSlider, ModalRangeSlider } from './slider';
export { ModalSelect, ModalCombobox } from './select';
export { ModalDatePicker } from './date-picker';
export { ModalFileDrop } from './file-drop';
export { ModalChart } from './chart';
export { ModalHandle } from './sheet';
export { ModalHost, useModals, confirm, resetModalQueue } from './imperative';
export { GassanProvider, japaneseLabels, englishLabels, useLabels } from './labels';
export { Phrase } from './phrase';
export { splitPhrases } from './internal/phrase';

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
  ControlAria,
  ModalFieldsetProps,
  ModalChipsProps,
  ChipOption,
  ModalSwitchProps,
  ModalTableProps,
  ModalAlertProps,
} from './fields';
export type {
  ModalInputProps,
  ModalPasswordInputProps,
  ModalSearchInputProps,
  ModalTextareaProps,
  ModalNumberFieldProps,
  ModalCodeInputProps,
} from './inputs';
export type {
  GroupAria,
  ModalCheckboxProps,
  ChoiceOption,
  ModalRadioGroupProps,
  ModalSegmentedProps,
  ModalRatingProps,
} from './choices';
export type { ModalSliderProps, ModalRangeSliderProps } from './slider';
export type { SelectOption, ModalSelectProps, ModalComboboxProps } from './select';
export type { ModalDatePickerProps } from './date-picker';
export type { ModalFileDropProps } from './file-drop';
export type { ModalChartProps } from './chart';
export type { ConfirmOptions, ModalsApi } from './imperative';
export type { GassanLabels, GassanProviderProps } from './labels';
export type { LineBreakMode, PhraseProps } from './phrase';

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
  Fieldset: ModalFieldset,
  Input: ModalInput,
  PasswordInput: ModalPasswordInput,
  SearchInput: ModalSearchInput,
  Textarea: ModalTextarea,
  NumberField: ModalNumberField,
  CodeInput: ModalCodeInput,
  Checkbox: ModalCheckbox,
  RadioGroup: ModalRadioGroup,
  Segmented: ModalSegmented,
  Rating: ModalRating,
  Slider: ModalSlider,
  RangeSlider: ModalRangeSlider,
  Select: ModalSelect,
  Combobox: ModalCombobox,
  DatePicker: ModalDatePicker,
  FileDrop: ModalFileDrop,
  Chips: ModalChips,
  Switch: ModalSwitch,
  Table: ModalTable,
  Chart: ModalChart,
  Alert: ModalAlert,
  Handle: ModalHandle,
} as const;
