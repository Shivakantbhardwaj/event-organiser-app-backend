const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const moment = require("moment-timezone");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


// POST create event
router.post("/", async (req, res) => {
  try {
    const { title, start, end } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const startIST = moment.tz(start, "Asia/Kolkata");
    const endIST = moment.tz(end, "Asia/Kolkata");

    const startHour = startIST.hour();
    const endHour = endIST.hour();

    if (startHour < 10 || endHour >= 18) {
      return res.status(400).json({ error: "Time must be between 10AM and 6PM" });
    }

    const newEvent = await Event.create({ title, start, end });
    req.io.emit("eventCreated", newEvent);
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});



// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (deletedEvent) {
      req.io.emit("eventDeleted", req.params.id); 
      res.json({ message: "Event deleted" });
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
