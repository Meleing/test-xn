import { injectable } from 'inversify';

/**
 * 配置文件,主要用于配置url
 *
 * @export
 * @class XNetConfig
 */
@injectable()
export class XNetConfig {
    /**
     * tag,用于区分不同的服务
     *
     * @type {string}
     * @memberof XNetConfig
     */
    public tag: 'ResourceServer' | 'WebPortalService' | 'CatalogServer' | 'WorkFlowService' | 'RenderService' | string;
    /**
     * url
     *
     * @type {string}
     * @memberof XNetConfig
     */
    public baseUrl: string;
}
