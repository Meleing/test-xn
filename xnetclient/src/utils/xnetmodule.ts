import { ContainerModule, interfaces } from 'inversify';
import * as _ from 'lodash';
import { XNetConfig } from '../config/xnetconfig';
import { CustomHeader } from '../interface/httphelper/customheader';
import { HttpHelperInterface } from '../interface/httphelper/httphelperinterface';
import { TypeSymbols } from '../interface/TypeSymbols';
import { JtlCacheStorage } from './cachestorage';
import { HttpHelper } from './httphelper';
import { HttpHelperNode } from './httphelper.node';
import { IsInBrowser } from './isinborwser';

export class XnetModule {
    public static GetModule(config: XNetConfig | XNetConfig[], customHeader?: () => CustomHeader) {
        const module = new ContainerModule(
            (
                bind: interfaces.Bind
                // unbind: interfaces.Unbind,
                // isBound: interfaces.IsBound,
                // rebind: interfaces.Rebind
            ) => {
                if (!(config instanceof Array)) {
                    // eslint-disable-next-line no-param-reassign
                    config = [config];
                }
                bind(TypeSymbols.CustomHeader).toConstantValue(customHeader || (() => ({})));
                bind(TypeSymbols.CacheStorage)
                    .to(JtlCacheStorage)
                    .inSingletonScope();
                // bind(TypeSymbols.DesignEncrypt).to(DesignEncrypt).inSingletonScope();
                // bind(TypeSymbols.DesignDecrypt).to(DesignDecrypt).inSingletonScope();
                // 注册配置
                config.forEach((c) => {
                    switch (c.tag) {
                        case 'default':
                            bind('defaultXNetConfig').toConstantValue(c);
                            break;
                        default:
                            bind(XNetConfig)
                                .toConstantValue(c)
                                .whenParentNamed(c.tag);
                            break;
                    }
                });

                // 注册httphelper,fetch的具体实现,如果要换成别的实现,替换这个httphelper就可以了
                if (IsInBrowser()) {
                    bind<HttpHelperInterface>(TypeSymbols.HttpHelper).to(HttpHelper as any);
                } else {
                    // node端注册一个不一样的httphelper
                    bind<HttpHelperInterface>(TypeSymbols.HttpHelper).to(HttpHelperNode as any);
                }
                // 注册所有服务实例,并且单例化
                // _.forEach(serviceClients, (ns) => {
                //     _.forEach(ns, (client: any) => {
                //         bind(client.CLASS_NAME)
                //             .to(client)
                //             .inSingletonScope();
                //     });
                // });

                // _.forEach(services, (client: any) => {
                //     bind(client.CLASS_NAME)
                //         .to(client)
                //         .inSingletonScope();
                // });
            }
        );
        return module;
    }
}
