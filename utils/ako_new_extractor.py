import pdfplumber
import pandas as pd

# Open the PDF file
with pdfplumber.open('ako_2023_4_2024_1.pdf') as pdf:
    # Select the page you want to extract the table from
    page = pdf.pages[0]
    
    # Extract the table
    table = page.extract_table()
    
    # Convert the table to a DataFrame
    df = pd.DataFrame(table[1:], columns=table[0])

#df = df.drop(0) # első sor
# drop first column
#df = df.drop(columns=[df.columns[0]])

# Set the first column as the index
df.set_index(df.columns[0], inplace=True)

second_row_values = df.iloc[0]
print(second_row_values)

#print header
print(df.columns)

print(df)
