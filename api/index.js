const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------------- EVENTS ---------------------- */
let events = [
  { id: "1", title: "City Marathon 2026", date: "2026-05-10", seats: 100 },
  { id: "2", title: "Yoga Camp", date: "2026-06-15", seats: 50 },
  { id: "3", title: "Fitness Workshop", date: "2026-07-20", seats: 30 },
  { id: "4", title: "Cricket Tournament 2026", date: "2026-08-05", seats: 80 }
];

const bookings = {};

/* ---------------------- MAIL SETUP ---------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

/* ---------------------- EMAIL TEMPLATE ---------------------- */
const buildEmailHTML = ({ name, eventTitle, eventDate, seatNumber, bookingId }) => {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const cancelLink = `http://localhost:4000/cancel?bookingId=${bookingId}`;

  return `
    <h2>🎟️ Booking Confirmed</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p>
    <p><b>Date:</b> ${formattedDate}</p>
    <p><b>Seat Number:</b> ${seatNumber}</p>
    <p><b>Booking ID:</b> ${bookingId}</p>
    <p><a href="${cancelLink}">Cancel Booking</a></p>
  `;
};

/* ---------------------- GET EVENTS ---------------------- */
app.get("/events", (req, res) => {
  res.json(events);
});

/* ---------------------- BOOK EVENT ---------------------- */
app.post("/book", async (req, res) => {
  const { eventId, name, email } = req.body;

  if (!eventId || !name || !email) {
    return res.status(400).json({ message: "eventId, name, and email are required." });
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  const event = events.find(e => e.id === eventId);

  if (!event) return res.status(404).json({ message: "Event not found." });

  if (event.seats <= 0) {
    return res.status(409).json({ message: "No seats available." });
  }

  const bookingKey = `${eventId}_${email.toLowerCase()}`;

  if (bookings[bookingKey]) {
    return res.status(409).json({
      message: "You have already booked this event with this email."
    });
  }

  const seatNumber = 101 - event.seats;
  event.seats -= 1;

  const bookingId = `EVT-${eventId}-${Date.now()}`;

  bookings[bookingKey] = {
    name,
    email,
    eventId,
    bookingId,
    seatNumber,
    bookedAt: new Date().toISOString()
  };

  /* ---------- USER EMAIL ---------- */
  try {
    await transporter.sendMail({
      from: `"EventBook" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed — ${event.title}`,
      html: buildEmailHTML({
        name,
        eventTitle: event.title,
        eventDate: event.date,
        seatNumber,
        bookingId
      })
    });

    console.log(`📧 User confirmation email sent to ${email}`);
  } catch (err) {
    console.error("❌ User email failed:", err.message);
  }

  /* ---------- ADMIN EMAIL ---------- */
  try {
    await transporter.sendMail({
      from: `"EventBook" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🔔 New Booking — ${event.title}`,
      html: `
        <h2>🔔 New Booking Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Event:</b> ${event.title}</p>
        <p><b>Date:</b> ${event.date}</p>
        <p><b>Seat:</b> ${seatNumber}</p>
        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Booked At:</b> ${new Date().toLocaleString()}</p>
      `
    });

    console.log(`🔔 Admin notified for booking by ${email}`);
  } catch (err) {
    console.error("❌ Admin email failed:", err.message);
  }

  return res.status(200).json({
    message: "Booking confirmed! Email sent.",
    booking: {
      eventId,
      name,
      email,
      eventTitle: event.title,
      seatNumber,
      bookingId
    }
  });
});

/* ---------------------- CANCEL BOOKING ---------------------- */
app.get("/cancel", (req, res) => {
  const { bookingId } = req.query;

  const booking = Object.values(bookings).find(b => b.bookingId === bookingId);

  if (!booking) {
    return res.status(404).send("<h2>Booking not found or already cancelled.</h2>");
  }

  const event = events.find(e => e.id === booking.eventId);

  if (event) event.seats += 1;

  delete bookings[`${booking.eventId}_${booking.email.toLowerCase()}`];

  res.send(`
    <html>
      <body style="font-family:sans-serif;text-align:center;padding:60px;background:#f1f5f9;">
        <h1 style="color:#ef4444;">❌ Booking Cancelled</h1>
        <p>Your booking for <strong>${event?.title}</strong> has been cancelled.</p>
        <a href="http://localhost:5173">← Back to EventBook</a>
      </body>
    </html>
  `);
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});