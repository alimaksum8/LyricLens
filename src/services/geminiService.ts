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
  introOpening: string = "",
  instruments: string = ""
): Promise<{ title: string; lyrics: string; musicStyle: string }> {
  if (!originalLyrics.trim()) {
    throw new Error("Lirik asli tidak ditemukan.");
  }

  const prompt = `Berdasarkan lirik asli dan analisis berikut, buatlah sebuah JUDUL, lirik lagu BARU, dan DESKRIPSI STYLE MUSIK dengan gaya penulisan khas dari pencipta lagu Indonesia: ${songwriter}, dengan karakteristik musik sebagai berikut:
  - Genre: ${genre}
  - Karakter Vokal: ${vocal}
  - Tempo: ${tempo}
  - Instrumen Utama: ${instruments || "Standar sesuai genre"}
  - Intro/Opening: ${introOpening || "Standar sesuai genre"}

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Aliran Musik (Genre: ${genre}, Vokal: ${vocal}, Tempo: ${tempo}, Instrumen: ${instruments}, Intro: ${introOpening}):
  - Pastikan diksi dan pemilihan kata mendukung nuansa ${genre}.
  - Sesuaikan gaya penulisan agar cocok dengan karakter vokal ${vocal} (misal: jika 'Bernafas' atau 'Sedih' dipilih, gunakan kalimat yang lebih emosional dan memberi ruang jeda nafas).
  - Tempo ${tempo} harus mempengaruhi ritme kata; tempo lambat membutuhkan kata-kata yang lebih panjang/dalam, sementara tempo cepat membutuhkan rima yang lebih dinamis.
  - Jika ada pilihan Instrumen (${instruments}), berikan penekanan pada instrumen tersebut dalam aransemen.
  - Jika ada pilihan Intro/Opening (${introOpening}), sertakan deskripsi awal dalam musik style atau arahkan penulisan lirik pembuka untuk menyesuaikan dengan ambience tersebut.

  Deskripsi Style Musik:
  - Berikan panduan aransemen musik yang detail meliputi instrumen utama, mood, dan cara membawakan lagu ini agar sesuai dengan jiwa ${songwriter} dan parameter yang dipilih (${genre}, ${vocal}, ${tempo}, ${instruments}, ${introOpening}).
  - PENTING UNTUK NOSTALGIA SLOW ROCK MALAYSIA 90-AN: Jika genre mengandung "Slowrock" atau instrumental menggunakan "Slowrock Malaysia", deskripsi gaya musik HARUS dengan kuat menggambarkan karakteristik Slow Rock Malaysia era 90-an yang legendaris:
    1. Vokal bernada tinggi melengking emosional ("soaring high-pitched male, emotional high register chest voice vocal", "highly dramatic vocal belts with rich vibrato" atau versi female yang melengking sedu/ratapan emosional).
    2. Melodi gitar listrik distorsi yang melengking sangat panjang, melodius, meratap dramatis (melodic screaming wailing electric guitar solo).
    3. Tempo lambat yang sarat kesedihan mendalam (slow rock tempo, around 70-80 BPM, 4/4 or 6/8 ballad measure).
    4. Ketukan drum bercirikhas snare dengan wet reverb yang sangat tebal dan dramatis (huge 90s wet room reverb snare, power ballad drums).
    5. Sapuan keyboard string pads yang melankolis dan mewah di bagian belakang sebagai latar (orchestral synth string pads backdrop, moody atmosphere).
  - PENTING: JANGAN PERNAH menyebutkan nama tokoh/pencipta lagu (${songwriter}), nama artis, atau nama band manapun di dalam deskripsi ini. Gunakan hanya deskripsi teknis musik, instrumen, dan suasana (mood) saja agar tidak diblokir oleh sistem AI musik eksternal (seperti Suno/Udio).
  - PENTING: Jika vokal '${vocal}' mengandung kata 'Male' atau 'Female', wajib mencantumkan identitas vokal tersebut (Male Vocal/Female Vocal) secara menyatu dalam narasi di baris pertama deskripsi. JANGAN gunakan kalimat pembuka kaku seperti "Lagu ini dibawakan oleh...". Gunakan gaya bahasa yang lebih puitis atau deskriptif langsung, contoh: "Suara seorang Female Vocal dengan karakter..." atau "Hadir dengan vokal Male yang..." agar mesin musik AI (seperti Suno/Udio) tetap bisa mengenali gender penyanyi dengan benar.
  - Sertakan bagaimana bagian Intro (${introOpening}) dan Instrumen (${instruments}) dimainkan secara detail.
  - PENTING: Jangan gunakan awalan kalimat seperti "Aransemen khas..." atau "Gaya musik...". Langsung saja jelaskan karakteristik musik secara naratif dan menyatu tanpa menyebut nama tokoh.
  - FORMAT DESKRIPSI WAJIB:
    Tulis deskripsi dalam 2 bagian dalam satu teks gabungan:
    1. Di paragraf pertama, berikan narasi puitis-teknis dalam bahasa Indonesia (maksimal 450 karakter).
    2. Di baris baru setelah paragraf tersebut, tambahkan kumpulan kata kunci/tag bahasa Inggris yang diapit dalam tanda kurung kuadrat agar dapat langsung dicopy-paste pengguna ke kolom model musik seperti Suno/Udio, misalnya: '[Suno/Udio Tags: 90s malay slow rock, malaysian slow rock ballad, soaring high-pitched emotional male vocal, wailing melodic electric guitar, huge room wet reverb snare, analog production style, melancholy, 75 bpm]'
  - PENTING: Maksimal keseluruhan deskripsi (termasuk tag) adalah 980 karakter.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik:
  1. Gunakan ciri khas bahasa, diksi, dan penataan kalimat yang sangat spesifik dari ${songwriter}.
  2. Pastikan penataan bahasa "enak dinyanyikan" (singable), memiliki aliran yang pas dengan nafas penyanyi, dan rima yang tidak dipaksakan namun harmonis.
  3. Perhatikan struktur lagu khas mereka (seperti penempatan Chorus yang kuat atau Bridge yang emosional).
  4. MAKSUD DAN INTI PESAN LIRIK HARUS TETAP SAMA DENGAN ASLINYA, namun dibalut dalam "jiwa" ${songwriter}, genre ${genre}, vokal ${vocal}, dan tempo ${tempo}.
  5. STRUKTUR LIRIK (jumlah bait, urutan verse/chorus) dan JUMLAH KATA PER BARIS HARUS PERSIS SAMA DENGAN LIRIK ASLI. Hitunglah jumlah kata di setiap baris lirik asli, dan pastikan baris yang bersangkutan di lirik baru memiliki jumlah kata yang sama persis. Hal ini sangat penting agar melodi dan ritme lagu tetap bisa digunakan tanpa perubahan.

  Panduan Khusus Tokoh:
  - Jika Ahmad Dhani: Diksi filosofis, puitis, metafora cerdas, nuansa rock-intelek.
  - Jika Rhoma Irama: Sarkasme halus, pesan moral/dakwah, lugas namun berwibawa.
  - Jika Opick: Religi, spiritual, kontemplasi kehidupan, pilihan kata menyejukkan.
  - Jika Dody Kangen Band: Sederhana, sangat relate dengan kisah cinta rakyat jelata, pop melayu.
  - Jika Melly Goeslaw: Imajinatif, metafora unik/tidak biasa, emosi meledak-ledak.
  - Jika Ariel NOAH: Puitis, metafora alam (hujan, angin, mimpi), kata-kata yang mengalir.
  - Jika Eros Candra: Lugas, bercerita (storytelling), kata-kata anak muda yang jujur.
  - Jika Tulus: Elegan, diksi rapi, modern, minimalis namun bermakna dalam.
  - Jika Youngky RM/Cecep AS/Deddy Dores: Gaya Pop-Rock/Slow-Rock melankolis era 80/90-an yang dramatis.
  - Jika Pance Pondaag: Diksi lembut, manis, sederhana, pop nostalgia.
  - Jika Saari Amri: Gaya melayu kental, puitis, kiasan kerinduan.
  - Jika Teddy Riady: Kalimat kuat, berkarakter, cinta dewasa.

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
    return result;
  } catch (error) {
    console.error("Error generating new lyrics:", error);
    throw new Error("Terjadi kesalahan saat membuat lirik baru. " + (error instanceof Error ? error.message : ""));
  }
}
