import pandas as pd
import json

file_path = '04-02-26-Dx-Code-Tool.xlsx'
xl = pd.ExcelFile(file_path)

info = {}

for sheet in xl.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet, nrows=10)
    info[sheet] = {
        "columns": df.columns.tolist(),
        "sample": df.head(5).to_dict(orient='records')
    }

with open('excel_info.json', 'w') as f:
    json.dump(info, f, indent=4)

print("Done. Saved to excel_info.json")
