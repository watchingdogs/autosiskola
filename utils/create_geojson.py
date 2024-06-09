import edukretesz_to_geojson
import institute_extractor
import kepzoszervek_extractor
import requests
import os



GMAPS_KEY = os.environ["GMAPS_API_KEY"]

kepzo_df = kepzoszervek_extractor.extractKepzoSzervek()
institute_list = institute_extractor.get_institutes()
institute_ids = sorted([i['nkhid'] for i in institute_list])
edukretesz_geojson = edukretesz_to_geojson.extractEdukretesz()

for id in institute_ids:
    id_found = False
    for feature in edukretesz_geojson['features']:
        if feature['properties']['nkhid'] == id:
            id_found = True
            #feature['properties']['name'] = "New Name"
            print(id)
            print(feature['properties']['name'])
            break
            # két lehetőség van
            # etitános, csak statisztikát kell berakni
            
    if not id_found:
        print(f"ID {id} not found in the feature list.")
        address = kepzo_df.loc[kepzo_df[2] == str(id)][3].values[0]
        # nem etitános, teljesen új rekord kell, geocode stb
        requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(address)}&key={GMAPS_KEY}").content

