import requests
import pdfplumber
import pandas as pd
import io
import json
from bs4 import BeautifulSoup
import os
import logging


'''
TODO:
- Kapcsolj be word wrapet.
- Jelenleg negyedévente változnak a KAV statisztikái, mindig az utolsó két negyedév kerül feldolgozásra, mivel nem lehet a PDFeket ugyanúgy valamiért mindig kiadniuk. A képzőszervek nyílvántartása évente változik, így akkor mindig érdemes lenne egy teljes futtatás, hátha valakinek változik a címe például. Negyedévente viszont az előbb említettek miatt futtatni kell, de jelenleg nincs módszer arra, hogy firssítse a meglévő geojson fájlt az adatokkal, erre jó lenne valamit kitalálni, annyival kevesebbe kerülne a Google API.
- Talán érdemes lenne újra szétbontani ezt a bazonagy fájlt többe a jobb átláthatóságért.
'''

# Setup variables
LOG_FILE_PATH = 'utils/geojson_creation.log'
MANUAL_OVERRIDES_PATH = 'utils/manual_overrides.json'
FAILED_GEOCODING_LOG = 'utils/failed_geocoding.log'
GEOJSON_PATH = 'react/src/data/iskolak.json'
GMAPS_KEY = os.environ.get("GMAPS_API_KEY")

# Setup logging
logging.basicConfig(filename=LOG_FILE_PATH, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_manual_overrides():
    """Load manual overrides for addresses and coordinates from a JSON file."""
    if os.path.exists(MANUAL_OVERRIDES_PATH):
        with open(MANUAL_OVERRIDES_PATH, 'r', encoding='utf-8') as file:
            return json.load(file)
    return {}


def save_failed_geocoding(id, address):
    """Log failed geocoding attempts for manual review later."""
    with open(FAILED_GEOCODING_LOG, 'a', encoding='utf-8') as file:
        file.write(f"ID: {id}, Address: {address}\n")


def check_and_resolve_failed_geocoding():
    # Köszi ChatGPT
    """
    Check the failed geocoding log and prompt the user for manual inputs to resolve them.
    Updates the geojson file and manual overrides file accordingly.
    """
    if not os.path.exists(FAILED_GEOCODING_LOG):
        print("No failed geocoding log found.")
        return

    with open(FAILED_GEOCODING_LOG, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    if not lines:
        print("No failed geocoding entries to resolve.")
        return

    manual_overrides = load_manual_overrides()

    if os.path.exists(GEOJSON_PATH):
        with open(GEOJSON_PATH, 'r', encoding='utf-8') as file:
            geojson = json.load(file)
    else:
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }

    resolved_lines = []

    for line in lines:
        parts = line.strip().split(", Address: ")
        if len(parts) != 2:
            continue

        id = parts[0].replace("ID: ", "").strip()
        address = parts[1].strip()

        print(f"Resolving ID: {id}, Address: {address}")
        try:
            lat = float(input("Enter latitude: "))
            lng = float(input("Enter longitude: "))
        except ValueError:
            print("Invalid input. Skipping this entry.")
            continue

        coords = [lng, lat]

        # Update manual overrides
        manual_overrides[id] = {
            "address": address,
            "coordinates": coords
        }

        # Add to geojson
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords
            },
            "properties": {
                "nkhid": int(id),
                "address": address,
                "name": "Manual Entry",
                "tags": [],
                "overall": None,
                "stats": {},
                "etitan": False
            }
        }
        geojson['features'].append(feature)

        resolved_lines.append(line)

    # Save updated geojson
    with open(GEOJSON_PATH, 'w', encoding='utf-8') as file:
        json.dump(geojson, file, ensure_ascii=False, indent=4)

    # Save updated manual overrides
    with open(MANUAL_OVERRIDES_PATH, 'w', encoding='utf-8') as file:
        json.dump(manual_overrides, file, ensure_ascii=False, indent=4)

    # Remove resolved lines from failed geocoding log
    with open(FAILED_GEOCODING_LOG, 'w', encoding='utf-8') as file:
        for line in lines:
            if line not in resolved_lines:
                file.write(line)

    print("Resolved all failed geocoding entries.")


