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
        df = pd.read_excel(file)
        df = df.replace({np.nan: None})
        excel_data = df
        return jsonify({"message": "Dosya başarıyla yüklendi"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-data", methods=["POST"])
def get_data_by_hesap_kodu():
    global excel_data
    if excel_data is None:
        return jsonify({"error": "Önce bir dosya yüklemelisiniz"}), 400

    try:
        requested_codes = request.json.get("codes", [])


        filtered = excel_data[excel_data["Hesap Mizan Raporu"].astype(str).isin([str(c) for c in requested_codes])]
        filtered = filtered.replace({np.nan: None})

        return jsonify(filtered.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
