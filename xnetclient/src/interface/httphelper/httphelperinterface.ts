import { HttpMethodOptionsInterface } from './httpmethodoptions';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface HttpHelperInterface {
    post: HttpMethodInterface;
    patch: HttpMethodInterface;
    get: HttpMethodInterface;
    httpMethod: <Arg extends object>(
        url: string,
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' | 'OPTIONS',
        params?: Arg,
        queryObj?: object,
        options?: HttpMethodOptionsInterface
    ) => Promise<any>;
    getToken: string;
}

type HttpMethodInterface = <Arg extends object>(url: string, params?: Arg, options?: HttpMethodOptionsInterface) => Promise<any>;
