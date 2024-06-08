import json
import requests


# Convert JSON data to GeoJSON format
def extractEdukretesz():
    "Veszi az Edukresz API-ból (E-Titán) az iskolák adatait és Python GeoJSON formátumba alakítja."
    data = requests.get('https://edukresz.hu/edukresz-partnerek/src/poi.php', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3'})
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
                "name": item["name"] if item["name"] else None,
                "category": item["category"] if item["category"] else None,
                "email": item["email"] if item["email"] else None,
                "web": item["web"] if item["web"] else None,
                "phone": item["phone"] if item["phone"] else None,
                "address": item["address"] if item["address"] else None,
                "nkhid": item["nkhazon"] if item["nkhazon"] else None,
                "tags": item["tags"] if item["tags"] else None,
                "etitan": True
            }
        }
        geojson["features"].append(feature)

    return geojson

# Save GeoJSON data to file
def save_geojson(data):
    with open('static/iskolak.geojson', 'w', encoding='utf-8') as file:
        # file.write("var data = ")
        json.dump(data.json(), file, ensure_ascii=False, indent=4)
