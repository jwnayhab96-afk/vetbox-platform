-- VetBox Seed Data (Realistic Egyptian Demo Data for Development & Staging)

-- 1. PROFILES
-- IDs correspond to fictional UUIDs for testing
INSERT INTO public.profiles (id, role, full_name, phone, governorate, city) VALUES
('11111111-1111-1111-1111-111111111111', 'owner', 'أحمد محمود القاضي', '01012345678', 'Cairo', 'Maadi'),
('22222222-2222-2222-2222-222222222222', 'owner', 'سارة عبد الرحمن', '01198765432', 'Giza', 'Dokki'),
('33333333-3333-3333-3333-333333333333', 'veterinarian', 'د. يوسف الشناوي', '01234567890', 'Cairo', 'New Cairo'),
('44444444-4444-4444-4444-444444444444', 'veterinarian', 'د. مريم النجار', '01055554433', 'Giza', 'Sheikh Zayed'),
('55555555-5555-5555-5555-555555555555', 'admin', 'إدارة منصة فيت بوكس', '01000000001', 'Cairo', 'Nasr City')
ON CONFLICT (id) DO NOTHING;

-- 2. VETERINARIAN PROFILES
INSERT INTO public.veterinarian_profiles (id, license_number, years_of_experience, specializations, education, bio, verification_status, consultation_fee, emergency_available, clinic_affiliation_name) VALUES
('33333333-3333-3333-3333-333333333333', 'EGY-VET-48920', 12, '{"small_animals", "surgery", "orthopedics"}', 'بكالوريوس طب بيطري - جامعة القاهرة، ماجستير جراحة الحيوانات الصغيرة', 'طبيب بيطري استشاري متخصص في جراحة العظام والأنسجة الرخوة للحيوانات الأليفة، عضو الجمعية المصرية لطب وجراحة الحيوانات الصغيرة.', 'verified', 350.00, true, 'مستشفى النيل البيطري التخصصي'),
('44444444-4444-4444-4444-444444444444', 'EGY-VET-51204', 8, '{"feline_medicine", "dermatology", "preventive_care"}', 'بكالوريوس طب وجراحة بيطرية - جامعة عين شمس، دبلوم الأمراض الجلدية', 'أخصائية طب وجراحة القطط والأمراض الجلدية والحساسية، مع اهتمام خاص بالرعاية الوقائية والتغذية العلاجية.', 'verified', 280.00, false, 'عيادة واحة الأليف البيطرية')
ON CONFLICT (id) DO NOTHING;

