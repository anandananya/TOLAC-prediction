import pandas as pd
import os
import glob

# Specify the directory containing the CSV files
input_directory = '/Users/ananya/Desktop/TOLAC-prediction/csv_files'

# Use glob to find all CSV files in the directory
csv_files = glob.glob(os.path.join(input_directory, '*.csv'))

# Initialize an empty list to hold DataFrames
dataframes = []

# Loop through the list of CSV files
for file in csv_files:
    # Read each CSV file into a DataFrame
    df = pd.read_csv(file)
    # Append the DataFrame to the list
    dataframes.append(df)

# Concatenate all DataFrames in the list into a single DataFrame
combined_df = pd.concat(dataframes, ignore_index=True)

# Specify the path for the output combined CSV file
output_file = '/Users/ananya/Desktop/TOLAC-prediction/csv_files/combined.csv'

# Save the combined DataFrame to a new CSV file
combined_df.to_csv(output_file, index=False)

print(f"Combined CSV file saved as {output_file}")
