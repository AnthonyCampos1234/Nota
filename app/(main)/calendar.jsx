import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('Day');
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', location: '', startTime: '', endTime: '' });

  useEffect(() => {
    // Simulating fetching events for the current date
    fetchEvents(currentDate);
  }, [currentDate]);

  const fetchEvents = (date) => {
    // This would typically be an API call. For now, we'll generate some sample events.
    const sampleEvents = [
      { id: '1', title: 'CS 3500 1 2024 (Boston)', location: 'Richards Hall, Room: 254', startTime: '11:40', endTime: '13:20', color: '#4CAF50' },
      { id: '2', title: 'INTB1203 40039 Intl Bus and Social R...', location: 'Dodge Hall, Room: 070', startTime: '13:30', endTime: '15:10', color: '#FF5722' },
    ];
    setEvents(sampleEvents);
  };

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
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

      const top = (startHour - 6) * 60 + startMinute;
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

  const handleAddEvent = () => {
    const newEventWithId = { ...newEvent, id: Date.now().toString(), color: '#' + Math.floor(Math.random() * 16777215).toString(16) };
    setEvents([...events, newEventWithId]);
    setShowModal(false);
    setNewEvent({ title: '', location: '', startTime: '', endTime: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.dateContainer}>
          <TouchableOpacity onPress={() => setViewMode(viewMode === 'Day' ? 'Week' : 'Day')}>
            <Text style={styles.dateText}>{viewMode} ⌄</Text>
          </TouchableOpacity>
          <Text style={styles.currentDate}>{formatDate(currentDate)}</Text>
        </View>
      </View>
      <View style={styles.navigationButtons}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.calendarContainer}>
          {renderTimeSlots()}
          {renderEvents()}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalView}>
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
          <TouchableOpacity style={styles.addEventButton} onPress={handleAddEvent}>
            <Text style={styles.addEventButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: 'white',
    fontSize: 20,
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
  navButtonText: {
    color: 'white',
    fontSize: 16,
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
    color: 'white',
    width: 50,
    textAlign: 'right',
    paddingRight: 10,
  },
  timeLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
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
  },
  eventLocation: {
    color: 'white',
    fontSize: 12,
  },
  eventTime: {
    color: 'white',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#333',
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
  input: {
    height: 40,
    width: '100%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: 'white',
    borderColor: 'white',
  },
  addEventButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  addEventButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CalendarScreen;