import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { PieChart, LineChart, BarChart } from 'react-native-gifted-charts';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const colors = {
    primary: '#000000',
    secondary: '#4A90E2',
    tertiary: '#50C878',
    quaternary: '#9B59B6',
    accent: '#FF69B4',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    gradientStart: '#000000',
    gradientMiddle1: '#0F2027',
    gradientMiddle2: '#203A43',
    gradientEnd: '#2C5364',
};

const gradientColors = [
    [colors.gradientStart, colors.gradientMiddle1, colors.gradientMiddle2, colors.gradientEnd],
    [colors.secondary, colors.quaternary],
    [colors.tertiary, colors.accent],
];

const GoalItem = ({ goal, onEdit, onDelete }) => (
    <LinearGradient
        colors={gradientColors[1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.goalItem}
    >
        <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalProgress}>{goal.progress}%</Text>
        </View>
        <View style={styles.goalActions}>
            <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
                onEdit(goal);
            }}>
                <Ionicons name="create-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDelete(goal);
            }}>
                <Ionicons name="trash-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
        </View>
    </LinearGradient>
);

const GoalsPage = () => {
    const insets = useSafeAreaInsets();
    const [goals, setGoals] = useState([
        { id: '1', name: "GPA", progress: 85, color: colors.secondary, history: [70, 75, 80, 85] },
        { id: '2', name: "Exams", progress: 88, color: colors.accent, history: [60, 70, 75, 88] },
        { id: '3', name: "Participation", progress: 95, color: colors.tertiary, history: [85, 90, 92, 95] },
        { id: '4', name: "Assignments", progress: 92, color: colors.quaternary, history: [80, 85, 90, 92] },
        { id: '5', name: "Projects", progress: 78, color: colors.secondary, history: [65, 70, 75, 78] },
    ]);
    const [editingGoal, setEditingGoal] = useState(null);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalProgress, setNewGoalProgress] = useState('');

    useEffect(() => {
        // Fetch goals from backend or local storage
        // For now, we're using the hardcoded goals
    }, []);

    const handleAddGoal = useCallback(() => {
        if (newGoalName && newGoalProgress) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const newGoal = {
                id: Date.now().toString(),
                name: newGoalName,
                progress: parseInt(newGoalProgress),
                color: gradientColors[Math.floor(Math.random() * gradientColors.length)][0],
                history: [parseInt(newGoalProgress)],
            };
            setGoals([...goals, newGoal]);
            setNewGoalName('');
            setNewGoalProgress('');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Invalid Input', 'Please enter both name and progress for the new goal.');
        }
    }, [newGoalName, newGoalProgress, goals]);

    const handleEditGoal = useCallback((goal) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
        setEditingGoal(goal);
        setNewGoalName(goal.name);
        setNewGoalProgress(goal.progress.toString());
    }, []);

    const handleUpdateGoal = useCallback(() => {
        if (newGoalName && newGoalProgress) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const updatedGoals = goals.map(g =>
                g.id === editingGoal.id
                    ? { ...g, name: newGoalName, progress: parseInt(newGoalProgress), history: [...g.history, parseInt(newGoalProgress)] }
                    : g
            );
            setGoals(updatedGoals);
            setEditingGoal(null);
            setNewGoalName('');
            setNewGoalProgress('');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Invalid Input', 'Please enter both name and progress for the goal.');
        }
    }, [newGoalName, newGoalProgress, editingGoal, goals]);

    const handleDeleteGoal = useCallback((goal) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Delete Goal',
            `Are you sure you want to delete the goal "${goal.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const updatedGoals = goals.filter(g => g.id !== goal.id);
                        setGoals(updatedGoals);
                    },
                    style: 'destructive'
                },
            ]
        );
    }, [goals]);

    const renderPieChart = useCallback(() => {
        const data = goals.map(goal => ({
            value: goal.progress,
            color: goal.color,
        }));

        return (
            <View style={styles.pieChartContainer}>
                <PieChart
                    data={data}
                    donut
                    radius={80}
                    innerRadius={60}
                    centerLabelComponent={() => {
                        return <Text style={styles.pieChartCenterLabel}>Goals</Text>
                    }}
                />
                <View style={styles.pieChartLegend}>
                    {goals.map((goal) => (
                        <View key={goal.id} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: goal.color }]} />
                            <Text style={styles.legendText}>{goal.name}: {goal.progress}%</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }, [goals]);

    const renderLineChart = useCallback(() => {
        const data = goals.map(goal => ({
            dataPoints: goal.history.map(value => ({ value })),
            color: goal.color,
        }));

        return (
            <LineChart
                data={data}
                height={200}
                width={SCREEN_WIDTH - 40}
                yAxisLabelWidth={40}
                yAxisLabelSuffix="%"
                yAxisTextStyle={{ color: colors.text }}
                xAxisTextStyle={{ color: colors.text }}
                hideDataPoints
                spacing={50}
                color={colors.text}
                thickness={2}
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={0}
                noOfSections={5}
                maxValue={100}
                yAxisColor={colors.text}
                xAxisColor={colors.text}
                rulesType="solid"
                rulesColor="rgba(255,255,255,0.1)"
            />
        );
    }, [goals]);

    const renderBarChart = useCallback(() => {
        const data = goals.map(goal => ({
            value: goal.progress,
            label: goal.name,
            frontColor: goal.color,
        }));

        return (
            <BarChart
                data={data}
                barWidth={30}
                spacing={24}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: colors.text }}
                xAxisLabelTextStyle={{ color: colors.text }}
                noOfSections={5}
                maxValue={100}
                labelWidth={40}
            />
        );
    }, [goals]);

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <LinearGradient
                    colors={gradientColors[0]}
                    style={[styles.header, { paddingTop: insets.top }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.back();
                        }}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={32} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Academic Goals</Text>
                    <View style={styles.placeholder} />
                </LinearGradient>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Overall Progress</Text>
                        {renderPieChart()}
                    </View>

                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Progress Over Time</Text>
                        {renderLineChart()}
                    </View>

                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Current Progress Comparison</Text>
                        {renderBarChart()}
                    </View>

                    <FlatList
                        data={goals}
                        renderItem={({ item }) => (
                            <GoalItem
                                goal={item}
                                onEdit={handleEditGoal}
                                onDelete={handleDeleteGoal}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        style={styles.goalList}
                        scrollEnabled={false}
                    />
                </ScrollView>

                <View style={styles.addGoalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Goal name"
                        placeholderTextColor={colors.textSecondary}
                        value={newGoalName}
                        onChangeText={setNewGoalName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Progress (%)"
                        placeholderTextColor={colors.textSecondary}
                        value={newGoalProgress}
                        onChangeText={setNewGoalProgress}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            editingGoal ? handleUpdateGoal() : handleAddGoal();
                        }}
                    >
                        <Text style={styles.addButtonText}>
                            {editingGoal ? 'Update Goal' : 'Add Goal'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.text,
        fontSize: 28,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    chartContainer: {
        marginBottom: 30,
        backgroundColor: colors.gradientMiddle1,
        borderRadius: 16,
        padding: 16,
    },
    chartTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    pieChartContainer: {
        alignItems: 'center',
    },
    pieChartCenterLabel: {
        fontSize: 18,
        color: colors.text,
        fontWeight: 'bold',
    },
    pieChartLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 10,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: colors.text,
        fontSize: 12,
    },
    goalList: {
        marginTop: 20,
    },
    goalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    goalInfo: {
        flex: 1,
    },
    goalName: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    goalProgress: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    goalActions: {
        flexDirection: 'row',
        width: 80,
        justifyContent: 'space-between',
    },
    addGoalContainer: {
        padding: 20,
        backgroundColor: colors.gradientMiddle1,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        backgroundColor: colors.gradientMiddle2,
        color: colors.text,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: colors.secondary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default GoalsPage;