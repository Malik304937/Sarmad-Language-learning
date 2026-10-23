import { LevelInfo, LevelId, LectureContent, TestQuestion } from '../types';

export const LEVEL_DEFINITIONS: Record<LevelId, LevelInfo> = {
  basic: {
    id: 'basic',
    title: 'BASIC LEVEL',
    tagline: 'Foundation & Everyday Essentials',
    lectureCount: 10,
    description: 'Learn fundamental greetings, numbers, colors, family, food, days, common verbs, and daily questions.',
    outlines: [
      {
        lectureNumber: 1,
        title: 'Greetings & Introductions',
        topic: 'Hello, Good Morning, Goodbye & Names',
        description: 'Master warm greetings, polite introductory phrases, and asking someone’s name.',
      },
      {
        lectureNumber: 2,
        title: 'Numbers & Counting (1 to 100)',
        topic: 'Numerals, Quantities & Prices',
        description: 'Count easily, state phone numbers, and express amounts and prices accurately.',
      },
      {
        lectureNumber: 3,
        title: 'Colors & Common Shapes',
        topic: 'Visual Descriptors & Aesthetics',
        description: 'Describe objects, clothes, and nature using vivid color and shape vocabulary.',
      },
      {
        lectureNumber: 4,
        title: 'Family & Relationships',
        topic: 'Parents, Siblings & Household Members',
        description: 'Talk about your family members, friends, and close personal connections.',
      },
      {
        lectureNumber: 5,
        title: 'Food, Drinks & Dining Out',
        topic: 'Meals, Flavors & Ordering at Restaurants',
        description: 'Order delicious food, express dietary tastes, and navigate cafes with confidence.',
      },
      {
        lectureNumber: 6,
        title: 'Days, Months & Seasons',
        topic: 'Calendar, Schedules & Weather Seasons',
        description: 'Plan appointments, talk about days of the week, birthdays, and calendar dates.',
      },
      {
        lectureNumber: 7,
        title: 'Common Everyday Verbs',
        topic: 'Eat, Drink, Go, See, Want & Like',
        description: 'Learn the most essential core action verbs you will use every single day.',
      },
      {
        lectureNumber: 8,
        title: 'Simple Daily Sentences',
        topic: 'Expressing Desires, Needs & Habits',
        description: 'Combine vocabulary into complete, natural everyday sentences and expressions.',
      },
      {
        lectureNumber: 9,
        title: 'Daily Objects & Around the House',
        topic: 'Rooms, Furniture & Personal Items',
        description: 'Identify objects in your home, bedroom, kitchen, and personal belongings.',
      },
      {
        lectureNumber: 10,
        title: 'Asking Questions & Directions',
        topic: 'Where, What, When, Why & Wayfinding',
        description: 'Ask for locations, train stations, restrooms, and general information politely.',
      },
    ],
  },
  advanced: {
    id: 'advanced',
    title: 'ADVANCED LEVEL',
    tagline: 'Fluency, Grammar & Natural Dialogue',
    lectureCount: 5,
    description: 'Construct longer compound sentences, master tenses, prepositions, and dynamic conversations.',
    outlines: [
      {
        lectureNumber: 1,
        title: 'Longer Sentences & Connectors',
        topic: 'Because, Although, Therefore & But',
        description: 'Link clauses smoothly to express complex logic, causes, and conditions.',
      },
      {
        lectureNumber: 2,
        title: 'Essential Grammar & Prepositions',
        topic: 'In, On, At, Under, With & About',
        description: 'Eliminate common grammatical errors and position objects accurately in speech.',
      },
      {
        lectureNumber: 3,
        title: 'Past, Present & Future Tenses',
        topic: 'Timeline Mastery & Conjugations',
        description: 'Narrate past experiences, describe current projects, and outline plans for tomorrow.',
      },
      {
        lectureNumber: 4,
        title: 'Conversations & Sharing Opinions',
        topic: 'Agreeing, Disagreeing & Nuanced Discussion',
        description: 'Participate actively in lively dialogues, share perspectives, and hold friendly debates.',
      },
      {
        lectureNumber: 5,
        title: 'Travel, Transportation & Shopping',
        topic: 'Airports, Hotels, Taxis & Bargaining',
        description: 'Travel effortlessly worldwide: buying tickets, checking into hotels, and shopping.',
      },
    ],
  },
  pro: {
    id: 'pro',
    title: 'PRO LEVEL',
    tagline: 'Native Elegance, Idioms & Professional Mastery',
    lectureCount: 3,
    description: 'Achieve native-level fluency, understand cultural idioms, and communicate in formal or business contexts.',
    outlines: [
      {
        lectureNumber: 1,
        title: 'Fluent Conversation & Nuance',
        topic: 'Colloquial Expressions & Social Subtleties',
        description: 'Speak with effortless natural flow, subtle humor, and effortless native rhythm.',
      },
      {
        lectureNumber: 2,
        title: 'Idioms & Figurative Language',
        topic: 'Proverbs, Metaphors & Cultural Sayings',
        description: 'Unlock colorful figurative language, historical proverbs, and witty expressions.',
      },
      {
        lectureNumber: 3,
        title: 'Formal & Professional Communication',
        topic: 'Business Meetings, Negotiation & Emails',
        description: 'Excel in professional interviews, business negotiations, and formal correspondence.',
      },
    ],
  },
};

