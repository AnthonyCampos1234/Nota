import AsyncStorage from '@react-native-async-storage/async-storage';

const serializeEvent = (event) => {
    const serialized = {};
    for (const [key, value] of Object.entries(event)) {
        if (value instanceof Date) {
            serialized[key] = {
                type: 'Date',
                value: value.toISOString()
            };
        } else if (typeof value === 'object' && value !== null) {
            serialized[key] = {
                type: 'Object',
                value: JSON.stringify(value)
            };
        } else {
            serialized[key] = {
                type: typeof value,
                value: value
            };
        }
    }
    return serialized;
};

const deserializeEvent = (serialized) => {
    const deserialized = {};
    for (const [key, { type, value }] of Object.entries(serialized)) {
        switch (type) {
            case 'Date':
                deserialized[key] = new Date(value);
                break;
            case 'Object':
                try {
                    deserialized[key] = JSON.parse(value);
                } catch {
                    deserialized[key] = value;
                }
                break;
            default:
                deserialized[key] = value;
        }
    }
    return deserialized;
};

export const saveEvents = async (events) => {
    try {
        const serializedEvents = events.map(serializeEvent);
        await AsyncStorage.setItem('events', JSON.stringify(serializedEvents));
    } catch (error) {
        console.error('Error saving events:', error);
    }
};

export const loadEvents = async () => {
    try {
        const savedEvents = await AsyncStorage.getItem('events');
        if (savedEvents !== null) {
            const serializedEvents = JSON.parse(savedEvents);
            return serializedEvents.map(deserializeEvent);
        }
        return [];
    } catch (error) {
        console.error('Error loading events:', error);
        return [];
    }
};