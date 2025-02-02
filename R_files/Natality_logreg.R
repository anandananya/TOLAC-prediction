# Load libraries
library(dplyr)
library(pROC)
library(caret)
library(readr)
library(data.table)

# # Convert character variables to factors
# final_data <- final_data %>%
#   mutate(across(where(is.character), as.factor))

# #Convert categorical variables to factors
# #Specify the levels and labels for better readability:
# final_data$`Birth Place` <- as.factor(final_data$`Birth Place`)
# final_data$`Birth Place` <- factor(final_data$`Birth Place`, 
#                                    levels = c(1, 2, 3, 4, 5, 6, 7), 
#                                    labels = c("Hospital", "Freestanding birth center", "Home (intended)", "Home (not)", "Home (unknown)", "Clinic", "Other"))
# final_data$`Mother's Race/Hispanic` <- as.factor(final_data$`Mother's Race/Hispanic`)
# final_data$`Mother's Race/Hispanic` <- factor(final_data$`Mother's Race/Hispanic`, 
#                                    levels = c(1, 2, 3, 4, 5, 6, 7), 
#                                    labels = c("White", "Black", "AIAN", "Asian", "NHOPI", "multirace", "Hispanic"))
# final_data$`Mother's education` <- as.factor(final_data$`Mother's education`)
# final_data$`Mother's education` <- factor(final_data$`Mother's education`, 
#                                               levels = c(1, 2, 3, 4, 5, 6, 7, 8), 
#                                               labels = c("8th grade or less", "9-12th grade", "High school/GED", "College credit", "Associate degree", "Bachelor's", "Master's", "Doctorate"))
# final_data$`TOLAC Attempted (if cesarean)` <- as.factor(final_data$`TOLAC Attempted (if cesarean)`)
# final_data$`TOLAC Attempted (if cesarean)` <- factor(final_data$`TOLAC Attempted (if cesarean)`, 
#                                           levels = c('Y','X'), 
#                                           labels = c("Y", "Not applicable"))
# final_data$`Delivery Method` <- as.factor(final_data$`Delivery Method`)
# final_data$`Delivery Method` <- factor(final_data$`Delivery Method`, 
#                                       levels = c("VBAC", "Repeat C-section"))
# #final_data$`Delivery Method` <- factor(final_data$`Delivery Method`, 
#                                        #levels = c(1, 2, 3, 4, 5, 6), 
#                                        #labels = c("Vaginal", "VBAC", "Primary C-section", "Repeat C-section", "Vaginal (unknown)", "C-section (unknown)"))
# final_data$Payment <- as.factor(final_data$Payment)
# final_data$Payment <- factor(final_data$Payment, 
#                                           levels = c(1, 2, 3, 4, 5, 6, 8), 
#                                           labels = c("Medicaid", "Private Insurance", "Self-Pay", "Indian Health Service", "CHAMPUS/TRICARE", "Other Gov", "Other"))

# #Convert continuous variables to numerical
# final_data[, `Prior births now living` := as.numeric(`Prior births now living`)] 
# final_data[, `Prior births now dead` := as.numeric(`Prior births now dead`)] 
# final_data[, `Number of Prenatal Visits` := as.numeric(`Number of Prenatal Visits`)] 
# final_data[, `Cigarettes before pregnancy` := as.numeric(`Cigarettes before pregnancy`)] 
# final_data[, `1st Tri Cigarettes` := as.numeric(`1st Tri Cigarettes`)] 
# final_data[, `2nd Tri Cigarettes` := as.numeric(`2nd Tri Cigarettes`)] 
# final_data[, `3rd Tri Cigarettes` := as.numeric(`3rd Tri Cigarettes`)] 
# final_data[, `Weight gain` := as.numeric(`Weight gain`)] 
# final_data[, `Interval Since Last Live Birth` := as.numeric(`Interval Since Last Live Birth`)] 

# #Write CSV
# fwrite(final_data, "data/natality_2022_final.csv")

#Read in CSV maintaining previous factor level order (START HERE)
#final_data <- fread("/Users/anishamittal/Desktop/Carle/Year 4/Data Science/natality_2022_final.csv")
print("Loading final_data...")
final_data <- read.csv("csv_files/natality_2017.csv", stringsAsFactors = TRUE)
print(head(final_data))

print("Checking column names:")
print(colnames(final_data))
final_data$Birth.Place <- factor(final_data$Birth.Place, 
  levels = c(1, 2, 3, 4, 5, 6, 7), 
  labels = c("Hospital", "Freestanding birth center", "Home (intended)", 
             "Home (not)", "Home (unknown)", "Clinic", "Other"))

final_data$Mother.s.Race.Hispanic <- factor(final_data$Mother.s.Race.Hispanic, 
  levels = c(1, 2, 3, 4, 5, 6, 7), 
  labels = c("White", "Black", "AIAN", "Asian", "NHOPI", "multirace", "Hispanic"))

final_data$Mother.s.Education <- factor(final_data$Mother.s.Education, 
  levels = c(1, 2, 3, 4, 5, 6, 7, 8), 
  labels = c("8th grade or less", "9-12th grade", "High school/GED", 
             "College credit", "Associate degree", "Bachelor's", "Master's", "Doctorate"))

final_data$Delivery.Method <- factor(final_data$Delivery.Method, 
  levels = c(2, 4),  # Based on the values you showed
  labels = c("VBAC", "Repeat C-section"))

final_data$TOLAC.Attempted..if.cesarean. <- factor(final_data$TOLAC.Attempted..if.cesarean., 
  levels = c('Y', 'X'), 
  labels = c("Y", "Not applicable"))  # Map "X" to "Not applicable"

