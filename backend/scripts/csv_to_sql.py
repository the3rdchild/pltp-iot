#!/usr/bin/env python3
"""
CSV to SQL Converter for sensor_data_test table
Usage: python csv_to_sql.py input.csv output.sql

CSV Format expected:
timestamp,temperature,pressure,flow_rate,gen_voltage_V-W,gen_voltage_W-U,gen_reactive_power,gen_output,gen_power_factor,gen_frequency,speed_detection,MCV_L,MCV_R,TDS,status

Example row:
2025-01-03T04:46:30	166.203	10.794	186.59	14.028	14.335	11.563	42.472	0.951	50.044	3054.071	41.16	78.734	470.906	normal
"""

import csv
import sys
import os

def escape_sql_value(value):
    """Escape SQL string values"""
    if value is None or value == '':
        return 'NULL'
    # Escape single quotes
    return "'" + str(value).replace("'", "''") + "'"

def convert_csv_to_sql(input_file, output_file):
    """Convert CSV file to SQL INSERT statements"""

    # Detect delimiter (tab or comma)
    with open(input_file, 'r', encoding='utf-8') as f:
        first_line = f.readline()
        delimiter = '\t' if '\t' in first_line else ','

    print(f"Detected delimiter: {'TAB' if delimiter == '\\t' else 'COMMA'}")

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        # Try to detect if there's a header
        reader = csv.reader(csvfile, delimiter=delimiter)
        rows = list(reader)

    if not rows:
        print("Error: CSV file is empty")
        return False

    # Check if first row is header
    first_row = rows[0]
    has_header = 'timestamp' in first_row[0].lower() or 'temperature' in str(first_row[1]).lower()

    if has_header:
        data_rows = rows[1:]
        print(f"Header detected, skipping first row")
    else:
        data_rows = rows

    print(f"Total data rows to convert: {len(data_rows)}")

    # SQL column names (matching PostgreSQL table)
    columns = [
        'timestamp',
        'temperature',
        'pressure',
        'flow_rate',
        'gen_voltage_v_w',
        'gen_voltage_w_u',
        'gen_reactive_power',
        'gen_output',
        'gen_power_factor',
        'gen_frequency',
        'speed_detection',
        'mcv_l',
        'mcv_r',
        'tds',
        'status'
    ]

    with open(output_file, 'w', encoding='utf-8') as sqlfile:
        # Write header comment
        sqlfile.write("-- Auto-generated SQL from CSV\n")
        sqlfile.write("-- Table: sensor_data_test\n")
        sqlfile.write(f"-- Total rows: {len(data_rows)}\n\n")

        # Write INSERT statements
        sqlfile.write(f"INSERT INTO sensor_data_test ({', '.join(columns)}) VALUES\n")

        values_list = []
        for i, row in enumerate(data_rows):
            if len(row) < 15:
                print(f"Warning: Row {i+1} has only {len(row)} columns, skipping")
                continue

            # Parse values
            timestamp = escape_sql_value(row[0])
            temperature = row[1] if row[1] else 'NULL'
            pressure = row[2] if row[2] else 'NULL'
            flow_rate = row[3] if row[3] else 'NULL'
            gen_voltage_v_w = row[4] if row[4] else 'NULL'
            gen_voltage_w_u = row[5] if row[5] else 'NULL'
            gen_reactive_power = row[6] if row[6] else 'NULL'
            gen_output = row[7] if row[7] else 'NULL'
            gen_power_factor = row[8] if row[8] else 'NULL'
            gen_frequency = row[9] if row[9] else 'NULL'
            speed_detection = row[10] if row[10] else 'NULL'
            mcv_l = row[11] if row[11] else 'NULL'
            mcv_r = row[12] if row[12] else 'NULL'
            tds = row[13] if row[13] else 'NULL'
            status = escape_sql_value(row[14]) if row[14] else "'normal'"

            values = f"({timestamp}, {temperature}, {pressure}, {flow_rate}, {gen_voltage_v_w}, {gen_voltage_w_u}, {gen_reactive_power}, {gen_output}, {gen_power_factor}, {gen_frequency}, {speed_detection}, {mcv_l}, {mcv_r}, {tds}, {status})"
            values_list.append(values)

        # Write all values, separated by commas
        sqlfile.write(',\n'.join(values_list))
        sqlfile.write(';\n')

    print(f"Successfully converted {len(values_list)} rows")
    print(f"Output saved to: {output_file}")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python csv_to_sql.py <input.csv> [output.sql]")
        print("\nExample:")
        print("  python csv_to_sql.py sensor_data.csv")
        print("  python csv_to_sql.py sensor_data.csv output.sql")
        sys.exit(1)

    input_file = sys.argv[1]

    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)

    # Default output filename
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    else:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}.sql"

    print(f"Converting: {input_file} -> {output_file}")

    success = convert_csv_to_sql(input_file, output_file)

    if success:
        print("\nDone! You can now import the SQL file to PostgreSQL using DBeaver or psql:")
        print(f"  psql -U pertasmart_user -d pertasmart_db -f {output_file}")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
