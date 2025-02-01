# Load necessary libraries
library(readr)
library(data.table)

# Define the file path to the natality dataset
natality_file <- "/Users/anishamittal/Desktop/Carle/Year 4/Data Science/Nat2022.txt"  # Replace with the actual file path

# Define the fixed-width column widths based on the User Guide
col_positions <- fwf_positions(
  start = c(9,32,75,117,124,171,173,198,238,253,255,257,259,283,304,313,314,315,316,318,331,332,343,344,345,346,347,403,407,436,454,499),  # Start position for Birth Weight
  end   = c(12,32,76,117,124,172,174,200,239,254,256,258,260,286,305,313,314,315,316,318,331,333,343,344,345,346,347,403,407,436,454,500),  # End position for Birth Weight
  col_names = c("Birth Year", "Birth Place","Mother's Age",
                "Mother's Race/Hispanic","Mother's education",
                "Prior births now living","Prior births now dead", "Interval Since Last Live Birth",
                "Number of Prenatal Visits","Cigarettes before pregnancy", "1st Tri Cigarettes","2nd Tri Cigarettes","3rd Tri Cigarettes",
                "Pre-pregnancy BMI","Weight gain","Pre-pregnancy diabetes",
                "Gestational Diabetes","Pre-pregnancy HTN","Gestational HTN","Previous Preterm Birth",
                "Previous Cesarean","Number of Previous Cesareans","Gonorrhea","Syphilis","Chlamydia","Hep B","Hep C",
                "TOLAC Attempted (if cesarean)","Delivery Method","Payment","Plurality","Obstetric Estimate")  # Column names 
)

# Read the fixed-width dataset
natality_data <- read_fwf(natality_file, col_positions)

# Write the data to a CSV file
#write_csv(natality_data, "/Users/anishamittal/Desktop/Carle/Year 4/Data Science/natality_2022.csv")
#write_csv(natality_data, "natality_2022.csv")
fwrite(natality_data, "/Users/anishamittal/Desktop/Carle/Year 4/Data Science/natality_2022.csv")

# Preview the first few rows
head(natality_data)

# Convert natality_data to data.table format
setDT(natality_data)

# Ensure 'PLURALITY' is numeric (integer) 
natality_data[, Plurality := as.integer(Plurality)] 

# Convert 'PREVIOUS CESAREANS' to numeric, handle non-numeric values (e.g., empty or invalid)
natality_data[, `Number of Previous Cesareans` := as.numeric(`Number of Previous Cesareans`)]

# Filter the data for singleton pregnancies and 1 or 2 previous cesareans and where TOLAC is either 'Y' (attempted) or 'X' (not applicable)
filtered_data <- natality_data[Plurality == 1 & `Number of Previous Cesareans` %in% c(01, 02) & `TOLAC Attempted (if cesarean)` %in% c("Y", "X")]

# Check the first few rows of the filtered data
head(filtered_data)

# Filter the data for records with no missing or unstated data
final_data <- filtered_data[`Birth Place`!= 9 & `Mother's Race/Hispanic`!= 8 & `Mother's education`!= 9 & `Prior births now living`!='99' & `Prior births now dead`!='99' & `Interval Since Last Live Birth`!= '999'
                            & `Number of Prenatal Visits`!='99' & `Cigarettes before pregnancy`!='99' & `1st Tri Cigarettes`!= '99' & `2nd Tri Cigarettes`!= '99' & `3rd Tri Cigarettes`!= '99' & `Pre-pregnancy BMI`!= 99.9
                            & `Weight gain`!='99' & `Pre-pregnancy diabetes`!= 'U' & `Gestational Diabetes`!= 'U' & `Pre-pregnancy HTN`!= 'U' & `Gestational HTN`!= 'U' & `Previous Preterm Birth`!= 'U'
                            & Gonorrhea!='U' & Syphilis!= 'U' & Chlamydia!= 'U' & `Hep B`!= 'U' & `Hep C`!= 'U' & Payment!= 9 & `Obstetric Estimate`!= 99]

#Filter data for births where last live birth interval is not applicable/1st live birth
final_data <- final_data[`Interval Since Last Live Birth`!='888']

# Write CSV
fwrite(final_data, "/Users/anishamittal/Desktop/Carle/Year 4/Data Science/natality_2022_filtered.csv")
