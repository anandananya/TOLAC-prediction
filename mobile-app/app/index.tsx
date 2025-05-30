import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.topContent}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8pqE-iyui6lerpnWRDBc6EVl16YtFO7FKESHJUqdypZx90QRSBqleJp7zYu53WBeYHACzCk3xSv50YtPr28JEtL6of_QG-K3ZivGwt0ncX2I-FXagUfNk4l2_hTHduPLU6jE4AzTOnXwUCtM0qBYBjmbM7Zc7vNIKKOlr6xJLdMaedyLVpLnjYjBamtva4Pq1ulm9dGflHj_RDClBIU-7gB0R4mMx5M-kM9o-AScHgIiJlz8PgMWwrOHBVL3mw-oleG0AYQTs1wka',
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Back2Birth</Text>
            <Text style={styles.subtitle}>
              Empowering mothers with personalized insights for a confident VBAC journey.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181116',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  topContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  backgroundImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#f20ca5',
    marginHorizontal: 16,
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