import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Back2Birth</Text>
      <Text style={styles.subtitle}>
        Your body, your baby, your choice.
      </Text>
      <Text style={styles.description}>
        This tool will help you estimate your chance of having a successful VBAC.
      </Text>

      <Button
        title="Start Assessment"
        onPress={() => router.push('/(auth)/predict')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  description: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#777',
  },
});
