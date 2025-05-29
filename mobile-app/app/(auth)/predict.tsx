import { View, Text, StyleSheet } from 'react-native';

export default function PredictScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VBAC Assessment Form</Text>
      <Text style={styles.subtitle}>We'll collect a few details to help you estimate your VBAC success.</Text>
      {/* Add form fields here next */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
});
