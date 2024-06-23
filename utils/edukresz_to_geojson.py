import requests


def extractEdukresz():
    "Veszi az Edukresz API-ból (E-Titán) az iskolák adatait és Python GeoJSON formátumba alakítja."
    data = requests.get('https://edukresz.hu/edukresz-partnerek/src/poi.php', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3'}).json()
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