final_data$Payment <- factor(final_data$Payment, 
  levels = c(1, 2, 3, 4, 5, 6, 8), 
  labels = c("Medicaid", "Private Insurance", "Self-Pay", "Indian Health Service", "CHAMPUS/TRICARE", "Other Gov", "Other"))


print(head(final_data))

# Make Delivery Method a binary variable
final_data$Delivery_Method_Binary <- ifelse(final_data$Delivery.Method == "VBAC", 1, 0)

# Set seed for reproducibility
set.seed(123)

# Split the dataset into training (70%) and testing (30%)
#train_indices <- createDataPartition(final_data$`Delivery Method`, p = 0.7, list = FALSE)
#train_data <- final_data[train_indices, ]
#test_data <- final_data[-train_indices, ]
split_ratio <- 0.7  # 70% for training

# Calculate the number of rows in the training set
train_size <- floor(split_ratio * nrow(final_data))

# Sample indices for the training set
train_indices <- sample(seq_len(nrow(final_data)), size = train_size)

# Create training and testing datasets
train_data <- final_data[train_indices, ]
test_data <- final_data[-train_indices, ]

# Fit the logistic regression model
logistic_model <- glm(Delivery_Method_Binary ~ `Birth.Place` + `Mother.s.Age` + `Mother.s.Race.Hispanic` + `Mother.s.Education` + 
                      `Prior.Births.Now.Living` + `Prior.Births.Now.Dead` + `Interval.Since.Last.Live.Birth` + `Number.of.Prenatal.Visits` + 
                      `Cigarettes.Before.Pregnancy` + `X1st.Tri.Cigarettes` + `X2nd.Tri.Cigarettes` + `X3rd.Tri.Cigarettes` + 
                      `Pre.pregnancy.BMI` + `Weight.Gain` + `Pre.pregnancy.Diabetes` + `Gestational.Diabetes` + 
                      `Pre.pregnancy.HTN` + `Gestational.HTN` + `Previous.Preterm.Birth` + `Number.of.Previous.Cesareans` + 
                      `Gonorrhea` + `Syphilis` + `Chlamydia` + `Hep.B` + `Hep.C` + `Payment` + `Obstetric.Estimate`, 
                      data = train_data, 
                      family = binomial)


# Predict probabilities on the test dataset
predicted_probabilities <- predict(logistic_model, newdata = test_data, type = "response")

# Convert probabilities to predicted classes (you can choose a threshold, e.g., 0.5)
#predicted_classes <- ifelse(predicted_probabilities > 0.5, "VBAC", "Repeat C-section")

# Calculate AUROC
roc_curve <- roc(test_data$`Delivery_Method_Binary`, predicted_probabilities)

# Print AUROC
auc_value <- auc(roc_curve)
print(auc_value)

# Plot the ROC curve
plot(roc_curve, main = "ROC Curve")

# Model summary
model_summary <- summary(logistic_model)
print(model_summary)

#Cross Validation
final_data$Delivery_Method_Binary <- as.factor(final_data$Delivery_Method)
final_data2 <- final_data

factor_vars <- c("Delivery_Method_Binary", "Birth.Place", "Mother.s.Race.Hispanic", 
                 "Mother.s.Education", "Pre.pregnancy.Diabetes", "Gestational.Diabetes", 
                 "Pre.pregnancy.HTN", "Gestational.HTN", "Previous.Preterm.Birth", "Gonorrhea", 
                 "Syphilis", "Chlamydia", "Hep.B", "Hep.C", "Payment")


print("Checking column names in final_data2 before modifying factor levels:")
print(colnames(final_data2))

# Loop through each factor variable and fix levels using make.names()
for (var in factor_vars) {
  if (!(var %in% colnames(final_data2))) {
    print(paste("WARNING: Variable", var, "not found in final_data2!"))
  } else if (all(is.na(final_data2[[var]]))) {
    print(paste("WARNING: Variable", var, "contains only NA values!"))
  } else {
    levels(final_data2[[var]]) <- make.names(levels(final_data2[[var]]))
  }
}

control <- trainControl(method = "cv", number = 5, classProbs = TRUE, 
                        summaryFunction = twoClassSummary)
cv_model <- train(Delivery_Method_Binary ~ Birth.Place + Mother.s.Age + Mother.s.Race.Hispanic + Mother.s.Education 
                  + Prior.Births.Now.Living + Prior.Births.Now.Dead + Interval.Since.Last.Live.Birth 
                  + Number.of.Prenatal.Visits + Cigarettes.Before.Pregnancy + X1st.Tri.Cigarettes + X2nd.Tri.Cigarettes 
                  + X3rd.Tri.Cigarettes + Pre.pregnancy.BMI + Weight.Gain + Pre.pregnancy.Diabetes 
                  + Gestational.Diabetes + Pre.pregnancy.HTN + Gestational.HTN + Previous.Preterm.Birth 
                  + Number.of.Previous.Cesareans + Gonorrhea + Syphilis + Chlamydia + Hep.B + Hep.C 
                  + Payment + Obstetric.Estimate, 
                  data = final_data2, 
                  method = "glm", 
                  family = binomial, 
                  trControl = control,
                  metric = "ROC")
print(cv_model$results$ROC)



# Extract coefficients, p-values, and significance levels
coefficients <- summary(cv_model)$coefficients

# Display the results in a table format
coef_table <- data.frame(
  Estimate = coefficients[, "Estimate"],
  Std.Error = coefficients[, "Std. Error"],
  z.value = coefficients[, "z value"],
  Pr = coefficients[, "Pr(>|z|)"],
  Significance = symnum(
    coefficients[, "Pr(>|z|)"],
    corr = FALSE, na = FALSE,
    cutpoints = c(0, 0.001, 0.01, 0.05, 0.1, 1),
    symbols = c("***", "**", "*", ".", " ")
  )
)

# Print the coefficients table
print(coef_table)
