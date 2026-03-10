const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---------------------- ADMIN EMAIL (HARDCODED) ---------------------- */
const ADMIN_EMAIL = "kartad044@rmkcet.ac.in";

/* ---------------------- EVENTS ---------------------- */
let events = [
  {
    id: "1",
    title: "City Marathon 2026",
    description: "Join thousands of runners in the biggest city marathon of the year!",
    date: "2026-05-10",
    time: "06:00 AM",
    location: "Marina Beach, Chennai",
    category: "Sports",
    seats: 100,
    totalSeats: 100
  },
  {
    id: "2",
    title: "Yoga Camp",
    description: "A rejuvenating full-day yoga camp led by certified instructors.",
    date: "2026-06-15",
    time: "07:30 AM",
    location: "Cubbon Park, Bangalore",
    category: "Wellness",
    seats: 50,
    totalSeats: 50
  },
  {
    id: "3",
    title: "Fitness Workshop",
    description: "Hands-on fitness workshop covering strength training and nutrition.",
    date: "2026-07-20",
    time: "10:00 AM",
    location: "YMCA Ground, Chennai",
    category: "Health",
    seats: 30,
    totalSeats: 30
  },
  {
    id: "4",
    title: "Cricket Tournament 2026",
    description: "Inter-college cricket tournament. Compete for the trophy!",
    date: "2026-08-05",
    time: "08:00 AM",
    location: "RMKCET Cricket Ground, Chennai",
    category: "Sports",
    seats: 80,
    totalSeats: 80
  }
];

const bookings = {};

/* ---------------------- RESEND EMAIL SETUP ---------------------- */
// Using Resend API (works on Render — no SMTP port blocking)

/* ---------------------- SEND EMAIL ---------------------- */
async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ Email skipped — RESEND_API_KEY is not set!");
    return;
  }
  if (!to) {
    console.error("❌ Email skipped — recipient address is missing!");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "EventBook <onboarding@resend.dev>",
      to,
      subject,
      html
    });
    if (error) {
      console.error(`❌ Email FAILED to ${to}:`, error.message);
    } else {
      console.log(`📧 Email sent to ${to} | ID: ${data.id}`);
    }
  } catch (err) {
    console.error(`❌ Email FAILED to ${to}:`, err.message);
  }
}

/* ---------------------- USER CONFIRMATION EMAIL ---------------------- */
const buildUserEmailHTML = ({ name, eventTitle, eventDate, eventTime, eventLocation, seatNumber, bookingId }) => {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const cancelLink = `${process.env.API_URL}/cancel?bookingId=${bookingId}`;

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🎟️</div>
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Booking Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your seat has been reserved successfully</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">
          Hello <strong>${name}</strong>, your booking for <strong>${eventTitle}</strong> is confirmed! 🎉
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e2e8f0;">
          <h3 style="color:#4f46e5;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Event Details</h3>
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:18px;margin-right:12px;">📅</span>
            <div>
              <div style="color:#6b7280;font-size:12px;">Date</div>
              <div style="color:#111827;font-weight:600;font-size:14px;">${formattedDate}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:18px;margin-right:12px;">🕐</span>
            <div>
              <div style="color:#6b7280;font-size:12px;">Time</div>
              <div style="color:#111827;font-weight:600;font-size:14px;">${eventTime || "TBD"}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;">
            <span style="font-size:18px;margin-right:12px;">📍</span>
            <div>
              <div style="color:#6b7280;font-size:12px;">Location</div>
              <div style="color:#111827;font-weight:600;font-size:14px;">${eventLocation || "TBD"}</div>
            </div>
          </div>
        </div>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #bbf7d0;">
          <h3 style="color:#16a34a;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Booking Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Seat Number</td>
              <td style="padding:6px 0;color:#111827;font-weight:700;font-size:13px;text-align:right;">#${seatNumber}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Booking ID</td>
              <td style="padding:6px 0;color:#111827;font-weight:600;font-size:12px;text-align:right;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:13px;">Name</td>
              <td style="padding:6px 0;color:#111827;font-weight:600;font-size:13px;text-align:right;">${name}</td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;padding-top:8px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">Need to cancel?</p>
          <a href="${cancelLink}" style="color:#ef4444;font-size:13px;text-decoration:none;">❌ Cancel this booking</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">EventBook · Automated confirmation email</p>
      </div>
    </div>
  `;
};

/* ---------------------- ADMIN NOTIFICATION EMAIL ---------------------- */
const buildAdminEmailHTML = ({ name, email, event, seatNumber, bookingId }) => `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px;text-align:center;">
      <div style="font-size:36px;">🔔</div>
      <h2 style="color:#ffffff;margin:8px 0 0;font-size:20px;">New Booking Received</h2>
      <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">A user just booked an event</p>
    </div>
    <div style="padding:24px;">
      <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
        <h3 style="color:#374151;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">User Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">👤 Name</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">📧 Email</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${email}</td>
          </tr>
        </table>
      </div>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;margin-top:16px;">
        <h3 style="color:#374151;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Event Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">🎟️ Event</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${event.title}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">📅 Date</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${event.date}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">🕐 Time</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${event.time}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">📍 Location</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">${event.location}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f1f5f9;">💺 Seat</td>
            <td style="padding:8px 0;font-weight:600;font-size:13px;text-align:right;border-bottom:1px solid #f1f5f9;">#${seatNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;">🆔 Booking ID</td>
            <td style="padding:8px 0;font-weight:600;font-size:12px;text-align:right;">${bookingId}</td>
          </tr>
        </table>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">Booked at ${new Date().toLocaleString()}</p>
    </div>
  </div>
`;

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

  const seatNumber = (event.totalSeats - event.seats) + 1;
  event.seats -= 1;
  const bookingId = `EVT-${eventId}-${Date.now()}`;

  bookings[bookingKey] = {
    name, email, eventId, bookingId, seatNumber,
    bookedAt: new Date().toISOString()
  };

  // Respond immediately to frontend
  res.status(200).json({
    message: "Booking confirmed!",
    booking: {
      eventId, name, email,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      seatNumber, bookingId
    }
  });

  // ✅ Send confirmation email to USER
  console.log(`📤 Sending confirmation email to user: ${email}`);
  await sendEmail({
    to: email,
    subject: `✅ Booking Confirmed — ${event.title}`,
    html: buildUserEmailHTML({
      name,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      seatNumber,
      bookingId
    })
  });

  // ✅ Send notification email to ADMIN (kartad044@rmkcet.ac.in)
  console.log(`📤 Sending booking details to admin: ${ADMIN_EMAIL}`);
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🔔 New Booking — ${event.title} by ${name}`,
    html: buildAdminEmailHTML({ name, email, event, seatNumber, bookingId })
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
        <a href="${process.env.FRONTEND_URL}">← Back to EventBook</a>
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
      <a href="${process.env.FRONTEND_URL}"
         style="display:inline-block;margin-top:16px;padding:10px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">
        ← Back to EventBook
      </a>
    </body></html>
  `);
});

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    admin_email: ADMIN_EMAIL,
    env: {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ SET" : "❌ MISSING",
      API_URL: process.env.API_URL || "❌ NOT SET",
      FRONTEND_URL: process.env.FRONTEND_URL || "❌ NOT SET"
    }
  });
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
  console.log(`🔑 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "✅ SET" : "❌ NOT SET"}`);
  console.log(`👤 Admin notifications → ${ADMIN_EMAIL}`);
});