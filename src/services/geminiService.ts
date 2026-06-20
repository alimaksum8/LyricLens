import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Utility to extract JSON from a string that might contain markdown blocks or extra text.
 */
function extractJson(text: string): any {
  try {
    // Attempt direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Search for the first { and last } to isolate the JSON object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start !== -1 && end !== -1 && end > start) {
      const potentialJson = text.substring(start, end + 1);
      try {
        return JSON.parse(potentialJson);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON:", innerError);
      }
    }
    throw e; // Rethrow if extraction fails or is not found
  }
}

export async function describeLyrics(lyrics: string, songwriter: string, model: string = "gemini-3-flash-preview"): Promise<string> {
  if (!lyrics.trim()) {
    throw new Error("Lirik tidak boleh kosong.");
  }

  const prompt = `Uraikan secara detail, indah, dan mendalam kisah, jalan cerita, perasaan, dan pesan yang ada di dalam lirik lagu berikut ini.
  
  PENTING: Sesuaikan gaya penguraian, pilihan kata, sudut pandang, serta seluruh karakter bahasanya agar MEREPRESENTASI ciri khas bahasa yang mudah dipahami, mengalir indah, berjiwa/bernyawa hangat, penuh ketulusan emosi, sopan/santun, agung, serta elegan ciri khas pencipta lagu legendaris Indonesia: ${songwriter}. JADIKAN SEGALA DESKRIPSI INI BENAR-BENAR TERASA SEPERTI DITULIS OLEH SEORANG MANUSIA SASTRAWAN SEJATI (Bukan AI kaku!).
  
  PRINSIP BAHASA UNTUK SEMUA GAYA TOKOH:
  - MUDAH DIPAHAMI & MENGALIR: Sampaikan dengan diksi yang mudah dipahami oleh semua kalangan, mengalir alami bagai air, tidak rumit atau berberlit-belit, namun tetap berbobot rasa yang tinggi.
  - PUITIS & BERNYAWA: Gunakan diksi-diksi sastrawi yang menghanyutkan jiwa, bernyawa luhur, dan mampu mengetuk sanubari terdalam pembaca. Sampaikan setiap emosi duka maupun suka dengan bahasa yang megah, tulus, dan berbalut empati sastra yang tinggi.
  - SOPAN, SANTUN & ELEGAN: Hindari diksi kasar, murahan, datar, atau kaku. Gunakan susunan kalimat yang penuh rasa hormat, tulus, bermartabat, dan anggun dalam menafsirkan setiap rasa duka maupun suka.
  
  Petunjuk Spesifik Gaya Sastra Karakter Pencipta:
  - Jika ${songwriter} terkenal dengan diksi filosofis (seperti Ahmad Dhani): Buatlah analisis makna yang sangat puitis-metaforis cerdas, filosofis, berkelas, penuh kesopanan intelektual, dan bernyawa megah.
  - Jika terkenal dengan religi/spiritual (seperti Opick): Buatlah analisis kontemplatif, syahdu, penuh kerendahan hati yang agung, ramah bertutur santun, puitis religi, dan menyentuh sisi spiritualitas batin secara damai dan sopan.
  - Jika terkenal dengan emosi pilu/melow slow-rock (seperti Youngky RM/Deddy Dores/Saari Amri/Eddy Hamid): Buatlah analisis makna yang teramat dramatis, sangat pilu, menyayat hati, penuh duka atau rasa rindu membara yang sopan dan anggun, menggambarkan kehampaan asmara atau penantian setia yang syahdu, puitis murni, mengalir indah, jelas, lugas, dan sangat menyentuh rasa.
  - Jika terkenal dengan sederhana/rakyat jelata (seperti Dody Kangen Band): Sampaikan dengan bahasa yang sangat santun, tulus, jujur, bersahaja, puitis lugu, bernyawa polos namun menyentuh hati terdalam tanpa basa-basi murahan.
  - Sesuaikan sudut pandang bahasa tulisan dengan kepribadian artistik puitis nan beradab dari ${songwriter} terpilih.

  Jelaskan dengan sangat jelas lirik lagu ini menceritakan tentang drama kehidupan/cinta apa, emosi apa saja yang dirasakan tokohnya, serta inti pesan yang ingin disampaikan penyairnya.
  Rangkumlah penjelasan cerita dan makna tersebut menjadi tepat 3 paragraf dengan gaya bahasa Indonesia yang mengalir puitis, mudah dipahami semua orang, syahdu, bernyawa hangat, bebas dari kekakuan robotik, serta kental dengan roh kesopanan tutur rasa dari ${songwriter}. Penjelasannya harus terasa menyentuh kalbu.

  PENTING: Harap langsung masuk ke inti cerita lirik tanpa menggunakan kalimat pembuka template yang kaku (seperti "Lirik ini menceritakan tentang...", "Lirik tersebut menggabarkan...", "Lagu ini mengisahkan...", atau sejenisnya). Buatlah awal paragraf pertama langsung mengalir puitis secara natural.

  Lirik:
  ${lyrics}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Gagal mendapatkan deskripsi.";
  } catch (error) {
    console.error("Error describing lyrics:", error);
    throw new Error("Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.");
  }
}

export async function generateNewLyrics(
  originalLyrics: string, 
  analysis: string, 
  songwriter: string, 
  model: string = "gemini-3-flash-preview", 
  duration: string = "5mnt", 
  genre: string = "Slowrock",
  vocal: string = "Male",
  tempo: string = "80-100 BPM",
  introOpening: string = "",
  instruments: string = "",
  isDuet: boolean = false,
  referenceSong: string = ""
): Promise<{ title: string; lyrics: string; musicStyle: string }> {
  if (!originalLyrics.trim()) {
    throw new Error("Lirik asli tidak ditemukan.");
  }

  const prompt = `Berdasarkan lirik asli dan analisis berikut, buatlah sebuah JUDUL, lirik lagu BARU, dan DESKRIPSI STYLE MUSIK yang secara mendalam MENJIWAI dan MENGAMBIL RUH artistik dari pencipta lagu Indonesia: ${songwriter}. 

  ${referenceSong ? `
  WAJIB MEMATUHI ACUAN STRUKTUR & JUMLAH KATA (REFERENSI LAGU):
  - Pengguna meminta agar lirik baru dibuat dengan mengikuti acuan lagu: "${referenceSong}".
  - SANGAT PENTING DAN KRITIS: Anda wajib merekonstruksi bait lirik baru dengan struktur bait yang sama persis, pembagian bagian (seperti [Verse], [Chorus], [Bridge], [Outro], dll) yang identik, serta JUMLAH KATA PER BARIS yang sama persis dengan lagu "${referenceSong}".
  - Sebagai contoh, jika lagu acuan adalah "Nike Ardilla - Seberkas Sinar" (atau judul lagu lain yang ditulis), hitung dan tiru pola bait, jumlah baris, dan jumlah kata di setiap barisnya agar persis sama dengan lagu tersebut. Lagu baru harus bisa dinyanyikan langsung dan pas dengan ketukan, nada, dan melodi dari lagu acuan "${referenceSong}".
  - Gaya bahasa, diksi puitis, dan pesan rohaniah/jiwa lagunya tetap disulam secara indah sesuai karakter khas pencipta lagu ${songwriter}.
  ` : ''}

  Tugas Utama Anda:
  1. EMBODY THE SOUL: Anda harus benar-benar "menjadi" ${songwriter}. Gunakan "DNA" musik mereka, pilihan diksi puitis mereka, cara mereka merangkai kata dan emosi, struktur lagu khas mereka, hingga gaya aransemen musik instrumen yang mereka sukai. Seluruh lirik, bahasa deskripsi, struktur bait, dan gaya musik wajib berciri khas penciptanya sehingga bila dihasilkan di generator musik (seperti Suno, Yolli AI, Udio, dsb) akan memancarkan kentalnya aroma musik ciptaan ${songwriter}!
  2. Karakteristik Musik Terpilih:
     - Genre: ${genre}
     - Karakter Vokal: ${isDuet ? "Duet (Male and Female)" : vocal}
     - Tempo: ${tempo}
     - Instrumen Utama: ${instruments || "Standar sesuai genre"}
     - Intro/Opening: ${introOpening || "Standar sesuai genre"}
     - Mode Penyanyi: ${isDuet ? "Duet (Male & Female, saling menjawab secara seru/romantis/dramatis)" : "Solo (Lirik dirancang khusus untuk satu penyanyi saja)"}

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Aliran Musik Dalam Jiwa ${songwriter}:
  - SESUAIKAN GAYA: Meskipun genre-nya ${genre}, aransemennya harus memiliki "sentuhan" khas ${songwriter}. 
  - Pastikan diksi dan pemilihan kata mendukung nuansa ${genre}.
  - Sesuaikan gaya penulisan agar cocok dengan karakter vokal ${isDuet ? "Duet (Male and Female)" : vocal} (misal: jika 'Bernafas' atau 'Sedih' dipilih, gunakan kalimat yang lebih emosional dan memberi ruang jeda nafas; jika 'Mendayu khas slowrock malaysia' dipilih, sesuaikan lirik agar mendayu-dayu kental dengan kiasan kerinduan, kepedihan mendalam, rima puitis khas melayu slow-rock 90-an, dan memberi ruang bagi vokal meliuk melengking panjang dengan cengkok yang kuat).
  - Tempo ${tempo} harus mempengaruhi ritme kata; tempo lambat membutuhkan kata-kata yang lebih panjang/dalam, sementara tempo cepat membutuhkan rima yang lebih dinamis.
  - Jika ada pilihan Instrumen (${instruments}), berikan penekanan pada instrumen tersebut dalam aransemen.
  - Jika ada pilihan Intro/Opening (${introOpening}), sertakan deskripsi awal dalam musik style atau arahkan penulisan lirik pembuka untuk menyesuaikan dengan ambience tersebut.

  Deskripsi Style Musik (Wajib Mengacu Secara Akurat Pada Seluruh Pilihan Parameter Terpilih):
  - SANGAT PENTING: Deskripsi style musik harus secara nyata menyertakan, mencerminkan, dan mengintegrasikan seluruh parameter pilihan pengguna secara selaras berikut:
    1. Genre: '${genre}' (Deskripsikan aransemen yang merepresentasikan genre ini dengan balutan roh khas ${songwriter}).
    2. Intro Opening: '${introOpening || "Standar sesuai tempo"}' (Gambarkan suasana pembuka lagu wajib sejalan dengan pilihan ini).
    3. Instruments: '${instruments || "Standar instrumen pendukung"}' (Sebutkan alat-alat musik ini secara eksplisit dimainkan dalam deskripsi).
    4. Vocals: '${isDuet ? "Duet (Male & Female)" : vocal}' (Cantumkan karakter vokal ini, khususnya vokal/duet secara mendalam di baris pertama deskripsi).
    5. Tempo: '${tempo}' (Gambarkan kecepatan ritme drum dan alunan lagu yang sesuai dengan tempo ini).
    6. Target Durasi Lagu: '${duration}' (Atur alur deskripsi lagu—intro, verse, reff memuncak, bridge solo instrumen, hingga outro penutup—yang masuk akal untuk mencakup durasi ini).
  - Berikan panduan aransemen musik yang detail meliputi instrumen utama, mood, dan cara membawakan lagu ini agar BENAR-BENAR MEREPRESENTASI JIWA ${songwriter} dalam parameter yang dipilih (${genre}, ${isDuet ? "Male and Female Duet" : vocal}, ${tempo}, ${instruments}, ${introOpening}).
  - MENERAPKAN PARAMETER SECARA PENUH DAN AKURAT: Deskripsi gaya musik yang dihasilkan wajib disesuaikan secara presisi, nyata, dan harmonis dengan genre '${genre}', moods (suasana perasaan hati), vokal '${isDuet ? "Male & Female Duet" : vocal}', tempo '${tempo}', instrumen '${instruments}', dan intro '${introOpening}' terpilih.
  - PENTING UNTUK NOSTALGIA SLOW ROCK MALAYSIA 90-AN: Jika genre mengandung "Slowrock" atau instrumental menggunakan "Slowrock Malaysia", deskripsi gaya musik HARUS dengan kuat menggambarkan karakteristik Slow Rock Malaysia era 90-an yang legendaris:
    1. Vokal bernada tinggi melengking emosional ("soaring high-pitched male, emotional high register chest voice vocal", "highly dramatic vocal belts with rich vibrato" atau versi female yang melengking sedu/ratapan emosional).
    2. Aransemen instrumen utama WAJIB menggunakan: Gitar Elektrik distorsi yang melengking sangat panjang, melodius, meratap dramatis (melodic screaming wailing electric guitar solo), Gitar Bass yang tebal mendukung harmonisasi, Drum dengan beat slow-rock yang mantap, dan Keyboard sebagai pengiring suasana atmosferik.
    3. Tempo lambat yang sarat kesedihan mendalam (slow rock tempo, around 70-80 BPM, 4/4 or 6/8 ballad measure).
    4. Suasana atmosferik yang dramatis dan mewah di bagian belakang sebagai latar (rich atmosphere backdrop, moody).
    5. UNTUK SLOWROCK: JANGAN PERNAH menggunakan unsur dangdut, koplo, kendang, atau beat perkusif cepat yang berlebihan. Fokus pada sustain gitar dan emosi vokal.
  - PENTING SANGAT KRITIS: JANGAN PERNAH menyebutkan NAMA TOKOH/PENCIPTA (${songwriter}), nama artis, atau nama band di dalam kotak deskripsi ini. Cukup JIWA DAN GAYA MEREKA saja yang dituangkan dalam deskripsi teknis musik, instrumen, dan suasana agar tidak diblokir sistem AI musik (seperti Suno/Udio).
  - PENTING SANGAT KRITIS: JANGAN PERNAH menyebutkan kata "tulus" (baik huruf kecil, besar, atau campuran seperti "tulus", "Tulus", "TULUS") di dalam deskripsi style musik 'musicStyle' maupun tags agar tidak terblokir. Ganti dengan kata "penerimaan", "ikhlas", atau "jujur" jika maksudnya adalah ketulusan hati.
  - PENTING SANGAT KRITIS: JANGAN PERNAH menggunakan kata "irama" (baik huruf kecil, besar, atau campuran, seperti "irama", "Irama", "IRAMA") di bagian deskripsi musik 'musicStyle' maupun tags. Gantikan kata tersebut selalu dengan kata lain seperti "ritme", "alunan", "tempo", "melodi", atau "beat". Suno/Udio menyensor kata "irama" karena dianggap merujuk ke artis "Rhoma Irama".
  - PENTING SANGAT KRITIS: JANGAN PERNAH menggunakan kata "cinematic", "string pads", "melancholic", "melankolis", or "strings pads" di bagian deskripsi musik maupun tags. Guanakan deskripsi suasana teknis lainnya.
  - PENTING SANGAT KRITIS: JANGAN PERNAH menggunakan kata "laki-laki", "laki laki", "cowok", "wanita", "perempuan", "perempian", "cewek", atau "gadis" pada instruksi lirik maupun style musik. Selalu gunakan istilah bahasa Inggris "male" untuk laki-laki/cowok, dan "female" untuk wanita/perempuan/perempian/cewek/gadis.
  - PENTING: JANGAN PERNAH memasukkan kata "koplo", "dangdut", "kendang", "tabla", "percussive", "upbeat", atau unsur musik dangdut/melayu modern yang berlebihan jika genre yang dipilih adalah Slowrock. Hasil harus murni rock ballad/slow rock.
  - PENTING: Jika vokal '${isDuet ? "Male and Female Duet" : vocal}' mengandung kata 'Male' or 'Female', wajib mencantumkan identitas vokal tersebut (Male Vocal/Female Vocal) secara menyatu dalam narasi di baris pertama deskripsi. JANGAN gunakan kalimat pembuka kaku seperti "Lagu ini dibawakan oleh...". Gunakan gaya bahasa yang lebih puitis atau deskriptif langsung, contoh: "Suara seorang Female Vocal dengan karakter..." atau "Hadir dengan vokal Male yang..." agar mesin musik AI (seperti Suno/Udio/Yolli AI) tetap bisa mengenali gender penyanyi dengan benar.
  - VOKAL MENDAYU KHAS SLOWROCK MALAYSIA: Jika vokal '${vocal}' mengandung 'Mendayu khas slowrock malaysia', deskripsi aransemen HARUS menggambarkan vokal bernada tinggi yang melengking sedu, penuh cengkok khas yang meratap duka mendalam ("heart-wrenching emotional high register voice, authentic 90s malay slow-rock vocal ornaments, dramatic wailing vibrato, soulful sorrowful delivery").
  - VOCAL LAMBAT MENDAYU DAYU: Jika vokal '${vocal}' mengandung 'Vocal Lambat Mendayu Dayu', deskripsi aransemen wajib melukiskan ketukan vokal yang diperlambat secara dramatis, mengalun lembut mengayun panjang, syahdu dan penuh jeritan batin duka/romantis yang bertahan lama ("slow-tempo vocal delivery, dramatic sluggish emotional singing, lingering melodic lines, highly melancholic slow vocal notes").
  - SLAPBACK DELAY (GEMA PENDEK KLASIK): Jika vokal '${vocal}' mengandung 'Slapback Delay (Gema Pendek Klasik)', deskripsi wajib menyebutkan adanya efek gema pantulan pendek klasik retro yang tebal pada vokal ("vintage slapback delay on vocals, retro warm vocal echo, 50s-80s short vocal reflection, analog slap-back sound").
  - SINGLE TAP DELAY (GEMA TUNGGAL): Jika vokal '${vocal}' mengandung 'Single Tap Delay (Gema Tunggal)', deskripsi wajib menjelaskan adanya efek gema tunggal presisi dan bersih secara ritmis yang meluaskan dimensi ruang vokal ("single tap vocal delay, crisp discrete echo, clean rhythmic delay, spacious 1-tap repeat shadow").
  - Sertakan bagaimana bagian Intro (${introOpening}) dan Instrumen (${instruments}) dimainkan secara detail.
  - PENTING: Jangan gunakan awalan kalimat seperti "Aransemen khas..." atau "Gaya musik...". Langsung saja jelaskan karakteristik musik secara naratif dan menyatu tanpa menyebut nama tokoh.
  - FORMAT DESKRIPSI WAJIB:
    Tulis deskripsi dalam 2 bagian dalam satu teks gabungan:
    1. Di paragraf pertama, berikan narasi puitis-teknis dalam bahasa Indonesia (maksimal 450 karakter).
    2. Di baris baru setelah paragraf tersebut, tambahkan kumpulan kata kunci/tag bahasa Inggris yang diapit dalam tanda kurung kuadrat agar dapat langsung dicopy-paste pengguna ke kolom model musik seperti Suno/Udio/Yolli AI, misalnya: '[Suno/Udio Tags: 90s malay slow rock, malaysian slow rock ballad, soaring high-pitched emotional male vocal, wailing melodic electric guitar, analog production style, 75 bpm]'
  - PENTING: Maksimal keseluruhan deskripsi (termasuk tag) adalah 980 karakter.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal, indah, dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik (WAJIB BEBAS DARI KEKAKUAN AI, SANGAT PUITIS, MENGALIR ALAMI, DAN SOPAN):
  ${isDuet ? `
  - PENTING (ATURAN DUET SALING MENJAWAB / BERSAHUTAN - PERCAKAPAN DINAMIS): Karena mode duet diaktifkan, lirik yang dihasilkan WAJIB dijadikan DUET Male DAN Female yang interaktif, saling menjawab (bersahutan/dialog romantis/dramatis yang mengalir indah):
    1. Berikan label penyanyi/vokal yang jelas di awal baris atau bait menggunakan tanda kurung siku, misalnya: [Male Vocal], [Female Vocal], atau [Duet] (saat mereka bernyanyi bersama).
    2. Struktur lirik harus diatur sedemikian rupa sehingga bait atau baris yang dinyanyikan Male dijawab dengan harmonis oleh Female, atau sebaliknya, membentuk percakapan puitis yang alami, lugas, jelas, dan dinamis.
    3. Aliran dialog ini harus terintegrasi secara puitis, jujur, manis, sopan, dan berbobot rasa mendalam sesuai jiwa lagu asli.` : `
  - PENTING (ATURAN SOLO): Karena mode duet DINONAKTIFKAN, lirik yang dihasilkan WAJIB murni untuk penyanyi SOLO (hanya satu orang penyanyi, baik Male saja atau Female saja sesuai karakter vokal yang dipilih). JANGAN menambahkan label [Male Vocal] atau [Female Vocal] di dalam lirik. Lirik harus dirancang khusus untuk dibawakan secara solo secara utuh, jujur, manis, sopan, meresap jiwa oleh satu penyanyi.`}
  1. GAYA SANGAT PUITIS, BERNYAWA, DAN MENGALIR INDAH (HUMAN-LIKE LYRICS): Rangkailah bait-bait lirik yang puitis namun sederhana, mengalir sangat luwes secara alami, jelas, lugas, mudah diterima dan dipahami oleh semua kalangan, sopan, serta bernyawa kuat seolah-olah murni ditulis oleh pencipta lagu/sastrawan manusia sungguhan yang legendaris (bukan teks kaku robotik/AI).
  2. CONTOH STANDARD ALIRAN LIRIK YANG SANGAT INDAH, ALAMI, DAN DISUKAI AUDIENS (JADIKAN INI ACUAN KHUSUS):
     "Biarkan saja orang berkata,
     Hubungan kita berdua
     Tidak mungkin lama,
     Biarkan saja orang mengira,
     Cinta kasih sayang kita,
     Hanya sementara,
     Aku bersumpah demi Tuhan yang kuasa,
     Ku akan mencintamu selamanya,
     Aku berjanji sampai lepas nyawa ini,
     Aku hanya milikmu seutuhnya..."
  3. HAPUS KEKAKUAN AI (ANTI-AI CLICHES): JANGAN PERNAH memakai kata-kata yang terlalu kaku, lebay, atau dipaksakan (hindari metafora berat buatan AI seperti "menyulam kasih", "tiang doa", "istana dalam harapan", "lemparkan senyum", "badai kenyataan merubuhkan", "melangkah pasti", "gapai mimpi di angkasa", dll yang membuat kalimat terdengar aneh dan tidak enak dinyanyikan). Gunakan bahasa sehari-hari yang dikemas penuh jiwa, tulus, manis, sopan, dan jujur.
  4. EMOSI YANG SANGAT HIDUP DAN NYATA (DEEP EMOTIONAL RESONANCE):
     - Jika nuansa lagu SEDIH / PILU / LUKA / SEPI / KERINDUAN: Rangkailah bahasa yang menusuk sampai ke tulang, sangat pilu, bernyawa duka, dan menyayat hati, namun tetap diredam dengan kesopanan tata krama bahasa yang indah. Pendengar harus bisa langsung merasakan "sesak di dada", "kehampaan", "tangisan batin yang tertahan", dan "kerinduan yang membakar sepi". Jadikan liriknya benar-benar terasa nyata, mengalir, indah, dan menguras air mata dengan cara yang elegan.
     - Jika nuansa lagu BAHAGIA / OPTIMIS / SUKACITA / HARAPAN: Rangkailah bahasa yang hangat, membebaskan pikiran, riang gembira secara jujur tanpa kepura-puraan. Gunakan pilihan kata puitis nan anggun yang membuat pendengar ikut tersenyum lebar, merasakan jantung mereka berdebar gembira, dan menangkap pancaran kehangatan cinta/harapan sejati.
     - Jika nuansa lainnya (marah, misterius, kontemplatif): Sesuaikan pilihan kata agar getaran frekuensi suasana hati tersebut langsung merambat ke jiwa pendengar secara dramatis namun tetap disajikan lewat estetika bahasa yang sopan dan berkelas tinggi.
  5. PRINSIP KESOPANAN & KEBERNYAWAAN (SOPAN & BERNYAWA): Bahasa yang digunakan harus mencerminkan rasa hormat yang mendalam terhadap sastra dan seni. Jalinan kata harus dirajut penuh kesantunan, berwibawa, anggun, dan bernyawa luhur (bebas dari umpatan, diksi jalanan yang vulgar, atau kalimat murahan).
  6. Ambil esensi makna, emosi, dan pesan mendalam dari "Hasil Analisis Makna" (deskripsi), lalu ubah menjadi bait-bait lirik baru yang SANGAT MENJIWAI ${songwriter}.
  7. Gunakan gaya bahasa khas, diksi asli yang mengalir indah, rima merdu, dan estetika penulisan kalimat yang SANGAT SPESIFIK dari pencipta lagu ${songwriter} serta selaraskan dengan vibes dari genre ${genre} yang dipilih.
  8. KELUWESAN & KESELARASAN METRIK (SINGABLE & RHYTHMICAL - BEBAS KEKAKUAN):
     - JANGAN MEMAKSAKAN JUMLAH KATA YANG KAKU PER BARIS karena itu merusak keindahan lirik dan membuat kalimat terdengar aneh/dipaksakan.
     - Fokuskan pada KELUWESAN phrasing (nada pengucapan), rima akhir yang berdentang indah, jumlah suku kata (syllable length) yang terasa seimbang dengan lirik asli, dan alur vokal yang empuk serta alami saat dinyanyikan (highly singable).
     - Struktur bait, urutan Verse/Chorus/Bridge, dan penempatan Reff harus tetap harmonis mengalir seirama dengan lirik asli.
  9. Perhatikan struktur lagu khas mereka (seperti penempatan Chorus penentu atau Bridge klimaks yang emosional).
  10. MAKSUD DAN INTI PESAN LIRIK SEPERTI YANG DIJELASKAN DI HASIL ANALISIS MAKNA (DESKRIPSI) HARUS TETAP SAMA DENGAN ASLINYA, namun dibungkus secara segar, kreatif, mengalir, dan berdaya puitis tinggi SESUAI BAHASA DAN KARAKTER KUAT ${songwriter}.
  11. INSTRUKSI MUSIK PER BAGIAN (WAJIB SESUAIKAN DENGAN INPUT PARAMETER PILIHAN): Pada setiap label struktur lirik (seperti [Verse], [Chorus], [Bridge], [Outro], dll), tambahkan instruksi musik di dalam tanda kurung di samping label tersebut secara spesifik dan wajib didasarkan secara nyata pada seluruh pilihan parameter pengguna:
      - Genre: '${genre}'
      - Intro Opening: '${introOpening || "Sesuai lagu"}'
      - Instruments: '${instruments || "Sesuai lagu"}'
      - Vocals: '${isDuet ? "Duet (Male/Female)" : vocal}'
      - Tempo: '${tempo}'
      - PENTING SANGAT KRITIS: Dalam menuliskan instruksi vokal di label/instruksi musik per bagian, dilarang keras menggunakan kata "laki-laki", "cowok", "wanita", "perempuan", "perempian", "cewek", atau "gadis". Wajib menggunakan istilah "male" (untuk laki-laki/cowok) dan "female" (untuk wanita/perempuan/perempian/cewek/gadis).
      Contoh: [Verse (Genre: ${genre}, Vocals: ${isDuet ? "Male/Female Duet Saling Menyanyi" : vocal}, Tempo: ${tempo}, Dominasi: ${instruments || "Gitar/Piano"}${introOpening ? `, Opening: ${introOpening}` : ''}, Mood: Emosional Syahdu)] atau [Chorus (Genre: ${genre}, Vocals: ${isDuet ? "Duet Saling Bersahutan" : vocal}, Tempo: ${tempo}, Instrumen: Aransemen memuncak klimaks dengan ${instruments || "Gitar Elektrik"}, Mood: Dramatis Menyayat)]. JANGAN menggunakan contoh template kaku yang tidak sesuai dengan pilihan di atas. Seluruh label bait lirik harus konsisten memuat parameter terpilih tersebut.

  Panduan Khusus Tokoh (WAJIB DIIKUTI DENGAN DIKSI PUITIS, BERNYAWA, DAN SOPAN):
  - Jika Ahmad Dhani: Gunakan diksi filosofis, puitis, metafora cerdas yang megah, nuansa rock-intelek yang berbobot sastra tinggi, sopan, agung, dan bermartabat.
  - Jika Rhoma Irama: Gunakan pesan moral/dakwah yang sarat kebaikan, lugas namun berwibawa tinggi, bertutur sangat sopan, mendalam, puitis berbalut nasehat yang bersahaja, dan maskulin sejati.
  - Jika Opick: Gunakan bahasa religi dan spiritual yang bernapas keindahan ketakwaan, kontemplasi kehidupan fana, kata-kata yang menyejukkan hati, puitis syahdu, serta teramat sopan, ramah, dan menenangkan jiwa.
  - Jika Dody Kangen Band: Gunakan bahasa yang sederhana, sangat tulus, puitis dalam kepolosan rasa, bersahaja, sopan kental melayu romantis, serta mudah dipahami rakyat jelata namun berbobot rasa yang jujur dan menyentuh.
  - Jika Melly Goeslaw: Gunakan bahasa imajinatif, metafora unik/tidak biasa yang meletupkan rasa cinta agung, emosi mendalam namun luhur, puitis eksentrik yang memesona, tetap sopan, serta bernyawa kuat.
  - Jika Ariel NOAH: Gunakan bahasa puitis yang lembut mengalir bagai air, penuh analogi dan metafora keindahan alam (hujan, angin, mimpi, bintang, waktu, hening), kata-kata kontemplatif yang dinamis, bersahabat, tulus, dan sopan.
  - Jika Eros Candra: Gunakan bahasa lugas bercerita (storytelling), kata-kata yang jujur, santun, hangat, puitis realitas sehari-hari yang bernyawa akrab, bersahaja, dan mudah dipahami semua kalangan.
  - Jika Tulus: Gunakan bahasa elegan, diksi yang sangat rapi-bersih, modern-minimalis namun bernyawa dalam, puitis kekinian yang sopan bertata krama tinggi dan menenangkan kalbu. (Ingat: JANGAN PERNAH sebut kata "tulus" di bagian Deskripsi Style Musik/tags, gunakan padanan kata seperti "murni", "ikhlas", "jujur"!).
  - Jika Youngky RM/Cecep AS/Deddy Dores: Gunakan gaya Pop-Rock/Slow-Rock melankolis era 80/90-an yang teramat dramatis, pilu menyayat duka lara yang sarat kerinduan puitis yang sopan, bernyawa megah, dan menyentuh sisi duka terdalam manusia.
  - Jika Pance Pondaag: Gunakan diksi lembut, manis, puitis sederhana, bernyawa romantis pop nostalgia yang sangat hangat, ramah, dan sopan dalam mengekspresikan asmara.
  - Jika Saari Amri: Gunakan gaya Slow-Rock melankolis era 80/90-an yang sangat dramatis dan menyayat hati, melayu kental yang puitis mendayu-dayu penuh cengkok, kiasan kerinduan yang dalam, sopan bersahaja, dan penuh kepedihan yang bernyawa duka indah.
  - Jika Eddy Hamid: Gunakan karakter bahasa lirik yang dikreasi mengalir sangat indah, puitis, mudah dipahami audien, jelas, lugas, bersahaja namun berbobot emosional mendalam seperti karya legendarisnya "Rindu Serindu Rindunya" (oleh Spoon). Fokuskan pada tema rindu yang membara, penantian yang setia, kesucian asmara, kejujuran batin yang tulus-ikhlas, sopan, bernyawa kuat, dan tidak berbelit-belit. Hindari kata-kata kaku buatan AI. Musik khas ciptaannya harus diwarnai aransemen Melayu Slow-Rock 90-an melodius yang agung, dengan melodi gitar yang meraung syahdu melengking panjang merayu sepi, drum slow-rock mantap bertempo 70-80 BPM, dan vokal melengking tinggi penuh penyerahan perasaan yang meratap lembut mendayu.
  - Jika Teddy Riady: Gunakan kalimat kuat, berkarakter, cinta dewasa yang realistis, namun tetap tersampaikan lewat balutan diksi puitis yang sopan, tegap, dan bersahaja.

  Lirik Asli:
  ${originalLyrics}

  Analisis Makna:
  ${analysis}

  PENTING: Kembalikan jawaban dalam format JSON dengan struktur yang ditentukan.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Judul lagu baru"
            },
            lyrics: {
              type: Type.STRING,
              description: "Lirik lagu lengkap dengan struktur"
            },
            musicStyle: {
              type: Type.STRING,
              description: "Deskripsi style musik (maks 980 karakter)"
            }
          },
          required: ["title", "lyrics", "musicStyle"]
        }
      }
    });

    const result = extractJson(response.text || "{}");
    if (!result.title || !result.lyrics || !result.musicStyle) {
      throw new Error("Format respons AI tidak valid.");
    }
    
    // Programmatic filter to sanitize any accidental occurrences of forbidden terms to bypass filters
    const cleanWord = (text: string, isMusicStyle: boolean = false) => {
      if (!text) return "";
      let cleaned = text;
      
      if (isMusicStyle) {
        cleaned = cleaned.replace(/tulus/gi, (match) => {
          if (match === "TULUS") return "JUJUR";
          if (match === "Tulus") return "Jujur";
          return "jujur";
        });
      }

      cleaned = cleaned.replace(/irama/gi, (match) => {
        if (match === "IRAMA") return "RITME";
        if (match === "Irama") return "Ritme";
        return "ritme";
      });
      cleaned = cleaned.replace(/melancholic|melankolis|cinematic|string pads|strings pads/gi, "");
      cleaned = cleaned.replace(/melancholy/gi, "");
      cleaned = cleaned.replace(/koplo|dangdut|kendang|tabla/gi, "");
      cleaned = cleaned.replace(/labirin/gi, (match) => {
        if (match === "LABIRIN") return "LIQU";
        if (match === "Labirin") return "Liku";
        return "liku";
      });
      // Force Indonesian gender terms to be replaced with English 'male' and 'female'
      cleaned = cleaned.replace(/laki(-|\s)?laki|cowok/gi, (match) => {
        if (match === match.toUpperCase()) return "MALE";
        if (match[0] === match[0].toUpperCase()) return "Male";
        return "male";
      });
      cleaned = cleaned.replace(/wanita|perempuan|perempian|cewek|gadis/gi, (match) => {
        if (match === match.toUpperCase()) return "FEMALE";
        if (match[0] === match[0].toUpperCase()) return "Female";
        return "female";
      });
      return cleaned;
    };

    return {
      title: cleanWord(result.title),
      lyrics: cleanWord(result.lyrics),
      musicStyle: cleanWord(result.musicStyle, true)
    };
  } catch (error) {
    console.error("Error generating new lyrics:", error);
    throw new Error("Terjadi kesalahan saat membuat lirik baru. " + (error instanceof Error ? error.message : ""));
  }
}
