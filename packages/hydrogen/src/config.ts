import type {HydrogenRequest} from './foundation/HydrogenRequest/HydrogenRequest.server.js';
import type {
  InlineHydrogenConfig,
  HydrogenPlugin,
  HydrogenPluginOptions,
} from './types.js';

export const defineConfig = (params: InlineHydrogenConfig) => params;

export type {InlineHydrogenConfig as HydrogenConfig};

export {ShopifyServerAnalyticsConnector} from './foundation/Analytics/connectors/Shopify/ServerAnalyticsConnector.js';
export {PerformanceMetricsServerAnalyticsConnector} from './foundation/Analytics/connectors/PerformanceMetrics/ServerAnalyticsConnector.js';

export {CookieSessionStorage} from './foundation/CookieSessionStorage/CookieSessionStorage.js';
export {MemorySessionStorage} from './foundation/MemorySessionStorage/MemorySessionStorage.js';

export const definePlugin =
  <T extends HydrogenPluginOptions>(pluginFn: (opt: T) => HydrogenPlugin) =>
  (options: T) =>
    pluginFn(options);

export type HandleMiddlewareParams = {
  request: HydrogenRequest;
};

export const defineMiddleware = (
  middleware: (
    middlewareParams: HandleMiddlewareParams
  ) => void | Response | Promise<void | Response>
) => middleware;
