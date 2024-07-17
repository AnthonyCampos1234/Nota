import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from "react-native";

const ClassButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  backgroundColor = '#333'
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.button,
        { backgroundColor: backgroundColor },
        containerStyles,
        isLoading ? styles.loading : {}
      ]}
      disabled={isLoading}
    >
      <Text style={[styles.text, textStyles]}>
        {title}
      </Text>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#000"
          size="small"
          style={styles.indicator}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    minHeight: 62,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  text: {
    color: '#fff', 
    fontFamily: 'psemibold',
    fontSize: 21
  },
  loading: {
    opacity: 0.5
  },
  indicator: {
    marginLeft: 8
  }
});

export default ClassButton;