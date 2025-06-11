from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

excel_data = None

@app.route("/upload", methods=["POST"])
def upload_file():
    global excel_data
    if 'file' not in request.files:
        return jsonify({"error": "Dosya bulunamadı"}), 400

    file = request.files['file']

    try:
        # Dosyanın içeriğini tüm satırlarıyla oku
        df_all = pd.read_excel(file, header=None)

        # Gerçek kolon başlıklarının olduğu satırı otomatik bul:
        header_row_index = None
        for i in range(len(df_all)):
            row = df_all.iloc[i].astype(str).str.lower()
            if "hesap" in row.to_string().lower() and "borç" in row.to_string().lower():
                header_row_index = i
                break

        if header_row_index is None:
            return jsonify({"error": "Gerçek sütun başlıkları bulunamadı."}), 400

        # O satırı başlık olarak tekrar oku
        file.seek(0)  # dosyayı başa sar
        df = pd.read_excel(file, header=header_row_index)
        df = df.replace({pd.NA: None})

        excel_data = df

        return jsonify({"message": "Excel başarıyla okundu", "columns": df.columns.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-data", methods=["POST"])
def get_data_by_hesap_kodu():
    global excel_data

    try:
        if excel_data is None:
            return jsonify({"error": "Excel verisi yüklenmemiş."}), 400

        print("Veri çerçevesi sütunları:", excel_data.columns.tolist())

        requested_codes = request.json.get("codes", [])
        excel_data.columns = excel_data.columns.str.strip().str.lower()

        if "hesap kodu" not in excel_data.columns:
            return jsonify({"error": "'Hesap Kodu' sütunu bulunamadı."}), 400

        filtered = excel_data[
            excel_data["hesap kodu"].astype(str).isin([str(code) for code in requested_codes])
        ]

        return jsonify(filtered.to_dict(orient="records"))

    except Exception as e:
        print("Hata:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
