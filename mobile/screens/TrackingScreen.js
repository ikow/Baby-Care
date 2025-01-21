import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TrackingScreen = () => {
  const [activities, setActivities] = useState([]);

  const addFeeding = () => {
    // Navigate to feeding form
  };

  const addDiaper = () => {
    // Navigate to diaper form
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Baby Tracking</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={addFeeding}>
          <Text style={styles.buttonText}>Add Feeding</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={addDiaper}>
          <Text style={styles.buttonText}>Add Diaper Change</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.activityItem}>
            <Text style={styles.activityTime}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.activityText}>
              {item.type === 'feeding' 
                ? `Feeding: ${item.feedingType} ${item.volume ? `${item.volume}ml` : ''}`
                : `Diaper: ${item.diaperType}`}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
  activityText: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default TrackingScreen; 