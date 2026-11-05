const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DATA STORES ====================

const ALL_DELHI_STATIONS = [
  { id: 'isbt_kg', name: 'ISBT Kashmere Gate (Maharana Pratap)', type: 'isbt', lat: 28.6675, lng: 77.2285, desc: "Asia's largest interstate bus terminus. North, HP, Punjab, Haryana, Rajasthan wings.", buses: 'HRTC, PUNBUS, RSRTC, Haryana Roadways, DTC' },
  { id: 'isbt_av', name: 'ISBT Anand Vihar (Swami Vivekanand)', type: 'isbt', lat: 28.6495, lng: 77.3150, desc: 'Major East Delhi hub for Uttar Pradesh (UPSRTC) & Uttarakhand (UTC) buses.', buses: 'UPSRTC Janrath, UTC Volvo, DTC Local' },
  { id: 'isbt_skk', name: 'ISBT Sarai Kale Khan (Vir Haqiqat Rai)', type: 'isbt', lat: 28.5910, lng: 77.2565, desc: 'South-East Delhi hub for Haryana, Agra, Mathura, MP, and Rajasthan.', buses: 'Haryana Roadways, UPSRTC, DTC' },
  { id: 'pvt_mjt', name: 'Majnu Ka Tila Private Volvo Stand', type: 'private', lat: 28.7015, lng: 77.2280, desc: 'Premier private luxury Volvo hub for Manali, Dharamshala, Kasol, Shimla.', buses: 'Zingbus, IntrCity, Laxmi Holidays, Northern Travels' },
  { id: 'pvt_dk', name: 'Dhaula Kuan Private Bus Hub', type: 'private', lat: 28.5950, lng: 77.1650, desc: 'Major South-West hub for private buses to Jaipur, Udaipur, Gurgaon, Alwar.', buses: 'RSRTC, Private Volvos, Airport Express' },
  { id: 'pvt_rka', name: 'RK Ashram Marg / CP Private Volvo Stand', type: 'private', lat: 28.6360, lng: 77.2080, desc: 'Paharganj / Central Delhi hub for long-distance overnight private sleepers.', buses: 'City Land Travels, Zingbus, Royal Safari' },
  { id: 'pvt_mori', name: 'Mori Gate Private Bus Stand', type: 'private', lat: 28.6635, lng: 77.2210, desc: 'Historical Old Delhi private bus hub near Kashmere Gate for Punjab & Haryana.', buses: 'Private Express Fleet, Tour Coaches' },
  { id: 'pvt_aksh', name: 'Akshardham / Gazipur Bus Stand', type: 'private', lat: 28.6180, lng: 77.2800, desc: 'Eastern Gateway for Lucknow, Kanpur, Varanasi, Gorakhpur private sleeper coaches.', buses: 'UPSRTC, Royal Cruiser, Private Sleepers' },
  { id: 'dtc_un', name: 'Uttam Nagar DTC Terminal', type: 'dtc', lat: 28.6210, lng: 77.0600, desc: 'Major West Delhi city terminal connecting routes 753, 883, 721.', buses: 'DTC AC Electric, DIMTS Cluster' },
  { id: 'dtc_meh', name: 'Mehrauli DTC Bus Terminal', type: 'dtc', lat: 28.5180, lng: 77.1850, desc: 'South Delhi heritage terminal connecting routes 502, 505.', buses: 'DTC Electric Fleet' },
  { id: 'dtc_bad', name: 'Badarpur Border Bus Terminal', type: 'dtc', lat: 28.4980, lng: 77.3050, desc: 'Border terminal connecting Delhi to Faridabad & Mathura Road routes (405A).', buses: 'DTC Route 405A, 429' },
  { id: 'dtc_nar', name: 'Narela Bus Terminal', type: 'dtc', lat: 28.8500, lng: 77.0950, desc: 'North Delhi terminal connecting route 193 to Kashmere Gate.', buses: 'DTC CNG Eco & Electric' },
  { id: 'dtc_np', name: 'Nehru Place Bus Terminal', type: 'dtc', lat: 28.5490, lng: 77.2520, desc: 'Financial district terminal connecting routes across Ring Road.', buses: 'DTC AC Fleet' },
  { id: 'dtc_mah', name: 'Mahipalpur / IGI Airport T3 Stand', type: 'dtc', lat: 28.5435, lng: 77.1275, desc: 'Airport feeder station for Route 550, 729, and Airport Express.', buses: 'Route 550, DTC Electric AC' }
];

const TRANSIT_ROUTES = {
  mahipalpur: {
    routeNumber: '550',
    title: 'Kashmere Gate ➔ Mahipalpur',
    description: 'Via Dhaula Kuan & Ring Road • Frequency: 10 min • Fare: ₹25 • Standing at ISBT City Terminal',
    originCoords: [28.6675, 77.2285],
    destCoords: [28.5435, 77.1275],
    path: [
      [28.6675, 77.2285],
      [28.6550, 77.2340],
      [28.6400, 77.2400],
      [28.6280, 77.2450],
      [28.6100, 77.2450],
      [28.5900, 77.2400],
      [28.5720, 77.2350],
      [28.5700, 77.2100],
      [28.5800, 77.1850],
      [28.5950, 77.1650],
      [28.5650, 77.1450],
      [28.5435, 77.1275]
    ]
  }
};

const TERMINAL_PATHS = {
  katra: [
    [28.6663, 77.2274],
    [28.6671, 77.2278],
    [28.6674, 77.2282],
    [28.6680, 77.2283],
    [28.6685, 77.2285]
  ],
  manali: [
    [28.6663, 77.2274],
    [28.6671, 77.2278],
    [28.6674, 77.2282],
    [28.6681, 77.2285],
    [28.6686, 77.2288]
  ],
  jaipur: [
    [28.6663, 77.2274],
    [28.6671, 77.2278],
    [28.6674, 77.2282],
    [28.6680, 77.2280],
    [28.6684, 77.2280]
  ],
  wrong_metro: [
    [28.6663, 77.2274],
    [28.6664, 77.2276],
    [28.6665, 77.2278],
    [28.6667, 77.2280]
  ]
};

// ==================== REST APIS ====================

