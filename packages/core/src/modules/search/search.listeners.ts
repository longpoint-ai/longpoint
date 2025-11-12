import { Injectable } from '@nestjs/common';
import { HandleEvent } from '../event';
import { type MediaAssetReadyEventPayload } from '../media';
import { SearchIndexService } from './services/search-index.service';

@Injectable()
export class SearchListeners {
  constructor(private readonly vectorIndexService: SearchIndexService) {}

  @HandleEvent('media.asset.ready')
  async handleMediaAssetReady(payload: MediaAssetReadyEventPayload) {}
}
