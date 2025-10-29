import { useClient } from '@/hooks/common';
import { useQuery } from '@tanstack/react-query';

export function AiSettings() {
  const client = useClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => client.ai.listAiProviders(),
  });

  console.log(data);

  return (
    <div>
      {/* provider list sidebar */}
      <div></div>
      {/* provider config form */}
      <div></div>
    </div>
  );
}