-- 3. CLINICS
INSERT INTO public.clinics (id, name, name_ar, clinic_type, phone, emergency_phone, email, address, governorate, city, latitude, longitude, services, species_treated, is_emergency_247, is_verified, cover_image_url) VALUES
('a0000000-0000-0000-0000-000000000001', 'Nile Veterinary Specialty Hospital', 'مستشفى النيل البيطري التخصصي', 'hospital', '0227508900', '01234567890', 'contact@nilevethospital.eg', 'شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة', 'Cairo', 'New Cairo', 30.0254, 31.4721, '{"surgery", "radiography", "ultrasound", "intensive_care", "laboratory", "inpatient", "vaccination"}', '{"dogs", "cats", "birds", "small_mammals"}', true, true, 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80'),
('a0000000-0000-0000-0000-000000000002', 'Pet Oasis Veterinary Clinic', 'عيادة واحة الأليف البيطرية', 'clinic', '0238514230', '01055554433', 'info@petoasisegypt.com', 'ميدان الحصري، المحور المركزي، الشيخ زايد، الجيزة', 'Giza', 'Sheikh Zayed', 30.0521, 30.9852, '{"examination", "vaccination", "dentistry", "grooming", "dermatology"}', '{"dogs", "cats", "rabbits"}', false, true, 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80'),
('a0000000-0000-0000-0000-000000000003', 'Maadi Vet Center', 'مركز المعادي للرعاية البيطرية', 'clinic', '0223589120', '01122334455', 'maadivet@gmail.com', 'شارع 9، دجلة، المعادي، القاهرة', 'Cairo', 'Maadi', 29.9602, 31.2825, '{"examination", "laboratory", "vaccination", "microchipping", "travel_certificates"}', '{"dogs", "cats", "birds"}', false, true, 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&w=1200&q=80'),
('a0000000-0000-0000-0000-000000000004', 'Alexandria Equine & Livestock Clinic', 'عيادة الإسكندرية للخيول والماشية', 'center', '034298100', '01088776655', 'alex.equine@gmail.com', 'طريق برج العرب، كينج مريوط، الإسكندرية', 'Alexandria', 'Borg El Arab', 31.0125, 29.7423, '{"equine_medicine", "herd_health", "reproduction", "mobile_unit", "surgery"}', '{"horses", "cattle", "sheep", "goats"}', true, true, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (id) DO NOTHING;

-- 4. CLINIC MEMBERSHIPS
INSERT INTO public.clinic_memberships (clinic_id, vet_id, role) VALUES
('a0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'رئيس قسم الجراحة والعظام'),
('a0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'المدير الطبي واستشاري طب القطط')
ON CONFLICT (clinic_id, vet_id) DO NOTHING;

-- 5. PETS (Multi-species)
INSERT INTO public.pets (id, owner_id, name, species, breed, gender, birth_date, is_age_estimated, weight_kg, color, microchip_number, identifying_marks, photo_url, species_attributes) VALUES
('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'روكي (Rocky)', 'dog', 'جيرمن شيبرد (German Shepherd)', 'male', '2022-04-15', false, 32.5, 'أسود مع تان (Black & Tan)', '900182001928374', 'علامة بيضاء صغيرة في الصدر', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80', '{"activity_level": "عالي", "diet": "دراي فود عالي البروتين"}'::jsonb),
('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'لونا (Luna)', 'cat', 'شيرازي رومي (Persian Mix)', 'female', '2023-08-10', false, 3.8, 'أبيض ناصع مع عيون عسلية', '900182001928555', 'شعر طويل كثيف', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', '{"indoor_only": true, "hairball_care": true}'::jsonb),
('b0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'زعفرانة (Zaafarana)', 'horse', 'خيول عربية أصيلة (Arabian)', 'female', '2019-02-20', false, 430.0, 'رمادي كستنائي (Chestnut)', 'EGY-EAU-2019-041', 'غرة بيضاء في الجبين وثلاث قوائم بيضاء', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80', '{"studbook_id": "EGY-WAHO-8841", "discipline": "قفز حواجز وترويض"}'::jsonb),
('b0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'تويتي (Tweety)', 'bird', 'كوكتيل (Cockatiel)', 'male', NULL, true, 0.09, 'رمادي مع خدود برتقالية وتاج أصفر', NULL, 'حلقة في الساق اليمنى رقم EG-22', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80', '{"cage_type": "قفص طيران واسع", "vocalization": "تغريد مستمر وصفير"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. PET-VET LINKS
INSERT INTO public.pet_vet_links (pet_id, vet_id, status, permission_scope, requested_by, notes) VALUES
('b0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'accepted', 'full_clinical_access', '11111111-1111-1111-1111-111111111111', 'الطبيب المعالج الأساسي لمتابعة العظام والتطعيمات الدورية.'),
('b0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'accepted', 'full_clinical_access', '11111111-1111-1111-1111-111111111111', 'المتابعة الدورية والفحص السنوي.')
ON CONFLICT (pet_id, vet_id) DO NOTHING;

-- 7. MEDICAL VISITS
INSERT INTO public.medical_visits (
    id, pet_id, vet_id, clinic_id, created_by, author_role, visit_date, visit_type,
    visit_reason, presenting_complaints, clinical_examination, diagnosis,
    treatment_plan, temperature_celsius, heart_rate_bpm, is_verified_diagnosis, next_appointment_date, follow_up_recommendations, status
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'a0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'veterinarian',
    now() - interval '14 days',
    'routine_checkup',
    'فحص دوري شامل وإعطاء الجرعة التنشيطية للتطعيم السنوي',
    'الكلب بصحة ونشاط ممتاز، لا توجد شكوى من الجهاز الهضمي أو التنفسي.',
    'الأغشية المخاطية وردية رطبة، نبضات القلب منتظمة وخالية من النفخات، تنفس هادئ وطبيعي، المفاصل سليمة بدون ألم عند التحريك، العقد الليمفاوية طبيعية.',
    'حالة صحية ممتازة مع وزن مثالي لسلالة الجيرمن شيبرد.',
    'إعطاء تطعيم السعار والتطعيم الثماني، وصف أقراص وقاية دورية ضد الديدان وحشرات القراد والبراغيث.',
    38.6, 92, true, (CURRENT_DATE + interval '6 months'),
    'إعادة الفحص ومتابعة الوزن بعد 6 أشهر، أو عند ملاحظة أي تغير في النشاط أو الشهية.',
    'finalized'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'a0000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'veterinarian',
    now() - interval '45 days',
    'emergency',
    'حكة جلدية شديدة وتساقط شعر في منطقة الرقبة وأعلى الظهر',
    'لاحظ المربي هرشاً مستمراً لمدة 3 أيام مع ظهور احمرار موضعي.',
    'وجود بقع حمراء مع قشور خفيفة خلف الأذنين وأعلى العنق، لا توجد علامات لطفيليات مرئية، فحص الفلورسنت خالي من الفطريات الجلدية الشائعة.',
    'التهاب جلدي تحسسي نتيجة لدغ البراغيث (Flea Allergy Dermatitis).',
    'استخدام أمبولات حماية موضعية، مع لوشن مهدئ للجلد لمدة 5 أيام، ونظام غذائي هيبوالرجينيك.',
    38.8, 140, true, NULL,
    'استكمال دورة العلاج الموضعي وتنظيف المفروشات في المنزل جيداً لمنع إعادة العدوى.',
    'finalized'
)
ON CONFLICT (id) DO NOTHING;

-- 8. VACCINATION RECORDS
INSERT INTO public.vaccination_records (
    id, pet_id, visit_id, administered_by_vet_id, created_by,
    vaccine_name, target_diseases, administration_date, next_due_date,
    batch_number, manufacturer, is_verified_by_vet, notes
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Nobivac Rabies',
    'السعار (Rabies)',
    CURRENT_DATE - interval '14 days',
    CURRENT_DATE + interval '351 days',
    'B89201A',
    'MSD Animal Health',
    true,
    'تم الحقن تحت الجلد في الكتف الأيسر بدون أي تفاعلات تحسسية فورية.'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Nobivac DHPPi + L4',
    'البارفو، الديستمبر، التهاب الكبد الوبائي، الليبتوسبيرا (8-way)',
    CURRENT_DATE - interval '14 days',
    CURRENT_DATE + interval '351 days',
    'V10499C',
    'MSD Animal Health',
    true,
    'الجرعة السنوية المنشطة.'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Purevax RCP FeLV',
    'طاعون القطط (Panleukopenia)، الكاليسي، الهربس، سرطان الدم السنوري',
    CURRENT_DATE - interval '45 days',
    CURRENT_DATE + interval '320 days',
    'FR-88912',
    'Boehringer Ingelheim',
    true,
    'تطعيم رباعي سنوي بدون مادة مساعدة لتقليل خطر الورم الليفي.'
)
ON CONFLICT (id) DO NOTHING;

-- 9. VACCINATION PLANS (Future planned protocols)
INSERT INTO public.vaccination_plans (
    id, pet_id, prescribed_by_vet_id, vaccine_name, target_disease, recommended_date, dose_number, total_doses, notes, status
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'تطعيم حشرات الكينل كوف (Bordetella KC)',
    'سعال الكلاب وبيوت الإيواء',
    CURRENT_DATE + interval '45 days',
    1, 1,
    'موصى به قبل دخول موسم الشتاء والتواجد في أماكن تجمع الكلاب.',
    'planned'
)
ON CONFLICT (id) DO NOTHING;

-- 10. MEDICATIONS
INSERT INTO public.medications (
    id, pet_id, visit_id, prescribed_by_vet_id, created_by,
    medication_name, dosage, frequency, start_date, end_date, is_ongoing, instructions_warnings, status
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'NexGard Spectra (30-60kg)',
    'قرص واحد مضغوط',
    'مرة كل 30 يوماً',
    CURRENT_DATE - interval '14 days',
    CURRENT_DATE + interval '16 days',
    false,
    'يعطى مع أو بدون طعام، يقي من ديدان القلب والقراد والبراغيث.',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- 11. REMINDERS
INSERT INTO public.reminders (id, pet_id, user_id, reminder_type, title, due_date, is_completed) VALUES
('10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'medication', 'جرعة الوقاية الشهرية ضد القراد (NexGard)', CURRENT_DATE + interval '16 days', false),
('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'vaccination', 'تطعيم كينل كوف (سعال الكلاب)', CURRENT_DATE + interval '45 days', false),
('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'hygiene', 'جلسة تمشيط وإزالة كرات الشعر (Hairball Grooming)', CURRENT_DATE + interval '3 days', false)
ON CONFLICT (id) DO NOTHING;

-- 12. ARTICLES (Knowledge Center)
INSERT INTO public.articles (
    id, slug, title, summary, body, category, species_target, cover_image_url, is_published, read_time_minutes, references_list
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'essential-vaccinations-dogs-egypt',
    'دليل التطعيمات الأساسية للكلاب في مصر: المواعيد والأهمية الوقائية',
    'تعرف على جدول التطعيمات الإلزامية والاختيارية لكلبك في مصر، وكيف تحميه من فيروسات البارفو، الديستمبر، وداء السعار القاتل.',
    '## أهمية التطعيمات الوقائية
تعتبر التطعيمات خط الدفاع الأول لحماية الكلاب في مصر من الأمراض الوبائية المنتشرة ذات معدلات النفوق المرتفعة، خاصة في الجراء الصغيرة.

### 1. التطعيم الثماني أو السباعي (DHPPi + L)
- **الأمراض المستهدفة:** البارفو، الديستمبر (الحمى المفرطة)، الالتهاب الكبدي الوبائي، والبارانفلونزا، والليبتوسبيرا.
- **التوقيت:** يبدأ في عمر 6 إلى 8 أسابيع، يعاد إعطاء جرعة تنشيطية بعد 3-4 أسابيع، ثم جرعة منشطة سنوية طوال حياة الكلب.

### 2. تطعيم داء السعار (Rabies Vaccine)
- **الإلزامية:** إلزامي قانونياً وطبياً لحماية الحيوان والإنسان.
- **التوقيت:** يؤخذ في عمر 3 أشهر وما بعده، ويكرر سنوياً بانتظام.

### نصائح طبية هامة قبل التطعيم:
1. يجب إجراء فحص إكلينيكي كامل والتأكد من خلو الحيوان من أي ارتفاع في درجة الحرارة.
2. إعطاء جرعة وقائية من مضادات الديدان قبل التطعيم بأسبوع لضمان كفاءة الجهاز المناعي.
3. الامتناع عن تحميم الكلب لمدة 48 ساعة بعد تلقي اللقاح تجنباً للإجهاد الحراري.',
    'preventive_care', 'dogs',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    true, 5,
    '[{"title": "WSAVA Vaccination Guidelines for Dogs and Cats", "url": "https://wsava.org"}, {"title": "دليل الهيئة العامة للخدمات البيطرية المصرية", "year": "2023"}]'::jsonb
),
(
    '20000000-0000-0000-0000-000000000002',
    'feline-urinary-tract-disease-guide',
    'أمراض المسالك البولية السفلية في القطط (FLUTD): الأسباب والوقاية العاجلة',
    'شرح طبي مفصل لأعراض انسداد مجرى البول عند ذكور القطط، متى يعتبر الأمر طوارئ قصوى، وكيفية حماية قطتك عبر التغذية السليمة وشرب الماء.',
    '## ما هي متلازمة FLUTD؟
تصف متلازمة المسالك البولية السفلية في القطط مجموعة متنوعة من الحالات التي تصيب المثانة ومجرى البول، وأكثرها خطورة هو انسداد مجرى البول التام عند ذكور القطط بسبب البلورات والحصوات البولية.

### العلامات التحذيرية التي تستدعي زيارة الطوارئ فوراً:
- التردد المتكرر على صندوق الفضلات (Litter box) دون إخراج بول أو بنزول قطرات مدممة.
- الصراخ أو المواء المؤلم أثناء محاولة التبول.
- لعق مفرط لمنطقة الأعضاء التناسلية.
- الخمول وفقدان الشهية والقيء (مؤشر على ارتفاع اليوريا وتسمم البول).

### الوقاية المنزلية الفعالة:
1. **زيادة شرب الماء:** وفر نافورة مياه جارية واخلط الطعام الجاف بالطعام الرطب (Wet Food).
2. **التحكم في التوتر:** القطط حساسة جداً للتغيرات البيئية، وتوتر القطط يؤدي مباشرة لالتهاب المثانة المعقم (FIC).
3. **نظافة صندوق الفضلات:** حافظ على تنظيف الصندوق يومياً وبشكل دوري.',
    'symptoms', 'cats',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
    true, 6,
    '[{"title": "ISFM Guidelines on Feline Idiopathic Cystitis", "url": "https://icatcare.org"}]'::jsonb
),
(
    '20000000-0000-0000-0000-000000000003',
    'equine-colic-emergency-management',
    'مغص الخيل: دليلك للتعامل السريع والتشخيص الأولي لحين وصول الطبيب البيطري',
    'المغص في الخيول هو حالة طوارئ حرجة قد تهدد حياة الحصان خلال ساعات. إليك الخطوات الطبية السليمة للتعامل الأولي.',
    '## لماذا يعتبر مغص الخيل حالة طارئة؟
الجهاز الهضمي للحصان فريد ومعقد؛ فالحصان لا يستطيع التقيؤ تشريحياً، وأي انحباس غازي أو التواء معوي يؤدي إلى ضغط شديد وألم حاد.

### علامات المغص المبكرة:
- ضرب الحصان الأرض بحوافره وتقليب رأسه باتجاه خاصرته.
- الرقود المفاجئ ومحاولة التدحرج المستمر على الأرض.
- تسارع معدل التنفس وزيادة التعرق بدون بذل جهد.
- غياب أصوات حركة الأمعاء الطبيعية عند وضع الأذن على جانبي البطن.

### ما يجب فعله فوراً:
1. **اتصل بالطبيب البيطري على الفور** ولا تنتظر تحسن الحالة ذاتياً.
2. **منع الحصان من التدحرج العنيف** لتجنب التواء الأمعاء الدقيقة أو انفجار المعدة، وذلك بالمشي الهادئ معه.
3. **أوقف كل الطعام والماء** لحين تقييم الطبيب البيطري للحالة.',
    'emergency_care', 'horses',
    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80',
    true, 7,
    '[{"title": "AAEP Guide to Colic in Horses", "url": "https://aaep.org"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
