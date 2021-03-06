import * as path from 'path';
import * as tg from 'generic-type-guard';
import { Inject, Service } from 'typedi';
import { FileLoader } from './utils/FileLoader';

export interface Configuration {
  name: string;
}

const isPartialConfiguration: tg.TypeGuard<
  Partial<Configuration>
> = new tg.IsInterface().withProperty('name', tg.isOptional(tg.isString)).get();

/**
 * ConfigurationService is an abstraction for accessing application configuration.
 */
@Service()
export class ConfigurationService implements Configuration {
  private readonly config: Partial<Configuration>;

  public constructor(@Inject(() => FileLoader) loader: FileLoader) {
    try {
      const configPath = path.resolve(process.cwd(), 'gtg-cli');
      const loadedConfig = loader.load(configPath);

      this.config = isPartialConfiguration(loadedConfig) ? loadedConfig : {};
    } catch (e: unknown) {
      this.config = {};
    }
  }

  public get name(): string {
    return this.config.name != null ? this.config.name : 'Unknown';
  }
}
