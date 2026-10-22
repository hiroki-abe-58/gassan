/**
 * 한국어 문구. 원본(ja/)과 같은 구성으로, 형태는 Messages로 강제한다.
 */
import type { Messages } from '../ja';
import accessibility from './accessibility';
import body from './body';
import button from './button';
import chart from './chart';
import choice from './choice';
import color from './color';
import common from './common';
import datePicker from './datePicker';
import demos from './demos';
import field from './field';
import fileDrop from './fileDrop';
import footer from './footer';
import gassan from './gassan';
import gate from './gate';
import header from './header';
import home from './home';
import imperative from './imperative';
import toast from './toast';
import uiBadges from './uiBadges';
import uiButtons from './uiButtons';
import uiFeedback from './uiFeedback';
import uiLayout from './uiLayout';
import uiNavigation from './uiNavigation';
import uiOverlays from './uiOverlays';
import kinds from './kinds';
import layers from './layers';
import layout from './layout';
import lineBreak from './lineBreak';
import media from './media';
import motion from './motion';
import nav from './nav';
import notes from './notes';
import provider from './provider';
import purpose from './purpose';
import root from './root';
import rules from './rules';
import scrim from './scrim';
import select from './select';
import sheet from './sheet';
import slider from './slider';
import spec from './spec';
import start from './start';
import textInput from './textInput';
import theme from './theme';
import title from './title';
import verification from './verification';

export default {
  common,
  gassan,
  nav,
  home,
  start,
  purpose,
  layers,
  kinds,
  accessibility,
  rules,
  notes,
  scrim,
  color,
  theme,
  layout,
  lineBreak,
  motion,
  root,
  header,
  title,
  body,
  footer,
  button,
  gate,
  field,
  textInput,
  choice,
  select,
  slider,
  datePicker,
  fileDrop,
  media,
  chart,
  sheet,
  imperative,
  toast,
  uiButtons,
  uiBadges,
  uiFeedback,
  uiLayout,
  uiNavigation,
  uiOverlays,
  provider,
  spec,
  verification,
  demos,
} satisfies Messages;
