import { ErrorCode } from '@longpoint/types';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { apiErrorDoc, BaseError, ResourceNotFound } from '../../shared/errors';

export class StorageUnitNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Storage unit', id, 'id');
  }
}
export const storageUnitNotFoundDoc = apiErrorDoc(
  new StorageUnitNotFound('mbjq36xe6397dsi6x9nq4ghc')
);
export const ApiStorageUnitNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Storage unit not found',
      ...storageUnitNotFoundDoc,
    })
  );
};

export class StorageUnitInUse extends BaseError {
  constructor(id: string) {
    super(
      ErrorCode.INVALID_INPUT,
      `Storage unit ${id} cannot be deleted because it has media containers`,
      HttpStatus.BAD_REQUEST
    );
  }
}
export const storageUnitInUseDoc = apiErrorDoc(
  new StorageUnitInUse('mbjq36xe6397dsi6x9nq4ghc')
);
export const ApiStorageUnitInUseResponse = () => {
  return applyDecorators(
    ApiConflictResponse({
      description: 'Storage unit is in use and cannot be deleted',
      ...storageUnitInUseDoc,
    })
  );
};

export class CannotDeleteDefaultStorageUnit extends BaseError {
  constructor(id: string) {
    super(
      ErrorCode.INVALID_INPUT,
      `Cannot delete default storage unit ${id}. There must be at least one default storage unit.`,
      HttpStatus.BAD_REQUEST
    );
  }
}
export const cannotDeleteDefaultStorageUnitDoc = apiErrorDoc(
  new CannotDeleteDefaultStorageUnit('mbjq36xe6397dsi6x9nq4ghc')
);
export const ApiCannotDeleteDefaultStorageUnitResponse = () => {
  return applyDecorators(
    ApiConflictResponse({
      description: 'Cannot delete the default storage unit',
      ...cannotDeleteDefaultStorageUnitDoc,
    })
  );
};

export class StorageProviderNotFound extends ResourceNotFound {
  constructor(id: string) {
    super('Storage provider', id, 'id');
  }
}
export const storageProviderNotFoundDoc = apiErrorDoc(
  new StorageProviderNotFound('mbjq36xe6397dsi6x9nq4ghc')
);
export const ApiStorageProviderNotFoundResponse = () => {
  return applyDecorators(
    ApiNotFoundResponse({
      description: 'Storage provider not found',
      ...storageProviderNotFoundDoc,
    })
  );
};
