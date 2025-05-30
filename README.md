# TOLAC-prediction

Back2Birth is a mobile application designed to help expectant mothers make informed decisions about Trial of Labor After Cesarean (TOLAC). Using advanced machine learning models trained on comprehensive natality data, the app provides personalized predictions for successful vaginal birth after cesarean (VBAC). By considering various maternal factors, medical history, and current pregnancy details, Back2Birth empowers women with data-driven insights for their birth planning journey.

## Repository Structure

### Folder Overview
- **`mobile-app/`**: React Native mobile application for Back2Birth.
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

- **`MLP.py`**:
  - Implements a Multi-Layer Perceptron (MLP) neural network to predict TOLAC outcomes.
  - Includes preprocessing steps, class balancing, early stopping, and regularization.
  - Outputs key metrics such as AUROC, loss curves, and classification reports.
  - Users can run the script with:
    ```bash
    python Python_files/MLP.py path/to/your_data.csv
    ```

#### **R_files/**
- **`Natality_createcsv.R`**:
  - Processes natality data and generates cleaned CSVs as an alternative to the Python implementation.
- **`Natality_logreg.R`**:
  - Performs logistic regression analysis to predict TOLAC outcomes based on natality data.

#### **csv_files/**
- Contains **pre-processed natality CSV files**, so users do not need to run `make_csv.py` or `Natality_createcsv.R` manually.
- These files can be directly used as input for `logreg.py` or `MLP.py`.

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

```bash
# Prerequisites
# Python 3.x (recommended: Python 3.8+)
# R with necessary libraries (readr, data.table, etc.)
# Conda (if using the provided environment.yml file)

# Python packages
pip install pandas statsmodels scikit-learn tensorflow matplotlib seaborn

# R packages
Rscript -e "install.packages(c('dplyr', 'pROC', 'caret', 'readr', 'data.table'))"

# Cloning the repository
git clone https://github.com/anandananya/TOLAC-prediction.git
cd TOLAC-prediction
```

---

## Running the Analysis  

```bash
# Running Logistic Regression in Python
python Python_files/logreg.py data/natality_{year}.csv

# Running MLP Neural Network in Python
python Python_files/MLP.py data/natality_{year}.csv

# Running the R script
Rscript R_files/Natality_logreg.R data/natality_{year}.csv
```

Replace `{year}` with the actual year of the dataset you want to analyze.
