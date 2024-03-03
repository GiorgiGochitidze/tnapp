import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';


const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

const handleLogIn = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/login",
      { username: username.toLowerCase(), password }
    );

    console.log("Response:", response); // Log the response

    if (response && response.data && response.data.message === "Login successful") {
      const user = response.data.user;

      // Check userType and navigate accordingly
      if (user.userType === "Manager") {
        // Navigate to Manager screen
        navigation.navigate("ManagerScreen");
      } else {
        // Navigate to Worker screen with username as parameter
        navigation.navigate("Workers", { username: user.username });
      }
    } else {
      console.log("Login failed. Incorrect username or password.");
    }
  } catch (error) {
    console.error("Login failed:", error.response.data.message);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.toggleContainer}>
          <Button title="Register" onPress={() => {navigation.navigate('Registration')}} />
          <Button title="Log In" onPress={() => {navigation.navigate('LogIn')}} />
        </View>
        <Text style={styles.title}>Log In</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="User Name"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
        />
        <Button title="Log In" onPress={handleLogIn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    display: 'flex',
    width: '100%',
    height: 'auto',
    gap: '20px',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  input: {
    width: "80%",
    height: 40,
    maxWidth: 300,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "white",
    color: "#46C9CA",
    paddingHorizontal: 10,
    fontSize: 15,
    marginVertical: 5,
  },

  form: {
    width: 400,
    height: "400px",
    paddingVertical: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#34445F",
    color: "#46C9CA",
    borderRadius: 20,
    gap: "20px",
  },
});

export default LogIn;
