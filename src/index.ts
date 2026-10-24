/**
 * gassan — native <dialog> based modal shell for React.
 *
 * 設計仕様は modal.skill.md を参照。
 * このファイルは公開面だけを定義する。
 */

import { ModalBody, ModalSection } from './body';
import { ModalChart } from './chart';
import { ModalCheckbox, ModalRadioGroup, ModalRating, ModalSegmented } from './choices';
import { ModalCalendar, ModalDateRangePicker, ModalRangeCalendar } from './calendar';
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
import { ModalPasswordStrength } from './password-strength';
import { ModalCombobox, ModalSelect } from './select';
import { ModalRangeSlider, ModalSlider } from './slider';
import { ModalTagInput } from './tag-input';
import { ModalTimePicker } from './time-picker';
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
export { ModalCalendar, ModalRangeCalendar, ModalDateRangePicker, commonDateRanges } from './calendar';
export { ModalTimePicker } from './time-picker';
export { ModalTagInput } from './tag-input';
export { ModalPasswordStrength } from './password-strength';
export { toast, ToastHost, resetToasts } from './toast';
export { ModalFileDrop } from './file-drop';
export { ModalChart } from './chart';

/* ------------------------------------------------------------------- ui parts */

// ページの上で使う部品（U-01〜U-27）。モーダルの部品ではないので Modal 名前空間には入れない。
export { Button, ButtonLink, IconButton, CopyButton } from './button';
export { Badge, Avatar, AvatarGroup, Kbd, Divider, Card, Stat, EmptyState, DescriptionList, Timeline } from './display';
export { Progress, Spinner, Skeleton, Banner } from './feedback';
export { Tabs } from './tabs';
export { Accordion } from './disclosure';
export { Tooltip, Popover, Menu } from './overlay';
export { Breadcrumbs, Pagination, Steps } from './navigation';
export { PageHeader } from './page-header';
export { DataTable } from './data-table';
export { CommandPalette } from './command-palette';
export { LineChart, BarChart, DonutChart, Sparkline, BarList, Gauge } from './charts';

/* ------------------------------------------------------------------ templates */

// SaaS のページのテンプレート（P-01〜）。見た目は templates.css（styles.css の後に読み込む）。
export { SiteProvider, SiteLink, useSite } from './templates/site';
export { AuthLayout, StatusLayout } from './templates/layouts';
export { SignInPage, SignUpPage, ForgotPasswordPage, ResetPasswordPage, TwoFactorPage, VerifyEmailPage, SignOutPage } from './templates/auth';
export { ErrorPage, MaintenancePage } from './templates/status';
export { SiteLayout } from './templates/site-layout';
export { DocumentPage, FaqPage, PricingPage, ContactPage, ChangelogPage } from './templates/public';
export { AppShell } from './templates/app-shell';
export { SettingsPage, SettingsSection } from './templates/settings';
export { MembersPage } from './templates/members';
export { BillingPage } from './templates/billing';
export { OnboardingPage } from './templates/onboarding';
export { InviteAcceptPage } from './templates/invite';
export { japaneseTemplateLabels, englishTemplateLabels } from './templates/labels';

/*
 * フォーム部品の中立の名前。ページの上でもモーダルの中でも同じ部品なので、Modal を付けずに書ける。
 * Modal.Input / ModalInput は残す（同じものを指す）。
 */
