import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const buttonWidth = (windowWidth - 75) / 2;

const CustomButton2 = ({ title, iconName, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={40} color="white" />
      </View>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    borderColor: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: buttonWidth,
    aspectRatio: 1,
    margin: 5,
    shadowColor: '#FFF',
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  iconContainer: {
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomButton2;