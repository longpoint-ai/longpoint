import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { MediaModule } from '../media';
import { SearchIndexController, VectorProviderController } from './controllers';
import { SearchIndexService } from './services/search-index.service';
import { VectorProviderService } from './services/vector-provider.service';

@Module({
  imports: [MediaModule, AiModule],
  controllers: [SearchIndexController, VectorProviderController],
  providers: [VectorProviderService, SearchIndexService],
})
export class SearchModule {}
