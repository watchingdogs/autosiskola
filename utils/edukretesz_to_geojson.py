import json
import requests


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
        # file.write("var data = ")
        json.dump(data, file, ensure_ascii=False, indent=4)


# Process the data
geojson_file_path = 'static/iskolak.geojson'  # Path to save the GeoJSON file
data = requests.get('https://edukresz.hu/edukresz-partnerek/src/poi.php', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3'})
geojson_data = convert_to_geojson(data.json())
save_geojson(geojson_data, geojson_file_path)

print(f"GeoJSON data has been saved to {geojson_file_path}")