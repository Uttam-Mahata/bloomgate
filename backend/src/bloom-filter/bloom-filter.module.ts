import { Module } from '@nestjs/common';
import { BloomFilterController } from './bloom-filter.controller';
import { BloomFilterService } from './bloom-filter.service';

@Module({
  controllers: [BloomFilterController],
  providers: [BloomFilterService],
  exports: [BloomFilterService],
})
export class BloomFilterModule {}
