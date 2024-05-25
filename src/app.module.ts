import { Module } from '@nestjs/common';
import { AppController, ProcessDataController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, ProcessDataController],
  providers: [AppService],
})
export class AppModule {}
