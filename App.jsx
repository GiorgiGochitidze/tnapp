import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Registration from "./Components/Registration";
import LogIn from "./Components/LogIn";
import Workers from "./Components/Workers"; // Import Workers component
import { useState } from "react";

const Stack = createStackNavigator();

export default function App() {
  const [userLocation, setUserLocation] = useState(null);

  const handleClockIn = (location) => {
    setUserLocation(location); // Set user's location in state
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="Login">
          {(props) => <LogIn {...props} navigation={props.navigation} />}
        </Stack.Screen>

        {/* Pass handleClockIn function as a parameter to Workers component */}
        <Stack.Screen name="Workers">
          {(props) => <Workers {...props} onClockIn={handleClockIn} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
