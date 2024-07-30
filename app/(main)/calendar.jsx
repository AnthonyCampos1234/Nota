import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveEvents, loadEvents } from '../../context/eventStorage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('Day');
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
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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

  const handleEventClick = (event) => {
    if (event) {
      setEditingEvent(event);
      setIsEditModalVisible(true);
    }
  };

  const handleDayClick = (date) => {
    setCurrentDate(date);
    setViewMode('Day');
  };

  const filterEvents = useCallback((date) => {
    if (!allEvents || allEvents.length === 0) {
      setFilteredEvents([]);
      return;
    }
    const isEventInRange = (event, start, end) => {
      const eventDate = new Date(event.date);
      if (event.repeat === 'none') {
        return eventDate >= start && eventDate <= end;
      }
      if (event.repeat === 'daily') {
        return eventDate <= end;
      }
      if (event.repeat === 'weekly') {
        return eventDate <= end && eventDate.getDay() === date.getDay();
      }
      if (event.repeat === 'monthly') {
        return eventDate <= end && eventDate.getDate() === date.getDate();
      }
      if (event.repeat === 'yearly') {
        return eventDate <= end && eventDate.getMonth() === date.getMonth() && eventDate.getDate() === date.getDate();
      }
      return false;
    };

    let filtered;
    if (viewMode === 'Day') {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      filtered = allEvents.filter(event => isEventInRange(event, dayStart, dayEnd));
    } else if (viewMode === 'Week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      filtered = allEvents.filter(event => isEventInRange(event, weekStart, weekEnd));
    } else if (viewMode === 'Month') {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      filtered = allEvents.filter(event => isEventInRange(event, monthStart, monthEnd));
    }

    setFilteredEvents(filtered);
  }, [allEvents, viewMode]);

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

  const changeDate = (change) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'Day') {
      newDate.setDate(newDate.getDate() + change);
    } else if (viewMode === 'Week') {
      newDate.setDate(newDate.getDate() + change * 7);
    } else if (viewMode === 'Month') {
      newDate.setMonth(newDate.getMonth() + change);
    }
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
    return filteredEvents.map((event) => {
      const startHour = event.startTime.getHours();
      const startMinute = event.startTime.getMinutes();
      const endHour = event.endTime.getHours();
      const endMinute = event.endTime.getMinutes();

      const top = startHour * 60 + startMinute;
      const height = (endHour - startHour) * 60 + (endMinute - startMinute);

      return (
        <TouchableOpacity
          key={event.id}
          style={[styles.event, { top, height, backgroundColor: event.color }]}
          onPress={() => handleEventClick(event)}
        >
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
          <Text style={styles.eventTime}>
            {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
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
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

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
                      {filteredEvents
                        .filter(event =>
                          (event.date.getDate() === date.getDate() || event.repeat !== 'none') &&
                          event.startTime.getHours() === hour
                        )
                        .map(event => (
                          <View key={event.id} style={[styles.weekViewEvent, { backgroundColor: event.color }]}>
                            <Text style={styles.weekViewEventTitle}>{event.title}</Text>
                            <Text style={styles.weekViewEventTime}>
                              {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
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

    return (
      <View style={styles.monthView}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.monthWeek}>
            {week.map((day, dayIndex) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = filteredEvents.filter(event =>
                (event.date.getDate() === day.getDate() && event.date.getMonth() === day.getMonth()) ||
                event.repeat === 'daily' ||
                (event.repeat === 'weekly' && event.date.getDay() === day.getDay()) ||
                (event.repeat === 'monthly' && event.date.getDate() === day.getDate()) ||
                (event.repeat === 'yearly' && event.date.getMonth() === day.getMonth() && event.date.getDate() === day.getDate())
              );

              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[styles.monthDay, !isCurrentMonth && styles.otherMonthDay]}
                  onPress={() => handleDayClick(day)}
                >
                  <Text style={[styles.monthDayText, isToday && styles.todayText]}>{day.getDate()}</Text>
                  <View style={styles.monthDayEvents}>
                    {dayEvents.slice(0, 3).map(event => (
                      <View key={event.id} style={[styles.monthEvent, { backgroundColor: event.color }]} />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
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
          color: ''
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {event ? 'Edit Event' : 'Add Event'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#999"
              value={editedEvent.title}
              onChangeText={(text) => setEditedEvent({ ...editedEvent, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#999"
              value={editedEvent.location}
              onChangeText={(text) => setEditedEvent({ ...editedEvent, location: text })}
            />
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
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
            <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.dateText}>
                Start: {editedEvent.startTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.dateText}>
                End: {editedEvent.endTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
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
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Repeat:</Text>
              {['none', 'daily', 'weekly', 'monthly', 'yearly'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.repeatOption, editedEvent.repeat === option && styles.selectedRepeatOption]}
                  onPress={() => setEditedEvent({ ...editedEvent, repeat: option })}
                >
                  <Text style={styles.repeatOptionText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              {event && (
                <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={onDelete}>
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };



  const handleAddOrUpdateEvent = async (updatedEvent) => {
    let updatedEvents;
    if (updatedEvent.id) {
      updatedEvents = allEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      );
    } else {
      const newEventWithId = {
        ...updatedEvent,
        id: Date.now().toString(),
        color: updatedEvent.color || ('#' + Math.floor(Math.random() * 16777215).toString(16))
      };
      updatedEvents = [...allEvents, newEventWithId];
    }
    setAllEvents(updatedEvents);
    await saveEvents(updatedEvents);
    filterEvents(currentDate);
    setIsEditModalVisible(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (editingEvent) {
      const updatedEvents = allEvents.filter(event => event.id !== editingEvent.id);
      setAllEvents(updatedEvents);
      await saveEvents(updatedEvents);
      filterEvents(currentDate);
      setIsEditModalVisible(false);
      setEditingEvent(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <>
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
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>
                    {newEvent.date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={newEvent.date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setNewEvent({ ...newEvent, date: selectedDate });
                      }
                    }}
                  />
                )}
                <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
                  <Text style={styles.dateText}>
                    Start: {newEvent.startTime.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={newEvent.startTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowStartTimePicker(false);
                      if (selectedTime) {
                        setNewEvent({ ...newEvent, startTime: selectedTime });
                      }
                    }}
                  />
                )}
                <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
                  <Text style={styles.dateText}>
                    End: {newEvent.endTime.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={newEvent.endTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowEndTimePicker(false);
                      if (selectedTime) {
                        setNewEvent({ ...newEvent, endTime: selectedTime });
                      }
                    }}
                  />
                )}
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Repeat:</Text>
                  {['none', 'daily', 'weekly', 'monthly', 'yearly'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.repeatOption, newEvent.repeat === option && styles.selectedRepeatOption]}
                      onPress={() => setNewEvent({ ...newEvent, repeat: option })}
                    >
                      <Text style={styles.repeatOptionText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => handleAddOrUpdateEvent(newEvent)}>
                    <Text style={styles.modalButtonText}>Add Event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={hideModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>
          <EditEventModal
            isVisible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false);
              setEditingEvent(null);
            }}
            event={editingEvent}
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
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
    width: 50,
  },
  weekDayHeader: {
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
    flex: 1,
    flexDirection: 'column',
  },
  monthWeek: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT / 8, // Adjust this value as needed
  },
  monthDay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 5,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  monthDayText: {
    color: '#FFF',
    fontSize: 14,
  },
  todayText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  monthDayEvents: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
  },
  monthEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
  moreEventsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  pickerLabel: {
    color: 'white',
    marginRight: 10,
  },
  repeatOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  selectedRepeatOption: {
    backgroundColor: '#4CAF50',
  },
  repeatOptionText: {
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  },
});

export default CalendarScreen;