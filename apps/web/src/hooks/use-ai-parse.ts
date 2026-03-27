'use client';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface ParseResult {
  title: string;
  priority: string;
  assigneeId: string | null;
  dueDate: string | null;
  labelIds: string[];
}

export function useAiParse() {
  return useMutation({
    mutationFn: async (data: { input: string; workspaceMembers?: any[]; workspaceLabels?: any[] }) => {
      const res = await api.post('/ai/parse-task', data);
      return res.data as { success: boolean; fallback: boolean; data: ParseResult | null };
    },
  });
}