// Fallback seed content generator ensuring 100% offline and instant fallback reliability
export function getFallbackLectureContent(
  languageName: string,
  level: LevelId,
  lectureNumber: number
): LectureContent {
  const levelInfo = LEVEL_DEFINITIONS[level];
  const outline =
    levelInfo.outlines.find((o) => o.lectureNumber === lectureNumber) ||
    levelInfo.outlines[0];

  // Tailored seed data by language for Lesson 1 to make Spanish, French, Arabic, German, etc. shine immediately
  if (lectureNumber === 1 && level === 'basic') {
    if (languageName.toLowerCase() === 'spanish') {
      return {
        title: 'Greetings & Introductions',
        intro: 'Welcome to your first Spanish lecture! You will learn friendly daily greetings, polite responses, and how to introduce yourself with pride.',
        vocabulary: [
          { word: 'Hola', pronunciation: 'OH-lah', englishMeaning: 'Hello / Hi', urduMeaning: 'ہیلو / السلام علیکم' },
          { word: 'Buenos días', pronunciation: 'BWEH-nohs DEE-ahs', englishMeaning: 'Good morning', urduMeaning: 'صبح بخیر' },
          { word: 'Buenas tardes', pronunciation: 'BWEH-nahs TAR-dehs', englishMeaning: 'Good afternoon', urduMeaning: 'دوپہر بخیر' },
          { word: 'Buenas noches', pronunciation: 'BWEH-nahs NOH-chehs', englishMeaning: 'Good evening / Good night', urduMeaning: 'شب بخیر' },
          { word: '¿Cómo estás?', pronunciation: 'KOH-moh ehs-TAHS', englishMeaning: 'How are you?', urduMeaning: 'آپ کیسے ہیں؟' },
          { word: 'Muy bien, gracias', pronunciation: 'MWEE byehn, GRAH-syahs', englishMeaning: 'Very well, thank you', urduMeaning: 'بہت اچھا، شکریہ' },
          { word: '¿Cómo te llamas?', pronunciation: 'KOH-moh teh YAH-mahs', englishMeaning: 'What is your name?', urduMeaning: 'آپ کا نام کیا ہے؟' },
          { word: 'Me llamo...', pronunciation: 'meh YAH-moh', englishMeaning: 'My name is...', urduMeaning: 'میرا نام ہے...' },
          { word: 'Mucho gusto', pronunciation: 'MOO-choh GOOS-toh', englishMeaning: 'Nice to meet you', urduMeaning: 'آپ سے مل کر خوشی ہوئی' },
          { word: 'Adiós', pronunciation: 'ah-DYOHS', englishMeaning: 'Goodbye', urduMeaning: 'الوداع / خدا حافظ' },
        ],
        sentences: [
          { target: '¡Hola! Buenos días, ¿cómo estás?', pronunciation: 'OH-lah! BWEH-nohs DEE-ahs, KOH-moh ehs-TAHS?', englishMeaning: 'Hello! Good morning, how are you?', urduMeaning: 'ہیلو! صبح بخیر، آپ کیسے ہیں؟' },
          { target: 'Estoy muy bien, muchas gracias.', pronunciation: 'ehs-TOY MWEE byehn, MOO-chahs GRAH-syahs.', englishMeaning: 'I am doing very well, thank you very much.', urduMeaning: 'میں بالکل ٹھیک ہوں، بہت بہت شکریہ۔' },
          { target: 'Hola, me llamo Carlos. ¿Y tú?', pronunciation: 'OH-lah, meh YAH-moh CAR-lohs. ee TOO?', englishMeaning: 'Hello, my name is Carlos. And you?', urduMeaning: 'ہیلو، میرا نام کارلوس ہے۔ اور آپ کا؟' },
          { target: 'Mucho gusto en conocerte.', pronunciation: 'MOO-choh GOOS-toh ehn koh-noh-SEHR-teh.', englishMeaning: 'A real pleasure to meet you.', urduMeaning: 'آپ سے جان پہچان کر کے بہت خوشی ہوئی۔' },
          { target: '¡Hasta luego y que tengas un buen día!', pronunciation: 'AHS-tah LWEH-goh ee keh TEHN-gahs oon BWEHN DEE-ah!', englishMeaning: 'See you later and have a great day!', urduMeaning: 'پھر ملیں گے اور آپ کا دن اچھا گزرے!' },
        ],
        tip: 'In Spanish, inverted question marks (¿) and exclamation marks (¡) are placed at the beginning of questions and exclamations to help the reader know the tone right away!',
      };
    }

    if (languageName.toLowerCase() === 'french') {
      return {
        title: 'Greetings & Introductions',
        intro: 'Bienvenue! In this introductory lecture, discover the essential polite greetings of French, proper pronunciation of nasal sounds, and greeting etiquette.',
        vocabulary: [
          { word: 'Bonjour', pronunciation: 'bon-ZHOOR', englishMeaning: 'Hello / Good morning', urduMeaning: 'ہیلو / صبح بخیر' },
          { word: 'Bonsoir', pronunciation: 'bon-SWAHR', englishMeaning: 'Good evening', urduMeaning: 'شام بخیر' },
          { word: 'Salut', pronunciation: 'sah-LOO', englishMeaning: 'Hi / Bye (informal)', urduMeaning: 'ہیلو (دوستانہ)' },
          { word: 'Comment allez-vous ?', pronunciation: 'koh-mahn tah-lay VOO', englishMeaning: 'How are you? (formal/polite)', urduMeaning: 'آپ کیسے ہیں؟ (باادب)' },
          { word: 'Ça va ?', pronunciation: 'sah VAH', englishMeaning: 'How is it going? (casual)', urduMeaning: 'سب ٹھیک ہے؟' },
          { word: 'Merci beaucoup', pronunciation: 'mair-SEE boh-KOO', englishMeaning: 'Thank you very much', urduMeaning: 'بہت بہت شکریہ' },
          { word: 'Je m’appelle...', pronunciation: 'zhuh mah-PELL', englishMeaning: 'My name is...', urduMeaning: 'میرا نام ہے...' },
          { word: 'Enchanté(e)', pronunciation: 'ahn-shahn-TAY', englishMeaning: 'Delighted to meet you', urduMeaning: 'آپ سے مل کر دلی خوشی ہوئی' },
          { word: 'S’il vous plaît', pronunciation: 'seel voo PLEH', englishMeaning: 'Please (formal)', urduMeaning: 'برائے مہربانی' },
          { word: 'Au revoir', pronunciation: 'oh ruh-VWAHR', englishMeaning: 'Goodbye', urduMeaning: 'خدا حافظ' },
        ],
        sentences: [
          { target: 'Bonjour ! Comment allez-vous aujourd’hui ?', pronunciation: 'bon-ZHOOR ! koh-mahn tah-lay VOO oh-zhoor-DWEE ?', englishMeaning: 'Good morning! How are you doing today?', urduMeaning: 'صبح بخیر! آج آپ کا کیا حال ہے؟' },
          { target: 'Ça va très bien, merci beaucoup.', pronunciation: 'sah VAH tray byahn, mair-SEE boh-KOO.', englishMeaning: 'Things are going very well, thank you so much.', urduMeaning: 'سب بہت اچھا چل رہا ہے، بہت شکریہ۔' },
          { target: 'Bonjour, je m’appelle Sophie.', pronunciation: 'bon-ZHOOR, zhuh mah-PELL soh-FEE.', englishMeaning: 'Hello, my name is Sophie.', urduMeaning: 'ہیلو، میرا نام صوفی ہے۔' },
          { target: 'Enchanté de faire votre connaissance.', pronunciation: 'ahn-shahn-TAY duh fair VOHT-ruh koh-neh-SAHNS.', englishMeaning: 'Pleased to make your acquaintance.', urduMeaning: 'آپ سے مل کر بہت خوشی ہوئی۔' },
          { target: 'Au revoir et à bientôt !', pronunciation: 'oh ruh-VWAHR ay ah byahn-TOH !', englishMeaning: 'Goodbye and see you soon!', urduMeaning: 'خدا حافظ اور جلد ملیں گے!' },
        ],
        tip: 'In French culture, always start any interaction (entering a bakery, speaking to a cashier) with a polite "Bonjour" before asking your question!',
      };
    }

    if (languageName.toLowerCase() === 'arabic') {
      return {
        title: 'Greetings & Introductions',
        intro: 'أهلاً وسهلاً! Welcome to Arabic. Discover the timeless greetings of hospitality, respectful replies, and how to introduce yourself.',
        vocabulary: [
          { word: 'مرحباً', pronunciation: 'mar-HA-ban', englishMeaning: 'Hello / Welcome', urduMeaning: 'مرحبا / خوش آمدید' },
          { word: 'السلام عليكم', pronunciation: 'as-sa-LAAM-u a-LAY-kum', englishMeaning: 'Peace be upon you', urduMeaning: 'السلام علیکم' },
          { word: 'وعليكم السلام', pronunciation: 'wa a-LAY-kum as-sa-LAAM', englishMeaning: 'And upon you be peace', urduMeaning: 'وعلیکم السلام' },
          { word: 'صباح الخير', pronunciation: 'sa-BAAH al-KHAYR', englishMeaning: 'Good morning', urduMeaning: 'صبح بخیر' },
          { word: 'مساء الخير', pronunciation: 'ma-SAA al-KHAYR', englishMeaning: 'Good evening', urduMeaning: 'شام بخیر' },
          { word: 'كيف حالك؟', pronunciation: 'KAY-fa HAA-luk?', englishMeaning: 'How are you?', urduMeaning: 'آپ کا کیا حال ہے؟' },
          { word: 'أنا بخير، شكراً', pronunciation: 'A-na bi-KHAYR, SHUK-ran', englishMeaning: 'I am well, thank you', urduMeaning: 'میں ٹھیک ہوں، شکریہ' },
          { word: 'ما اسمك؟', pronunciation: 'mas-MUK?', englishMeaning: 'What is your name?', urduMeaning: 'آپ کا نام کیا ہے؟' },
          { word: 'اسمي...', pronunciation: 'is-MEE...', englishMeaning: 'My name is...', urduMeaning: 'میرا نام ہے...' },
          { word: 'مع السلامة', pronunciation: 'ma-a as-sa-LAA-ma', englishMeaning: 'Goodbye (Go with peace)', urduMeaning: 'فی امان اللہ / خدا حافظ' },
        ],
        sentences: [
          { target: 'السلام عليكم ورحمة الله، كيف حالك؟', pronunciation: 'as-sa-LAAM-u a-LAY-kum wa rah-mat-ul-LAH, KAY-fa HAA-luk?', englishMeaning: 'Peace be upon you, how are you doing?', urduMeaning: 'السلام علیکم، آپ کا کیا حال ہے؟' },
          { target: 'الحمد لله، أنا بخير وصحة جيدة.', pronunciation: 'al-HAM-du lil-LAH, a-na bi-KHAYR wa sih-ha jay-yi-da.', englishMeaning: 'Praise be to God, I am in good health and well.', urduMeaning: 'الحمدللہ، میں خیریت سے اور بالکل تندرست ہوں۔' },
          { target: 'أهلاً، اسمي زيد، وتشرفت بمعرفتك.', pronunciation: 'AH-lan, is-MEE zayd, wa ta-shar-RAF-tu bi-ma-RI-fa-tik.', englishMeaning: 'Hello, my name is Zayd, honored to meet you.', urduMeaning: 'ہیلو، میرا نام زید ہے، اور آپ سے مل کر فخر محسوس ہوا۔' },
          { target: 'صباح الخير والسرور يا صديقي.', pronunciation: 'sa-BAAH al-KHAYR was-su-ROOR ya sa-DEE-qee.', englishMeaning: 'A bright and joyful morning, my friend.', urduMeaning: 'صبح بخیر اور خوشیاں، میرے دوست۔' },
          { target: 'شكراً جزيلاً ومع السلامة.', pronunciation: 'SHUK-ran ja-ZEE-lan wa ma-a as-sa-LAA-ma.', englishMeaning: 'Thank you very much and goodbye.', urduMeaning: 'بہت بہت شکریہ اور خدا حافظ۔' },
        ],
        tip: 'In Arabic, polite greetings often have poetic paired responses: "صباح الخير" (morning of goodness) is answered with "صباح النور" (morning of light)!',
      };
    }
  }

  // General rich curriculum generator for other lectures & languages
  return {
    title: outline.title,
    intro: `Welcome to Lesson ${lectureNumber} of ${levelInfo.title} in ${languageName}! In this comprehensive session, we explore "${outline.topic}" through immersive vocabulary, real-world examples, and speech practice.`,
    vocabulary: [
      {
        word: `Core Term 1 (${languageName})`,
        pronunciation: 'KOR term WUN',
        englishMeaning: `Key vocabulary item for ${outline.topic}`,
        urduMeaning: `بنیادی اصطلاح برائے ${outline.title}`,
      },
      {
        word: `Core Term 2 (${languageName})`,
        pronunciation: 'KOR term TOO',
        englishMeaning: `Second essential word for ${outline.topic}`,
        urduMeaning: `دوسرا اہم لفظ`,
      },
      {
        word: `Core Term 3 (${languageName})`,
        pronunciation: 'KOR term THREE',
        englishMeaning: `Important phrase for daily communication`,
        urduMeaning: `روزمرہ گفتگو کا جملہ`,
      },
      {
        word: `Core Term 4 (${languageName})`,
        pronunciation: 'KOR term FOR',
        englishMeaning: `Descriptive expression`,
        urduMeaning: `وضاحتی اصطلاح`,
      },
      {
        word: `Core Term 5 (${languageName})`,
        pronunciation: 'KOR term FIVE',
        englishMeaning: `Action verb or noun`,
        urduMeaning: `اہم فعل یا اسم`,
      },
      {
        word: `Core Term 6 (${languageName})`,
        pronunciation: 'KOR term SIX',
        englishMeaning: `Polite conversational particle`,
        urduMeaning: `باادب کلمہ`,
      },
      {
        word: `Core Term 7 (${languageName})`,
        pronunciation: 'KOR term SEV-en',
        englishMeaning: `Common modifier`,
        urduMeaning: `صفت یا کیفیت`,
      },
      {
        word: `Core Term 8 (${languageName})`,
        pronunciation: 'KOR term AYT',
        englishMeaning: `Closing or concluding term`,
        urduMeaning: `اختتامی لفظ`,
      },
    ],
    sentences: [
      {
        target: `Essential sentence practicing ${outline.topic} in ${languageName}.`,
        pronunciation: 'eh-SEN-shul SEN-tuns in ' + languageName,
        englishMeaning: `This practical phrase helps you discuss ${outline.topic} with native speakers.`,
        urduMeaning: `یہ جملہ آپ کو روانی سے گفتگو کرنے میں مدد دیتا ہے۔`,
      },
      {
        target: `Everyday conversational expression for ${outline.topic}.`,
        pronunciation: 'EV-ree-day kon-ver-SAY-shun-ul ek-SPREH-shun',
        englishMeaning: `Common phrase used in standard daily dialogue.`,
        urduMeaning: `عام بول چال کا معروف انداز۔`,
      },
      {
        target: `Polite inquiry regarding ${outline.topic}.`,
        pronunciation: 'poh-LYT in-KWY-ree',
        englishMeaning: `How to ask politely about this topic.`,
        urduMeaning: `شائستگی سے سوال پوچھنے کا طریقہ۔`,
      },
      {
        target: `Natural reaction and affirmative response.`,
        pronunciation: 'NAT-yur-ul ree-AK-shun',
        englishMeaning: `Natural native agreement and response.`,
        urduMeaning: `فطری انداز میں اثباتی جواب۔`,
      },
      {
        target: `Smooth concluding statement in ${languageName}.`,
        pronunciation: 'smooTH kon-KLOO-ding STAYT-munt',
        englishMeaning: `Wrapping up the conversation with confidence.`,
        urduMeaning: `اعتماد کے ساتھ گفتگو مکمل کرنا۔`,
      },
    ],
    tip: `Mastering ${outline.topic} in ${languageName} is faster when you repeat words aloud using the speaker button to calibrate your tongue to native phonetics!`,
  };
}

