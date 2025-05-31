import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const { probability, risk_level, message } = params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your VBAC Prediction</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.probabilityContainer}>
          <Text style={styles.probabilityText}>{probability}%</Text>
          <Text style={styles.probabilityLabel}>Success Probability</Text>
        </View>

        <View style={[
          styles.riskLevelBadge,
          risk_level === 'Low' && styles.lowRiskBadge,
          risk_level === 'Medium' && styles.mediumRiskBadge,
          risk_level === 'High' && styles.highRiskBadge,
        ]}>
          <Text style={styles.riskLevelText}>{risk_level} Risk</Text>
        </View>

        <Text style={styles.messageText}>{message}</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(auth)/predict')}
        >
          <Text style={styles.buttonText}>Make Another Prediction</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#ba9cb0',
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  probabilityContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  probabilityText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#f20ca5',
  },
  probabilityLabel: {
    fontSize: 18,
    color: '#ba9cb0',
    marginTop: 8,
  },
  riskLevelBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 30,
  },
  lowRiskBadge: {
    backgroundColor: '#4CAF50',
  },
  mediumRiskBadge: {
    backgroundColor: '#FF9800',
  },
  highRiskBadge: {
    backgroundColor: '#f44336',
  },
  riskLevelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#392833',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 