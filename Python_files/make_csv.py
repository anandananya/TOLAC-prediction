import pandas as pd
import os

# Define the years to process
years = list(range(2017, 2024))

# Define the fixed-width column positions (adjusted from 1-based to 0-based indexing)
col_specs = [
    (8, 12), (31, 32), (74, 76), (116, 117), (123, 124), (170, 172), (172, 174), (197, 200),
    (237, 239), (252, 254), (254, 256), (256, 258), (258, 260), (282, 286), (303, 305), (312, 313),
    (313, 314), (314, 315), (315, 316), (317, 318), (330, 331), (331, 333), (342, 343), (343, 344),
    (344, 345), (345, 346), (346, 347), (402, 403), (406, 407), (435, 436), (453, 454), (498, 500)
]

col_names = [
    "Birth Year", "Birth Place", "Mother's Age", "Mother's Race/Hispanic", "Mother's Education",
    "Prior Births Now Living", "Prior Births Now Dead", "Interval Since Last Live Birth",
    "Number of Prenatal Visits", "Cigarettes Before Pregnancy", "1st Tri Cigarettes", "2nd Tri Cigarettes",
    "3rd Tri Cigarettes", "Pre-pregnancy BMI", "Weight Gain", "Pre-pregnancy Diabetes",
    "Gestational Diabetes", "Pre-pregnancy HTN", "Gestational HTN", "Previous Preterm Birth",
    "Previous Cesarean", "Number of Previous Cesareans", "Gonorrhea", "Syphilis", "Chlamydia",
    "Hep B", "Hep C", "TOLAC Attempted (if cesarean)", "Delivery Method", "Payment", "Plurality",
    "Obstetric Estimate"
]

# Loop through each year and process
def process_files():
    for year in years:
        file_path = f"data/Nat{year}.txt"
        if os.path.exists(file_path):
            # Read the fixed-width file
            df = pd.read_fwf(file_path, colspecs=col_specs, names=col_names, dtype=str)
            
            # Debug: Check the loaded data
            print(f"Processing year: {year}")
            print(f"Initial data shape: {df.shape}")
            
            # Save raw data for inspection
            raw_output_path = f"raw_natality_{year}.csv"
            df.to_csv(raw_output_path, index=False)
            print(f"Raw data saved to: {raw_output_path}")

            # Clean and standardize the 'TOLAC Attempted (if cesarean)' column
            if "TOLAC Attempted (if cesarean)" in df.columns:
                df["TOLAC Attempted (if cesarean)"] = df["TOLAC Attempted (if cesarean)"].str.strip()

            # Convert specific columns to numeric
            df["Plurality"] = pd.to_numeric(df["Plurality"], errors='coerce')
            df["Number of Previous Cesareans"] = pd.to_numeric(df["Number of Previous Cesareans"], errors='coerce')

            # Filter singleton pregnancies with 1 or 2 previous cesareans where TOLAC is 'Y' or 'X'
            filtered_df = df[(df["Plurality"] == 1) & 
                             df["Number of Previous Cesareans"].isin([1, 2]) & 
                             df["TOLAC Attempted (if cesarean)"].isin(["Y", "X"])]

            # Debug: Check the filtered data
            print(f"Filtered data shape (step 1): {filtered_df.shape}")

            # Filter out missing/unstated data
            final_df = filtered_df[(filtered_df["Birth Place"] != "9") & (filtered_df["Mother's Race/Hispanic"] != "8") &
                                   (filtered_df["Mother's Education"] != "9") & (filtered_df["Prior Births Now Living"] != "99") &
                                   (filtered_df["Prior Births Now Dead"] != "99") & (filtered_df["Interval Since Last Live Birth"] != "999") &
                                   (filtered_df["Number of Prenatal Visits"] != "99") & (filtered_df["Cigarettes Before Pregnancy"] != "99") &
                                   (filtered_df["1st Tri Cigarettes"] != "99") & (filtered_df["2nd Tri Cigarettes"] != "99") &
                                   (filtered_df["3rd Tri Cigarettes"] != "99") & (filtered_df["Pre-pregnancy BMI"] != "99.9") &
                                   (filtered_df["Weight Gain"] != "99") & (filtered_df["Pre-pregnancy Diabetes"] != "U") &
                                   (filtered_df["Gestational Diabetes"] != "U") & (filtered_df["Pre-pregnancy HTN"] != "U") &
                                   (filtered_df["Gestational HTN"] != "U") & (filtered_df["Previous Preterm Birth"] != "U") &
                                   (filtered_df["Gonorrhea"] != "U") & (filtered_df["Syphilis"] != "U") &
                                   (filtered_df["Chlamydia"] != "U") & (filtered_df["Hep B"] != "U") & (filtered_df["Hep C"] != "U") &
                                   (filtered_df["Payment"] != "9") & (filtered_df["Obstetric Estimate"] != "99")]

            # Debug: Check the filtered data after removing missing values
            print(f"Filtered data shape (step 2): {final_df.shape}")

            # Filter for first live birth or not applicable interval since last birth
            final_df = final_df[final_df["Interval Since Last Live Birth"] != "888"]

            # Debug: Final shape
            print(f"Final data shape: {final_df.shape}")

            # Save the cleaned dataset
            output_path = f"csv_files/natality_{year}.csv"
            os.makedirs("csv_files", exist_ok=True)  # Ensure directory exists
            final_df.to_csv(output_path, index=False)
            print(f"Processed and saved to: {output_path}")

# Run the processing
process_files()
