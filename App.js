import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
export default function App() {
  const [newCurlocation, setNewCurlocation] = useState(null);
  console.log(Constants.systemFonts);
  let foregroundSubscrition = null;
  async function getLoca() {
    (async () => {
      const foregroundPermission =
        await Location.requestForegroundPermissionsAsync();
      console.log('foregroundPermission', foregroundPermission);

      if (foregroundPermission.granted) {
        foregroundSubscrition = Location.watchPositionAsync(
          {
            // Tracking options
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          location => {
            setNewCurlocation(JSON.stringify(location));
            console.log(JSON.stringify(location));
          },
        );
      }
    })();
  }

  return (
    <View>
      <Text onPress={() => getLoca()}>위치 가져오기</Text>
      <Text>{newCurlocation}</Text>
    </View>
  );
}