def extractKepzoSzervek():
    """
    Kiszedi a dokumentumtárban lévő PDF-ből a képzőszervek adatait.
    Ezt a linket folyamatosan frissíteni kell, mert a PDF tartalma változhat.
    Az oszlopok nevei az eredeti fileban benne vannak.
    A funkció egy DataFrame-et ad vissza, amit tovább lehet dolgozni.
    """
    response = requests.get("https://www.kozlekedesihatosag.kormany.hu/documents/66250/66746/K%C3%A9pz%C5%91szervek+2024.12.23.pdf/a8b9090c-e051-88a7-f4fe-affb7c1a7a8b?version=1.0&t=1734948697800&previewFileIndex=&download=true")
    file = io.BytesIO(response.content)

    with pdfplumber.open(file) as pdf:
        all_tables = []

        for page in pdf.pages:
            table = page.extract_table()
            table = table[4:]  # Remove headers
            all_tables.append(table)

        df = pd.concat([pd.DataFrame(table, columns=range(1, 45)) for table in all_tables], ignore_index=True)
        df.replace('\n', ' ', regex=True, inplace=True)

    return df


def get_institutes():
    """ 
    Összegyűjti az intézmények nevét és NKH azonosítóját a vizsgakozpont.hu-ról.
    """
    page = requests.get('https://vizsgakozpont.hu/ako_vsm?institution=0003')
    soup = BeautifulSoup(page.content, 'html.parser')

    dropdown = soup.find('select', {'id': 'institution'})
    options = dropdown.find_all('option')

    options_list = []
    for option in options:
        option_text = option.text.strip()
        option_value = option.get('value')
        if option_value:
            options_list.append({'name': option_text, 'nkhid': option_value})

    return options_list


def extract_table_data(nkhid):
    page = requests.get(f'https://vizsgakozpont.hu/ako_vsm?institution={str(nkhid).zfill(4)}')
    soup = BeautifulSoup(page.content, 'html.parser')
    tbodies = soup.find_all('tbody')

    types = ["ÁKÓ", "VSM"]
    data = []

    for i, tbody in enumerate(tbodies):
        rows = tbody.find_all('tr')
        for row in rows:
            th = row.find('th')
            if th is not None:
                jogstipus = th.get_text(strip=True).replace('"', '')

            cellList = [cell.get_text(strip=True).replace('  ', '') for cell in row.find_all('td')]
            if len(cellList) == 4:
                tipus = cellList[0]
                cellList.pop(0)

            data.append([types[i], jogstipus, tipus] + cellList)

    data = format_data(data)
    return data


def format_data(data):
    result = {"stats": {}}

    for entry in data:
        category, license_type, subject, year, quarter, value = entry

        if category not in result["stats"]:
            result["stats"][category] = {}

        if license_type not in result["stats"][category]:
            result["stats"][category][license_type] = {}

        if subject not in result["stats"][category][license_type]:
            result["stats"][category][license_type][subject] = []

        result["stats"][category][license_type][subject].append({
            "year": int(year.replace(".", "")),
            "quarter": int(quarter.split('.')[0].replace("Q", "").strip()),
            "value": value
        })

    return result


def calculate_overall_score(data):
    vsm_keys = set(data['stats']['VSM'].keys())
    ako_keys = set(data['stats']['ÁKÓ'].keys())
    common_keys = sorted(vsm_keys.intersection(ako_keys))
    overall = {}

    for licensetype in common_keys:
        values = []

        for metrics in data['stats']['VSM'][licensetype]['forgalom']:
            if metrics['value'] != 'Nincs adat':
                values.append(float(metrics['value'].split('%')[0].strip()))

        for metrics in data['stats']['ÁKÓ'][licensetype]['gyakorlat']:
            if metrics['value'] != 'Nincs adat':
                values.append(10000 / float(metrics['value'].split('%')[0].strip()))

        if values:
            overall[licensetype] = round(sum(values) / len(values), 2)
        else:
            overall[licensetype] = 0

    return overall


