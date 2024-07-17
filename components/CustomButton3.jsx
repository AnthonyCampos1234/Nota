import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';

const CustomButton3 = ({ title, icon }) => {
  return (
    <TouchableOpacity style={styles.button}>
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.icon} />
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    margin: 10,
  },
  iconContainer: {
    marginBottom: 25,
  },
  icon: {
    width: 40,
    height: 40,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomButton3;