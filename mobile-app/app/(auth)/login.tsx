import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/predict');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#181116' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>{'<'} Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.innerContainer}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Enter your email and password to continue</Text>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#ba9cb0"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#ba9cb0"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.linkRowCentered}>
              <Text style={styles.forgot}>Forgot Password?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.forgot}>First Time User?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#181116',
  },
  topRow: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  innerContainer: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#ba9cb0',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#392833',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
  },
  linkRowCentered: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  forgot: {
    color: '#ba9cb0',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#f20ca5',
    height: 48,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
});