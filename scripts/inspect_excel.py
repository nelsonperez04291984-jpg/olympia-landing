import pandas as pd

file_path = '04-02-26-Dx-Code-Tool.xlsx'
xl = pd.ExcelFile(file_path)

print(f"Sheet names: {xl.sheet_names}")

for sheet in xl.sheet_names:
    print(f"\n--- Sheet: {sheet} ---")
    df = pd.read_excel(file_path, sheet_name=sheet, nrows=5)
    print(f"Columns: {df.columns.tolist()}")
    print("Sample Data:")
    print(df.to_string())
