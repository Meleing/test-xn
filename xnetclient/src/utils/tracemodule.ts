import * as _ from 'lodash';
import { Tracer, ExplicitContext, BatchRecorder, jsonEncoder, sampler } from 'zipkin';
import axios from 'axios';
import { interfaces, ContainerModule } from 'inversify';
import { HttpLogger } from 'zipkin-transport-http';

import { XNetConfig } from '../config/xnetconfig';
import { TypeSymbols } from '../interface/TypeSymbols';

const { JSON_V2 } = jsonEncoder;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const wrapAxios = require('zipkin-instrumentation-axiosjs');

export class TraceModule {
    public static GetModule(serviceName: string | undefined, config: XNetConfig[]) {
        const module = new ContainerModule(
            (
                bind: interfaces.Bind
                // unbind: interfaces.Unbind,
                // isBound: interfaces.IsBound,
                // rebind: interfaces.Rebind
            ) => {
                if (serviceName) {
                    const zipkinConfig = _.find(config, (c) => c.tag === 'zipkin');

                    const tracer = new Tracer({
                        ctxImpl: new ExplicitContext(),
                        sampler: new sampler.Sampler(sampler.alwaysSample),
                        recorder: new BatchRecorder({
                            logger: new HttpLogger({
                                endpoint: `${zipkinConfig!.baseUrl}/api/v2/spans`,
                                jsonEncoder: JSON_V2,
                            }),
                        }),
                        localServiceName: serviceName, // name of this application
                    });
                    bind(TypeSymbols.ZipkinAxios).toDynamicValue((ctx) => {
                        const remoteServiceName = ctx.currentRequest.parentRequest!.target.getNamedTag()!.value;
                        const zipkinAxios = wrapAxios(axios, { tracer, remoteServiceName });
                        return zipkinAxios;
                    });
                } else {
                    bind(TypeSymbols.ZipkinAxios).toConstantValue(axios);
                }
            }
        );
        return module;
    }
}
