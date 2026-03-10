const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---------------------- EVENTS ---------------------- */
let events = [
  { id: "1", title: "City Marathon 2026", date: "2026-05-10", seats: 100, totalSeats: 100 },
  { id: "2", title: "Yoga Camp", date: "2026-06-15", seats: 50, totalSeats: 50 },
  { id: "3", title: "Fitness Workshop", date: "2026-07-20", seats: 30, totalSeats: 30 },
  { id: "4", title: "Cricket Tournament 2026", date: "2026-08-05", seats: 80, totalSeats: 80 }
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
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const cancelLink = `${process.env.API_URL || "http://localhost:4000"}/cancel?bookingId=${bookingId}`;

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px;">
      <h2 style="color:#4f46e5;">🎟️ Booking Confirmed!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;color:#64748b;">Date</td><td style="padding:8px;font-weight:600;">${formattedDate}</td></tr>
        <tr style="background:#fff;"><td style="padding:8px;color:#64748b;">Seat Number</td><td style="padding:8px;font-weight:600;">#${seatNumber}</td></tr>
        <tr><td style="padding:8px;color:#64748b;">Booking ID</td><td style="padding:8px;font-weight:600;">${bookingId}</td></tr>
      </table>
      <a href="${cancelLink}" style="color:#ef4444;font-size:13px;">Cancel this booking</a>
    </div>
  `;
};

/* ---------------------- GET EVENTS ---------------------- */
app.get("/events", (req, res) => {
  res.json(events);
});

/* ---------------------- BOOK EVENT ---------------------- */
app.post("/book", (req, res) => {
  const { eventId, name, email } = req.body;

  // Validation
  if (!eventId || !name || !email) {
    return res.status(400).json({ message: "eventId, name, and email are required." });
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters." });
  }

  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });
  if (event.seats <= 0) return res.status(409).json({ message: "No seats available." });

  const bookingKey = `${eventId}_${email.toLowerCase()}`;
  if (bookings[bookingKey]) {
    return res.status(409).json({ message: "You have already booked this event with this email." });
  }

  // Confirm booking
  const seatNumber = (event.totalSeats - event.seats) + 1;
  event.seats -= 1;
  const bookingId = `EVT-${eventId}-${Date.now()}`;

  bookings[bookingKey] = {
    name, email, eventId, bookingId, seatNumber,
    bookedAt: new Date().toISOString()
  };

  // Send emails fire-and-forget (non-blocking)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    transporter.sendMail({
      from: `"EventBook" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed — ${event.title}`,
      html: buildEmailHTML({ name, eventTitle: event.title, eventDate: event.date, seatNumber, bookingId })
    }).then(() => console.log(`📧 Email sent to ${email}`))
      .catch(err => console.error("❌ User email failed:", err.message));

    transporter.sendMail({
      from: `"EventBook" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🔔 New Booking — ${event.title}`,
      html: `
        <h2>🔔 New Booking Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Event:</b> ${event.title}</p>
        <p><b>Date:</b> ${event.date}</p>
        <p><b>Seat:</b> #${seatNumber}</p>
        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Booked At:</b> ${new Date().toLocaleString()}</p>
      `
    }).then(() => console.log(`🔔 Admin notified`))
      .catch(err => console.error("❌ Admin email failed:", err.message));
  }

  // Respond immediately — don't wait for email
  return res.status(200).json({
    message: "Booking confirmed!",
    booking: {
      eventId,
      name,
      email,
      eventTitle: event.title,
      eventDate: event.date,
      seatNumber,
      bookingId
    }
  });
});

/* ---------------------- CANCEL BOOKING ---------------------- */
app.get("/cancel", (req, res) => {
  const { bookingId } = req.query;
  const bookingEntry = Object.entries(bookings).find(([, b]) => b.bookingId === bookingId);

  if (!bookingEntry) {
    return res.status(404).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f1f5f9;">
        <h2 style="color:#ef4444;">Booking not found or already cancelled.</h2>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">← Back to EventBook</a>
      </body></html>
    `);
  }

  const [bookingKey, booking] = bookingEntry;
  const event = events.find(e => e.id === booking.eventId);
  if (event) event.seats += 1;
  delete bookings[bookingKey];

  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#f1f5f9;">
      <h1 style="color:#ef4444;">❌ Booking Cancelled</h1>
      <p>Your booking for <strong>${event?.title}</strong> has been cancelled.</p>
      <p style="color:#64748b;">Booking ID: ${bookingId}</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
         style="display:inline-block;margin-top:16px;padding:10px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">
        ← Back to EventBook
      </a>
    </body></html>
  `);
});

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});