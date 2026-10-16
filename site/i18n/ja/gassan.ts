/**
 * gassan が出す文字列（閉じる・読み上げ・ゲートの理由など）。App が GassanProvider に渡す。
 * 日本語と英語はライブラリの既定の文言をそのまま使い、ほかの言語はサイトで訳す。
 */
import { japaneseLabels, type GassanLabels } from '@genelab/gassan';

const labels: GassanLabels = japaneseLabels;

export default labels;
