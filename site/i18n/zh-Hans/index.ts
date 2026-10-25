/**
 * 简体中文的文字。形状（Messages）与原本 ja/ 相同，键缺失或多余会在类型检查中报错。
 */
import type { Messages } from '../ja';
import accessibility from './accessibility';
import authPatterns from './authPatterns';
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
import uiCarousel from './uiCarousel';
import uiChat from './uiChat';
import uiScroll from './uiScroll';
import uiCharts from './uiCharts';
import uiCommand from './uiCommand';
import uiData from './uiData';
import uiFeedback from './uiFeedback';
import uiLayout from './uiLayout';
import uiNavigation from './uiNavigation';
import uiOverlays from './uiOverlays';
import japaneseInput from './japaneseInput';
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
import templateDocs from './templateDocs';
import templateSamples from './templateSamples';
import templates from './templates';
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
  japaneseInput,
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
  uiCommand,
  uiData,
  uiCharts,
  uiCarousel,
  uiChat,
  uiScroll,
  templates,
  templateDocs,
  templateSamples,
  authPatterns,
  provider,
  spec,
  verification,
  demos,
} satisfies Messages;
