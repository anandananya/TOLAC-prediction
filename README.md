# TOLAC-prediction

This repository contains code and resources to analyze and predict outcomes related to Trial of Labor After Cesarean (TOLAC). The project processes natality data and performs predictive analysis using Python and R.

## Repository Structure

### Folder Overview
- **`Python_files/`**: Contains Python scripts for data processing and analysis.
- **`R_files/`**: Contains R scripts for alternative data processing and analysis.
- **`csv_files/`**: Pre-processed natality CSV files ready for analysis.

### File Descriptions

#### **Python_files/**
- **`make_csv.py`**: 
  - Processes natality data files for multiple years.
  - Reads fixed-width natality data files (e.g., `Nat2016.txt` to `Nat2023.txt`).
  - Filters the data for relevant fields and conditions.
  - Outputs processed CSV files into the `csv_files/` directory.
- **`logreg.py`**:
  - Performs logistic regression analysis on natality data.
  - Users can specify their own CSV file as input via the command line:
    ```bash
    python Python_files/logreg.py path/to/your_data.csv
    ```

#### **R_files/**
- **`Natality_createcsv.R`**:
  - Processes natality data and generates cleaned CSVs as an alternative to the Python implementation.
- **`Natality_logreg.R`**:
  - Performs logistic regression analysis to predict TOLAC outcomes based on natality data.

#### **csv_files/**
- Contains **pre-processed natality CSV files**, so users do not need to run `make_csv.py` or `Natality_createcsv.R` manually.
- These files can be directly used as input for `logreg.py`.

#### **environment.yml**
- A Conda environment file that includes all the required dependencies to run the project.
- To create the environment, run the following command:
  ```bash
  conda env create -f environment.yml
  ```
- Activate the environment using:
  ```bash
  conda activate tolac-env
  ```

---

## Installation and Setup

### Prerequisites
- Python 3.x
- R with necessary libraries (`readr`, `data.table`, etc.)
- Conda (if using the provided `environment.yml` file)
- Python packages:
  - Pandas (install via `pip install pandas`)
  - Statsmodels (install via `pip install statsmodels`)
  - Scikit-learn (install via `pip install scikit-learn`)
- R packages:
  - dplyr (install via `install.packages('dplyr')`)
  - pROC (install via `install.packages('pROC')`)
  - caret (install via `install.packages('caret')`)
  - readr (install via `install.packages('readr')`)
  - data.table (install via `install.packages('data.table')`)

### Cloning the Repository
```bash
git clone https://github.com/anandananya/TOLAC-prediction.git
cd TOLAC-prediction
```

## Running the Analysis  

Once the environment is set up and the necessary dependencies are installed, you can run the analysis using the following commands:  

### Running the Python script  
```bash
python Python_files/logreg.py data/natality_{year}.csv
```

### Running the R script  
```bash
Rscript R_files/Natality_logreg.R data/natality_{year}.csv
```

Replace `{year}` with the actual year of the dataset you want to analyze.