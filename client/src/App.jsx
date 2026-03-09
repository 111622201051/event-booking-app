import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EventsPage } from "./pages/EventsPage";
import { LoginPage }  from "./pages/LoginPage";

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={(username) => setUser(username)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <EventsPage user={user} onLogout={() => setUser(null)} />
    </QueryClientProvider>
  );
}