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

export async function generateNewLyrics(originalLyrics: string, analysis: string, songwriter: string, model: string = "gemini-3-flash-preview", duration: string = "5mnt"): Promise<{ title: string; lyrics: string }> {
  if (!originalLyrics.trim()) {
    throw new Error("Lirik asli tidak ditemukan.");
  }

  const prompt = `Berdasarkan lirik asli dan analisis berikut, buatlah sebuah JUDUL dan lirik lagu BARU dengan gaya penulisan khas dari pencipta lagu Indonesia: ${songwriter}.

  Target Durasi Lagu: ${duration}.
  PENTING: Aturlah panjang lirik agar pas dengan durasi ${duration} tersebut. Jika durasi cukup panjang (seperti 8-10 menit), Anda BOLEH menambahkan pengulangan Reff/Chorus (misal: [Chorus 2x]), menambahkan Bridge yang lebih panjang, atau menambahkan bagian [Interlude/Solo Instrument Representation] jika dirasa perlu untuk menambah estetika aliran lagu.

  Karakteristik Judul:
  1. Bahasa yang mudah dihafal dan lugas.
  2. Memiliki arti yang luas namun bikin penasaran.
  3. Terasa global dan bisa diterima oleh semua kalangan (anak-anak, muda-mudi, dewasa, rakyat kecil, elit politik, hingga akademis).

  Karakteristik Lirik:
  1. Gunakan ciri khas bahasa, diksi, dan penataan kalimat yang sangat spesifik dari ${songwriter}.
  2. Pastikan penataan bahasa "enak dinyanyikan" (singable), memiliki aliran yang pas dengan nafas penyanyi, dan rima yang tidak dipaksakan namun harmonis.
  3. Perhatikan struktur lagu khas mereka (seperti penempatan Chorus yang kuat atau Bridge yang emosional).
  4. Nuansa, nada kata, dan emosional harus identik dengan lirik aslinya namun dibalut dalam "jiwa" ${songwriter}.
  5. Struktur lirik lengkap sesuai durasi: [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro].

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
    "lyrics": "Lirik Lagu Lengkap Dengan Struktur Disini"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    if (!result.title || !result.lyrics) {
      throw new Error("Format respons AI tidak valid.");
    }
    return result;
  } catch (error) {
    console.error("Error generating new lyrics:", error);
    throw new Error("Terjadi kesalahan saat membuat lirik baru.");
  }
}
