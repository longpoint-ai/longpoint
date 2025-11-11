import { Injectable } from '@nestjs/common';
import { HandleEvent } from '../event';
import { type MediaAssetReadyEventPayload } from '../media';
import { VectorIndexService } from './services/vector-index.service';

@Injectable()
export class VectorListeners {
  constructor(private readonly vectorIndexService: VectorIndexService) {}

  @HandleEvent('media.asset.ready')
  async handleMediaAssetReady(payload: MediaAssetReadyEventPayload) {}
}
