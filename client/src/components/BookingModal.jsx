import { useState, useEffect } from "react";
import { useBookEvent } from "../hooks/useBookEvent";

export const BookingModal = ({ event, onClose, onSuccess, onError }) => {
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [errors, setErrors] = useState({});
  const { mutate, isPending } = useBookEvent();

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!name.trim())  e.name  = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    mutate(
      { eventId: event.id, name: name.trim(), email: email.trim().toLowerCase() },
      {
        onSuccess: (data) => { onSuccess(data.message || "Booking confirmed!"); onClose(); },
        onError:   (err)  => { onError(err.message   || "Booking failed."); },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Reserve Your Seat</h2>
        <p className="text-sm text-indigo-600 font-medium mb-6 truncate">{event.title}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.name ? "border-rose-400 bg-rose-50" : "border-gray-300"}`} />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.email ? "border-rose-400 bg-rose-50" : "border-gray-300"}`} />
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-7">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isPending ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};
