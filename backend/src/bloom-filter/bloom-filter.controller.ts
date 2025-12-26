import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BloomFilterService } from './bloom-filter.service';

@Controller('bloom-filter')
export class BloomFilterController {
  constructor(private readonly bloomFilterService: BloomFilterService) {}

  @Post('create-filter')
  createFilter(@Body() body: { siteId: string; modifiedIds: string[] }) {
    return this.bloomFilterService.createModificationFilter(
      body.siteId,
      body.modifiedIds,
    );
  }

  @Post('filter-records')
  filterRecords(
    @Body()
    body: {
      siteId: string;
      records: Array<{ id: string; [key: string]: any }>;
      filter: { bitArray: number[]; size: number; hashCount: number };
    },
  ) {
    return this.bloomFilterService.getMatchingRecords(
      body.siteId,
      body.records,
      body.filter,
    );
  }

  @Post('bloom-join')
  performBloomJoin(
    @Body()
    body: {
      masterRecords: Array<{ id: string; [key: string]: any }>;
      siteRecords: Array<{ id: string; [key: string]: any }>;
      modifiedIds: string[];
    },
  ) {
    return this.bloomFilterService.performBloomJoin(
      body.masterRecords,
      body.siteRecords,
      body.modifiedIds,
    );
  }
}

