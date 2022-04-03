import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, Button} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'LOCATION_TASK_NAME';
let foregroundSubscription = null;

// 위치 추적을 위한 백그라운드 태스크 작업 정의
TaskManager.defineTask(LOCATION_TASK_NAME, async ({data, error}) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    //데이터에서 위치정보 추출
    const {locations} = data;
    const location = locations[0];
    if (location) {
      console.log('Location in background', location.coords);
    }
  }
});

export default function App() {
  // 위치 정보 정의: {latitude: number, longitude: number}
  const [position, setPosition] = useState(null);

  // 앱 시작한 후 바로 권한 확인
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted)
        await Location.requestBackgroundPermissionsAsync();
    };
    requestPermissions();
  }, []);

  // foreground에서 위치 추적 시작
  const startForegroundUpdate = async () => {
    // foreground 위치 확인권한 확인
    const {granted} = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      console.log('location tracking denied');
      return;
    }
    // foreground가 아니면 위치 추적을 종료한다
    foregroundSubscription?.remove();

    // 실시간 위치 확인
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // 더 나은 로그를 위해, the most sensitive option으로 accuracy 조정
        accuracy: Location.Accuracy.BestForNavigation,
      },
      location => {
        setPosition(location.coords);
      },
    );
  };

  // foreground에서 위치 추적 종료
  const stopForegroundUpdate = () => {
    foregroundSubscription?.remove();
    setPosition(null);
  };

  // background에서 위치추적 시작
  const startBackgroundUpdate = async () => {
    // 권한이 없으면 추적하지 않는다
    const {granted} = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      console.log('location tracking denied');
      return;
    }

    // task가 정의되어 있지 않으면 추적을 시작하지 않는다s
    const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
    if (!isTaskDefined) {
      console.log('Task is not defined');
      return;
    }

    // 백그라운드에서 이미 추적하고 있으면 새로 추적하지 않음
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME,
    );
    if (hasStarted) {
      console.log('Already started');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      // 더 나은 로그를 위해, the most sensitive option으로 accuracy 조정
      accuracy: Location.Accuracy.BestForNavigation,
      // 백그라운드에서 지속적으로 추적하고 싶으면 해당 notification 을 enable해라
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Location',
        notificationBody: 'Location tracking in background',
        notificationColor: '#fff',
      },
    });
  };

  // 백그라운드 추적 중지
  const stopBackgroundUpdate = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME,
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Location tacking stopped');
    }
  };
  return (
    <View style={styles.container}>
      <Text>Longitude: {position?.longitude}</Text>
      <Text>Latitude: {position?.latitude}</Text>
      <View style={styles.separator} />
      <Button
        onPress={startForegroundUpdate}
        title="Start in foreground"
        color="green"
      />
      <View style={styles.separator} />
      <Button
        onPress={stopForegroundUpdate}
        title="Stop in foreground"
        color="red"
      />
      <View style={styles.separator} />
      <Button
        onPress={startBackgroundUpdate}
        title="Start in background"
        color="green"
      />
      <View style={styles.separator} />
      <Button
        onPress={stopBackgroundUpdate}
        title="Stop in foreground"
        color="red"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginTop: 15,
  },
  separator: {
    marginVertical: 8,
  },
});