def get_etitan_list():
    """
    Ad egy listát az E-Titánt használó iskolák NKH azonosítójáról.
    """
    megyek = ["BK", "BE", "BA", "BZ", "BU", "CS", "FE", "GS", "HB", "HE", "JN", "KE", "NO", "PE", "SO", "SZ", "TO", "VA", "VE", "ZA"]
    alldata = []
    nkhidlist = []

    for megye in megyek:
        data = requests.get(f"https://edukresz.hu/map-api-service?county={megye}", headers={'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.3"}).json()
        alldata = alldata + data['data']

    for entry in alldata:
        nkhidlist.append(int(entry['nkhazon']))

    return sorted(list(set(nkhidlist)))


def category_finder(df, id):
    """ 
    Ad egy listát az engedélyezett jogosítványkategóriákról.
    """
    categories = ["AM", "A1", "A2", "A", "B", "BE", "C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE", "K", "T", "Troli"]
    values = df.loc[df[2] == str(id)].values[0][5:5+len(categories)]
    tags = [categories[i] for i in range(len(categories)) if values[i] != '']

    return tags


def create_geojson():
    kepzo_df = extractKepzoSzervek()
    institute_list = get_institutes()
    institute_ids = sorted([int(i['nkhid']) for i in institute_list])
    etitan_list = get_etitan_list()
    manual_overrides = load_manual_overrides()

    if os.path.exists(GEOJSON_PATH):
        with open(GEOJSON_PATH, 'r', encoding='utf-8') as file:
            geojson = json.load(file)
    else:
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }

    for id in institute_ids:
        kaverror = False

        formatted = extract_table_data(id)
        if formatted['stats'] == {}:
            logging.warning(f"ID {id} Nincs nyílvántartva a KAV által.")
            kaverror = True
        else:
            overall = calculate_overall_score(formatted)

        id_found = False
        for feature in geojson['features']:
            if feature['properties']['nkhid'] == str(id):
                id_found = True

                feature['properties']['tags'] = category_finder(kepzo_df, id)
                feature['properties']['overall'] = overall if not kaverror else None
                feature['properties']['stats'] = formatted['stats'] if not kaverror else None
                feature['properties']['etitan'] = True if id in etitan_list else False

                break

        if not id_found:
            logging.info(f"ID {id} új rekord.")
            try:
                address = kepzo_df.loc[kepzo_df[2] == str(int(id))][3].values[0]
            except IndexError:
                logging.error(f"ID {id} nem található a képzőszervek listájában.")
                continue

            if str(id) in manual_overrides:
                coords = manual_overrides[str(id)]['coordinates']
            else:
                re = requests.get(f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(address)}&language=HU&components=country:HU&key={GMAPS_KEY}").json()
                if not re['results']:
                    logging.warning(f"ID {id} címét ({address}) nem lehetett geokódolni. Manualis hozzáadás szükséges.")
                    save_failed_geocoding(id, address)
                    continue
                if 'error_message' in re:
                    logging.error(f"Google API error for ID {id}: {re['error_message']}")
                    raise RuntimeError(f"Google API error: {re['error_message']}")

                coords = [
                    re['results'][0]['geometry']['location']['lng'],
                    re['results'][0]['geometry']['location']['lat']
                ]

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": coords
                },
                "properties": {
                    "name": kepzo_df.loc[kepzo_df[2] == str(id)][1].values[0],
                    "address": address,
                    "nkhid": id,
                    "tags": category_finder(kepzo_df, id),
                    "overall": overall if not kaverror else None,
                    "stats": formatted['stats'] if not kaverror else None,
                    "etitan": True if id in etitan_list else False
                }
            }

            geojson['features'].append(feature)

    with open(GEOJSON_PATH, 'w', encoding='utf-8') as file:
        json.dump(geojson, file, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    create_geojson()
