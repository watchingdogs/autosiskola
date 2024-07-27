from bs4 import BeautifulSoup
import requests


def get_institutes():
    "Összegyűjti az intézmények nevét és NKH azonosítóját a vizsgakozpont.hu-ról. (Nincs benne minden inzétmény!)"

    page = requests.get('https://vizsgakozpont.hu/ako_vsm?institution=0003')
    soup = BeautifulSoup(page.content, 'html.parser')

    dropdown = soup.find('select', {'id': 'institution'})
    options = dropdown.find_all('option')

    options_list = []
    for option in options:
        option_text = option.text.strip()
        option_value = option.get('value')
        if option_value:  # Only add if the value is not None
            options_list.append({'name': option_text, 'nkhid': option_value})
    
    return options_list


def extract_table_data(nkhid):
    page = requests.get(f'https://vizsgakozpont.hu/ako_vsm?institution={str(nkhid).zfill(4)}')
    soup = BeautifulSoup(page.content, 'html.parser')
    tbodies = soup.find_all('tbody')
    # Ha nincs táblázat, a funkció üres listát ad vissza.

    types = ["ÁKÓ", "VSM"]
    data = []

    for i, tbody in enumerate(tbodies):
        rows = tbody.find_all('tr')
        for row in rows:
            # Jogosítvány típusa
            th = row.find('th')
            if th is not None:
                jogstipus = th.get_text(strip=True).replace('"', '')

            cellList = [cell.get_text(strip=True).replace('  ', '') for cell in row.find_all('td')]
            
            # Elméleti vagy forgalmi vizsga
            if len(cellList) == 4:
                tipus = cellList[0]
                cellList.pop(0)

            data.append([types[i], jogstipus, tipus] + cellList)

    data = format_data(data)
    return data


def format_data(data):
    "Return the stats dictionary."
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
    """
    Kiszámolja az iskola összpontszámát.
    Ehhez veszi az átlagos képzési óraszámot, és a forgalmi vizsga sikerességét.
    Az elméleti vizsga nincs beleszámolva, mivel több mint az iskolák fele E-Titánt használ. Később feature?
    """
    vsm_keys = set(data['stats']['VSM'].keys())
    ako_keys = set(data['stats']['ÁKÓ'].keys())
    common_keys = sorted(vsm_keys.intersection(ako_keys))
    overall = {}

    for licensetype in common_keys:
        values = []

        for metrics in data['stats']['VSM'][licensetype]['forgalom']:
            if metrics['value'] != 'Nincs adat':
                values.append(float(metrics['value'].split('%')[0].strip()))

        # Az ÁKÓ-t először normalizálni kell, mert az értékek fordítottak. Azért kell a 10000, mert ha csak 100-zal osztjuk, akkor 1 az érték max, nem 100.
        for metrics in data['stats']['ÁKÓ'][licensetype]['gyakorlat']:
            if metrics['value'] != 'Nincs adat':
                values.append(10000 / float(metrics['value'].split('%')[0].strip()))

        if values:
            overall[licensetype] = round(sum(values) / len(values), 2)
        else:
            overall[licensetype] = 0

    return overall

'''
formatted = extract_table_data('3194')
overall = calculate_overall_score(formatted)
print(overall)
'''
