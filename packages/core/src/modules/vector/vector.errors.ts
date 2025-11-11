import { apiErrorDoc, ResourceNotFound } from '@/shared/errors';
import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

export class VectorIndexNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Vector index', id, 'id');
  }
}
export const vectorIndexNotFoundDoc = apiErrorDoc(
  new VectorIndexNotFound('r2qwyd76nvd98cu6ewg8ync2')
);
export const ApiVectorIndexNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Vector index not found',
      ...vectorIndexNotFoundDoc,
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
