import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export interface SystemStatusParams {
  totalContainers: number;
}

@ApiSchema({ name: 'SystemStatus' })
export class SystemStatusDto {
  @ApiProperty({
    description: 'Total number of ready media containers',
    example: 150,
  })
  totalContainers: number;

  constructor(params: SystemStatusParams) {
    this.totalContainers = params.totalContainers;
  }
}
