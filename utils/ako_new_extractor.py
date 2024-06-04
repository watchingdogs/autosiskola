import pdfplumber
import pandas as pd
import io
import requests


response = requests.get("https://vizsgakozpont.hu/uploads/2024/dokumentumok/ako_2023_4_2024_1.pdf")
file = io.BytesIO(response.content)

with pdfplumber.open(file) as pdf:
    # Initialize an empty list to store the tables from each page
    all_tables = []
    
    # Iterate over each page in the PDF
    for page in pdf.pages:
        # Extract the table
        table = page.extract_table()
        
        # Remove the unnecessary rows
        table = table[1:]
        
        # Append the table to the list
        all_tables.append(table)
    
    # Concatenate all the tables into one DataFrame
    df = pd.concat([pd.DataFrame(table, columns=table[0]) for table in all_tables], ignore_index=True) # type: ignore

    # Remove all rows that contain the text 'Azon.'
    df = df[~df.apply(lambda row: row.astype(str).str.contains('Azon.').any(), axis=1)]


# Get the unique date ranges from the data
column_names = df.columns.tolist()
dates = column_names[3].split(" ")

# Set the first column as the index; and rename columns due to the same extracted names
df.columns = ["sorszam"] + list(range(7))
df.set_index(df.columns[0], inplace=True)

# Split A1A2Asum into two columns
df[['temp1', 'temp2']] = df.iloc[:, 4].str.split(expand=True)
df.insert(5, 'temp1', df.pop('temp1'))
df.insert(6, 'temp2', df.pop('temp2'))
df = df.drop(columns=[df.columns[4]])

# Split B into two columns
df[['temp3', 'temp4']] = df.iloc[:, 6].str.split(expand=True)
df.insert(7, 'temp3', df.pop('temp3'))
df.insert(8, 'temp4', df.pop('temp4'))
df = df.drop(columns=[df.columns[6]])

# Split C into two columns
df[['temp5', 'temp6']] = df.iloc[:, 8].str.split(expand=True)
df.insert(9, 'temp5', df.pop('temp5'))
df.insert(10, 'temp6', df.pop('temp6'))
df = df.drop(columns=[df.columns[8]])

# Rename columns
df.columns = ["kepzo_nev", "kepzo_azonosito", f"AM_{dates[0]}", f"AM_{dates[1]}", f"A1A2Asum_{dates[0]}", f"A1A2Asum_{dates[1]}", f"B_{dates[0]}", f"B_{dates[1]}", f"C_{dates[0]}", f"C_{dates[1]}"]

# export to csv
df.to_csv('data/ako.csv', index=True, header=True)
