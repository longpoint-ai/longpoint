import { useQuery } from '@tanstack/react-query';
import { useClient } from '../common';

interface SearchStatus {
  isSearchSetup: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useSearchStatus(): SearchStatus {
  const client = useClient();

  const {
    data: indexes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['search-indexes'],
    queryFn: () => client.search.listSearchIndexes(),
  });

  const isSearchSetup =
    indexes?.some((index) => index.active === true) ?? false;

  return {
    isSearchSetup,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
