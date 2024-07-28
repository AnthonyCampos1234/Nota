import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, FormField } from "../../components";

const Insight = () => {
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async () => {
    if (question.trim() === "") {
      return Alert.alert("Error", "Please enter a question");
    }
    setIsLoading(true);
    try {
      // TODO: Implement LLM question asking logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAiResponse(" AI response. We need to replace this with actual LLM integration.");
      setQuestion("");
    } catch (error) {
      Alert.alert("Error", "Failed to process your question");
    } finally {
      setIsLoading(false);
    }
  };

  const newsUpdates = [
    "New AI features added!",
    "Improved user interface",
    "Bug fixes and performance enhancements",
    "Update 2.0 released!",
    "Desktop Application coming soon!",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.aiSection}>
            <Text style={styles.sectionTitle}>AI Assistant</Text>
            <FormField
              value={question}
              placeholder="Enter your question..."
              handleChangeText={setQuestion}
              otherStyles={styles.input}
            />
            <CustomButton
              title="Ask"
              handlePress={askQuestion}
              containerStyles={styles.button}
              isLoading={isLoading}
            />
            {aiResponse !== "" && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>AI Response:</Text>
                <Text style={styles.responseText}>{aiResponse}</Text>
              </View>
            )}
          </View>

          <View style={styles.newsSection}>
            <Text style={styles.sectionTitle}>News & Updates</Text>
            {newsUpdates.map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <Ionicons name="newspaper-outline" size={20} color="#FFF" />
                <Text style={styles.updateText}>{update}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  aiSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  newsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 16,
  },
  responseContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  responseText: {
    color: '#fff',
    fontSize: 16,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  updateText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default Insight;