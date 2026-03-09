import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookEvent } from "../api/eventApi";

export const useBookEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
};
