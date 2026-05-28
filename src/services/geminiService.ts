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

export async function describeLyrics(lyrics: string, model: string = "gemini-3-flash-preview"): Promise<string> {
  if (!lyrics.trim()) {
    throw new Error("Lirik tidak boleh kosong.");
  }

  const prompt = `Uraikan secara detail, indah, dan mendalam kisah, jalan cerita, perasaan, dan pesan yang ada di dalam lirik lagu berikut ini.
  Jelaskan dengan sangat jelas lirik lagu ini menceritakan tentang drama kehidupan/cinta apa, emosi apa saja yang dirasakan tokohnya, serta inti pesan yang ingin disampaikan penyairnya.
  Rangkumlah penjelasan cerita dan makna tersebut menjadi tepat 3 paragraf dengan gaya bahasa Indonesia yang mengalir puitis, ekspresif, namun tetap lugas dan mudah dipahami. Soal ceritanya harus tergambar nyata dan menyentuh.

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
  instruments: string = ""
): Promise<{ title: string; lyrics: string; musicStyle: string }> {
  if (!originalLyrics.trim()) {
    throw new Error("Lirik asli tidak ditemukan.");
  }

  const prompt = `Berdasarkan lirik asli dan analisis berikut, buatlah sebuah JUDUL, lirik lagu BARU, dan DESKRIPSI STYLE MUSIK yang secara mendalam MENJIWAI dan MENGAMBIL RUH artistik dari pencipta lagu Indonesia: ${songwriter}. 

  Tugas Utama Anda:
  1. EMBODY THE SOUL: Anda harus benar-benar "menjadi" ${songwriter}. Gunakan "DNA" musik mereka, cara mereka memilih kata, dan cara mereka membangun emosi.
  2. Karakteristik Musik Terpilih:
     - Genre: ${genre}
     - Karakter Vokal: ${vocal}
     - Tempo: ${tempo}
     - Instrumen Utama: ${instruments || "Standar sesuai genre"}
     - Intro/Opening: ${introOpening || "Standar sesuai genre"}

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Aliran Musik Dalam Jiwa ${songwriter}:
  - SESUAIKAN GAYA: Meskipun genre-nya ${genre}, aransemennya harus memiliki "sentuhan" khas ${songwriter}. 
  - Pastikan diksi dan pemilihan kata mendukung nuansa ${genre}.
  - Sesuaikan gaya penulisan agar cocok dengan karakter vokal ${vocal} (misal: jika 'Bernafas' atau 'Sedih' dipilih, gunakan kalimat yang lebih emosional dan memberi ruang jeda nafas).
  - Tempo ${tempo} harus mempengaruhi ritme kata; tempo lambat membutuhkan kata-kata yang lebih panjang/dalam, sementara tempo cepat membutuhkan rima yang lebih dinamis.
  - Jika ada pilihan Instrumen (${instruments}), berikan penekanan pada instrumen tersebut dalam aransemen.
  - Jika ada pilihan Intro/Opening (${introOpening}), sertakan deskripsi awal dalam musik style atau arahkan penulisan lirik pembuka untuk menyesuaikan dengan ambience tersebut.

  Deskripsi Style Musik:
  - Berikan panduan aransemen musik yang detail meliputi instrumen utama, mood, dan cara membawakan lagu ini agar BENAR-BENAR MEREPRESENTASI JIWA ${songwriter} dalam parameter yang dipilih (${genre}, ${vocal}, ${tempo}, ${instruments}, ${introOpening}).
  - PENTING UNTUK NOSTALGIA SLOW ROCK MALAYSIA 90-AN: Jika genre mengandung "Slowrock" atau instrumental menggunakan "Slowrock Malaysia", deskripsi gaya musik HARUS dengan kuat menggambarkan karakteristik Slow Rock Malaysia era 90-an yang legendaris:
    1. Vokal bernada tinggi melengking emosional ("soaring high-pitched male, emotional high register chest voice vocal", "highly dramatic vocal belts with rich vibrato" atau versi female yang melengking sedu/ratapan emosional).
    2. Aransemen instrumen utama WAJIB menggunakan: Gitar Elektrik distorsi yang melengking sangat panjang, melodius, meratap dramatis (melodic screaming wailing electric guitar solo), Gitar Bass yang tebal mendukung harmonisasi, Drum dengan beat slow-rock yang mantap, dan Keyboard sebagai pengiring suasana atmosferik.
    3. Tempo lambat yang sarat kesedihan mendalam (slow rock tempo, around 70-80 BPM, 4/4 or 6/8 ballad measure).
    4. Suasana atmosferik yang dramatis dan mewah di bagian belakang sebagai latar (rich atmosphere backdrop, moody).
    5. UNTUK SLOWROCK: JANGAN PERNAH menggunakan unsur dangdut, koplo, kendang, atau beat perkusif cepat yang berlebihan. Fokus pada sustain gitar dan emosi vokal.
  - PENTING SANGAT KRITIS: JANGAN PERNAH menyebutkan NAMA TOKOH/PENCIPTA (${songwriter}), nama artis, atau nama band di dalam kotak deskripsi ini. Cukup JIWA DAN GAYA MEREKA saja yang dituangkan dalam deskripsi teknis musik, instrumen, dan suasana agar tidak diblokir sistem AI musik (seperti Suno/Udio).
  - PENTING SANGAT KRITIS: JANGAN PERNAH menggunakan kata "irama" (baik huruf kecil, besar, atau campuran, seperti "irama", "Irama", "IRAMA") di bagian deskripsi musik 'musicStyle' maupun tags. Gantikan kata tersebut selalu dengan kata lain seperti "ritme", "alunan", "tempo", "melodi", atau "beat". Suno/Udio menyensor kata "irama" karena dianggap merujuk ke artis "Rhoma Irama".
  - PENTING SANGAT KRITIS: JANGAN PERNAH menggunakan kata "cinematic", "string pads", "melancholic", "melankolis", or "strings pads" di bagian deskripsi musik maupun tags. Guanakan deskripsi suasana teknis lainnya.
  - PENTING: JANGAN PERNAH memasukkan kata "koplo", "dangdut", "kendang", "tabla", "percussive", "upbeat", atau unsur musik dangdut/melayu modern yang berlebihan jika genre yang dipilih adalah Slowrock. Hasil harus murni rock ballad/slow rock.
  - PENTING: Jika vokal '${vocal}' mengandung kata 'Male' atau 'Female', wajib mencantumkan identitas vokal tersebut (Male Vocal/Female Vocal) secara menyatu dalam narasi di baris pertama deskripsi. JANGAN gunakan kalimat pembuka kaku seperti "Lagu ini dibawakan oleh...". Gunakan gaya bahasa yang lebih puitis atau deskriptif langsung, contoh: "Suara seorang Female Vocal dengan karakter..." atau "Hadir dengan vokal Male yang..." agar mesin musik AI (seperti Suno/Udio) tetap bisa mengenali gender penyanyi dengan benar.
  - Sertakan bagaimana bagian Intro (${introOpening}) dan Instrumen (${instruments}) dimainkan secara detail.
  - PENTING: Jangan gunakan awalan kalimat seperti "Aransemen khas..." atau "Gaya musik...". Langsung saja jelaskan karakteristik musik secara naratif dan menyatu tanpa menyebut nama tokoh.
  - FORMAT DESKRIPSI WAJIB:
    Tulis deskripsi dalam 2 bagian dalam satu teks gabungan:
    1. Di paragraf pertama, berikan narasi puitis-teknis dalam bahasa Indonesia (maksimal 450 karakter).
    2. Di baris baru setelah paragraf tersebut, tambahkan kumpulan kata kunci/tag bahasa Inggris yang diapit dalam tanda kurung kuadrat agar dapat langsung dicopy-paste pengguna ke kolom model musik seperti Suno/Udio, misalnya: '[Suno/Udio Tags: 90s malay slow rock, malaysian slow rock ballad, soaring high-pitched emotional male vocal, wailing melodic electric guitar, analog production style, 75 bpm]'
  - PENTING: Maksimal keseluruhan deskripsi (termasuk tag) adalah 980 karakter.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik:
  1. Ambil esensi makna, emosi, dan pesan mendalam dari "Hasil Analisis Makna" (deskripsi), lalu ubah menjadi bait-bait lirik baru yang SANGAT MENJIWAI ${songwriter}.
  2. Gunakan gaya bahasa khas, diksi puitis, rima indah, dan estetika penulisan kalimat yang SANGAT SPESIFIK dari pencipta lagu ${songwriter} serta selaraskan dengan vibes dari genre ${genre} yang dipilih.
  3. Pastikan penataan rima dan baris lirik terasa "enak dinyanyikan" (singable), alami, dan memiliki aliran puitis yang menyatu dengan nafas vokal ${vocal} serta ritme tempo ${tempo}.
  4. Perhatikan struktur lagu khas mereka (seperti penempatan Chorus penentu atau Bridge klimaks yang emosional).
  5. MAKSUD DAN INTI PESAN LIRIK SEPERTI YANG DIJELASKAN DI HASIL ANALISIS MAKNA (DESKRIPSI) HARUS TETAP SAMA DENGAN ASLINYA, namun dibungkus secara segar, kreatif, dan berdaya puitis tinggi SESUAI KARAKTER KUAT ${songwriter}.
  6. STRUKTUR LIRIK (jumlah bait, urutan verse/chorus) dan JUMLAH KATA PER BARIS HARUS PERSIS SAMA DENGAN LIRIK ASLI. Hitunglah jumlah kata di setiap baris lirik asli, lalu buatlah baris lirik baru dengan jumlah kata yang sama persis agar melodi, rima, dan ritme lagu asli tetap bisa digunakan secara sempurna tanpa mengubah durasi ${duration}.
  7. INSTRUKSI MUSIK PER BAGIAN: Pada setiap label struktur lirik (seperti [Verse], [Chorus], [Bridge], dll), tambahkan instruksi musik di dalam kurung tepat di samping label tersebut. Instruksi harus mencakup: alat musik apa yang dominan, moods-nya bagaimana, karakter vocals-nya seperti apa, dan temponya bagaimana. Contoh: [Chorus (Gitar distorsi melengking, mood sangat emosional, vokal high-pitched, tempo stabil dramatis)].

  Panduan Khusus Tokoh (WAJIB DIIKUTI):
  - Jika Ahmad Dhani: Gunakan diksi filosofis, puitis, metafora cerdas, nuansa rock-intelek yang megah.
  - Jika Rhoma Irama: Gunakan sarkasme halus, pesan moral/dakwah, lugas namun berwibawa dan maskulin.
  - Jika Opick: Gunakan bahasa religi, spiritual, kontemplasi kehidupan, pilihan kata menyejukkan.
  - Jika Dody Kangen Band: Gunakan bahasa sederhana, sangat relate dengan kisah cinta rakyat jelata, pop melayu yang lugu.
  - Jika Melly Goeslaw: Gunakan bahasa imajinatif, metafora unik/tidak biasa, emosi meledak-ledak.
  - Jika Ariel NOAH: Gunakan bahasa puitis, metafora alam (hujan, angin, mimpi), kata-kata yang mengalir dinamis.
  - Jika Eros Candra: Gunakan bahasa lugas, bercerita (storytelling), kata-kata anak muda yang jujur dan apa adanya.
  - Jika Tulus: Gunakan bahasa elegan, diksi rapi, modern, minimalis namun bermakna dalam dan puitis modern.
  - Jika Youngky RM/Cecep AS/Deddy Dores: Gunakan gaya Pop-Rock/Slow-Rock melankolis era 80/90-an yang sangat dramatis dan menyayat hati.
  - Jika Pance Pondaag: Gunakan diksi lembut, manis, sederhana, pop nostalgia yang romantis.
  - Jika Saari Amri: Gunakan gaya melayu kental, puitis mendayu, kiasan kerinduan yang dalam.
  - Jika Teddy Riady: Gunakan kalimat kuat, berkarakter, cinta dewasa yang realistis.

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
    const cleanWord = (text: string) => {
      if (!text) return "";
      let cleaned = text.replace(/irama/gi, (match) => {
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
      return cleaned;
    };

    return {
      title: cleanWord(result.title),
      lyrics: cleanWord(result.lyrics),
      musicStyle: cleanWord(result.musicStyle)
    };
  } catch (error) {
    console.error("Error generating new lyrics:", error);
    throw new Error("Terjadi kesalahan saat membuat lirik baru. " + (error instanceof Error ? error.message : ""));
  }
}
