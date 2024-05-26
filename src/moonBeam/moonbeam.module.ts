import { Module } from '@nestjs/common';
import { MoonbeamService } from './moonbeam.service';

@Module({
  providers: [MoonbeamService],
  exports: [MoonbeamService],
})
export class MoonbeamModule {
}
