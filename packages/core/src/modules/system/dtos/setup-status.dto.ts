import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface SetupStatusParams {
  isFirstTimeSetup: boolean;
}

@ApiSchema({ name: 'SetupStatus' })
export class SetupStatusDto {
  @ApiProperty({
    description: 'Whether the first time setup is complete',
    example: false,
  })
  isFirstTimeSetup: boolean;

  constructor(params: SetupStatusParams) {
    this.isFirstTimeSetup = params.isFirstTimeSetup;
  }
}
