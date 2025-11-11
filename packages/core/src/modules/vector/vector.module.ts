import { Module } from '@nestjs/common';
import { MediaModule } from '../media';
import { VectorIndexService } from './services/vector-index.service';
import { VectorProviderService } from './services/vector-provider.service';

@Module({
  imports: [MediaModule],
  providers: [VectorProviderService, VectorIndexService],
})
export class VectorModule {}
