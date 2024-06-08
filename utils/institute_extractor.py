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
    page = requests.get(f'https://vizsgakozpont.hu/ako_vsm?institution={nkhid}')
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

    for item in data:
        item[4] = item[4].replace('Q', '')
        item[3] = item[3].replace('.', '')

    return data

# print(extract_table_data('4117'))
