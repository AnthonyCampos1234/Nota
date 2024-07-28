import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const buttonWidth = (windowWidth - 75) / 2;

const CustomButton2 = ({ title, iconName, onPress, notificationCount = 0 }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={40} color="white" />
        {notificationCount > 0 && (
          <View style={styles.notificationDot}>
            <Text style={styles.notificationText}>{notificationCount}</Text>
          </View>
        )}
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
    position: 'relative',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomButton2;