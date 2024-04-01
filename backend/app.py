from flask import Flask, request, jsonify
from bing_image_downloader import downloader
import os
import base64
from werkzeug.exceptions import BadRequest
from flask_cors import CORS
import logging
import shutil

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Function to remove all images and folders from AllImages directory
def cleanup_all_images():
    all_images_dir = 'AllImages'
    if os.path.exists(all_images_dir):
        shutil.rmtree(all_images_dir)

# api
@app.route('/')
def home():
    return "hello"

@app.route('/generate_images', methods=['POST'])
def generate_images():
    cleanup_all_images()
    try:
        data = request.get_json()
        text = data['text']
        limit = data['limit']
    except (BadRequest, KeyError) as e:
        return jsonify({'error': 'Missing key in request body.'}), 400

    try:
        if not text:
            return jsonify({'error': 'Text description is missing.'}), 400

        downloader.download(text, limit=int(limit), output_dir='AllImages', timeout=10)

        # Collect all image files in the AllImages directory
        image_data_list = []
        all_images_dir = 'AllImages/' + text
        for filename in os.listdir(all_images_dir):
            image_path = os.path.join(all_images_dir, filename)
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            image_data_list.append({'filename': filename, 'data': image_base64})

        # Return the list of image data in the JSON response
        return jsonify({'images': image_data_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Internal Server Error

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
