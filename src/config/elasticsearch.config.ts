import { ConfigService } from '@nestjs/config';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const getElasticSearchConfig = async (
  configService: ConfigService,
): Promise<ElasticsearchModuleOptions> => ({
  node: configService.getOrThrow<string>('ELASTIC_SEARCH_NODE'),
});
