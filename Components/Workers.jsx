import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import * as Location from "expo-location"; // Import Location from Expo
import { useNavigation } from "@react-navigation/native";

const Workers = ({ onClockIn, route }) => {
  const { username } = route.params;
  const [currentDate, setCurrentDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [workingTime, setWorkingTime] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false); // Track if timer has started
  const [latitude, setLatitude] = useState(null); // User's latitude
  const [longitude, setLongitude] = useState(null); // User's longitude
  const [ws, setWs] = useState(null); // WebSocket instance
  const [watchId, setWatchId] = useState(null); // ID of the watchPosition callback
  const navigation = useNavigation();

  useEffect(() => {
    const intervalId = setInterval(fetchTime, 1000);
    fetchTime();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const initializeWebSocket = () => {
      const socket = new WebSocket("ws://localhost:5000/");

      socket.onopen = () => {
        console.log("Connected to WebSocket server");
        setWs(socket);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        if (!event.wasClean) {
          console.error(
            `WebSocket connection closed unexpectedly: code=${event.code}, reason=${event.reason}`
          );
        }
      };
    };

    initializeWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const fetchTime = () => {
    try {
      const currentDateObj = new Date();
      setCurrentDate(currentDateObj.toDateString());
      setCurrentTime(currentDateObj.toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching time:", error.message);
    }
  };

  const clockIn = async () => {
    try {
      const currentDateTime = new Date();
      setClockInTime(currentDateTime);
      setTimerStarted(true);

      const { status } = await Location.requestForegroundPermissionsAsync(); // Request permission for location
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      const id = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const locationData = { latitude, longitude };
          setLatitude(latitude);
          setLongitude(longitude);

          // Send data to the server
          if (onClockIn) {
            onClockIn({ username, workingTime: null, location: locationData });
            saveWorkingTime({
              username,
              workingTime: null,
              location: locationData,
            });
          }
        },
        (error) => {
          console.error("Error getting user's location:", error.message);
        }
      );

      setWatchId(id);
    } catch (error) {
      console.error("Error clocking in:", error.message);
    }
  };

  const clockOut = async () => {
    try {
      const currentDateTime = new Date();
      setClockOutTime(currentDateTime);

      if (watchId !== null) {
        await watchId.remove(); // Use remove method on watchId to stop watching
      } else {
        console.error("watchId is null");
      }

      if (clockInTime !== null) {
        const diffMilliseconds = currentDateTime - clockInTime;
        const seconds = Math.floor(diffMilliseconds / 1000);
        setWorkingTime(seconds);
        saveWorkingTime({ username, workingTime: seconds, location: null });
      } else {
        console.error("clockInTime is null");
      }
    } catch (error) {
      console.error("Error clocking out:", error.message);
    }
  };

  const resetTimer = () => {
    try {
      setClockInTime(null);
      setClockOutTime(null);
      setWorkingTime(null);
      setTimerStarted(false);
    } catch (error) {
      console.error("Error resetting timer:", error.message);
    }
  };

  const saveWorkingTime = (data) => {
    fetch("http://localhost:5000/api/saveWorkingTime", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        console.error("Error saving working time:", error.message);
      });
  };

  return (
    <View>
      <View style={styles.header}>
        <Text>Welcome, {username}!</Text>
        <Button title="Log Out" onPress={() => navigation.navigate("LogIn")} />
      </View>
      <View>
        <View style={styles.texts}>
          <Text>Current Date: {currentDate}</Text>
          <Text>Current Time: {currentTime}</Text>
        </View>

        <View style={styles.form}>
          <Text>
            <Text>Your Current Working Time: </Text>
            {workingTime !== null
              ? `Worked for ${formatTime(workingTime)}`
              : clockOutTime
              ? `Worked from ${formatTime(clockInTime)} to ${formatTime(
                  clockOutTime
                )}`
              : timerStarted
              ? "Timer started"
              : "Not yet Started Work"}
          </Text>
        </View>
        {!clockOutTime && !timerStarted && (
          <Button title="Clock In" onPress={clockIn} />
        )}
        {!clockOutTime && timerStarted && (
          <Button title="Clock Out" onPress={clockOut} />
        )}
        {clockOutTime && <Button title="Reset" onPress={resetTimer} />}
      </View>
    </View>
  );
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default Workers;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: "auto",
    display: "flex",
    justifyContent: "space-evenly",
    flexDirection: "row",
  },

  form: {
    width: "300px",
    height: "300px",
    margin: "auto",
    marginTop: "100px",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: '20px'
  },

  texts: {
    width: "100%",
    textAlign: "center",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
});
