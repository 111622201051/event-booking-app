import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../api/eventApi";

export const useEvents = () =>
  useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 30000,
    retry: 2,
  });
