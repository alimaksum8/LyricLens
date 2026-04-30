import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function describeLyrics(lyrics: string, model: string = "gemini-3-flash-preview"): Promise<string> {
  if (!lyrics.trim()) {
    throw new Error("Lirik tidak boleh kosong.");
  }

  const prompt = `Jelaskan secara detail keseluruhan isi lirik lagu berikut ini. 
  Berikan analisis mendalam tentang makna, emosi, dan pesan yang ingin disampaikan.
  Tugas Anda adalah merangkum penjelasan tersebut menjadi tepat 3 paragraf.
  Gunakan bahasa Indonesia yang mengalir, ekspresif, dan puitis namun tetap lugas.

  PENTING: Jangan gunakan kalimat pembuka seperti "Lirik ini melukiskan...", "Lirik tersebut menggambarkan...", atau sejenisnya. Langsung saja masuk ke inti pembahasan dengan gaya bahasa yang natural dan tidak kaku.

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
  introOpening: string = ""
): Promise<{ title: string; lyrics: string; musicStyle: string }> {
  if (!originalLyrics.trim()) {
    throw new Error("Lirik asli tidak ditemukan.");
  }

  const prompt = `Berdasarkan lirik asli dan analisis berikut, buatlah sebuah JUDUL, lirik lagu BARU, dan DESKRIPSI STYLE MUSIK dengan gaya penulisan khas dari pencipta lagu Indonesia: ${songwriter}, dengan karakteristik musik sebagai berikut:
  - Genre Utama (WAJIB DIPATUHI): ${genre}
  - Karakter Vokal: ${vocal}
  - Tempo: ${tempo}
  - Intro/Opening: ${introOpening || "Standar sesuai genre"}

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Aliran Musik (Genre Utama: ${genre}, Vokal: ${vocal}, Tempo: ${tempo}, Intro: ${introOpening}):
  - PENTING: Prioritaskan Genre Utama (${genre}) di atas segalanya. Jika gaya penulisan ${songwriter} biasanya berbeda dengan genre ${genre} (misal: pencipta lagu/tokoh biasanya Dangdut/Pop tapi dipilih Rock), maka gunakan hanya gaya penulisan liriknya (diksi/rima/mood) saja. ARANSEMEN MUSIK HARUS 100% MURNI ${genre}.
  - DILARANG KERAS menyertakan elemen, instrumen, atau istilah dari genre Dangdut, Koplo, Keroncong, Melayu, atau musik tradisional lainnya jika genre yang dipilih adalah Rock, Pop, Metal, atau EDM. JANGAN sebutkan "Kendang", "Suling", "Tabuhan", "Cengkok", atau "Dendang" kecuali jika ${genre} memang genre tersebut.
  - Jika genre adalah 'Rock' atau 'Slow Rock', pastikan ada deskripsi tentang 'Distorted Electric Guitar', 'Aggressive/Emotional Drums', dan 'Driving Bass'. 
  - KHUSUS Genre 'Slow Rock' (terutama gaya Malaysia/Indonesia 90-an): Wajib sertakan elemen 'Crying lead guitar solo' yang mendayu, 'Heavy keyboard/synth pads' untuk atmosfer megah, dan vokal yang memiliki 'high-pitched emotive delivery'.
  - Jika 'Pop', pastikan ada 'Piano', 'Synthesizer', atau 'Clean Guitar'.
  - Sesuaikan gaya penulisan agar cocok dengan karakter vokal ${vocal}. Dekripsikan vokal secara teknis: jika 'Male/Female', jelaskan apakah suaranya berat (deep), serak (raspy), bersih (clean), berpuncak tinggi (high-pitched), atau berbisik (airy/breathy).
  - PENTING: Jika vokal mengandung 'No Effects Reverb' atau 'Vocals Bersih', pastikan deskripsi menggunakan kata kunci 'Dry', 'Raw', 'Unprocessed', 'Clean', dan 'Direct' untuk vokal tersebut.
  - PENTING: Untuk musik dan vokal secara umum, gunakan pendekatan "RAW & DRY PRODUCTION" jika parameter mendukung. Hindari penggunaan efek reverb, delay, atau echo yang berlebihan di dalam deskripsi. Tekankan pada suara yang 'Natural', 'Organic', dan 'Dry' agar terdengar jujur dan tanpa polesan efek elektronik.
  - Tempo ${tempo} harus mempengaruhi ritme kata.
  - Jika ada pilihan Intro/Opening (${introOpening}), sertakan deskripsi awal dalam musik style sesuai instrumen pendukung genre ${genre}.

  Deskripsi Style Musik:
  - Berikan panduan aransemen musik yang detail dan dinamis untuk SETIAP BAGIAN lagu (Intro, Verse, Chorus, Bridge, Outro).
  - PENTING: Deskripsi vokal di baris pertama HARUS mendalam dan tekankan pada 'Dry vocals' (vokal tanpa efek). Gunakan kata kunci tekstur suara yang dipahami AI musik (seperti: 'Dry vocal with raspy texture', 'Natural clean pop vocals', 'Organic high pitched voice', 'Direct emotional delivery') agar identitas vokal '${vocal}' konsisten dan jernih.
  - PENTING: Deskripsi ini HARUS menjadi dasar atau "blueprint" yang sinkron dengan instruksi metadata yang Anda tulis di dalam kurung pada label struktur lirik (misal: jika di deskripsi menyebutkan "Chorus yang meledak dengan distorsi", maka label lirik harus [Chorus (Distorted Guitar, ...)]).
  - Jelaskan pergeseran intensitas instrumen (misal: "Verse tenang dengan piano, Chorus meledak dengan distorsi gitar dan drum yang dinamis") agar sesuai dengan genre ${genre}.
  - PENTING: JANGAN PERNAH menyebutkan nama tokoh/pencipta lagu (${songwriter}), nama artis, atau nama band manapun di dalam deskripsi ini. Gunakan hanya deskripsi teknis musik, instrumen, dan suasana (mood) saja. Hal ini penting agar deskripsi tidak diblokir oleh sistem AI musik eksternal (seperti Suno/Udio).
  - PENTING: Jika vokal '${vocal}' mengandung kata 'Male' atau 'Female', wajib mencantumkan identitas vokal tersebut secara menyatu dalam narasi di baris pertama deskripsi.
  - Sertakan bagaimana bagian Intro (${introOpening}) dimainkan secara detail sesuai estetika ${genre}.
  - PENTING: Jangan gunakan awalan kalimat seperti "Aransemen khas..." atau "Gaya musik...". Langsung saja jelaskan karakteristik musik secara naratif dan menyatu tanpa menyebut nama tokoh.
  - PENTING: Maksimal 980 karakter.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik:
  1. Gunakan ciri khas bahasa, diksi, dan penataan kalimat yang sangat spesifik dari ${songwriter}.
  2. Struktur lirik HARUS menyertakan label struktur yang jelas (seperti [Intro], [Verse 1], [Chorus], [Bridge], [Outro]).
  3. PENTING: Di SETIAP label struktur, tambahkan instruksi singkat berupa metadata musik (Alat Musik utama, Vocal style, dan Tempo spesifik bagian itu) di dalam kurung. Contoh: [Chorus (Distorted Guitar, Emotive High Vocals, Up-tempo)]. Pastikan metadata ini 100% sinkron dan konsisten dengan apa yang Anda tulis di Deskripsi Style Musik.
  4. Pastikan penataan bahasa "enak dinyanyikan" (singable) dan memiliki aliran yang pas dengan nafas penyanyi.
  5. Nuansa, nada kata, dan emosional harus identik dengan lirik aslinya namun dibalut dalam "jiwa" ${songwriter}, genre ${genre}, vocal ${vocal}, dan tempo ${tempo}.
  6. Struktur lirik HARUS mengikuti pola dan struktur yang identik dengan lirik asli namun disesuaikan dengan target durasi: ${duration}.
  7. PENTING: JANGAN gunakan kata "Powerful" dalam instruksi vokal atau deskripsi musik. Gunakan istilah lain seperti "Emotive", "Soulful", "Raw", "Clean", atau "Gritty" untuk menjaga variasi.

  Panduan Khusus Tokoh:
  - Jika Youngky RM/Cecep AS/Deddy Dores: Gaya Pop-Rock/Slow-Rock melankolis era 80/90-an yang dramatis.
  - Jika Pance Pondaag: Diksi lembut, manis, sederhana, pop nostalgia.
  - Jika Saari Amri: Gaya melayu kental, puitis, kiasan kerinduan.
  - Jika Teddy Riady: Kalimat kuat, berkarakter, cinta dewasa.

  Lirik Asli:
  ${originalLyrics}

  Analisis Makna:
  ${analysis}

  PENTING: Kembalikan jawaban dalam format JSON mentah (tanpa markdown block) dengan struktur:
  {
    "title": "Judul Lagu Disini",
    "lyrics": "Lirik Lagu Lengkap Dengan Struktur Disini",
    "musicStyle": "Deskripsi Style Musik Disini (Maks 980 Karakter)"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    if (!result.title || !result.lyrics || !result.musicStyle) {
      throw new Error("Format respons AI tidak valid.");
    }
    return result;
  } catch (error) {
    console.error("Error generating new lyrics:", error);
    throw new Error("Terjadi kesalahan saat membuat lirik baru.");
  }
}
