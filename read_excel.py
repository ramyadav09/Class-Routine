import pandas as pd
import os

base = r'E:\AppRoutine'
files = [
    'timetable_reports_2_20260712_2108_student.xlsx',
    'Section detail_5th.xlsx',
    'CD and DMDW new section.xlsx',
    '5TH SEM ELECTIVE SECTION_CD_DMDW.xlsx'
]

for f in files:
    path = os.path.join(base, f)
    print('=' * 140)
    print(f'FILE: {f}')
    print('=' * 140)
    xls = pd.ExcelFile(path, engine='openpyxl')
    print(f'Sheet names: {xls.sheet_names}')
    for sheet in xls.sheet_names:
        print(f'\n--- Sheet: "{sheet}" ---')
        df = pd.read_excel(xls, sheet_name=sheet, header=None)
        print(f'Shape: {df.shape[0]} rows x {df.shape[1]} cols')
        print()
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 200)
        pd.set_option('display.max_colwidth', 40)
        print(df.head(20).to_string())
        print()
    print()
