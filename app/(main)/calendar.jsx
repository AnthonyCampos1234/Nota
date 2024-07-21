import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('Day');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', location: '', startTime: '', endTime: '', color: '' });
  const [modalAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate, viewMode]);

  const fetchEvents = (date) => {
    // Simulating API call
    const sampleEvents = [
      { id: '1', title: 'CS 3500 1 2024', location: 'Richards Hall 254', startTime: '11:40', endTime: '13:20', color: '#4CAF50', date: new Date(date) },
      { id: '2', title: 'INTB1203 40039', location: 'Dodge Hall 070', startTime: '13:30', endTime: '15:10', color: '#FF5722', date: new Date(date) },
    ];
    setEvents(sampleEvents);
  };

  const showModal = () => {
    setIsModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const renderTimeSlots = () => {
    return timeSlots.map((hour) => (
      <View key={hour} style={styles.timeSlot}>
        <Text style={styles.timeText}>{hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}</Text>
        <View style={styles.timeLine} />
      </View>
    ));
  };

  const renderEvents = () => {
    return events.map((event) => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const startMinute = parseInt(event.startTime.split(':')[1]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      const endMinute = parseInt(event.endTime.split(':')[1]);

      const top = startHour * 60 + startMinute;
      const height = (endHour - startHour) * 60 + (endMinute - startMinute);

      return (
        <TouchableOpacity key={event.id} style={[styles.event, { top, height, backgroundColor: event.color }]}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
          <Text style={styles.eventTime}>{event.startTime} - {event.endTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderDayView = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.calendarContainer}>
        {renderTimeSlots()}
        {renderEvents()}
      </View>
    </ScrollView>
  );

  const renderWeekView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return (
      <ScrollView>
        <View style={styles.weekViewContainer}>
          <View style={styles.weekDayHeadersContainer}>
            <View style={styles.emptyCell} />
            {weekDays.map((day, index) => {
              const date = new Date(startOfWeek);
              date.setDate(startOfWeek.getDate() + index);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <View key={day} style={[styles.weekDayHeader, isToday && styles.todayWeekDay]}>
                  <Text style={[styles.weekDayText, isToday && styles.todayText]}>{day}</Text>
                  <View style={[styles.weekDateCircle, isToday && styles.todayDateCircle]}>
                    <Text style={[styles.weekDateText, isToday && styles.todayText]}>{date.getDate()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.weekViewContent}>
            {timeSlots.map((hour) => (
              <View key={hour} style={styles.weekViewRow}>
                <Text style={styles.weekViewTimeText}>{hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}</Text>
                {weekDays.map((day, index) => {
                  const date = new Date(startOfWeek);
                  date.setDate(startOfWeek.getDate() + index);
                  return (
                    <View key={`${day}-${hour}`} style={styles.weekViewCell}>
                      {events
                        .filter(event =>
                          event.date.getDate() === date.getDate() &&
                          parseInt(event.startTime.split(':')[0]) === hour
                        )
                        .map(event => (
                          <View key={event.id} style={[styles.weekViewEvent, { backgroundColor: event.color }]}>
                            <Text style={styles.weekViewEventTitle}>{event.title}</Text>
                            <Text style={styles.weekViewEventTime}>{event.startTime} - {event.endTime}</Text>
                          </View>
                        ))
                      }
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return (
      <View style={styles.monthView}>
        {monthDays.slice(0, endOfMonth.getDate()).map(day => (
          <TouchableOpacity key={day} style={styles.monthDay}>
            <Text style={styles.monthDayText}>{day}</Text>
            <View style={styles.monthDayEvents}>
              {events.filter(event => event.date.getDate() === day).slice(0, 2).map(event => (
                <View key={event.id} style={[styles.monthEvent, { backgroundColor: event.color }]} />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleAddEvent = () => {
    const newEventWithId = {
      ...newEvent,
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      date: currentDate
    };
    setEvents([...events, newEventWithId]);
    hideModal();
    setNewEvent({ title: '', location: '', startTime: '', endTime: '', color: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.dateContainer}>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'Day' ? 'Week' : viewMode === 'Week' ? 'Month' : 'Day')}>
            <Text style={styles.dateText}>{viewMode} View <Ionicons name="chevron-down" size={16} color="white" /></Text>
          </TouchableOpacity>
          <Text style={styles.currentDate}>{formatDate(currentDate)}</Text>
        </View>
      </View>
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Previous</Text>
          <Ionicons name="chevron-back" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>
      {viewMode === 'Day' && renderDayView()}
      {viewMode === 'Week' && renderWeekView()}
      {viewMode === 'Month' && renderMonthView()}
      <TouchableOpacity style={styles.addButton} onPress={showModal}>
        <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalView,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#999"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#999"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Start Time (HH:MM)"
              placeholderTextColor="#999"
              value={newEvent.startTime}
              onChangeText={(text) => setNewEvent({ ...newEvent, startTime: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="End Time (HH:MM)"
              placeholderTextColor="#999"
              value={newEvent.endTime}
              onChangeText={(text) => setNewEvent({ ...newEvent, endTime: text })}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddEvent}>
                <Text style={styles.modalButtonText}>Add Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={hideModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  currentDate: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  navButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    paddingLeft: 50,
  },
  timeSlot: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    width: 50,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 12,
  },
  timeLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  event: {
    position: 'absolute',
    left: 60,
    right: 10,
    borderRadius: 5,
    padding: 10,
  },
  eventTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  eventLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  eventTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  weekViewContainer: {
    flexDirection: 'column',
  },
  weekDayHeadersContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  emptyCell: {
    color: 'white',
    width: 50,
  },
  weekDayHeader: {
    color: 'white',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekViewContent: {
    flexDirection: 'column',
  },
  weekDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekDateText: {
    color: 'white',
    fontSize: 12,
  },
  weekViewRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  weekViewTimeText: {
    width: 50,
    textAlign: 'right',
    paddingRight: 10,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  weekViewCell: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  weekViewEvent: {
    position: 'absolute',
    left: 2,
    right: 2,
    padding: 4,
    borderRadius: 4,
    elevation: 2,
  },
  weekViewEventTitle: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weekViewEventTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
  },
  monthView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  monthDay: {
    width: (SCREEN_WIDTH - 20) / 7,
    height: (SCREEN_WIDTH - 20) / 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  monthDayText: {
    color: '#FFF',
    fontSize: 14,
  },
  monthDayEvents: {
    flexDirection: 'row',
    marginTop: 5,
  },
  monthEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#2C2C2C',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CalendarScreen;