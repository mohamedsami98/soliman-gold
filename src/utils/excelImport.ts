import * as XLSX from 'xlsx';

export interface ParsedJewelryItem {
  code: string;
  name: string;
  category: string;
  categoryName: string;
  karat: number;
  weight: number;
  description?: string;
  seoTitle?: string;
  price: number;
  status: 'valid' | 'warning' | 'invalid';
  validationMessage?: string;
  isExisting?: boolean;
}

// Clean and normalize Arabic text for header comparison
export function normalizeArabicHeader(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel / accents
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[_\-\/\\]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Category mapping helper for the 10 store categories
export function mapCategory(arabicName: string): { slug: string; name: string } {
  const norm = normalizeArabicHeader(arabicName);

  // 1. سبايك
  if (norm.includes('سبيك') || norm.includes('سبائك') || norm.includes('سبايك') || norm.includes('جنيه') || norm.includes('اونص') || norm.includes('استثمار') || norm.includes('bullion')) {
    return { slug: 'bullion', name: 'سبايك' };
  }
  // 2. توينزات (must check before rings)
  if (norm.includes('توينز') || norm.includes('توين') || norm.includes('twin')) {
    return { slug: 'twin-rings', name: 'توينزات' };
  }
  // 3. دبل (must check before rings)
  if (norm.includes('دبل') || norm.includes('دبله') || norm.includes('محبس') || norm.includes('wedding')) {
    return { slug: 'wedding-bands', name: 'دبل' };
  }
  // 4. خواتم
  if (norm.includes('خاتم') || norm.includes('خواتم') || norm.includes('سوليتير') || norm.includes('ring')) {
    return { slug: 'rings', name: 'خواتم' };
  }
  // 5. حلقان
  if (norm.includes('حلق') || norm.includes('حلقان') || norm.includes('قرط') || norm.includes('earring')) {
    return { slug: 'earrings', name: 'حلقان' };
  }
  // 6. انسيال (must check before bangles)
  if (norm.includes('انسيال') || norm.includes('انسيالات') || norm.includes('تنس') || norm.includes('bracelet')) {
    return { slug: 'bracelets', name: 'انسيال' };
  }
  // 7. اساور
  if (norm.includes('اساور') || norm.includes('اسوار') || norm.includes('اسوره') || norm.includes('غوايش') || norm.includes('غويش') || norm.includes('بناجر') || norm.includes('bangle')) {
    return { slug: 'bangles', name: 'اساور' };
  }
  // 8. تعاليق
  if (norm.includes('تعليق') || norm.includes('تعاليق') || norm.includes('دلاي') || norm.includes('دلايه') || norm.includes('ماشه') || norm.includes('pendant')) {
    return { slug: 'pendants', name: 'تعاليق' };
  }
  // 9. عقد
  if (norm.includes('عقد') || norm.includes('اعقاد') || norm.includes('كوليه') || norm.includes('شوكر') || norm.includes('طقم') || norm.includes('اطقم') || norm.includes('شبك') || norm.includes('collar')) {
    return { slug: 'collars', name: 'عقد' };
  }
  // 10. سلاسل
  if (norm.includes('سلاسل') || norm.includes('سلسله') || norm.includes('جنزير') || norm.includes('حبل') || norm.includes('necklace') || norm.includes('chain')) {
    return { slug: 'necklaces', name: 'سلاسل' };
  }

  return { slug: 'rings', name: arabicName.trim() || 'خواتم' };
}

// Parse karat to numeric 18, 21, or 24
export function parseKarat(val: any): number {
  if (typeof val === 'number') {
    if (val === 18 || val === 21 || val === 24) return val;
    if (val >= 22) return 24;
    if (val >= 20) return 21;
    return 18;
  }
  const str = String(val || '');
  if (str.includes('24')) return 24;
  if (str.includes('21')) return 21;
  if (str.includes('18')) return 18;
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num === 24 || num === 21 || num === 18) return num;
    if (num >= 22) return 24;
    if (num >= 20) return 21;
    return 18;
  }
  return 21; // Default karat in Egypt
}

