import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { EventModule } from '../event';
import { MediaModule } from '../media';
import { SearchIndexController, VectorProviderController } from './controllers';
import { SearchListeners } from './search.listeners';
import { SearchIndexService } from './services/search-index.service';
import { VectorProviderService } from './services/vector-provider.service';

@Module({
  imports: [MediaModule, AiModule, EventModule],
  controllers: [SearchIndexController, VectorProviderController],
  providers: [VectorProviderService, SearchIndexService, SearchListeners],
})
export class SearchModule {}
