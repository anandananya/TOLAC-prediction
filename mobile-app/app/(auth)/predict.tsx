// MultiStepDetailsForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Platform, Modal, FlatList, Alert } from 'react-native';
import { Stack, router } from 'expo-router';

const steps = ["Basic Info", "Prenatal Care", "Health History", "Demographics"];

const raceOptions = [
  { label: "Select Race", value: "" },
  { label: "Asian", value: "Asian" },
  { label: "Black", value: "Black" },
  { label: "White", value: "White" },
  { label: "NHOPI", value: "NHOPI" },
  { label: "Other", value: "Other" },
];

const educationOptions = [
  { label: "Select Education", value: "" },
  { label: "Associate Degree", value: "Associate" },
  { label: "Bachelor's", value: "Bachelors" },
  { label: "College Credit", value: "College Credit" },
  { label: "Doctorate", value: "Doctorate" },
  { label: "High School/GED", value: "High School/GED" },
  { label: "Master's", value: "Masters" },
];

const paymentOptions = [
  { label: "Select Payment Method", value: "" },
  { label: "Medicaid", value: "Medicaid" },
  { label: "Self-Pay", value: "Self-Pay" },
];

interface DropdownProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownButtonText, !selectedOption?.value && styles.placeholderText]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownModal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    item.value === value && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    item.value === value && styles.dropdownItemTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function PredictScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Format the data - convert string values to numbers where needed
      const formattedData = {
        "Mother's Age": Number(formData["Mother's Age"]),
        "Prior Births Now Living": Number(formData["Prior Births Now Living"]),
        "Prior Births Now Dead": Number(formData["Prior Births Now Dead"]),
        "Interval Since Last Live Birth": Number(formData["Interval Since Last Live Birth"]),
        "Number of Prenatal Visits": Number(formData["Number of Prenatal Visits"]),
        "Pre-pregnancy BMI": Number(formData["Pre-pregnancy BMI"]),
        "Weight Gain": Number(formData["Weight Gain"]),
        "Number of Previous Cesareans": Number(formData["Number of Previous Cesareans"]),
        "Obstetric Estimate": Number(formData["Obstetric Estimate"]),
        "Pre-pregnancy Diabetes": formData["Pre-pregnancy Diabetes"] || "No",
        "Gestational Diabetes": formData["Gestational Diabetes"] || "No",
        "Pre-pregnancy HTN": formData["Pre-pregnancy HTN"] || "No",
        "Gestational HTN": formData["Gestational HTN"] || "No",
        "Previous Preterm Birth": formData["Previous Preterm Birth"] || "No",
        "Mother's Race": formData["Mother's Race"] || "",
        "Mother's Education": formData["Mother's Education"] || "",
        "Payment Method": formData["Payment Method"] || "",
      };

      console.log('Submitting formatted data:', formattedData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://192.168.68.136:5001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });      

      clearTimeout(timeoutId);
      console.log('Response received:', response.status);

      const result = await response.json();
      console.log('Parsed result:', result);

      if (result.success) {
        router.push({
          pathname: '/(auth)/results',
          params: {
            probability: String(result.prediction.probability),
            risk_level: result.prediction.risk_level,
            message: result.prediction.message,
          },
        });
      } else {
        Alert.alert("Prediction Error", result.error || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Request failed:", error);
      if (error.name === 'AbortError') {
        Alert.alert("Timeout", "The request took too long to respond. Please try again.");
      } else {
        Alert.alert("Error", "Could not connect to prediction service. Please check if the server is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
      </View>
      <View style={styles.stepsLabelContainer}>
        {steps.map((step, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              currentStep >= index && styles.activeStepLabel
            ]}
          >
            {index + 1}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mother's Age</Text>
              <TextInput 
                placeholder="Enter age" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Mother\'s Age'] ?? '')}
                onChangeText={text => handleChange('Mother\'s Age', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prior Births Now Living</Text>
              <TextInput 
                placeholder="Enter number" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Prior Births Now Living'] ?? '')}
                onChangeText={text => handleChange('Prior Births Now Living', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prior Births Now Dead</Text>
              <TextInput 
                placeholder="Enter number" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Prior Births Now Dead'] ?? '')}
                onChangeText={text => handleChange('Prior Births Now Dead', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Interval Since Last Live Birth (months)</Text>
              <TextInput 
                placeholder="Enter months" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Interval Since Last Live Birth'] ?? '')}
                onChangeText={text => handleChange('Interval Since Last Live Birth', text)} 
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Prenatal Visits</Text>
              <TextInput 
                placeholder="Enter number" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Number of Prenatal Visits'] ?? '')}
                onChangeText={text => handleChange('Number of Prenatal Visits', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pre-pregnancy BMI</Text>
              <TextInput 
                placeholder="Enter BMI" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Pre-pregnancy BMI'] ?? '')}
                onChangeText={text => handleChange('Pre-pregnancy BMI', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight Gain (lbs)</Text>
              <TextInput 
                placeholder="Enter weight gain" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Weight Gain'] ?? '')}
                onChangeText={text => handleChange('Weight Gain', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Previous Cesareans</Text>
              <TextInput 
                placeholder="Enter number" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Number of Previous Cesareans'] ?? '')}
                onChangeText={text => handleChange('Number of Previous Cesareans', text)} 
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Obstetric Estimate (weeks)</Text>
              <TextInput 
                placeholder="Enter weeks" 
                placeholderTextColor="#ba9cb0"
                style={styles.input} 
                value={String(formData['Obstetric Estimate'] ?? '')}
                onChangeText={text => handleChange('Obstetric Estimate', text)} 
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            {['Pre-pregnancy Diabetes', 'Gestational Diabetes', 'Pre-pregnancy HTN', 'Gestational HTN', 'Previous Preterm Birth'].map(label => (
              <View key={label} style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.booleanButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      formData[label] === 'Yes' && styles.booleanButtonActive
                    ]}
                    onPress={() => handleChange(label, 'Yes')}
                  >
                    <Text style={[
                      styles.booleanButtonText,
                      formData[label] === 'Yes' && styles.booleanButtonTextActive
                    ]}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      formData[label] === 'No' && styles.booleanButtonActive
                    ]}
                    onPress={() => handleChange(label, 'No')}
                  >
                    <Text style={[
                      styles.booleanButtonText,
                      formData[label] === 'No' && styles.booleanButtonTextActive
                    ]}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mother's Race</Text>
              <Dropdown
                options={raceOptions}
                value={String(formData['Mother\'s Race'] ?? '')}
                onSelect={(value) => handleChange('Mother\'s Race', value)}
                placeholder="Select Race"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mother's Education</Text>
              <Dropdown
                options={educationOptions}
                value={String(formData['Mother\'s Education'] ?? '')}
                onSelect={(value) => handleChange('Mother\'s Education', value)}
                placeholder="Select Education"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Method</Text>
              <Dropdown
                options={paymentOptions}
                value={String(formData['Payment Method'] ?? '')}
                onSelect={(value) => handleChange('Payment Method', value)}
                placeholder="Select Payment Method"
              />
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{steps[currentStep]}</Text>
      </View>
      
      {renderProgressBar()}
      {renderStep()}
      
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={prevStep}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            currentStep === 0 && styles.fullWidthButton,
            isLoading && styles.disabledButton
          ]} 
          onPress={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Loading...' : currentStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181116',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#ba9cb0',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,  // To offset the back button width
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#392833',
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#f20ca5',
    borderRadius: 2,
  },
  stepsLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepLabel: {
    color: '#ba9cb0',
    fontSize: 12,
  },
  activeStepLabel: {
    color: '#f20ca5',
    fontWeight: 'bold',
  },
  stepContainer: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#392833',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#392833',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  picker: {
    color: '#fff',
    height: Platform.OS === 'ios' ? 150 : 50,
    width: '100%',
  },
  pickerItem: {
    backgroundColor: '#392833',
    fontSize: 16,
  },
  booleanButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    backgroundColor: '#392833',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  booleanButtonActive: {
    backgroundColor: '#f20ca5',
  },
  booleanButtonText: {
    color: '#ba9cb0',
    fontSize: 16,
    fontWeight: '500',
  },
  booleanButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#f20ca5',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#392833',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ba9cb0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullWidthButton: {
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: '#392833',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: '#ba9cb0',
  },
  dropdownIcon: {
    color: '#ba9cb0',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    backgroundColor: '#392833',
    borderRadius: 12,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#181116',
  },
  dropdownItemSelected: {
    backgroundColor: '#f20ca5',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
