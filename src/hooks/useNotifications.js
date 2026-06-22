import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificationsApi from "../api/notifications.api";

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.listNotifications,
    refetchInterval: 60000, // Poll every minute for MVP
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: data?.data || [],
    unreadCount: (data?.data || []).filter((n) => !n.is_read).length,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
  };
}
