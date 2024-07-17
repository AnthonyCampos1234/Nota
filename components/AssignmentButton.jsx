import { Text, TouchableOpacity, StyleSheet, View } from "react-native";

const AssignmentButton = ({
  title,
  classTitle,
  dueDate,
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
        containerStyles,
        isLoading ? styles.loading : {},
        { backgroundColor }
      ]}
      disabled={isLoading}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.classTitle, textStyles]}>
          {classTitle}
        </Text>
        <View style={styles.assignmentContainer}>
          <Text style={[styles.assignmentTitle, textStyles]}>
            {title}
          </Text>
          <Text style={[styles.dueDate, textStyles]}>
            Due: {dueDate}
          </Text>
        </View>
      </View>
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
    padding: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#333',
  },
  textContainer: {
    width: '100%',
  },
  classTitle: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  assignmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  assignmentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  dueDate: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  loading: {
    opacity: 0.5,
  },
  indicator: {
    marginLeft: 8,
  },
});

export default AssignmentButton;