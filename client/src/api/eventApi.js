const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const fetchEvents = async () => {
  const res = await fetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error("Failed to fetch events. Is the API running?");
  return res.json();
};

export const bookEvent = async ({ eventId, name, email }) => {
  const res = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, name, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Booking failed.");
  return data;
};
