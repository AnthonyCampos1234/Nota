import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText, ClipPath } from 'react-native-svg';

const GradientText = ({ text, gradientColors }) => {
  return (
    <View style={styles.container}>
      <Svg height="60" width="100%">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            {gradientColors.map((color, index) => (
              <Stop offset={`${(index / (gradientColors.length - 1)) * 100}%`} stopColor={color} key={index} />
            ))}
          </LinearGradient>
          <ClipPath id="clip">
            <SvgText
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".35em"
              fontSize="40"
              fontWeight="bold"
            >
              {text}
            </SvgText>
          </ClipPath>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" clipPath="url(#clip)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GradientText;