// Parse weight in grams (e.g., 5.4, "5.45 جم", "10,2")
export function parseWeight(val: any): number {
  if (typeof val === 'number') return Math.round(val * 100) / 100;
  const str = String(val || '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

// Parse price in EGP (e.g., 35000, "35,000 ج.م")
export function parsePrice(val: any): number {
  if (typeof val === 'number') return Math.round(val);
  const str = String(val || '')
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Identify column indexes from sheet headers based on the user's 8 specific columns:
 * 1. كود المنتج
 * 2. اسم المنتج (SEO)
 * 3. التصنيف
 * 4. العيار
 * 5. الوزن الظاهر (جرام)
 * 6. وصف مختصر
 * 7. عنوان SEO
 * 8. السعر (جنيه)
 */
export function identifyColumns(headerRow: any[]): {
  codeIdx: number;
  nameIdx: number;
  categoryIdx: number;
  karatIdx: number;
  weightIdx: number;
  descriptionIdx: number;
  seoTitleIdx: number;
  priceIdx: number;
} {
  let codeIdx = -1;
  let nameIdx = -1;
  let categoryIdx = -1;
  let karatIdx = -1;
  let weightIdx = -1;
  let descriptionIdx = -1;
  let seoTitleIdx = -1;
  let priceIdx = -1;

  headerRow.forEach((col, idx) => {
    const h = normalizeArabicHeader(col);
    if (!h) return;

    // 1. كود المنتج
    if (codeIdx === -1 && (h.includes('كود المنتج') || h.includes('كود القطع') || h.includes('كود') || h.includes('code') || h.includes('رمز'))) {
      codeIdx = idx;
    }
    // 7. عنوان SEO (checked early to avoid conflict with "اسم المنتج (SEO)")
    else if (seoTitleIdx === -1 && (h.includes('عنوان seo') || h.includes('عنوان سيو') || h.includes('عنوان السيو') || h.includes('seo title') || (h.includes('عنوان') && (h.includes('seo') || h.includes('سيو'))))) {
      seoTitleIdx = idx;
    }
    // 2. اسم المنتج (SEO)
    else if (nameIdx === -1 && (h.includes('اسم المنتج') || h.includes('اسم الصنف') || h.includes('اسم القطع') || h.includes('صنف') || h.includes('item name') || (h.includes('اسم') && !h.includes('مجموعه')))) {
      nameIdx = idx;
    }
    // 3. التصنيف
    else if (categoryIdx === -1 && (h.includes('تصنيف') || h.includes('مجموعه رئيسي') || h.includes('مجموعه') || h.includes('قسم') || h.includes('category'))) {
      categoryIdx = idx;
    }
    // 4. العيار
    else if (karatIdx === -1 && (h.includes('عيار') || h.includes('karat'))) {
      karatIdx = idx;
    }
    // 5. الوزن الظاهر (جرام)
    else if (weightIdx === -1 && (h.includes('الوزن الظاهر') || h.includes('وزن') || h.includes('weight') || h.includes('جرام'))) {
      weightIdx = idx;
    }
    // 6. وصف مختصر
    else if (descriptionIdx === -1 && (h.includes('وصف مختصر') || h.includes('الوصف المختصر') || h.includes('وصف') || h.includes('الوصف') || h.includes('description') || h.includes('مواصفات'))) {
      descriptionIdx = idx;
    }
    // 8. السعر (جنيه)
    else if (priceIdx === -1 && (h.includes('سعر') || h.includes('السعر (جنيه)') || h.includes('price') || h.includes('قيمه'))) {
      priceIdx = idx;
    }
  });

  // Fallback defaults if exact match was not found but table has columns
  if (codeIdx === -1 && headerRow.length >= 1) codeIdx = 0;
  if (nameIdx === -1 && headerRow.length >= 2) nameIdx = 1;
  if (categoryIdx === -1 && headerRow.length >= 3) categoryIdx = 2;
  if (karatIdx === -1 && headerRow.length >= 4) karatIdx = 3;
  if (weightIdx === -1 && headerRow.length >= 5) weightIdx = 4;
  if (descriptionIdx === -1 && headerRow.length >= 6) descriptionIdx = 5;
  if (seoTitleIdx === -1 && headerRow.length >= 7) seoTitleIdx = 6;
  if (priceIdx === -1 && headerRow.length >= 8) priceIdx = 7;

  return { codeIdx, nameIdx, categoryIdx, karatIdx, weightIdx, descriptionIdx, seoTitleIdx, priceIdx };
}

/**
 * Parses raw Excel workbook buffer or CSV content into validated jewelry items
 */
export function parseExcelData(dataBuffer: ArrayBuffer, existingCodes: Set<string> = new Set()): ParsedJewelryItem[] {
  const workbook = XLSX.read(dataBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert sheet to array of arrays (rows)
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rows.length < 2) {
    throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات بعد رأس الجدول.');
  }

  // Find header row (first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i];
    if (row && row.some((cell) => cell && String(cell).trim().length > 0)) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = rows[headerRowIndex];
  const { codeIdx, nameIdx, categoryIdx, karatIdx, weightIdx, descriptionIdx, seoTitleIdx, priceIdx } = identifyColumns(headerRow);

  const parsedItems: ParsedJewelryItem[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every((c) => c === null || c === undefined || String(c).trim() === '')) {
      continue; // skip empty rows
    }

    const rawCode = codeIdx !== -1 ? row[codeIdx] : '';
    const rawName = nameIdx !== -1 ? row[nameIdx] : '';
    const rawCategory = categoryIdx !== -1 ? row[categoryIdx] : '';
    const rawKarat = karatIdx !== -1 ? row[karatIdx] : '';
    const rawWeight = weightIdx !== -1 ? row[weightIdx] : '';
    const rawDescription = descriptionIdx !== -1 ? row[descriptionIdx] : '';
    const rawSeoTitle = seoTitleIdx !== -1 ? row[seoTitleIdx] : '';
    const rawPrice = priceIdx !== -1 ? row[priceIdx] : '';

    const code = rawCode ? String(rawCode).trim().toUpperCase() : '';
    const name = rawName ? String(rawName).trim() : '';
    const categoryInfo = mapCategory(String(rawCategory || name || ''));
    const karat = parseKarat(rawKarat);
    const weight = parseWeight(rawWeight);
    const description = rawDescription ? String(rawDescription).trim() : '';
    const seoTitle = rawSeoTitle ? String(rawSeoTitle).trim() : '';
    const price = parsePrice(rawPrice);

    let status: 'valid' | 'warning' | 'invalid' = 'valid';
    let validationMessage = '';

    if (!code && !name) {
      continue; // completely invalid empty row
    }

    if (!code) {
      status = 'invalid';
      validationMessage = 'كود المنتج مفقود';
    } else if (!name) {
      status = 'warning';
      validationMessage = 'اسم المنتج غير محدد (سيتم استخدام تصنيف القطعة)';
    }

    const isExisting = existingCodes.has(code);

    parsedItems.push({
      code: code || `AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || `${categoryInfo.name} عيار ${karat}`,
      category: categoryInfo.slug,
      categoryName: categoryInfo.name,
      karat,
      weight,
      description: description || `صياغة ذهبية فاخرة عيار ${karat} مدموغة رسميًا.`,
      seoTitle: seoTitle || (name ? `${name} | عيار ${karat} | سليمان جولد` : ''),
      price,
      status,
      validationMessage,
      isExisting,
    });
  }

  return parsedItems;
}

/**
 * Generates and triggers download of a standardized sample Excel file with the exact 8 Arabic columns:
 * كود المنتج | اسم المنتج (SEO) | التصنيف | العيار | الوزن الظاهر (جرام) | وصف مختصر | عنوان SEO | السعر (جنيه)
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      'كود المنتج': 'BAR-1001',
      'اسم المنتج (SEO)': 'سبيكة ذهب عيار 24 وزن 10 جرام مغلفة بي تي سي',
      'التصنيف': 'سبايك',
      'العيار': 24,
      'الوزن الظاهر (جرام)': 10.0,
      'وصف مختصر': 'سبيكة ذهب استثمارية نقية 999.9 معتمدة مع باركود الأمان وغلاف أصلي محكم وشهادة الفحص الدولي.',
      'عنوان SEO': 'سبيكة ذهب 10 جرام عيار 24 بي تي سي بأفضل سعر مصنعية | سليمان جولد',
      'السعر (جنيه)': 44500,
    },
    {
      'كود المنتج': 'RNG-1002',
      'اسم المنتج (SEO)': 'خاتم سوليتير ملكي فخم مرصع بزيركون سويسري عيار 18',
      'التصنيف': 'خواتم',
      'العيار': 18,
      'الوزن الظاهر (جرام)': 4.8,
      'وصف مختصر': 'خاتم سوليتير ذهب أصفر عيار 18 بحجر مركزي براق عالي النقاوة محاط بهالة ملكية مضيئة.',
      'عنوان SEO': 'خاتم سوليتير ذهب عيار 18 تصميم إيطالي فخم للعرائس | سليمان جولد',
      'السعر (جنيه)': 22500,
    },
    {
      'كود المنتج': 'BND-1003',
      'اسم المنتج (SEO)': 'دبلة زفاف ليزر إيطالي صب مريحة عيار 21',
      'التصنيف': 'دبل',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 5.2,
      'وصف مختصر': 'دبلة زواج عيار 21 بتشطيب إيطالي مريح Comfort Fit بحواف انسيابية ونقش ليزري كلاسيكي.',
      'عنوان SEO': 'دبلة خطوبة وزواج ذهب عيار 21 إيطالي كلاسيك | سليمان جولد',
      'السعر (جنيه)': 21000,
    },
    {
      'كود المنتج': 'EAR-1004',
      'اسم المنتج (SEO)': 'حلق ذهب هلالي مفرغ عيار 21 بنقش بارز',
      'التصنيف': 'حلقان',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 6.5,
      'وصف مختصر': 'زوج حلقان هلالي عيار 21 بنقش ليزري بارز ومفرغ بخرزات متحركة تمنحك إطلالة شرقية ساحرة.',
      'عنوان SEO': 'حلقان ذهب عيار 21 تصميم هلالي مصري أصيل | سليمان جولد',
      'السعر (جنيه)': 26800,
    },
    {
      'كود المنتج': 'BGL-1005',
      'اسم المنتج (SEO)': 'غوايش صب كليوباترا نقش بارز ليزر عيار 21',
      'التصنيف': 'اساور',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 18.5,
      'وصف مختصر': 'غوايش ذهب صب متينة عيار 21 بنقش كليوباترا ثلاثي الأبعاد لا يبهت مع لمعان مرآتي فاخر.',
      'عنوان SEO': 'غوايش ذهب عيار 21 كليوباترا صب فاخرة | متجر سليمان جولد',
      'السعر (جنيه)': 75000,
    },
    {
      'كود المنتج': 'TWN-1006',
      'اسم المنتج (SEO)': 'توينز عرايس مزدوج عيار 18 مرصع بأحجار سويسرية',
      'التصنيف': 'توينزات',
      'العيار': 18,
      'الوزن الظاهر (جرام)': 7.1,
      'وصف مختصر': 'طقم خاتمين توينز متداخلين من الذهب عيار 18 مرصعين بصفين من الأحجار السويسرية عالية البريق.',
      'عنوان SEO': 'توينز شبكة عرايس ذهب عيار 18 فخم ألماس ستايل | سليمان جولد',
      'السعر (جنيه)': 31200,
    },
    {
      'كود المنتج': 'PND-1007',
      'اسم المنتج (SEO)': 'تعليقة ودلاية آية الكرسي عيار 21 بإطار مزخرف',
      'التصنيف': 'تعاليق',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 8.2,
      'وصف مختصر': 'تعليقة دائرية بارزة محفور عليها آية الكرسي بخط عربي أصيل ومحاطة بإطار مضفور عيار 21.',
      'عنوان SEO': 'دلاية ذهب آية الكرسي عيار 21 صياغة يدوية فاخرة | سليمان جولد',
      'السعر (جنيه)': 33500,
    },
    {
      'كود المنتج': 'BRC-1008',
      'اسم المنتج (SEO)': 'انسيال ذهب موديل كارتييه ليزر عيار 18',
      'التصنيف': 'انسيال',
      'العيار': 18,
      'الوزن الظاهر (جرام)': 11.3,
      'وصف مختصر': 'انسيال ذهب عيار 18 بتصميم حلقات كارتييه الأيقونية مع قفل أمان محكم وبريق لا يتغير.',
      'عنوان SEO': 'انسيال ذهب عيار 18 تصميم كارتييه عصري راقي | سليمان جولد',
      'السعر (جنيه)': 42000,
    },
    {
      'كود المنتج': 'COL-1009',
      'اسم المنتج (SEO)': 'عقد كوليه ملكي عيار 21 شلالي للمناسبات والشبكات',
      'التصنيف': 'عقد',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 35.0,
      'وصف مختصر': 'عقد شبكة ملكي عيار 21 بتفاصيل الشلال الذهبي المتدلي يمنح العنق فخامة استثنائية.',
      'عنوان SEO': 'عقد كوليه ذهب عيار 21 شبكة عروس ملكية | سليمان جولد قلين',
      'السعر (جنيه)': 142000,
    },
    {
      'كود المنتج': 'NCK-1010',
      'اسم المنتج (SEO)': 'سلسلة حبل إيطالي انسيابية بريق الألماس عيار 21',
      'التصنيف': 'سلاسل',
      'العيار': 21,
      'الوزن الظاهر (جرام)': 14.8,
      'وصف مختصر': 'سلسلة حبل مجدولة عيار 21 بتقنية القص الماسي الإيطالية المرنة بطول مثالي 50 سم.',
      'عنوان SEO': 'سلسلة ذهب حبل إيطالي عيار 21 مبرومة فخمة | سليمان جولد',
      'السعر (جنيه)': 61000,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for comfortable viewing in Microsoft Excel
  worksheet['!cols'] = [
    { wch: 16 }, // كود المنتج
    { wch: 45 }, // اسم المنتج (SEO)
    { wch: 16 }, // التصنيف
    { wch: 10 }, // العيار
    { wch: 18 }, // الوزن الظاهر (جرام)
    { wch: 60 }, // وصف مختصر
    { wch: 55 }, // عنوان SEO
    { wch: 18 }, // السعر (جنيه)
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'أصناف سليمان جولد');

  // Trigger download
  XLSX.writeFile(workbook, 'شيت_أصناف_سليمان_جولد_8_أعمدة.xlsx');
}
