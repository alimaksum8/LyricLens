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
  - Genre: ${genre}
  - Karakter Vokal: ${vocal}
  - Tempo: ${tempo}
  - Intro/Opening: ${introOpening || "Standar sesuai genre"}

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Aliran Musik (Genre: ${genre}, Vokal: ${vocal}, Tempo: ${tempo}, Intro: ${introOpening}):
  - Pastikan diksi dan pemilihan kata mendukung nuansa ${genre}.
  - Sesuaikan gaya penulisan agar cocok dengan karakter vokal ${vocal} (misal: jika 'Bernafas' atau 'Sedih' dipilih, gunakan kalimat yang lebih emosional dan memberi ruang jeda nafas).
  - Tempo ${tempo} harus mempengaruhi ritme kata; tempo lambat membutuhkan kata-kata yang lebih panjang/dalam, sementara tempo cepat membutuhkan rima yang lebih dinamis.
  - Jika ada pilihan Intro/Opening (${introOpening}), sertakan deskripsi awal dalam musik style atau arahkan penulisan lirik pembuka untuk menyesuaikan dengan ambience tersebut.

  Deskripsi Style Musik:
  - Berikan panduan aransemen musik yang detail meliputi instrumen utama, mood, dan cara membawakan lagu ini agar sesuai dengan jiwa ${songwriter} dan parameter yang dipilih (${genre}, ${vocal}, ${tempo}, ${introOpening}).
  - PENTING: JANGAN PERNAH menyebutkan nama tokoh/pencipta lagu (${songwriter}), nama artis, atau nama band manapun di dalam deskripsi ini. Gunakan hanya deskripsi teknis musik, instrumen, dan suasana (mood) saja. Hal ini penting agar deskripsi tidak diblokir oleh sistem AI musik eksternal (seperti Suno/Udio).
  - PENTING: Jika vokal '${vocal}' mengandung kata 'Male' atau 'Female', wajib mencantumkan identitas vokal tersebut (Male Vocal/Female Vocal) secara menyatu dalam narasi di baris pertama deskripsi. JANGAN gunakan kalimat pembuka kaku seperti "Lagu ini dibawakan oleh...". Gunakan gaya bahasa yang lebih puitis atau deskriptif langsung, contoh: "Suara seorang Female Vocal dengan karakter..." atau "Hadir dengan vokal Male yang..." agar mesin musik AI (seperti Suno/Udio) tetap bisa mengenali gender penyanyi dengan benar.
  - Sertakan bagaimana bagian Intro (${introOpening}) dimainkan secara detail.
  - PENTING: Jangan gunakan awalan kalimat seperti "Aransemen khas..." atau "Gaya musik...". Langsung saja jelaskan karakteristik musik secara naratif dan menyatu tanpa menyebut nama tokoh.
  - PENTING: Maksimal 980 karakter.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik:
  1. Gunakan ciri khas bahasa, diksi, dan penataan kalimat yang sangat spesifik dari ${songwriter}.
  2. Pastikan penataan bahasa "enak dinyanyikan" (singable), memiliki aliran yang pas dengan nafas penyanyi, dan rima yang tidak dipaksakan namun harmonis.
  3. Perhatikan struktur lagu khas mereka (seperti penempatan Chorus yang kuat atau Bridge yang emosional).
  4. Nuansa, nada kata, dan emosional harus identik dengan lirik aslinya namun dibalut dalam "jiwa" ${songwriter}, genre ${genre}, vokal ${vocal}, dan tempo ${tempo}.
  5. PENTING: Lirik baru harus memiliki struktur yang SANGAT IDENTIK dengan lirik asli. Pertahankan jumlah baris, urutan bait, dan yang paling penting: PERTAHANKAN JUMLAH KATA PER BARIS (atau mendekati) agar ritme dan meter lagu tidak berubah drastis dari aslinya.
  6. Jangan melakukan perubahan radikal pada struktur kalimat; lakukan interpretasi artistik (parafrase) yang mendekati pilihan kata lirik asli namun dengan sentuhan gaya ${songwriter}.

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
