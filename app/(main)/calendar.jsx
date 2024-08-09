import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, Animated, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveEvents, loadEvents } from '../../context/eventStorage';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [viewMode, setViewMode] = useState('Month');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', location: '', date: new Date(),
    startTime: new Date(), endTime: new Date(),
    color: '', repeat: 'none'
  });
  const [modalAnimation] = useState(new Animated.Value(0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const repeatOptions = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const loadedEvents = await loadEvents();
      setAllEvents(loadedEvents);
      setIsLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      filterEvents(currentDate);
    }
  }, [currentDate, viewMode, allEvents, isLoading]);

  const filterEvents = useCallback((date) => {
    if (!allEvents || allEvents.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const isEventInRange = (event, start, end) => {
      const eventDate = new Date(event.date);
      if (eventDate > end) return false;
      if (event.repeat === 'none') {
        return eventDate >= start && eventDate <= end;
      }

      // Check if the event starts before or during the range
      if (eventDate > end) return false;
      if (eventDate < start) {
        // For repeating events that start before the range, check if they would occur during the range
        const daysDiff = Math.floor((start - eventDate) / (1000 * 60 * 60 * 24));
        switch (event.repeat) {
          case 'daily':
            return true;
          case 'weekly':
            return daysDiff % 7 === 0;
          case 'monthly':
            return start.getDate() >= eventDate.getDate();
          case 'yearly':
            return (start.getMonth() > eventDate.getMonth() ||
              (start.getMonth() === eventDate.getMonth() && start.getDate() >= eventDate.getDate()));
        }
      }
      return true;
    };

    let filtered;
    let rangeStart, rangeEnd;

    if (viewMode === 'Day' || viewMode === 'Schedule') {
      rangeStart = new Date(date.setHours(0, 0, 0, 0));
      rangeEnd = new Date(date.setHours(23, 59, 59, 999));
    } else if (viewMode === 'Week') {
      rangeStart = new Date(date);
      rangeStart.setDate(date.getDate() - date.getDay());
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeStart.getDate() + 6);
    } else if (viewMode === 'Month') {
      rangeStart = new Date(date.getFullYear(), date.getMonth(), 1);
      rangeEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    filtered = allEvents.filter(event => isEventInRange(event, rangeStart, rangeEnd));

    setFilteredEvents(filtered);
  }, [allEvents, viewMode]);

  const handleEventClick = useCallback((event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    if (event) {
      setEditingEvent(event);
      setIsEditModalVisible(true);
    }
  }, []);

  const handleDayClick = useCallback((date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    setCurrentDate(date);
    setViewMode('Day');
  }, []);

  const showModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewEvent({
      title: '',
      location: '',
      date: currentDate,
      startTime: new Date(currentDate.setHours(currentDate.getHours() + 1, 0, 0, 0)),
      endTime: new Date(currentDate.setHours(currentDate.getHours() + 2, 0, 0, 0)),
      color: '',
      repeat: 'none'
    });
    setIsModalVisible(true);
    setEditingEvent(null);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [currentDate, modalAnimation]);

  const hideModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setEditingEvent(null);
    });
  }, [modalAnimation]);

  const renderViewSwitcher = useCallback(() => (
    <LinearGradient
      colors={gradientColors[1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.viewSwitcherButton}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
          setViewMode(viewMode === 'Schedule' ? 'Day' : viewMode === 'Day' ? 'Week' : viewMode === 'Week' ? 'Month' : 'Schedule');
        }}
      >
        <Text style={styles.viewSwitcherText}>{viewMode} View</Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>
    </LinearGradient>
  ), [viewMode]);

  const formatDate = useCallback((date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, []);

  const changeDate = useCallback((change) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
    const newDate = new Date(currentDate);
    if (viewMode === 'Day' || viewMode === 'Schedule') {
      newDate.setDate(newDate.getDate() + change);
    } else if (viewMode === 'Week') {
      newDate.setDate(newDate.getDate() + change * 7);
    } else if (viewMode === 'Month') {
      newDate.setMonth(newDate.getMonth() + change);
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const renderDayView = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.dayViewHeader}>
        <Text style={styles.dayViewHeaderText}>
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      <View style={styles.dayViewContainer}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dayViewEvent}
              onPress={() => handleEventClick(event)}
            >
              <View style={[styles.eventDot, { backgroundColor: event.color || '#FFFFFF' }]} />
              <Text style={styles.dayViewEventTitle}>{event.title}</Text>
              <Text style={styles.dayViewEventTime}>
                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events for this day</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const isToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    const getEventsForDay = (day) => {
      return filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        if (event.repeat === 'none') {
          return eventDate.toDateString() === day.toDateString();
        }
        if (eventDate > day) return false;
        switch (event.repeat) {
          case 'daily':
            return true;
          case 'weekly':
            return eventDate.getDay() === day.getDay();
          case 'monthly':
            return eventDate.getDate() === day.getDate();
          case 'yearly':
            return eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate();
          default:
            return false;
        }
      });
    };

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.weekViewContainer}>
          {days.map((day, index) => (
            <View key={index} style={styles.weekViewDay}>
              <TouchableOpacity
                style={[
                  styles.weekViewDayHeader,
                  isToday(day) && styles.weekViewDayHeaderToday
                ]}
                onPress={() => handleDayClick(day)}
              >
                <Text style={styles.weekViewDayText}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.weekViewDateText,
                  isToday(day) && styles.weekViewDateTextToday
                ]}>
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
              <View style={styles.weekViewEventsContainer}>
                {getEventsForDay(day).map((event, eventIndex) => (
                  <TouchableOpacity
                    key={eventIndex}
                    style={[styles.weekViewEvent, { backgroundColor: event.color || '#4285F4' }]}
                    onPress={() => handleEventClick(event)}
                  >
                    <Text style={styles.weekViewEventTitle} numberOfLines={1} ellipsizeMode="tail">
                      {event.title}
                    </Text>
                    <Text style={styles.weekViewEventTime}>
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeks = [];
    let currentWeek = [];
    const day = new Date(startDate);

    while (day <= endDate) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const getEventsForDay = (day) => {
      return filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        if (event.repeat === 'none') {
          return eventDate.toDateString() === day.toDateString();
        }
        if (eventDate > day) return false;
        switch (event.repeat) {
          case 'daily':
            return true;
          case 'weekly':
            return eventDate.getDay() === day.getDay();
          case 'monthly':
            return eventDate.getDate() === day.getDate();
          case 'yearly':
            return eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate();
          default:
            return false;
        }
      });
    };

    const isToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    return (
      <View style={styles.monthView}>
        <View style={styles.weekDayHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.monthWeek}>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const today = isToday(day);
              const dayEvents = getEventsForDay(day);

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.monthDay,
                    !isCurrentMonth && styles.otherMonthDay,
                    today && styles.todayMonthDay
                  ]}
                  onPress={() => handleDayClick(day)}
                >
                  <Text style={[
                    styles.monthDayText,
                    today && styles.todayText,
                    !isCurrentMonth && styles.otherMonthDayText
                  ]}>
                    {day.getDate()}
                  </Text>
                  <View style={styles.monthDayEvents}>
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <View
                        key={index}
                        style={[
                          styles.monthEvent,
                          { backgroundColor: event.color || '#4285F4' },
                          today && styles.todayMonthEvent
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={[styles.moreEventsText, today && styles.todayMoreEventsText]}>
                        +{dayEvents.length - 3}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderScheduleView = () => (
    <FlatList
      data={filteredEvents}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.scheduleEvent}
          onPress={() => handleEventClick(item)}
        >
          <View style={[styles.scheduleEventDot, { backgroundColor: item.color || '#4285F4' }]} />
          <View style={styles.scheduleEventContent}>
            <Text style={styles.scheduleEventTitle}>{item.title}</Text>
            <Text style={styles.scheduleEventTime}>
              {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
              {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {item.location && (
              <Text style={styles.scheduleEventLocation}>{item.location}</Text>
            )}
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled</Text>
        </View>
      )}
    />
  );

  const EditEventModal = ({ isVisible, onClose, event, onSave, onDelete }) => {
    const [editedEvent, setEditedEvent] = useState(event || {
      title: '',
      location: '',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      repeat: 'none',
      color: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showRepeatPicker, setShowRepeatPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const colorOptions = ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333', '#000000'];

    useEffect(() => {
      if (event) {
        setEditedEvent(event);
      } else {
        setEditedEvent({
          title: '',
          location: '',
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          repeat: 'none',
          color: '#4285F4'
        });
      }
    }, [event]);

    const handleSave = () => {
      onSave(editedEvent);
      onClose();
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{event ? 'Edit event' : 'New event'}</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add title"
                  placeholderTextColor="#757575"
                  value={editedEvent.title}
                  onChangeText={(text) => setEditedEvent({ ...editedEvent, title: text })}
                />
              </View>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={24} color="#757575" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {editedEvent.date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={editedEvent.date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setEditedEvent({ ...editedEvent, date: selectedDate });
                    }
                  }}
                />
              )}
              <View style={styles.timeContainer}>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartTimePicker(true)}>
                  <Ionicons name="time-outline" size={24} color="#757575" style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>
                    {editedEvent.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndTimePicker(true)}>
                  <Ionicons name="time-outline" size={24} color="#757575" style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>
                    {editedEvent.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
              {showStartTimePicker && (
                <DateTimePicker
                  value={editedEvent.startTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(false);
                    if (selectedTime) {
                      setEditedEvent({ ...editedEvent, startTime: selectedTime });
                    }
                  }}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={editedEvent.endTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowEndTimePicker(false);
                    if (selectedTime) {
                      setEditedEvent({ ...editedEvent, endTime: selectedTime });
                    }
                  }}
                />
              )}
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={24} color="#757575" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Add location"
                  placeholderTextColor="#757575"
                  value={editedEvent.location}
                  onChangeText={(text) => setEditedEvent({ ...editedEvent, location: text })}
                />
              </View>
              <TouchableOpacity style={styles.repeatButton} onPress={() => setShowRepeatPicker(true)}>
                <Ionicons name="repeat" size={24} color="#757575" style={styles.inputIcon} />
                <Text style={styles.repeatText}>
                  {editedEvent.repeat === 'none' ? 'Does not repeat' : `Repeats ${editedEvent.repeat}`}
                </Text>
              </TouchableOpacity>
              {showRepeatPicker && (
                <Picker
                  selectedValue={editedEvent.repeat}
                  onValueChange={(itemValue) => {
                    setEditedEvent({ ...editedEvent, repeat: itemValue });
                    setShowRepeatPicker(false);
                  }}
                  style={styles.picker}
                >
                  {repeatOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} color="#000" />
                  ))}
                </Picker>
              )}
              <TouchableOpacity style={styles.colorButton} onPress={() => setShowColorPicker(true)}>
                <View style={[styles.colorDot, { backgroundColor: editedEvent.color || '#4285F4' }]} />
                <Text style={styles.colorText}>Color</Text>
              </TouchableOpacity>
              {showColorPicker && (
                <View style={styles.colorPickerContainer}>
                  {colorOptions.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorOption, { backgroundColor: color }]}
                      onPress={() => {
                        setEditedEvent({ ...editedEvent, color: color });
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </View>
              )}
              {event && (
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                  <Ionicons name="trash-outline" size={24} color="#DB4437" style={styles.inputIcon} />
                  <Text style={styles.deleteText}>Delete event</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const handleAddOrUpdateEvent = useCallback(async (updatedEvent) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let updatedEvents;
    if (updatedEvent.id) {
      updatedEvents = allEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      );
    } else {
      const newEventWithId = {
        ...updatedEvent,
        id: Date.now().toString(),
        color: updatedEvent.color || colors.secondary
      };
      updatedEvents = [...allEvents, newEventWithId];
    }
    setAllEvents(updatedEvents);
    await saveEvents(updatedEvents);
    filterEvents(currentDate);
    setIsEditModalVisible(false);
    setEditingEvent(null);
    hideModal();
  }, [allEvents, currentDate, filterEvents, hideModal]);

  const handleDeleteEvent = useCallback(async () => {
    if (editingEvent && !isDeleting) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setIsDeleting(true);
      const updatedEvents = allEvents.filter(event => event.id !== editingEvent.id);

      setIsEditModalVisible(false);
      setEditingEvent(null);

      timeoutRef.current = setTimeout(async () => {
        setAllEvents(updatedEvents);
        await saveEvents(updatedEvents);
        filterEvents(currentDate);
        setIsDeleting(false);
      }, 100);
    }
  }, [allEvents, currentDate, editingEvent, filterEvents, isDeleting]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <>
          <LinearGradient
            colors={gradientColors[0]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={32} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.dateContainer}>
              {renderViewSwitcher()}
              <Text style={styles.currentDate}>{formatDate(currentDate)}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
              /* Implement search functionality */
            }}>
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          </LinearGradient>
          <View style={styles.navigationButtons}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeDate(1)} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          {viewMode === 'Day' && renderDayView()}
          {viewMode === 'Week' && renderWeekView()}
          {viewMode === 'Month' && renderMonthView()}
          {viewMode === 'Schedule' && renderScheduleView()}
          <TouchableOpacity style={styles.addButton} onPress={showModal}>
            <Ionicons name="add" size={30} color={colors.primary} />
          </TouchableOpacity>

          <EditEventModal
            isVisible={isEditModalVisible || isModalVisible}
            onClose={() => {
              if (!isDeleting) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.medium);
                setIsEditModalVisible(false);
                setIsModalVisible(false);
                setEditingEvent(null);
              }
            }}
            event={editingEvent || newEvent}
            onSave={handleAddOrUpdateEvent}
            onDelete={handleDeleteEvent}
          />
        </>
      )}
    </SafeAreaView>
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
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
  },
  currentDate: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  dayViewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dayViewEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dayViewEventTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  dayViewEventTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  monthView: {
    flex: 1,
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: colors.gradientMiddle1,
  },
  weekDayText: {
    color: colors.text,
    fontSize: 12,
  },
  monthWeek: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT / 8,
  },
  monthDay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.textSecondary,
    padding: 5,
  },
  otherMonthDay: {
    backgroundColor: colors.gradientMiddle1,
  },
  todayMonthDay: {
    backgroundColor: colors.gradientMiddle2,
  },
  monthDayText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  todayText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  otherMonthDayText: {
    color: colors.textSecondary,
  },
  monthDayEvents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  monthEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
  todayMonthEvent: {
    opacity: 0.7,
  },
  moreEventsText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  todayMoreEventsText: {
    color: colors.text,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: 10,
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  repeatText: {
    fontSize: 16,
    color: colors.text,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  colorText: {
    fontSize: 16,
    color: colors.text,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 20,
  },
  deleteText: {
    fontSize: 16,
    color: colors.accent,
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.gradientMiddle1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  weekViewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  weekViewDay: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.7,
    borderRightWidth: 1,
    borderRightColor: colors.textSecondary,
  },
  weekViewDayHeader: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  weekViewDayHeaderToday: {
    backgroundColor: colors.gradientMiddle2,
  },
  weekViewDayText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekViewDateText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  weekViewDateTextToday: {
    color: colors.accent,
  },
  weekViewEventsContainer: {
    paddingTop: 5,
  },
  weekViewEvent: {
    borderRadius: 5,
    padding: 5,
    marginBottom: 5,
    marginHorizontal: 2,
  },
  weekViewEventTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekViewEventTime: {
    color: colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  dayViewHeader: {
    backgroundColor: colors.gradientMiddle1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  dayViewHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scheduleEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary,
  },
  scheduleEventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  scheduleEventContent: {
    flex: 1,
  },
  scheduleEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  scheduleEventTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  scheduleEventLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewSwitcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewSwitcherText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default CalendarScreen;