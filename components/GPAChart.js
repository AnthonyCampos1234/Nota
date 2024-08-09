import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';

const GPAChart = ({ data }) => {
  const width = Dimensions.get('window').width - 32; // Full width minus padding

  return (
    <View style={{ height: 250, padding: 16, backgroundColor: '#1a1a1a', borderRadius: 16, marginBottom: 24 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>GPA Progression</Text>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width}
        height={200}
        domainPadding={{ y: 10 }}
      >
        <VictoryAxis
          tickFormat={(t) => `${t}`}
          style={{
            axis: { stroke: '#FFFFFF' },
            tickLabels: { fill: '#FFFFFF', fontSize: 10 }
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => t.toFixed(1)}
          style={{
            axis: { stroke: '#FFFFFF' },
            tickLabels: { fill: '#FFFFFF', fontSize: 10 }
          }}
        />
        <VictoryLine
          data={data}
          x="semester"
          y="gpa"
          style={{
            data: { stroke: '#2ecc71' },
          }}
        />
      </VictoryChart>
    </View>
  );
};

export default GPAChart;