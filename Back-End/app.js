const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let registeredUsers = [];

wss.on("connection", (ws) => {
  console.log("Client connected");
  // Send initial data to the client when they connect
  ws.send(JSON.stringify(loadAllUsersData()));

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const updateUserLocations = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Load existing data from a file on server startup
const loadData = () => {
  try {
    const userData = fs.readFileSync("registeredUsers.json", "utf-8");
    registeredUsers = JSON.parse(userData) || [];
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, create an empty array and save it to the file
      fs.writeFileSync("registeredUsers.json", "[]", "utf-8");
    } else {
      console.error("Error loading data:", error.message);
    }
  }
};

// Save data to a file after each registration
const saveData = () => {
  try {
    fs.writeFileSync(
      "registeredUsers.json",
      JSON.stringify(registeredUsers, null, 2),
      "utf-8"
    );
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error.message);
  }
};

// POST route for user registration
app.post("/api/register", (req, res) => {
  const { username, password, userType } = req.body;

  console.log("\nUser Registration Data (Backend):", {
    username,
    password,
    userType,
  });

  if (registeredUsers.find((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Create a new file for the user and save the timer value
  try {
    fs.writeFileSync(
      `${username}_timer.json`,
      JSON.stringify({ timer: 0 }, null, 2),
      "utf-8"
    );
    console.log(`Timer file created and saved successfully for ${username}`);
  } catch (error) {
    console.error(`Error creating timer file for ${username}:`, error.message);
  }

  registeredUsers.push({ username, password, userType });
  saveData();

  res.json({ message: "User registered successfully" });
});

// POST route for user login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = registeredUsers.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    res.json({ message: "Login successful", user });
  } else {
    res
      .status(401)
      .json({ message: "Login failed. Incorrect username or password." });
  }
});

app.post("/api/saveWorkingTime", (req, res) => {
  const { username, workingTime, location } = req.body;

  try {
    // Load existing data
    let allUsersData = loadAllUsersData();

    // Update the workingTime and location
    allUsersData[username] = {
      ...(allUsersData[username] || {}), // Preserve existing data if any
      workingTime,
      location
    };

    // Save updated data to the file
    saveAllUsersData(allUsersData);

    res.json({ message: "Working time and location saved successfully" });
    
    // Send WebSocket update to all clients
    updateUserLocations(allUsersData);

    console.log(`Updated working time and location for user: ${username}`);
  } catch (error) {
    console.error(
      `Error saving working time and location for ${username}:`,
      error.message
    );
    res.status(500).json({ message: "Internal server error" });
  }
});


// Function to load data from all_users_data.json
const loadAllUsersData = () => {
  try {
    const userData = fs.readFileSync("all_users_data.json", "utf-8");
    return JSON.parse(userData) || {};
  } catch (error) {
    console.error("Error loading data:", error.message);
    return {};
  }
};

// Function to save data to all_users_data.json
const saveAllUsersData = (data) => {
  try {
    fs.writeFileSync("./all_users_data.json", JSON.stringify(data, null, 2), "utf-8");
    console.log("All users data saved successfully");
  } catch (err) {
    console.error("Error saving data:", err.message);
  }
};


// GET route for the root
app.get("/", (req, res) => {
  res.json({
    message: "Root of the server",
    registrationData: registeredUsers,
  });
});

// Load existing data from files on server startup
loadData();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});