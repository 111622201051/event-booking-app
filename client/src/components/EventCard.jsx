export const EventCard = ({ event, onBook }) => {
  const soldOut  = event.seats === 0;
  const lowSeats = !soldOut && event.seats <= 5;

  const date = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className={`h-1.5 ${soldOut ? "bg-gray-200" : "bg-indigo-500"}`} />
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{event.title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date}</span>
        </div>
        <div className="mt-auto space-y-3">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
            soldOut  ? "bg-gray-100 text-gray-400" :
            lowSeats ? "bg-amber-100 text-amber-700" :
                       "bg-emerald-100 text-emerald-700"
          }`}>
            {soldOut  ? "Sold Out" :
             lowSeats ? `Only ${event.seats} seat${event.seats > 1 ? "s" : ""} left!` :
                        `${event.seats} seats available`}
          </span>
          <button
            onClick={() => onBook(event)}
            disabled={soldOut}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              soldOut
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}>
            {soldOut ? "Sold Out" : "Book Now →"}
          </button>
        </div>
      </div>
    </div>
  );
};
