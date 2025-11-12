import { apiErrorDoc, ResourceNotFound } from '@/shared/errors';
import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

export class SearchIndexNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Search index', id, 'id');
  }
}
export const searchIndexNotFoundDoc = apiErrorDoc(
  new SearchIndexNotFound('r2qwyd76nvd98cu6ewg8ync2')
);
export const ApiSearchIndexNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Search index not found',
      ...searchIndexNotFoundDoc,
    })
  );
};

export class VectorProviderNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Vector provider', id);
  }
}
export const vectorProviderNotFoundDoc = apiErrorDoc(
  new VectorProviderNotFound('r2qwyd76nvd98cu6ewg8ync2')
);
export const ApiVectorProviderNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Vector provider not found',
      ...vectorProviderNotFoundDoc,
    })
  );
};
