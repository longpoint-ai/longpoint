import { Module } from '@nestjs/common';
import { MediaModule } from '../media';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  imports: [MediaModule],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
