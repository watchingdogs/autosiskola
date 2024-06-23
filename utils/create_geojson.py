import edukresz_to_geojson
import institute_extractor
import kepzoszervek_extractor
import requests
import os
import json


def category_finder(df):
    "Ad egy listát az engedélyezett jogosítványkategóriákról."
    categories = ["AM", "A1", "A2", "A", "B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE", "K", "T", "Troli"]
    values = df.loc[df[2] == str(4050)].values[0][5:5+len(categories)]
    tags = [categories[i] for i in range(len(categories)) if values[i] != '']

    return tags

def save_geojson(data):
    with open('static/iskolak.geojson', 'w', encoding='utf-8') as file:
        # file.write("var data = ")
        json.dump(data.json(), file, ensure_ascii=False, indent=4)


GMAPS_KEY = os.environ["GMAPS_API_KEY"]

kepzo_df = kepzoszervek_extractor.extractKepzoSzervek()
institute_list = institute_extractor.get_institutes()
institute_ids = sorted([i['nkhid'] for i in institute_list])
edukresz_geojson = edukresz_to_geojson.extractEdukresz()

total_ids = len(institute_ids)
counter = 0

for id in institute_ids:
    counter += 1
    print(f"{counter}/{total_ids}")

    formatted = institute_extractor.extract_table_data(id)
    if formatted['stats'] == {}:
        print(f"ID {id} hibát adott a KAV API-ban.")
        continue
    overall = institute_extractor.calculate_overall_score(formatted)
     
    id_found = False
    for feature in edukresz_geojson['features']:
        if feature['properties']['nkhid'] == id:
            # Benne volt az Edukresz listájában.
            id_found = True

            feature['properties']['tags'] = category_finder(kepzo_df)
            feature['properties']['etitan'] = True
            feature['properties']['overall'] = overall
            feature['properties']['stats'] = formatted['stats']

            break
            
    if not id_found:
        # Nincs benne a listában, teljesen új rekord kell.
        print(f"ID {id} not found in the feature list.")
        address = kepzo_df.loc[kepzo_df[2] == str(int(id))][3].values[0]
        re = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(address)}&key={GMAPS_KEY}").json()

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    re['results'][0]['geometry']['location']['lng'],
                    re['results'][0]['geometry']['location']['lat']
                ]
            },
            "properties": {
                "name": kepzo_df.loc[kepzo_df[2] == str(int(id))][1].values[0],
                "address": address,
                "nkhid": id,
                "tags": category_finder(kepzo_df),
                "etitan": False,
                "overall": overall,
                "stats": formatted['stats']
            }
        }

        edukresz_geojson['features'].append(feature)

save_geojson(edukresz_geojson)