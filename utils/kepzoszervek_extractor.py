import requests
import pdfplumber
import pandas as pd
import io


def extractKepzoSzervek():
    """
    Kiszedi a dokumentumtárban lévő PDF-ből a képzőszervek adatait.
    Ezt a linket folyamatosan frissíteni kell, mert a PDF tartalma változhat.
    Az oszlopok nevei az eredeti fileban benne vannak.
    A funkció egy DataFrame-et ad vissza, amit tovább lehet dolgozni.
    """
    #response = requests.get("https://www.kozlekedesihatosag.kormany.hu/documents/66250/66746/K%C3%A9pz%C5%91szervek+2023.10.12.pdf/b0864abb-7221-9fb6-af68-97a4941a2497?version=1.1&t=1697122513207&previewFileIndex=&download=true")
    #Lehet blokkoltak a tesztelésnél, mertegy idő után timed outolt a kérés, ezért inkább a githubon pagesen lévő PDF-et használom.
    response = requests.get("https://watchingdogs.github.io/autosiskola/app/static/K%C3%A9pz%C5%91szervek%202023.10.12.pdf")
    file = io.BytesIO(response.content)

    with pdfplumber.open(file) as pdf:
        # Initialize an empty list to store the tables from each page
        all_tables = []
            
        # Iterate over each page in the PDF
        for page in pdf.pages:
            # Extract the table
            table = page.extract_table()
            
            # Remove the headers
            table = table[4:]
            
            # Append the table to the list
            all_tables.append(table)
        
        # Concatenate all the tables into one DataFrame
        df = pd.concat([pd.DataFrame(table, columns=range(1, 45)) for table in all_tables], ignore_index=True)
        df.replace('\n', ' ', regex=True, inplace=True)

    return df


# df.to_csv('data/kepzoszervek.csv', index=False)
