"use client";
import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [hesapKodu, setHesapKodu] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Excel dosyası yükle
  const handleFileUpload = async () => {
    if (!file) {
      setMessage("Lütfen bir dosya seçin");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Dosya başarıyla yüklendi.");
      } else {
        setMessage("Yükleme hatası: " + result.error);
      }
    } catch (err) {
      setMessage("Yükleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Hesap koduna göre veri çek
  const handleGetData = async () => {
    if (!hesapKodu) {
      setMessage("Lütfen bir hesap kodu girin.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/get-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codes: [hesapKodu] }),
      });

      const result = await res.json();

      if (res.ok) {
        setData(result);
        setMessage("Veri başarıyla alındı.");
      } else {
        setMessage("Hata: " + result.error);
      }
    } catch (err) {
      setMessage("Veri çekilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Excel Yükleme ve Hesap Kodu Sorgulama</h1>

      <div style={{ marginTop: 16 }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? "Yükleniyor..." : "Excel Yükle"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <input
          type="text"
          placeholder="Hesap Kodu"
          value={hesapKodu}
          onChange={(e) => setHesapKodu(e.target.value)}
        />
        <button onClick={handleGetData} disabled={loading}>
          {loading ? "Sorgulanıyor..." : "Verileri Getir"}
        </button>
      </div>

      {message && <p style={{ marginTop: 16 }}>{message}</p>}

      {data.length > 0 && (
        <table border="1" style={{ marginTop: 24, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} style={{ padding: 8 }}>
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((value, i) => (
                  <td key={i} style={{ padding: 8 }}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
