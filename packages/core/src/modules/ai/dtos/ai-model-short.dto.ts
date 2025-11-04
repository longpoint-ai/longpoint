import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import type { AiModelDto } from './ai-model.dto';

export type AiModelShortParams = Pick<
  AiModelDto,
  'id' | 'name' | 'fullyQualifiedId' | 'description'
>;

@ApiSchema({ name: 'AiModelShort' })
export class AiModelShortDto {
  @ApiProperty({
    description: 'The ID of the model',
    example: 'claude-haiku-4-5-20251001',
  })
  id: string;

  @ApiProperty({
    description: 'The fully qualified ID of the model',
    example: 'anthropic/claude-haiku-4-5-20251001',
  })
  fullyQualifiedId: string;

  @ApiProperty({
    description: 'The display name of the model',
    example: 'Claude Haiku 4.5',
  })
  name: string;

  @ApiProperty({
    description: 'A brief description of the model',
    type: 'string',
    example:
      'Claude Haiku 4.5 is a small, fast, and powerful model for text generation',
    nullable: true,
  })
  description: string | null;

  constructor(data: AiModelShortParams) {
    this.id = data.id;
    this.name = data.name;
    this.fullyQualifiedId = data.fullyQualifiedId;
    this.description = data.description;
  }
}
