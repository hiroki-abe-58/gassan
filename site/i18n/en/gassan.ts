/**
 * Strings that gassan itself renders (close, announcements, gate reasons, ...). English uses the library's bundled labels.
 */
import { englishLabels, japaneseHolidayNames, japaneseHolidayResolver, type GassanLabels } from '@genelab/gassan';

// The bundled English labels show no holidays. The docs demo Japan's public holidays, so they are switched on here.
const labels: GassanLabels = { ...englishLabels, holidays: japaneseHolidayResolver(japaneseHolidayNames.en) };

export default labels;