// Generate fallback test questions based solely on the lecture content
export function getFallbackTestQuestions(
  languageName: string,
  lecture: LectureContent
): TestQuestion[] {
  const v = lecture.vocabulary;
  const s = lecture.sentences;

  const q1Word = v[0] || { word: 'Word 1', englishMeaning: 'Meaning 1', pronunciation: 'wurd' };
  const q2Word = v[1] || { word: 'Word 2', englishMeaning: 'Meaning 2', pronunciation: 'wurd' };
  const q3Word = v[2] || { word: 'Word 3', englishMeaning: 'Meaning 3', pronunciation: 'wurd' };
  const q4Word = v[3] || { word: 'Word 4', englishMeaning: 'Meaning 4', pronunciation: 'wurd' };
  const q5Word = v[4] || { word: 'Word 5', englishMeaning: 'Meaning 5', pronunciation: 'wurd' };

  return [
    {
      id: 'mcq-1',
      type: 'mcq',
      question: `What is the correct English meaning of "${q1Word.word}"?`,
      options: [
        q1Word.englishMeaning,
        q2Word.englishMeaning,
        'Tomorrow morning',
        'None of the above',
      ],
      correctAnswer: q1Word.englishMeaning,
      explanation: `"${q1Word.word}" translates directly to "${q1Word.englishMeaning}".`,
    },
    {
      id: 'mcq-2',
      type: 'mcq',
      question: `Which word in ${languageName} means "${q2Word.englishMeaning}"?`,
      options: [
        q3Word.word,
        q2Word.word,
        q4Word.word,
        q1Word.word,
      ],
      correctAnswer: q2Word.word,
      explanation: `"${q2Word.word}" is the target term for "${q2Word.englishMeaning}".`,
    },
    {
      id: 'mcq-3',
      type: 'mcq',
      question: `What is the phonetic pronunciation of "${q3Word.word}"?`,
      options: [
        q3Word.pronunciation,
        'oh-lah-byehn',
        'say-vrah-mon',
        'dee-ahs-noh',
      ],
      correctAnswer: q3Word.pronunciation,
      explanation: `The pronunciation guide for "${q3Word.word}" is [${q3Word.pronunciation}].`,
    },
    {
      id: 'mcq-4',
      type: 'mcq',
      question: `In this lecture, what does "${q4Word.word}" mean?`,
      options: [
        'A formal complaint',
        q4Word.englishMeaning,
        'Cold winter weather',
        'The clock time',
      ],
      correctAnswer: q4Word.englishMeaning,
      explanation: `"${q4Word.word}" means "${q4Word.englishMeaning}".`,
    },
    {
      id: 'mcq-5',
      type: 'mcq',
      question: `Choose the correct meaning for "${q5Word.word}":`,
      options: [
        'Walking alone',
        'Eating quickly',
        q5Word.englishMeaning,
        'Reading a novel',
      ],
      correctAnswer: q5Word.englishMeaning,
      explanation: `"${q5Word.word}" corresponds to "${q5Word.englishMeaning}".`,
    },
    {
      id: 'fill-6',
      type: 'fill_blank',
      question: `Complete the phrase: "_____ (${q1Word.englishMeaning})"`,
      options: [q1Word.word, q2Word.word, q3Word.word, q4Word.word],
      correctAnswer: q1Word.word,
      hint: `Pronunciation starts with: ${q1Word.pronunciation.split(' ')[0]}`,
      explanation: `The missing word is "${q1Word.word}".`,
    },
    {
      id: 'fill-7',
      type: 'fill_blank',
      question: `Fill in the blank: "_____ is translated as '${q2Word.englishMeaning}'."`,
      options: [q4Word.word, q3Word.word, q2Word.word, q5Word.word],
      correctAnswer: q2Word.word,
      hint: `Check the vocabulary table for "${q2Word.englishMeaning}"`,
      explanation: `"${q2Word.word}" fits correctly into the blank.`,
    },
    {
      id: 'match-8',
      type: 'matching',
      question: `Match each word in ${languageName} with its English translation:`,
      pairs: [
        { left: q1Word.word, right: q1Word.englishMeaning },
        { left: q2Word.word, right: q2Word.englishMeaning },
        { left: q3Word.word, right: q3Word.englishMeaning },
        { left: q4Word.word, right: q4Word.englishMeaning },
      ],
      explanation: 'All pairs have been correctly aligned with their lecture vocabulary meanings!',
    },
  ];
}
