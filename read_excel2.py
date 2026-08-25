import pandas as pd
import os

base = r'E:\AppRoutine'
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 300)
pd.set_option('display.max_colwidth', 50)

# FILE 1: Timetable - show more rows to see all sections
path = os.path.join(base, 'timetable_reports_2_20260712_2108_student.xlsx')
print('=' * 140)
print('FILE: timetable_reports_2_20260712_2108_student.xlsx')
print('=' * 140)
df = pd.read_excel(path, sheet_name='Section Grid', header=None)
print(f'Shape: {df.shape}')
# Print unique sections from column 0 (odd rows are section headers, even rows are day rows)
print('\n--- Unique section identifiers found ---')
secs = df[0].dropna().unique()
for s in secs:
    print(f'  {s}')
print()

# Print all rows (the full timetable)
for i in range(len(df)):
    row = df.iloc[i]
    # Check if it's a section header row (contains "course group")
    if isinstance(row.iloc[0], str) and 'course group' in row.iloc[0]:
        print(f'\n--- {row.iloc[0]} ---')
    else:
        print(f'{str(row.iloc[0]):12s} {str(row.iloc[1]):12s} | {str(row.iloc[2]):45s} | {str(row.iloc[3]):45s} | {str(row.iloc[4]):45s} | {str(row.iloc[5]):45s} | {str(row.iloc[6]):12s} | {str(row.iloc[7]):12s} | {str(row.iloc[8]):12s} | {str(row.iloc[9]):12s} | {str(row.iloc[10]):12s} | {str(row.iloc[11]):12s}')

print()
print()
