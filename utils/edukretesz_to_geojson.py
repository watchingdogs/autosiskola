# https://edukresz.hu/edukresz-partnerek/src/poi.php

import json

# Load JSON data from file
def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# Convert JSON data to GeoJSON format
def convert_to_geojson(data):
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }

    for item in data:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(item["location"]["longitude"]),
                    float(item["location"]["latitude"])
                ]
            },
            "properties": {
                "name": item["name"],
                "category": item["category"],
                "email": item["email"],
                "web": item["web"],
                "phone": item["phone"],
                "address": item["address"],
                "nkhazon": item["nkhazon"],
                "tags": item["tags"],
            }
        }
        geojson["features"].append(feature)

    return geojson

# Save GeoJSON data to file
def save_geojson(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write("var data = ")
        json.dump(data, file, ensure_ascii=False, indent=4)

# Paths to input and output files
json_file_path = 'poi.json'  # Path to your JSON file
geojson_file_path = 'geojson.js'  # Path to save the GeoJSON file

# Process the data
data = load_json(json_file_path)
geojson_data = convert_to_geojson(data)
save_geojson(geojson_data, geojson_file_path)

print(f"GeoJSON data has been saved to {geojson_file_path}")
