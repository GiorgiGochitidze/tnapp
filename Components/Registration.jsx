import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";

const Registration = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "Worker",
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async () => {
    try {
      console.log("User Registration Data (Frontend):", formData);

      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData
      );

      console.log(response.data);

      setFormData({
        // Clear form fields after successful registration
        username: "",
        password: "",
        userType: "Worker",
      });

      navigation.navigate("Login"); // Navigate to the login page
    } catch (error) {
      console.error("Registration failed:", error.response.data.message);
    }
  };

  return (
    <View style={styles.formAppContainer}>
      <View style={styles.form}>
        <View style={styles.toggleContainer}>
          <Button
            title="Register"
            onPress={() => {}}
            style={styles.toggleBtn}
          />
          <Button
            title="Log In"
            onPress={() => navigation.navigate("Login")}
            style={styles.toggleBtn}
          />
        </View>

        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          name="username"
          value={formData.username}
          onChangeText={(text) => handleInputChange("username", text)}
          placeholder="User Name"
        />
        <TextInput
          style={styles.input}
          name="password"
          value={formData.password}
          onChangeText={(text) => handleInputChange("password", text)}
          secureTextEntry
          placeholder="Password"
        />
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          style={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formAppContainer: {
    width: "100%",
    height: 600,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
  title: {
    color: "#46C9CA",
    fontSize: 20,
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
  submitBtn: {
    width: 200,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#46C9CA",
    color: "white",
    marginTop: 20,
  },

  toggleContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    gap: '20px',
    flexDirection: 'row',
    justifyContent: 'center'
  }
});

export default Registration;
