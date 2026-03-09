import { useState, useCallback } from "react";
import { useEvents }    from "../hooks/useEvents";
import { EventCard }    from "../components/EventCard";
import { BookingModal } from "../components/BookingModal";
import { Toast }        from "../components/Toast";

export const EventsPage = ({ user, onLogout }) => {
  const { data: events, isLoading, isError, error, refetch } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">EventBook</span>
          </div>
                  <div className="flex items-center gap-4">
          {events && <span className="text-sm text-slate-500 hidden sm:block">{events.filter((e) => e.seats > 0).length} events open</span>}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-xs font-bold uppercase">{user?.[0]}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user}</span>
          </div>
          <button onClick={onLogout} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium">
            Logout
          </button>
        </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Upcoming Events</h1>
          <p className="text-gray-500">Browse events and book your seat instantly.</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-8" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Could not load events</h2>
            <p className="text-gray-500 text-sm mb-6">{error?.message}</p>
            <button onClick={() => refetch()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && events?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">📭</p>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No events yet</h2>
            <p className="text-gray-500 text-sm">Check back soon.</p>
          </div>
        )}

        {!isLoading && !isError && events?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onBook={setSelectedEvent} />
            ))}
          </div>
        )}
      </main>

      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={(msg) => showToast(msg, "success")}
          onError={(msg)   => showToast(msg, "error")}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
