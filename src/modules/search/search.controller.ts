import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiPaths } from '../../common/constants/api-paths';
import { OptionalJwtAuthGuard } from '../../common/utils/optionalJwtAuthGuard';
import { SearchProductsQueryDto } from './dto/get-search-products.dto';
import { SearchService } from './search.service';

@Controller(ApiPaths.Search.Root)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Search.Products)
  async getSearchedProducts(
    @Query() query: SearchProductsQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId;

    return this.searchService.searchProducts(query, userId);
  }
}
