require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Allow requests from the React frontend
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { console.log("MongoDB Connected"); })
    .catch((err) => { console.log(err); });

// Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const campusRoutes = require("./routes/campusRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

// Mount Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/campuses", campusRoutes);
app.use("/subjects", subjectRoutes);
app.use("/sections", sectionRoutes);
app.use("/timetable", timetableRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});