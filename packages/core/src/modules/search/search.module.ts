import { Module } from '@nestjs/common';
import { MediaModule } from '../media';
import { SearchIndexService } from './services/search-index.service';
import { VectorProviderService } from './services/vector-provider.service';

@Module({
  imports: [MediaModule],
  providers: [VectorProviderService, SearchIndexService],
})
export class SearchModule {}