export { ModalField as Field, ModalFieldset as Fieldset, ModalChips as Chips, ModalSwitch as Switch, ModalTable as Table, ModalAlert as Alert } from './fields';
export {
  ModalInput as Input,
  ModalPasswordInput as PasswordInput,
  ModalSearchInput as SearchInput,
  ModalTextarea as Textarea,
  ModalNumberField as NumberField,
  ModalCodeInput as CodeInput,
} from './inputs';
export { ModalCheckbox as Checkbox, ModalRadioGroup as RadioGroup, ModalSegmented as Segmented, ModalRating as Rating } from './choices';
export { ModalSlider as Slider, ModalRangeSlider as RangeSlider } from './slider';
export { ModalSelect as Select, ModalCombobox as Combobox } from './select';
export { ModalDatePicker as DatePicker } from './date-picker';
export { ModalCalendar as Calendar, ModalRangeCalendar as RangeCalendar, ModalDateRangePicker as DateRangePicker } from './calendar';
export { ModalTimePicker as TimePicker } from './time-picker';
export { ModalTagInput as TagInput } from './tag-input';
export { ModalPasswordStrength as PasswordStrength } from './password-strength';
export { ModalFileDrop as FileDrop } from './file-drop';
export { ModalChart as Chart } from './chart';
export { ModalHandle } from './sheet';
export { ModalHost, useModals, confirm, resetModalQueue } from './imperative';
export { GassanProvider, japaneseLabels, englishLabels, useLabels } from './labels';
export { japaneseHoliday, japaneseHolidays, japaneseHolidayNames, japaneseHolidayResolver } from './holidays';
export type { Holiday, HolidayResolver, JapaneseHolidayKey } from './holidays';
export { DATE_RANGE_PRESETS } from './internal/dates';
export type { DateRange, DateRangePresetKey } from './internal/dates';
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
  MotionPreset,
} from './types';
export { KIND_DEFAULTS, DEFAULT_BLOCKED_MESSAGE, DEFAULT_UNRESOLVED_GATE_MESSAGE, MOTION_PRESETS } from './types';

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
export type { ModalDatePickerProps, CalendarOptions } from './date-picker';
export type { ModalCalendarProps, ModalRangeCalendarProps, ModalDateRangePickerProps, DateRangePreset } from './calendar';
export type { ModalTimePickerProps } from './time-picker';
export type { ModalTagInputProps } from './tag-input';
export type { ModalPasswordStrengthProps, PasswordRule, PasswordScore } from './password-strength';
export type {
  ToastAction,
  ToastHostProps,
  ToastOptions,
  ToastPosition,
  ToastPromiseMessages,
  ToastTone,
} from './toast';
export type { ButtonProps, ButtonLinkProps, ButtonSize, IconButtonProps, CopyButtonProps } from './button';
export type {
  StatusTone,
  BadgeProps,
  AvatarProps,
  AvatarSize,
  AvatarGroupProps,
  KbdProps,
  DividerProps,
  CardProps,
  StatProps,
  EmptyStateProps,
  DescriptionItem,
  DescriptionListProps,
  TimelineItem,
  TimelineProps,
} from './display';
export type { ProgressProps, SpinnerProps, SkeletonProps, BannerProps } from './feedback';
export type { TabItem, TabsProps } from './tabs';
export type { PageHeaderProps } from './page-header';
export type { DataTableColumn, DataTableProps, DataTableSort, DataTableSortValue } from './data-table';
export type { CommandItem, CommandPaletteProps } from './command-palette';
export type {
  BarChartProps,
  BarListItem,
  BarListProps,
  CartesianChartProps,
  ChartBaseProps,
  ChartFormat,
  ChartRow,
  ChartSeries,
  ChartValue,
  DonutChartProps,
  DonutDatum,
  GaugeProps,
  LineChartProps,
  SparklineProps,
} from './charts';
export type { AccordionItem, AccordionProps } from './disclosure';
export type { TooltipProps, PopoverProps, MenuItem, MenuSeparator, MenuGroup, MenuEntry, MenuProps } from './overlay';
export type { BreadcrumbItem, BreadcrumbsProps, PaginationProps, StepItem, StepsProps } from './navigation';
export type { Site, SiteLinkProps, SiteLinks, SiteNavLink, SiteFooterColumn, SiteProviderProps } from './templates/site';
export type { SiteLayoutProps } from './templates/site-layout';
export type { AppShellProps, AppNavSection, AppNavItem, AppAccount } from './templates/app-shell';
export type {
  SettingsPageProps,
  SettingsSectionProps,
  SettingsProfile,
  SettingsPassword,
  SettingsTwoFactor,
  SettingsSession,
  SettingsSessions,
  SettingsDeleteAccount,
} from './templates/settings';
export type { MembersPageProps, WorkspaceMember, MemberRole, MemberInvitation, MemberInviteValues } from './templates/members';
export type { BillingPageProps, BillingPlan, BillingStatus, BillingUsage, BillingPaymentMethod, BillingInvoice } from './templates/billing';
export type { OnboardingPageProps, OnboardingStep } from './templates/onboarding';
export type { InviteAcceptPageProps } from './templates/invite';
export type {
  DocumentSection,
  DocumentPageProps,
  FaqItem,
  FaqPageProps,
  PricingPlan,
  PricingComparisonRow,
  PricingPageProps,
  ContactValues,
  ContactPageProps,
  ChangelogTag,
  ChangelogEntry,
  ChangelogPageProps,
} from './templates/public';
export type { AuthLayoutProps, StatusLayoutProps } from './templates/layouts';
export type {
  AuthProvider,
  SignInPageProps,
  SignInValues,
  SignUpPageProps,
  SignUpValues,
  ForgotPasswordPageProps,
  ResetPasswordPageProps,
  TwoFactorPageProps,
  VerifyEmailPageProps,
  SignOutPageProps,
} from './templates/auth';
export type { ErrorPageProps, MaintenancePageProps, MaintenanceUpdate } from './templates/status';
export type { ErrorStatus, TemplateLabels } from './templates/labels';
export type { SubmitResult } from './templates/form';
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
  DateRangePicker: ModalDateRangePicker,
  Calendar: ModalCalendar,
  RangeCalendar: ModalRangeCalendar,
  TimePicker: ModalTimePicker,
  TagInput: ModalTagInput,
  PasswordStrength: ModalPasswordStrength,
  FileDrop: ModalFileDrop,
  Chips: ModalChips,
  Switch: ModalSwitch,
  Table: ModalTable,
  Chart: ModalChart,
  Alert: ModalAlert,
  Handle: ModalHandle,
} as const;