// Stations endpoint
app.get('/api/stations', (req, res) => {
  const { type, q } = req.query;
  let results = ALL_DELHI_STATIONS;

  if (type && type !== 'all') {
    results = results.filter(s => s.type === type);
  }

  if (q) {
    const term = q.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.buses.toLowerCase().includes(term) ||
      s.desc.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

// Transit routes endpoint
app.get('/api/routes/:id', (req, res) => {
  const route = TRANSIT_ROUTES[req.params.id];
  if (!route) {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  res.json({ success: true, data: route });
});

// Terminal wayfinding paths
app.get('/api/terminal-paths', (req, res) => {
  res.json({ success: true, data: TERMINAL_PATHS });
});

// Live Crowd Odometer telemetry (with realistic CCTV fluctuation)
app.get('/api/crowd-density', (req, res) => {
  const jitter = () => (Math.random() * 4 - 2).toFixed(1);

  const data = {
    interstate: { label: 'HEAVY RUSH', density: +(88.0 + +jitter()).toFixed(1), angle: 68, headcount: 3842 + Math.floor(Math.random() * 40 - 20), color: 'text-rose-500', advice: 'Heavy rush on Interstate Deck. Divert via East Ramp to avoid concourse queue.' },
    himachal: { label: 'PEAK BOARDING', density: +(94.0 + +jitter()).toFixed(1), angle: 79, headcount: 1420 + Math.floor(Math.random() * 30 - 15), color: 'text-rose-500', advice: 'Bays 11-15 boarding Katra and Manali Volvos. High passenger density.' },
    punjab: { label: 'MODERATE', density: +(62.0 + +jitter()).toFixed(1), angle: 22, headcount: 980 + Math.floor(Math.random() * 20 - 10), color: 'text-amber-500', advice: 'Bays 1-10 moving smoothly. Normal boarding speed.' },
    rajasthan: { label: 'NORMAL FLOW', density: +(38.0 + +jitter()).toFixed(1), angle: -22, headcount: 410 + Math.floor(Math.random() * 10 - 5), color: 'text-emerald-400', advice: 'Bays 31-40 have low congestion. Clear platform access.' },
    dtc: { label: 'MODERATE', density: +(55.0 + +jitter()).toFixed(1), angle: 9, headcount: 780 + Math.floor(Math.random() * 20 - 10), color: 'text-amber-500', advice: 'City buses operating on 10-12 min scheduled intervals.' },
    metro: { label: 'CONCOURSE BOTTLENECK', density: +(91.0 + +jitter()).toFixed(1), angle: 74, headcount: 2150 + Math.floor(Math.random() * 30 - 15), color: 'text-rose-500', advice: 'Metro Gate 1 & 2 heavily congested. Keep right for bus terminal.' }
  };

  res.json({ success: true, timestamp: new Date().toISOString(), data });
});

// ==================== MULTILINGUAL TRANSIT AI CHATBOT ====================

const CHAT_RESPONSES = {
  hi: {
    metro: "⚠️ मेट्रो गेट 1 और 2 से गलती से बचने के निर्देश:\n\n1. आईएसबीटी में प्रवेश करते समय उस भूमिगत सबवे में न जाएं जो मेट्रो गेट 1 और 2 (येलो लाइन) की ओर जाता है।\n2. हमेशा दाईं ओर रहें और 'इंटर-स्टेट बस डेक' (INTER-STATE BUS DECKS) लिखे हरे बोर्ड का अनुसरण करें।\n3. केंद्रीय एस्केलेटर या ईस्ट लगेज रैंप से सीधे लेवल 2 (बे 1-42) पर जाएं।\n4. यदि आपको दिल्ली मेट्रो के टिकट गेट दिखें, तो तुरंत 180° पीछे मुड़ें!",
    majnu: "मजनू का टीला प्राइवेट वोल्वो स्टैंड आईएसबीटी कश्मीरी गेट से लगभग 2.5 किमी उत्तर आउटर रिंग रोड पर स्थित है। यहाँ से रोज़ाना शाम को मनाली, धर्मशाला और कसोल के लिए ज़िंगबस, इंटरसिटी और लक्ष्मी हॉलिडेज की वोल्वो बसें चलती हैं।",
    '550': "डीटीसी बस रूट 550 कश्मीरी गेट से महिपालपुर बाईपास को जोड़ती है (वाया लाल किला, आईटीओ, एम्स और धौला कुआं)। यह बस सिटी बस बे 41 से हर 10 मिनट में मिलती है। एसी किराया मात्र ₹25 है।",
    katra: "कटरा / माता वैष्णो देवी के लिए पनबस वोल्वो स्लीपर बस लेवल 2 इंटरस्टेट डेक, बे 12 से शाम 19:45 बजे रवाना होती है। किराया ₹1,250 है।",
    manali: "मनाली के लिए एचआरटीसी हिमसुता वोल्वो बस बे 14 से रात 20:15 बजे निकलती है। किराया ₹1,420 है। ईस्ट कॉनकोर्स से रैंप सुविधा भी उपलब्ध है।",
    jaipur: "जयपुर के लिए राजस्थान रोडवेज (RSRTC) गोल्ड लाइन वोल्वो बस बे 08 से शाम 18:30 बजे रवाना होती है। किराया ₹680 है।",
    anand: "आनंद विहार आईएसबीटी पूर्वी दिल्ली में उत्तर प्रदेश (UPSRTC) और उत्तराखंड की बसों का मुख्य केंद्र है। कश्मीरी गेट बे 19 से डीटीसी रूट 202 सीधे आनंद विहार जाती है।",
    cloakroom: "24x7 क्लॉकरूम और सामान रखने की सुविधा लेवल 1 कॉनकोर्स, पिलर 8 के पास उपलब्ध है। शुल्क ₹30 प्रति बैग (24 घंटे के लिए) है। वैध पहचान पत्र अनिवार्य है।",
    greet: "नमस्ते! मैं आपका आईएसबीटी कश्मीरी गेट एआई सहायक हूँ। आप मुझसे बस बे, प्राइवेट वोल्वो, क्लॉकरूम या मेट्रो गेट से बचने का रास्ता पूछ सकते हैं!",
    default: (msg) => `मैं "${msg}" के बारे में जानकारी देने में मदद कर सकता हूँ। आप ऊपर सर्च बार में किसी भी बस स्टेशन को खोज सकते हैं या लाइव भीड़ मीटर देख सकते हैं।`
  },
  pa: {
    metro: "⚠️ ਮੈਟਰੋ ਗੇਟ 1 ਅਤੇ 2 ਵਿੱਚ ਗਲਤੀ ਨਾਲ ਜਾਣ ਤੋਂ ਬਚਣ ਦੇ ਨਿਰਦੇਸ਼:\n\n1. ਆਈ.ਐਸ.ਬੀ.ਟੀ. ਵਿੱਚ ਦਾਖਲ ਹੁੰਦੇ ਸਮੇਂ ਮੈਟਰੋ ਗੇਟ 1 ਅਤੇ 2 ਵੱਲ ਜਾਣ ਵਾਲੇ ਸਬਵੇਅ ਵਿੱਚ ਨਾ ਜਾਓ।\n2. ਹਮੇਸ਼ਾ ਸੱਜੇ ਪਾਸੇ ਰਹੋ ਅਤੇ 'ਇੰਟਰ-ਸਟੇਟ ਬੱਸ ਡੈੱਕ' ਦੇ ਹਰੇ ਬੋਰਡਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।\n3. ਕੇਂਦਰੀ ਐਸਕੇਲੇਟਰ ਰਾਹੀਂ ਸਿੱਧੇ ਲੈਵਲ 2 (ਬੇਅ 1-42) 'ਤੇ ਜਾਓ।\n4. ਜੇਕਰ ਮੈਟਰੋ ਗੇਟ ਦਿਖਣ ਤਾਂ ਤੁਰੰਤ 180° ਵਾਪਸ ਮੁੜੋ!",
    majnu: "ਮਜਨੂੰ ਕਾ ਟੀਲਾ ਪ੍ਰਾਈਵੇਟ ਵੋਲਵੋ ਹੱਬ ਆਈ.ਐਸ.ਬੀ.ਟੀ. ਕਸ਼ਮੀਰੀ ਗੇਟ ਤੋਂ ਲਗਭਗ 2.5 ਕਿਲੋਮੀਟਰ ਉੱਤਰ ਵੱਲ ਹੈ। ਮਨਾਲੀ, ਧਰਮਸ਼ਾਲਾ ਲਈ ਪ੍ਰਾਈਵੇਟ ਵੋਲਵੋ ਇੱਥੋਂ ਚੱਲਦੀਆਂ ਹਨ।",
    '550': "ਡੀਟੀਸੀ ਰੂਟ 550 ਕਸ਼ਮੀਰੀ ਗੇਟ ਤੋਂ ਮਹੀਪਾਲਪੁਰ ਨੂੰ ਜੋੜਦੀ ਹੈ। ਇਹ ਸਿਟੀ ਬੱਸ ਬੇਅ 41 ਤੋਂ ਹਰ 10 ਮਿੰਟ ਬਾਅਦ ਮਿਲਦੀ ਹੈ। ਕਿਰਾਇਆ ₹25 ਹੈ।",
    katra: "ਕਟੜਾ ਵੈਸ਼ਨੋ ਦੇਵੀ ਲਈ ਪਨਬੱਸ ਵੋਲਵੋ ਬੇਅ 12 ਤੋਂ ਸ਼ਾਮ 19:45 ਵਜੇ ਰਵਾਨਾ ਹੁੰਦੀ ਹੈ। ਕਿਰਾਇਆ ₹1,250 ਹੈ।",
    manali: "ਮਨਾਲੀ ਲਈ ਐਚ.ਆਰ.ਟੀ.ਸੀ. ਵੋਲਵੋ ਬੇਅ 14 ਤੋਂ ਰਾਤ 20:15 ਵਜੇ ਚੱਲਦੀ ਹੈ। ਕਿਰਾਇਆ ₹1,420 ਹੈ।",
    jaipur: "ਜੈਪੁਰ ਲਈ ਵੋਲਵੋ ਬੱਸ ਬੇਅ 08 ਤੋਂ ਸ਼ਾਮ 18:30 ਵਜੇ ਰਵਾਨਾ ਹੁੰਦੀ ਹੈ। ਕਿਰਾਇਆ ₹680 ਹੈ।",
    anand: "ਆਨੰਦ ਵਿਹਾਰ ਆਈ.ਐਸ.ਬੀ.ਟੀ. ਯੂ.ਪੀ. ਅਤੇ ਉੱਤਰਾਖੰਡ ਦੀਆਂ ਬੱਸਾਂ ਲਈ ਮੁੱਖ ਟਰਮੀਨਲ ਹੈ। ਬੇਅ 19 ਤੋਂ ਬੱਸ 202 ਸਿੱਧੀ ਜਾਂਦੀ ਹੈ।",
    cloakroom: "ਲੈਵਲ 1 ਪਿੱਲਰ 8 ਦੇ ਨੇੜੇ 24 ਘੰਟੇ ਸਮਾਨ ਰੱਖਣ ਲਈ ਕਲੋਕਰੂਮ ਉਪਲਬਧ ਹੈ। ਫੀਸ ₹30 ਪ੍ਰਤੀ ਬੈਗ ਹੈ।",
    greet: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਆਈ.ਐਸ.ਬੀ.ਟੀ. ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਬੱਸ ਪਲੇਟਫਾਰਮ, ਰੂਟ ਜਾਂ ਵੋਲਵੋ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
    default: (msg) => `ਮੈਂ "${msg}" ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਸਰਚ ਬਾਰ ਜਾਂ ਭੀੜ ਮੀਟਰ ਦੇਖ ਸਕਦੇ ਹੋ।`
  },
  bn: {
    metro: "⚠️ ভুল করে মেট্রো গেট ১ এবং ২ এ যাওয়া এড়ানোর নির্দেশিকা:\n\n১. আইএসবিটি প্রবেশের পর মেট্রো গেট ১ ও ২ এর দিকে যাওয়া পাতাল পথ ব্যবহার করবেন না।\n২. ডান দিকে থাকুন এবং 'ইন্টার-স্টেট বাস ডেক' নির্দেশক সবুজ সাইন অনুসরণ করুন।\n৩. কেন্দ্রীয় এস্কেলেটর দিয়ে সরাসরি লেভেল ২ (বে ১-৪২) এ যান।\n৪. মেট্রো গেট দেখলে সাথে সাথে ১৮০° ঘুরে দাঁড়ান!",
    majnu: "মজনু কা টিলা প্রাইভেট ভলভো স্ট্যান্ড কাশ্মীরি গেট থেকে প্রায় ২.৫ কিমি উত্তরে। এখান থেকে মানালি ও ধর্মশালার ভলভো ছাড়ে।",
    '550': "ডিটিসি রুট ৫৫০ কাশ্মীরি গেট থেকে মহিপালপুর সরাসরি যায়। বে ৪১ থেকে প্রতি ১০ মিনিটে ছাড়ে। ভাড়া ₹২৫।",
    katra: "কাটরা বৈষ্ণো দেবী ভলভো লেভেল ২, বে ১২ থেকে সন্ধ্যা ১৯:৪৫ এ ছাড়ে। ভাড়া ₹১,২৫০।",
    manali: "মানালি এইচআরটিসি ভলভো বে ১৪ থেকে রাত ২০:১৫ এ ছাড়ে। ভাড়া ₹১,৪২০।",
    jaipur: "জয়পুর আরএসআরটিসি ভলভো বে ০৮ থেকে সন্ধ্যা ১৮:৩০ এ ছাড়ে। ভাড়া ₹৬৮০।",
    anand: "আনন্দ বিহার আইএসবিটি ইউপি ও উত্তরাখণ্ডের বাসের মূল টার্মিনাল। বে ১৯ থেকে বাস ২০২ সরাসরি যায়।",
    cloakroom: "লেভেল ১ পিলার ৮ এর কাছে ২৪ ঘণ্টা ক্লকরুম ও লাগেজ স্টোরেজ সুবিধা রয়েছে। ফি প্রতি ব্যাগ ₹৩০।",
    greet: "নমস্কার! আমি আপনার আইএসবিটি এআই সহায়ক। আপনি বাস প্ল্যাটফর্ম, রুট বা ভলভো বাস সম্পর্কে জিজ্ঞাসা করতে পারেন।",
    default: (msg) => `আমি "${msg}" সম্পর্কিত তথ্যে আপনাকে সাহায্য করতে পারি। আপনি উপরের সার্চ বক্সে স্টেশন খুঁজতে পারেন।`
  },
  mr: {
    metro: "⚠️ मेट्रो गेट १ आणि २ कडे चुकून जाणे टाळण्यासाठी सूचना:\n\n१. आयएसबीटीमध्ये प्रवेश करताना मेट्रो गेट १ व २ कडे जाणाऱ्या सबवेमध्ये जाऊ नका.\n२. उजव्या बाजूला राहा आणि 'इंटर-स्टेट बस डेक' चे हिरवे फलक फॉलो करा.\n३. मध्यवर्ती एस्केलेटरने थेट लेव्हल २ (बे १-४२) वर जा.\n४. मेट्रो गेट्स दिसल्यास लगेच १८०° मागे फिरा!",
    majnu: "मजनू का टीला खाजगी व्होल्वो हब आयएसबीटी काश्मिरी गेटपासून २.५ किमी उत्तरेस आहे. मनाली, धर्मशालासाठी खाजगी व्होल्वो येथून सुटतात.",
    '550': "डीटीसी रूट ५५० काश्मिरी गेट ते महिपालपूर थेट जोडतो. बे ४१ वरून दर १० मिनिटांनी बस उपलब्ध आहे. भाडे ₹२५ आहे.",
    katra: "कटरा / वैष्णो देवीसाठी व्होल्वो बस लेव्हल २, बे १२ वरून संध्याकाळी १९:४५ वाजता सुटते. भाडे ₹१,२५० आहे.",
    manali: "मनालीसाठी एचआरटीसी व्होल्वो बे १४ वरून रात्री २०:१५ वाजता सुटते. भाडे ₹१,४२० आहे.",
    jaipur: "जयपूरसाठी आरएसआरटीसी व्होल्वो बे ०८ वरून संध्याकाळी १८:३० वाजता सुटते. भाडे ₹६८० आहे.",
    anand: "आनंद विहार आयएसबीटी यूपी आणि उत्तराखंड बसेसचे मुख्य केंद्र आहे. बे १९ वरून डीटीसी रूट २०२ थेट जाते.",
    cloakroom: "लेव्हल १ पिलर ८ जवळ २४ तास क्लॉकरूम आणि लगेज स्टोरेज उपलब्ध आहे. दर प्रति बॅग ₹३० (२४ तासांसाठी).",
    greet: "नमस्कार! मी तुमचा आयएसबीटी सहाय्यक आहे. तुम्ही बस प्लॅटफॉर्म, मार्ग किंवा खाजगी व्होल्वोबद्दल विचारू शकता.",
    default: (msg) => `मी "${msg}" बाबत मदत करू शकतो. आपण वरील शोध पट्टीमध्ये स्थानक शोधू शकता.`
  },
  ta: {
    metro: "⚠️ மெட்ரோ கேட் 1 & 2 க்கு தவறாக செல்வதைத் தவிர்க்க வழிகாட்டுதல்:\n\n1. ஐஎஸ்பிடி நுழைவாயிலில் இருந்து மெட்ரோ கேட் 1 மற்றும் 2 சுரங்கப்பாதைக்குள் செல்ல வேண்டாம்.\n2. வலதுபுறமாக சென்று 'இன்டர்-ஸ்டேட் பஸ் டெக்ஸ்' பச்சை பலகைகளைப் பின்தொடரவும்.\n3. எஸ்கலேட்டர் மூலம் நேரடியாக நிலை 2 (பே 1-42) க்குச் செல்லவும்.\n4. மெட்ரோ நுழைவுவாயில் கண்டால் உடனடியாக 180° திரும்பி வரவும்!",
    majnu: "மஜ்னு கா திலா தனியார் வோல்வோ நிலையம் காஷ்மீரி கேட்டில் இருந்து 2.5 கி.மீ வடக்கில் உள்ளது. மணாலி மற்றும் தர்மசாலா செல்லும் பேருந்துகள் இங்கிருந்து புறப்படுகின்றன.",
    '550': "டிடிசி பாதை 550 காஷ்மீரி கேட் முதல் மஹிபால்பூர் வரை இணைக்கிறது. பே 41 இல் இருந்து 10 நிமிடங்களுக்கு ஒரு முறை புறப்படுகிறது. கட்டணம் ₹25.",
    katra: "கத்ரா வைஷ்ணோ தேவி வோல்வோ பேருந்து நிலை 2, பே 12 இல் இருந்து மாலை 19:45 மணிக்கு புறப்படுகிறது. கட்டணம் ₹1,250.",
    manali: "மணாலி எச்ஆர்டிசி வோல்வோ பே 14 இல் இருந்து இரவு 20:15 மணிக்கு புறப்படுகிறது. கட்டணம் ₹1,420.",
    jaipur: "ஜெய்ப்பூர் ஆர்எஸ்ஆர்டிசி வோல்வோ பே 08 இல் இருந்து மாலை 18:30 மணிக்கு புறப்படுகிறது. கட்டணம் ₹680.",
    anand: "ஆனந்த் விஹார் ஐஎஸ்பிடி உத்தரபிரதேசம் மற்றும் உத்தரகாண்ட் பேருந்துகளுக்கான முக்கிய முனையம் ஆகும். பே 19 இலிருந்து பேருந்து 202 செல்கிறது.",
    cloakroom: "நிலை 1 பில்லர் 8 அருகே 24 மணி நேர லக்கேஜ் வைப்பகம் உள்ளது. கட்டணம் பை ஒன்றுக்கு ₹30.",
    greet: "வணக்கம்! நான் உங்கள் ஐஎஸ்பிடி பயண உதவியாளர். பேருந்து தளம் அல்லது வழித்தடங்கள் பற்றி என்னிடம் கேட்கலாம்.",
    default: (msg) => `"${msg}" தொடர்பாக நான் உங்களுக்கு உதவ முடியும். நீங்கள் மேலே உள்ள தேடல் பட்டியைப் பயன்படுத்தலாம்.`
  },
  te: {
    metro: "⚠️ మెట్రో గేట్ 1 & 2 లోకి పొరపాటున వెళ్లకుండా సూచనలు:\n\n1. ఐఎస్బీటీలోకి ప్రవేశించేటప్పుడు మెట్రో గేట్ 1 & 2 సబ్‌వేలోకి వెళ్లవద్దు.\n2. కుడి వైపున ఉంటూ 'ఇంటర్-స్టేట్ బస్ డెక్స్' పచ్చని బోర్డులను అనుసరించండి.\n3. ఎస్కలేటర్ ద్వారా నేరుగా లెవల్ 2 (బే 1-42) కు వెళ్లండి.\n4. మెట్రో గేట్లు కనిపిస్తే వెంటనే 180° వెనక్కి తిరగండి!",
    majnu: "మజ్ను కా తిలా ప్రైవేట్ వోల్వో హబ్ కాశ్మీరీ గేట్ నుండి 2.5 కి.మీ ఉత్తరాన ఉంది. మనాలీ బస్సులు ఇక్కడి నుంచే బయలుదేరుతాయి.",
    '550': "డీటీసీ రూట్ 550 కాశ్మీరీ గేట్ నుండి మహిపాల్‌పూర్‌కు వెళ్తుంది. బే 41 నుండి ప్రతి 10 నిమిషాలకు అందుబాటులో ఉంటుంది. ఛార్జీ ₹25.",
    katra: "కత్రా వైష్ణో దేవి వోల్వో బస్సు లెవల్ 2, బే 12 నుండి సాయంత్రం 19:45 కు బయలుదేరుతుంది. ఛార్జీ ₹1,250.",
    manali: "మనాలీ హెచ్‌ఆర్‌టీసీ వోల్వో బే 14 నుండి రాత్రి 20:15 కు బయలుదేరుతుంది. ఛార్జీ ₹1,420.",
    jaipur: "జైపూర్ వోల్వో బస్సు బే 08 నుండి సాయంత్రం 18:30 కు బయలుదేరుతుంది. ఛార్జీ ₹680.",
    anand: "ఆనంద్ విహార్ ఐఎస్బీటీ యుపి, ఉత్తరాఖండ్ బస్సులకు ప్రధాన టెర్మినల్. బే 19 నుండి బస్సు 202 నేరుగా వెళ్తుంది.",
    cloakroom: "లెవల్ 1 పిల్లర్ 8 వద్ద 24 గంటల లగేజ్ క్లోక్‌రూమ్ ఉంది. రుసుము ప్రతి బ్యాగ్‌కు ₹30.",
    greet: "నమస్కారం! నేను మీ ఐఎస్బీటీ సహాయకుడిని. బస్సు బే లేదా మార్గాల గురించి నన్ను అడగవచ్చు.",
    default: (msg) => `నేను "${msg}" లో మీకు సహాయం చేయగలను. మీరు పైన ఉన్న శోధన పట్టీని ఉపయోగించవచ్చు.`
  },
  gu: {
    metro: "⚠️ મેટ્રો ગેટ 1 અને 2 માં ભૂલથી જતા અટકવા માટેની સૂચનાઓ:\n\n1. આઇએસબીટીમાં પ્રવેશ કરતી વખતે મેટ્રો ગેટ 1 અને 2 તરફ જતા સબવેમાં ન જશો.\n2. હંમેશા જમણી બાજુ રહો અને 'ઇન્ટર-સ્ટેટ બસ ડેક્સ' ના લીલા બોર્ડને અનુસરો.\n3. સેન્ટ્રલ એસ્કેલેટર દ્વારા સીધા લેવલ 2 (બે 1-42) પર જાઓ.\n4. જો મેટ્રો ટર્નસ્ટાઇલ દેખાય તો તરત જ 180° પાછા વળો!",
    majnu: "મજનૂ કા ટીલા પ્રાઇવેટ વોલ્વો હબ કાશ્મીરી ગેટથી 2.5 કિમી ઉત્તરે છે. મનાલી અને ધર્મશાલાની ખાનગી વોલ્વો અહીંથી ઊપડે છે.",
    '550': "ડીટીસી રૂટ 550 કાશ્મીરી ગેટથી મહિપાલપુર જાય છે. સિટી બસ બે 41 પરથી દર 10 મિનિટે ઉપડે છે. ભાડું ₹25 છે.",
    katra: "કટરા વૈષ્ણોદેવી વોલ્વો લેવલ 2, બે 12 પરથી સાંજે 19:45 વાગ્યે ઉપડે છે. ભાડું ₹1,250 છે.",
    manali: "મનાલી એચઆરટીસી વોલ્વો બે 14 પરથી રાત્રે 20:15 વાગ્યે ઉપડે છે. ભાડું ₹1,420 છે.",
    jaipur: "જયપુર આરએસઆરટીસી વોલ્વો બે 08 પરથી સાંજે 18:30 વાગ્યે ઉપડે છે. ભાડું ₹680 છે.",
    anand: "આનંદ વિહાર આઇએસબીટી યુપી અને ઉત્તરાખંડની બસોનું મુખ્ય કેન્દ્ર છે. બે 19 થી બસ 202 સીધી જાય છે.",
    cloakroom: "લેવલ 1 પિલર 8 પાસે 24 કલાક લગેજ ક્લોકરૂમ ઉપલબ્ધ છે. પ્રતિ બેગ ભાડું ₹30 છે.",
    greet: "નમસ્તે! હું તમારો આઇએસબીટી એઆઈ સહાયક છું. તમે બસ સ્ટેન્ડ, રૂટ કે પ્લેટફોર્મ વિશે પૂછી શકો છો.",
    default: (msg) => `હું "${msg}" અંગે તમને મદદ કરી શકું છું. તમે ઉપરના સર્ચ બોક્સમાં પણ શોધી શકો છો.`
  },
  ur: {
    metro: "⚠️ میٹرو گیٹ 1 اور 2 میں غلطی سے داخل ہونے سے بچنے کی ہدایات:\n\n1. آئی ایس بی ٹی میں داخل ہوتے وقت میٹرو گیٹ 1 اور 2 کی طرف جانے والے زیر زمین سب وے میں نہ جائیں۔\n2. دائیں طرف رہیں اور 'انٹر اسٹیٹ بس ڈیکس' کے سبز بورڈز پر عمل کریں۔\n3. مرکزی ایسکلیٹر کے ذریعے براہ راست لیول 2 (بے 1-42) پر جائیں۔\n4. اگر آپ کو میٹرو گیٹ نظر آئیں تو فوراً 180 ڈگری پیچھے مڑیں!",
    majnu: "مجنوں کا ٹیلا پرائیویٹ وولوو اسٹینڈ کشمیری گیٹ سے تقریباً 2.5 کلومیٹر شمال میں ہے۔ منالی کے لیے وولوو بسیں یہیں سے روانہ ہوتی ہیں۔",
    '550': "ڈی ٹی سی بس روٹ 550 کشمیری گیٹ سے مہیپال پور کو جوڑتی ہے۔ بے 41 سے ہر 10 منٹ پر ملتی ہے۔ کرایہ ₹25 ہے۔",
    katra: "کٹرا ویشنو دیوی کے لیے وولوو بس لیول 2، بے 12 سے شام 19:45 بجے روانہ ہوتی ہے۔ کرایہ ₹1,250 ہے۔",
    manali: "منالی کے لیے ایچ آر ٹی سی وولوو بس بے 14 سے رات 20:15 بجے روانہ ہوتی ہے۔ کرایہ ₹1,420 ہے۔",
    jaipur: "جے پور کے لیے وولوو بس بے 08 سے شام 18:30 بجے روانہ ہوتی ہے۔ کرایہ ₹680 ہے۔",
    anand: "آنند وہار آئی ایس بی ٹی یوپی اور اتراکھنڈ کی بسوں کا مرکزی اڈہ ہے۔ بے 19 سے بس 202 سیدھی جاتی ہے۔",
    cloakroom: "لیول 1 ستون 8 کے قریب 24 گھنٹے کلوک روم اور سامان رکھنے کی سہولت ہے۔ چارج ₹30 فی بیگ ہے۔",
    greet: "خوش آمدید! میں آپ کا آئی ایس بی ٹی سفری معاون ہوں۔ آپ مجھ سے بس پلیٹ فارم یا روٹ کے بارے میں پوچھ سکتے ہیں۔",
    default: (msg) => `میں "${msg}" کے بارے میں آپ کی رہنمائی کر سکتا ہوں۔ آپ تلاش کا خانہ بھی استعمال کر سکتے ہیں۔`
  },
  fr: {
    metro: "⚠️ INSTRUCTIONS POUR ÉVITER D'ENTRER DANS LE MÉTRO PAR ERREUR :\n\n1. En entrant à l'ISBT, NE PRENEZ PAS le passage souterrain menant aux portes de métro 1 et 2 (Ligne Jaune).\n2. Restez à droite et suivez les panneaux lumineux verts 'INTER-STATE BUS DECKS'.\n3. Prenez l'escalier mécanique central ou la rampe Est vers le niveau 2 (Quais 1-42).\n4. Si vous voyez les portillons du métro, faites demi-tour immédiatement à 180° !",
    majnu: "Le terminal privé de bus Volvo de Majnu Ka Tila est situé à 2,5 km au nord d'ISBT Kashmere Gate le long de l'Outer Ring Road. Départs quotidiens pour Manali et Dharamshala.",
    '550': "La ligne DTC 550 relie directement Kashmere Gate à Mahipalpur Bypass. Départs du quai 41 toutes les 10 minutes. Tarif : 25 ₹.",
    katra: "Le bus Volvo PUNBUS pour Katra / Vaishno Devi part du niveau 2, Quai 12 à 19h45. Tarif : 1 250 ₹.",
    manali: "Le bus Volvo HRTC pour Manali part du Quai 14 à 20h15. Tarif : 1 420 ₹.",
    jaipur: "Le bus Volvo RSRTC pour Jaipur part du Quai 08 à 18h30. Tarif : 680 ₹.",
    anand: "ISBT Anand Vihar est le terminal principal pour l'Uttar Pradesh et l'Uttarakhand. Prenez la ligne DTC 202 depuis le quai 19.",
    cloakroom: "La consigne à bagages 24h/24 se trouve au niveau 1 près du pilier 8. Tarif : 30 ₹ par bagage / 24h.",
    greet: "Bonjour ! Je suis votre assistant de voyage IA pour l'ISBT Kashmere Gate. Comment puis-je vous aider ?",
    default: (msg) => `Je peux vous renseigner sur "${msg}". Vous pouvez rechercher des stations ou consulter l'odomètre d'affluence en direct.`
  },
  es: {
    metro: "⚠️ INSTRUCCIONES PARA EVITAR ENTRAR AL METRO POR ERROR:\n\n1. Al entrar a la terminal ISBT, NO TOME el paso subterráneo hacia las Puertas 1 y 2 del Metro (Línea Amarilla).\n2. Manténgase a la derecha y siga los letreros verdes iluminados 'INTER-STATE BUS DECKS'.\n3. Suba por la escalera mecánica central o rampa Este hacia el Nivel 2 (Andenes 1-42).\n4. ¡Si ve los torniquetes del Metro de Delhi, dé la vuelta 180° de inmediato!",
    majnu: "La estación privada de autobuses Volvo de Majnu Ka Tila se encuentra a 2.5 km al norte de ISBT Kashmere Gate. Salidas hacia Manali y Dharamshala.",
    '550': "La ruta DTC 550 conecta Kashmere Gate directamente con Mahipalpur. Sale del Andén 41 cada 10 minutos. Tarifa: ₹25.",
    katra: "El autobús Volvo a Katra / Vaishno Devi sale del Nivel 2, Andén 12 a las 19:45. Tarifa: ₹1,250.",
    manali: "El autobús Volvo HRTC a Manali sale del Andén 14 a las 20:15. Tarifa: ₹1,420.",
    jaipur: "El autobús Volvo RSRTC a Jaipur sale del Andén 08 a las 18:30. Tarifa: ₹680.",
    anand: "ISBT Anand Vihar es la terminal principal hacia Uttar Pradesh y Uttarakhand. Tome la ruta DTC 202 desde el andén 19.",
    cloakroom: "La consigna de equipaje 24 horas está en el Nivel 1 cerca del Pilar 8. Tarifa: ₹30 por maleta / 24 hrs.",
    greet: "¡Hola! Soy tu asistente de viaje con IA para ISBT Kashmere Gate. ¿En qué te puedo ayudar hoy?",
    default: (msg) => `Puedo ayudarte con "${msg}". Puedes buscar estaciones en la barra superior o ver el odómetro de congestión.`
  },
  de: {
    metro: "⚠️ ANWEISUNGEN ZUR VERMEIDUNG DER METRO-TORE 1 & 2:\n\n1. Beim Betreten des ISBT NICHT die Fußgängerunterführung zu den Metro-Toren 1 & 2 nehmen.\n2. Halten Sie sich rechts und folgen Sie den grünen Schildern 'INTER-STATE BUS DECKS'.\n3. Nehmen Sie die Rolltreppe direkt zu Ebene 2 (Bussteige 1-42).\n4. Wenn Sie U-Bahn-Schranken sehen, drehen Sie sich sofort um 180° um!",
    majnu: "Der private Volvo-Busbahnhof Majnu Ka Tila liegt 2,5 km nördlich von ISBT Kashmere Gate. Tägliche Fahrten nach Manali und Dharamshala.",
    '550': "DTC Buslinie 550 verbindet Kashmere Gate direkt mit Mahipalpur. Fährt alle 10 Min von Bussteig 41 ab. Fahrpreis: ₹25.",
    katra: "Der Volvo-Bus nach Katra / Vaishno Devi fährt von Ebene 2, Bussteig 12 um 19:45 Uhr ab. Fahrpreis: ₹1.250.",
    manali: "Der HRTC Volvo nach Manali fährt von Bussteig 14 um 20:15 Uhr ab. Fahrpreis: ₹1.420.",
    jaipur: "Der RSRTC Volvo nach Jaipur fährt von Bussteig 08 um 18:30 Uhr ab. Fahrpreis: ₹680.",
    anand: "ISBT Anand Vihar ist der Hauptknotenpunkt für Uttar Pradesh und Uttarakhand. DTC Linie 202 fährt von Bussteig 19.",
    cloakroom: "Die 24x7 Gepäckaufbewahrung befindet sich auf Ebene 1 bei Pfeiler 8. Gebühr: ₹30 pro Gepäckstück / 24 Std.",
    greet: "Guten Tag! Ich bin Ihr KI-Reiseassistent für das Terminal ISBT Kashmere Gate. Fragen Sie mich gerne!",
    default: (msg) => `Ich kann Ihnen bei "${msg}" helfen. Nutzen Sie das Suchfeld oder den Live-Stau-Odometer.`
  },
  en: {
    metro: "⚠️ EXACT INSTRUCTIONS TO AVOID ACCIDENTAL METRO GATES:\n\n1. When entering ISBT from Ring Road or Lothian Road, DO NOT take the underground pedestrian subway leading to Metro Gate 1 & 2 (Yellow Line).\n2. Keep right and follow the wide concourse corridor with the overhead illuminated green signs saying 'INTER-STATE BUS DECKS'.\n3. Take the central escalator or East Luggage Ramp directly up to Level 2 (Bays 1-42).\n4. If you see Delhi Metro AFC turnstiles, you are in the wrong place! Turn around 180° immediately.",
    majnu: "Majnu Ka Tila Private Volvo Hub is located just 2.5 km north of ISBT Kashmere Gate along the Outer Ring Road. Operators like Zingbus, IntrCity, Laxmi Holidays, and Northern Travels depart from here every evening for Manali, Dharamshala, and Kasol. You can click 'All Delhi Stations' or search 'Majnu Ka Tila' in the top search bar to navigate directly.",
    '550': "DTC Bus Route 550 connects ISBT Kashmere Gate directly to Mahipalpur Bypass via Red Fort, Delhi Gate, ITO, AIIMS, and Dhaula Kuan. Buses run every 10 minutes from City Bus Bay 41. Fare is ₹25 (AC). Click the 'Take me there' button on the map to begin.",
    katra: "PUNBUS Volvo sleeper coach to Katra / Vaishno Devi departs from Level 2 Interstate Deck, Bay 12 at 19:45 IST. Fare is ₹1,250. Click 'Bay 12: Katra Volvo' on the map for turn-by-turn guidance.",
    manali: "Manali HRTC Himsuta Volvo departs from Bay 14 at 20:15 IST. Fare is ₹1,420. Accessible ramp routing is available via the East Concourse.",
    jaipur: "RSRTC Gold Line Volvo to Jaipur departs from Bay 08 at 18:30 IST. Fare is ₹680.",
    anand: "ISBT Anand Vihar in East Delhi is the primary terminus for Uttar Pradesh (UPSRTC) and Uttarakhand (UTC) buses. You can take DTC Route 202 from Bay 19 at Kashmere Gate directly to Anand Vihar.",
    cloakroom: "The 24x7 Cloakroom & Luggage Storage is located on Level 1 Concourse near Pillar 8. Charge is ₹30/bag per 24 hours. A government photo ID is required.",
    greet: "Namaste! I am your ISBT Kashmere Gate AI Travel Companion. I can answer any doubts about bus bays, private Volvo stations, or how to avoid accidental Metro gates!",
    default: (msg) => `I can help with "${msg}". You can search any bus station in the top search box or open the Crowd Odometer sector to inspect live terminal passenger congestion.`
  }
};

function detectIntent(msg) {
  const q = (msg || '').toLowerCase();
  if (q.includes('metro') || q.includes('gate 1') || q.includes('gate1') || q.includes('avoid') || q.includes('wrong') ||
      q.includes('मेट्रो') || q.includes('गेट 1') || q.includes('गलत') || q.includes('सबवे') || q.includes('टर्नस्टाइल') ||
      q.includes('ਮੈਟਰੋ') || q.includes('গেটের') || q.includes('மெட்ரோ') || q.includes('మెట్రో')) {
    return 'metro';
  }
  if (q.includes('majnu') || q.includes('tila') || (q.includes('private') && q.includes('volvo')) ||
      q.includes('मजनू') || q.includes('टीला') || q.includes('प्राइवेट') || q.includes('ਮਜਨੂੰ') || q.includes('মজনু') ||
      q.includes('மஜ்னு') || q.includes('మజ్ను') || q.includes('zingbus') || q.includes('intrcity')) {
    return 'majnu';
  }
  if (q.includes('550') || q.includes('mahipalpur') || q.includes('airport') ||
      q.includes('महिपालपुर') || q.includes('हवाई') || q.includes('ਮਹੀਪਾਲਪੁਰ') || q.includes('মহিপালপুর') ||
      q.includes('மஹிபால்பூர்') || q.includes('మహిపాల్‌పూర్')) {
    return '550';
  }
  if (q.includes('katra') || q.includes('vaishno') || q.includes('कटरा') || q.includes('वैष्णो') ||
      q.includes('ਕਟੜਾ') || q.includes('কাটরা') || q.includes('கத்ரா') || q.includes('కత్రా') ||
      q.includes('bay 12') || q.includes('बे 12') || q.includes('ਪਲੇਟਫਾਰਮ 12')) {
    return 'katra';
  }
  if (q.includes('manali') || q.includes('hrtc') || q.includes('मनाली') ||
      q.includes('ਮਨਾਲੀ') || q.includes('মানালি') || q.includes('மணாலி') || q.includes('మనాలీ') ||
      q.includes('bay 14') || q.includes('बे 14')) {
    return 'manali';
  }
  if (q.includes('jaipur') || q.includes('rsrtc') || q.includes('जयपुर') ||
      q.includes('ਜੈਪੁਰ') || q.includes('জয়পুর') || q.includes('ஜெய்ப்பூர்') || q.includes('జైపూర్') ||
      q.includes('bay 8') || q.includes('बे 8') || q.includes('बे 08')) {
    return 'jaipur';
  }
  if (q.includes('anand vihar') || q.includes('anand') || q.includes('आनंद विहार') || q.includes('आनन्द विहार') ||
      q.includes('ਆਨੰਦ') || q.includes('আনন্দ') || q.includes('ஆனந்த்') || q.includes('ఆనంద్')) {
    return 'anand';
  }
  if (q.includes('cloakroom') || q.includes('luggage') || q.includes('locker') || q.includes('baggage') || q.includes('saman') ||
      q.includes('क्लॉकरूम') || q.includes('सामान') || q.includes('लॉकर') || q.includes('बैग') ||
      q.includes('ਸਮਾਨ') || q.includes('লাগেজ') || q.includes('लगेज') || q.includes('லக்கேஜ்') || q.includes('లగేజ్')) {
    return 'cloakroom';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('नमस्ते') || q.includes('ਸਤਿ') ||
      q.includes('নমস্কার') || q.includes('வணக்கம்') || q.includes('నమస్కారం') || q.includes('bonjour') || q.includes('hola') ||
      q.includes('hallo') || q.includes('help') || q.includes('madad') || q.includes('मदद') || q.includes('सहायता')) {
    return 'greet';
  }
  return 'default';
}

// Transit AI Chatbot Endpoint
app.post('/api/chat', (req, res) => {
  const { message, lang = 'en-IN' } = req.body;
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'A non-empty message is required' });
  }

  const langKey = (lang || 'en').split('-')[0].toLowerCase();
  const intent = detectIntent(message);
  const langPack = CHAT_RESPONSES[langKey] || CHAT_RESPONSES['en'];

  let reply = '';
  if (intent === 'default') {
    reply = typeof langPack.default === 'function' ? langPack.default(message) : CHAT_RESPONSES['en'].default(message);
  } else {
    reply = langPack[intent] || CHAT_RESPONSES['en'][intent];
  }

  res.json({ success: true, intent, language: langKey, reply });
});

// ==================== MULTILINGUAL AUDIO TTS ENDPOINT ====================

function chunkTextForTTS(str, maxLen = 140) {
  const cleaned = str
    .replace(new RegExp('[#*_' + String.fromCharCode(96) + '~>•]', 'g'), ' ')
    .replace(/⚠️|ℹ️|🚨|📍|🚌|🧭|🛑|🔊|📢/gu, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const chunks = [];
  const sentences = cleaned.split(/([।\.\n\?!;]+)/).filter(Boolean);
  let current = '';

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if ((current + s).length <= maxLen) {
      current += s;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (s.length > maxLen) {
        const words = s.split(/(\s+|,)/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + w).length <= maxLen) {
            wordChunk += w;
          } else {
            if (wordChunk.trim()) chunks.push(wordChunk.trim());
            wordChunk = w;
          }
        }
        current = wordChunk;
      } else {
        current = s;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

const ttsAudioCache = new Map();

app.get('/api/tts', async (req, res) => {
  try {
    const { text, lang = 'hi' } = req.query;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).send('Text parameter is required');
    }

    const langCode = lang.split('-')[0].toLowerCase();
    const cacheKey = `${langCode}:${text.trim()}`;

    if (ttsAudioCache.has(cacheKey)) {
      const cached = ttsAudioCache.get(cacheKey);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': cached.length,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.send(cached);
    }

    const chunks = chunkTextForTTS(text);
    if (chunks.length === 0) {
      return res.status(400).send('No valid text to synthesize');
    }

    const buffers = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(chunk)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`TTS upstream error: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffers.push(Buffer.from(arrayBuffer));
    }

    const combined = Buffer.concat(buffers);
    if (ttsAudioCache.size > 100) {
      const firstKey = ttsAudioCache.keys().next().value;
      ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, combined);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combined.length,
      'Cache-Control': 'public, max-age=86400'
    });
    res.send(combined);
  } catch (err) {
    console.error('Error generating TTS:', err.message);
    res.status(500).json({ error: 'Failed to synthesize audio', message: err.message });
  }
});

// HTML entry point
app.get('/', (_req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.sendFile(path.join(__dirname, 'html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ISBT Kashmere Gate Full-Stack Transit Server running on port http://localhost:${PORT}`);
  });
}

module.exports = app;
