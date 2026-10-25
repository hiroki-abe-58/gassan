/**
 * 日本語の文言（原本）。ほかの言語は、この形（Messages）を満たすように同じ並びのファイルを持つ。
 * 1 ページ 1 ファイル。キーはページの節の id（Section の id）に揃えると、ページと文言を行き来しやすい。
 */
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

const messages = {
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
  uiCommand,
  uiData,
  uiCharts,
  uiCarousel,
  uiChat,
  uiScroll,
  templates,
  templateDocs,
  templateSamples,
  provider,
  spec,
  verification,
  demos,
};

export default messages;

export type Messages = typeof messages;
