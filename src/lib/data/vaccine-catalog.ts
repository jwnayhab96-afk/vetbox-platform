export type VaccineCatalogEntry = {
  id: string;
  name: string;
  species: Array<"dog" | "cat">;
  diseases: string;
  boosterGuidance: string;
  note?: string;
  sourceUrl: string;
};

/** Reference list transcribed from the supplied Egypt vaccine workbook. */
export const VACCINE_CATALOG: VaccineCatalogEntry[] = [
  {
    id: "nobivac-puppy-dp", name: "Nobivac Puppy DP", species: ["dog"],
    diseases: "Canine Distemper (الديستمبر)؛ Canine Parvovirus (البارفو)",
    boosterGuidance: "إذا بدأت الجرعة عند 6 أسابيع: جرعة تالية بعد 4 أسابيع (بعمر 10 أسابيع أو أكثر). بعد إكمال البرنامج: كل 3 سنوات حسب نشرة الشركة المصرية.",
    note: "لقاح مبكر للجراء، ولا يغني عن استكمال برنامج اللقاحات الأخرى الذي يحدده الطبيب.",
    sourceUrl: "https://egypt.msd-animal-health.com/products/nobivac-puppy-dp/",
  },
  {
    id: "nobivac-dhppi", name: "Nobivac DHPPI", species: ["dog"],
    diseases: "Canine Distemper؛ Canine Adenovirus (التهاب الكبد المعدي/أمراض تنفسية)؛ Canine Parvovirus؛ Canine Parainfluenza",
    boosterGuidance: "مكونات Distemper/Adenovirus/Parvovirus: كل 3 سنوات؛ مكوّن Parainfluenza: سنويًا. قد تحتاج جرعتين للـ Parainfluenza بفاصل 2–4 أسابيع ضمن السلسلة الأولية.",
    note: "النشرة المصرية توصي بجرعة نهائية بعمر 10 أسابيع أو أكثر؛ الجدول يتأثر بعمر الجرو وباقي التطعيمات المركبة المستخدمة.",
    sourceUrl: "https://egypt.msd-animal-health.com/products/nobivac-dhppi/",
  },
  {
    id: "nobivac-lepto", name: "Nobivac Lepto", species: ["dog"],
    diseases: "Leptospirosis (الليبتوسبيرا؛ L. canicola وL. icterohaemorrhagiae)",
    boosterGuidance: "بعد الجرعتين الأوليتين: تنشيطي سنويًا.",
    note: "حسب صفحة الشركة في مصر: أول جرعة عند 8–9 أسابيع، ثم جرعة عند 12 أسبوعًا، وبعدها سنويًا.",
    sourceUrl: "https://egypt.msd-animal-health.com/products/nobivac-lepto/",
  },
  {
    id: "nobivac-rabies", name: "Nobivac Rabies", species: ["dog", "cat"],
    diseases: "Rabies (السعار)",
    boosterGuidance: "صفحة الشركة في مصر تذكر حماية لمدة لا تقل عن 3 سنوات بعد جرعة عند عمر 12 أسبوعًا؛ تُراعى أي متطلبات محلية أو قانونية أقصر.",
    note: "إذا أُعطي لأول مرة قبل عمر 12 أسبوعًا، تذكر النشرة إعادة الجرعة عند عمر 12 أسبوعًا أو أكثر.",
    sourceUrl: "https://egypt.msd-animal-health.com/products/nobivac-rabies/",
  },
  {
    id: "biocan-dhppi-l", name: "Biocan DHPPi + L", species: ["dog"],
    diseases: "Distemper؛ التهاب الكبد/عدوى Adenovirus؛ Parvovirus؛ Parainfluenza؛ Leptospirosis",
    boosterGuidance: "الصفحة التجارية المصرية تذكر جرعات بفاصل 14–21 يومًا حتى عمر 16 أسبوعًا، ثم تنشيطي كل 12 شهرًا.",
    note: "المعلومة مأخوذة من صفحة مورد تجاري؛ تحقق من النشرة الأصلية للعبوة ومن التوافر الحالي قبل الاعتماد عليها.",
    sourceUrl: "https://www.animalhealthegypt.com/shop/biocan-dhppi-l-1-1-dose-746",
  },
  {
    id: "rabisin", name: "Rabisin", species: ["dog", "cat"],
    diseases: "Rabies (السعار)",
    boosterGuidance: "أول تنشيطي بعد سنة من الجرعة الأساسية؛ ثم قد تصل الفترة إلى 3 سنوات وفق نشرة أوروبية معتمدة. يوجد مصدر بيع مصري يذكر التنشيط سنويًا؛ اتبع نشرة العبوة المسجلة في مصر والمتطلبات المحلية.",
    note: "تختلف فترة التنشيط حسب النشرة المحلية والمتطلبات؛ راجع نشرة العبوة المسجلة في مصر.",
    sourceUrl: "https://www.vmd.defra.gov.uk/productinformationdatabase/files/SPC_Documents/SPC_3067997.PDF",
  },
  {
    id: "feline-fvrcp", name: "التطعيم الثلاثي للقطط (FVRCP — حسب الشركة)", species: ["cat"],
    diseases: "Feline Panleukopenia؛ Feline Herpesvirus-1 (التهاب الأنف والقصبة الهوائية)؛ Feline Calicivirus",
    boosterGuidance: "للصغار: جرعات كل 3–4 أسابيع حتى عمر 16 أسبوعًا أو أكثر؛ توصي WSAVA بجرعة لاحقة عند نحو 6 أشهر. بعدها غالبًا كل 3 سنوات للقطط منخفضة المخاطر؛ وقد يلزم تنشيط سنوي لبعض القطط عالية المخاطر.",
    note: "الجدول يختلف حسب المنتج ودرجة تعرض القطة للخطر.",
    sourceUrl: "https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf",
  },
  {
    id: "biofel-pch", name: "Biofel PCH", species: ["cat"],
    diseases: "Feline Panleukopenia؛ Feline Calicivirus؛ Feline Herpesvirus",
    boosterGuidance: "جرعة ثانية بعد 3–4 أسابيع من الأولى، ثم تنشيطي كل 12 شهرًا حسب الشركة المصنعة.",
    note: "تبدأ الجرعات عادةً بعمر 8–10 أسابيع؛ قد تلزم جرعة قرب عمر 16 أسبوعًا بسبب الأجسام المضادة الأمومية.",
    sourceUrl: "https://www.bioveta.eu/products/veterinary-products/biofel-pch-emulsion-for-injection.html",
  },
  {
    id: "felocell-3", name: "Felocell 3 RCP", species: ["cat"],
    diseases: "Feline Herpesvirus-1؛ Feline Calicivirus؛ Feline Panleukopenia",
    boosterGuidance: "جرعتان أوليتان بفاصل 3–4 أسابيع، وآخر جرعة عند عمر 16 أسبوعًا أو أكثر. لم تثبت نشرة المنتج الحاجة إلى تنشيط سنوي تلقائي؛ استخدم تقييم الطبيب وإرشادات WSAVA.",
    note: "الملصق المتاح لا يحدد مدة المناعة؛ يختلف التنشيط حسب درجة خطورة تعرض القطة.",
    sourceUrl: "https://www.zoetisus.com/content/_assets/docs/vmips/package-inserts/felocell_3.pdf",
  },
  {
    id: "felocell-4", name: "Felocell 4 RCP+Ch", species: ["cat"],
    diseases: "Feline Herpesvirus-1؛ Feline Calicivirus؛ Feline Panleukopenia؛ Chlamydia psittaci",
    boosterGuidance: "المصدر المتاح يؤكد جرعتين أوليتين بفاصل يقارب 3 أسابيع، لكنه لا يثبت فترة تنشيط موحدة من النشرة المحلية؛ راجع النشرة المسجلة المرفقة بالعبوة.",
    note: "المصدر المتاح لا يؤكد التوافر الحالي أو مطابقة النشرة المصرية.",
    sourceUrl: "https://www.aphis.usda.gov/aphis/ourfocus/animalhealth/veterinary-biologics/product-summaries/f26b2090-ee17-41f9-8fa9-0899be8373b2",
  },
  {
    id: "felv", name: "لقاح Feline Leukemia (FeLV — حسب الشركة)", species: ["cat"],
    diseases: "Feline Leukemia Virus (فيروس لوكيميا القطط)",
    boosterGuidance: "جرعتان أوليتان بفاصل 3–4 أسابيع؛ تنشيطي بعد سنة. بعد ذلك سنويًا للقطط المستمرة في التعرض للخطر، أو حسب نشرة المنتج للقطط منخفضة الخطورة.",
    note: "يوصى باختبار FeLV قبل التطعيم؛ الاحتياج يعتمد على العمر واحتمال الاختلاط بقطط مصابة أو الخروج إلى الشارع.",
    sourceUrl: "https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf",
  },
  {
    id: "bordetella", name: "لقاح Kennel Cough / Bordetella — حسب المنتج", species: ["dog"],
    diseases: "Bordetella bronchiseptica؛ وقد يحتوي المنتج على Canine Parainfluenza أيضًا",
    boosterGuidance: "غالبًا تنشيطي سنويًا للكلاب المعرضة للاختلاط؛ الجرعات الأولية تختلف حسب طريقة الإعطاء والمنتج.",
    note: "لقاح غير أساسي لكل الكلاب؛ يحدد الطبيب الحاجة إليه حسب الإيواء أو الاختلاط المتكرر بكلاب أخرى.",
    sourceUrl: "https://www.aaha.org/resources/2022-aaHA-canine-vaccination-guidelines/",
  },
];
