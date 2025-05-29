import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

export default function SigninScreen() {
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
            <Text style={styles.title}>Congrats on the baby 🥳!</Text>
            <Text style={styles.subtitle}>Enter your email and password to register</Text>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#ba9cb0"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#ba9cb0"
                style={styles.input}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Register</Text>
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
});