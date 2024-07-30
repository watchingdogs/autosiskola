import institute_extractor
import kepzoszervek_extractor
import requests
import os
import json


# REPO ROOTBÓL KELL FUTTATNI, VAGY A PATHOT ÁTÁLLíTANI!!!
geojson_path = 'react/src/data/iskolak.json'
GMAPS_KEY = os.environ["GMAPS_API_KEY"]


def get_etitan_list():
    '''
    Ad egy listát az E-Titánt használó iskolák NKH azonosítójáról.
    Az új APIban vannak üres mezők telefonszámra emailre, weboldalra, de ezzel jelenleg nem lehet mit kezdeni. Ha majd implementálja az eduKRESZ, talán van lehetőség a használatára.
    '''
    megyek = ["BK", "BE", "BA", "BZ", "BU", "CS", "FE", "GS", "HB", "HE", "JN", "KE", "NO", "PE", "SO", "SZ", "TO", "VA", "VE", "ZA"]
    alldata = []
    nkhidlist = []

    for megye in megyek:
        data = requests.get(f"https://edukresz.hu/map-api-service?county={megye}", headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3'}).json()
        alldata = alldata + data['data']

    for entry in alldata:
        nkhidlist.append(int(entry['nkhazon']))

    return sorted(list(set(nkhidlist)))


def category_finder(df, id):
    "Ad egy listát az engedélyezett jogosítványkategóriákról."
    categories = ["AM", "A1", "A2", "A", "B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE", "K", "T", "Troli"]
    values = df.loc[df[2] == str(id)].values[0][5:5+len(categories)]
    tags = [categories[i] for i in range(len(categories)) if values[i] != '']

    return tags


kepzo_df = kepzoszervek_extractor.extractKepzoSzervek()
institute_list = institute_extractor.get_institutes()
institute_ids = sorted([int(i['nkhid']) for i in institute_list])
etitan_list = get_etitan_list()


if os.path.exists(geojson_path):
    with open(geojson_path, 'r', encoding='utf-8') as file:
        geojson = json.load(file)
else:
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    

for id in institute_ids:
    kaverror = False

    formatted = institute_extractor.extract_table_data(id)
    if formatted['stats'] == {}:
        print(f"ID {id} Nincs nyílvántartva a KAV által.")
        kaverror = True
    else:
        overall = institute_extractor.calculate_overall_score(formatted)
    
     
    id_found = False
    for feature in geojson['features']:
        if feature['properties']['nkhid'] == str(id):
            # Ez most csak akkor fut le, ha frissítjük az adatokat.
            id_found = True

            feature['properties']['tags'] = category_finder(kepzo_df, id)
            feature['properties']['overall'] = overall if not kaverror else None
            feature['properties']['stats'] = formatted['stats'] if not kaverror else None
            feature['properties']['etitan'] = True if id in etitan_list else False

            break
            
    if not id_found:
        # Nincs benne a listában, teljesen új rekord kell, vagy első futás.
        print(f"ID {id} új rekord.")
        try:
            address = kepzo_df.loc[kepzo_df[2] == str(int(id))][3].values[0]
        except IndexError:
            print(f"ID {id} nem található a képzőszervek listájában.")
            continue

        re = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(address)}&language=HU&components=country:HU&key={GMAPS_KEY}").json()
        if not re['results']:
            print(f"ID {id} címét ({address}) nem lehetett geokódolni. Érdemes manuálisan hozzáadni.")
            continue

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
                "name": kepzo_df.loc[kepzo_df[2] == str(id)][1].values[0],
                "address": address, # Ide lehetne a Google APIt használva magyar formátumba rakni a címeket is.
                "nkhid": id,
                "tags": category_finder(kepzo_df, id),
                "overall": overall if not kaverror else None,
                "stats": formatted['stats'] if not kaverror else None,
                "etitan": True if id in etitan_list else False
            }
        }

        geojson['features'].append(feature)

with open(geojson_path, 'w', encoding='utf-8') as file:
    json.dump(geojson, file, ensure_ascii=False, indent=4)