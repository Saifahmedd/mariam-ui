from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the sentence transformer model
model = SentenceTransformer("BAAI/bge-large-en-v1.5")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Server is running!"})

@app.route("/check_redundancy", methods=["POST"])
def check_redundancy():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        df = pd.read_excel(file)
        if df.empty:
            return jsonify({"error": "The uploaded Excel file is empty"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to read Excel file: {str(e)}"}), 400
    
    # Extract subjects into a dictionary
    subjects = {}
    for col in df.columns:
        subjects[col] = df[col].dropna().tolist()
    
    # Flatten the dataset
    all_courses = sum(subjects.values(), [])
    
    if not all_courses:
        return jsonify({"error": "No valid subjects found in the file"}), 400
    
    # Generate embeddings
    embeddings = model.encode(all_courses, convert_to_tensor=True)
    
    # Compute cosine similarity matrix
    similarity_matrix = util.pytorch_cos_sim(embeddings, embeddings).cpu().numpy()
    
    SIMILARITY_THRESHOLD = 0.75
    redundant_pairs = []
    
    for i in range(len(all_courses)):
        for j in range(i + 1, len(all_courses)):
            similarity = similarity_matrix[i, j]
            if similarity > SIMILARITY_THRESHOLD:
                redundant_pairs.append({
                    "pair": (all_courses[i], all_courses[j]),
                    "similarity": round(float(similarity), 2)
                })
    
    return jsonify({"redundancies": redundant_pairs})

if __name__ == "__main__":
    app.run(debug=True)