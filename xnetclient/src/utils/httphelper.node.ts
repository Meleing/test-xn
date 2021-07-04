import { AxiosRequestConfig, AxiosStatic } from 'axios';
import { inject, injectable, optional } from 'inversify';
import * as _ from 'lodash';
import { XNetConfig } from '../config/xnetconfig';
import { CustomHeader } from '../interface/httphelper/customheader';
import { HttpHelperInterface } from '../interface/httphelper/httphelperinterface';
import { HttpMethodOptionsInterface } from '../interface/httphelper/httpmethodoptions';
import { ResponseBase } from '../interface/httphelper/responsebase';
import { TypeSymbols } from '../interface/TypeSymbols';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const camelcaseObjectDeep = require('camelcase-object-deep');

/**
 * HTTP请求的实现类,这个东西应该是个单例模式,不要自己实例化
 * 注意,请求都是基于Promise异步的
 *
 * @export
 * @class HttpHelper
 */
@injectable()
export class HttpHelperNode implements HttpHelperInterface {
    /**
     * 配置文件
     *
     * @protected
     * @type {XNetConfig}
     * @memberof HttpHelper
     */
    @inject(XNetConfig)
    @optional()
    protected config: XNetConfig;

    @inject('defaultXNetConfig')
    @optional()
    protected defaultConfig: XNetConfig;

    @inject(TypeSymbols.ZipkinAxios)
    protected axios: AxiosStatic;

    /**
     * 自定义header
     * 选择的优先方式是
     * {...this.header(),...customHeader,...paramHeader}
     *
     * @protected
     * @type {CustomHeader}
     * @memberof HttpHelper
     */
    @inject(TypeSymbols.CustomHeader)
    protected customHeader: () => CustomHeader;

    // /**
    //  * Creates an instance of HttpHelper.
    //  * @param {string} baseUrl 服务器地址
    //  * @memberof HttpHelper
    //  */
    // constructor(baseUrl: string) {
    //     this.baseUrl = baseUrl + '/';
    // }

    /**
     * 封装post请求
     *
     * @param {string} url
     * @param {object} [params]
     */
    public post = async <Arg, T extends ResponseBase>(url: string, params?: Arg, options?: HttpMethodOptionsInterface): Promise<T> =>
        this.httpMethod<Arg, T>(url, 'POST', params, undefined, options);

    /**
     * 封装patch请求
     *
     * @memberof HttpHelper
     */
    public patch = async <Arg, T extends ResponseBase>(url: string, params: Arg, options?: HttpMethodOptionsInterface): Promise<T> =>
        this.httpMethod<Arg, T>(url, 'PATCH', params, undefined, options);

    /**
     * 封装get请求
     *
     * @param {string} url
     * @param {*} [queryObj]
     * @returns
     * @memberof HttpHelper
     */
    public async get<Arg extends object, T extends ResponseBase>(
        url: string,
        queryObj?: Arg,
        options?: HttpMethodOptionsInterface
    ): Promise<T> {
        return this.httpMethod<undefined, T>(url, 'GET', undefined, queryObj, options);
    }

    /**
     * 请求提交的实现封装
     *
     * @param {string} url
     * @param {string} method
     * @param {object} [params]
     * @returns
     */
    public async httpMethod<Arg, T extends ResponseBase>(
        url: string,
        method: string,
        params?: Arg,
        queryObj?: object,
        options?: HttpMethodOptionsInterface
    ): Promise<T> {
        const fetchParam: AxiosRequestConfig = {
            method,
            headers: { ...this._headers(), ...this.customHeader(), ...(options ? options.header : {}) },
            responseType: 'json',
            url: this._getUrl(url, options),
            timeout: 10000,
        };
        if (params) {
            fetchParam.data = params;
        }
        if (queryObj) {
            fetchParam.url += `?${_.entries(queryObj)
                .filter(([, value]) => !_.isUndefined(value))
                .map(([key, value]) => {
                    return `${key}=${value}`;
                })
                .join('&')}`;
            // url +=
            //     '?' + _.entries(queryObj).filter(([, value]) => !_.isUndefined(value)).map(([key, value]) => {
            //         return `${key}=${this.trimStart(value, 'dto')}`;
            //     }).join('&');
        }
        const response = await this.axios.request(fetchParam);

        const data = await response.data;
        const j = camelcaseObjectDeep(data, { deep: true });
        if (j && j.items) {
            j.items = { ...j.items, ...data.items };
        }
        // console.log(this.cache.load(url));
        return j as T;
    }

    public get getToken() {
        return '';
    }

    // /**
    //  * 验证
    //  *
    //  * @private
    //  * @returns
    //  * @memberof HttpHelper
    //  */
    // private jtlToken(): undefined {
    //     return undefined;
    // }

    /**
     * 构造HTTP HEADER
     *
     * @private
     * @returns
     * @memberof HttpHelper
     */
    private _headers() {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    /**
     * 把相对地址转换成绝对地址
     *
     * @private
     * @memberof HttpHelper
     */
    private _getUrl = (url: string, options?: HttpMethodOptionsInterface) =>
        // eslint-disable-next-line no-nested-ternary
        `${options && options.baseUrl ? options.baseUrl : this.config ? this.config.baseUrl : this.defaultConfig.baseUrl}${url}`;
    // private trimStart = (val: string, c: string) => {
    //     if (c == null || c === '') {
    //         const str = val.replace(/^s*/, '');
    //         return str;
    //     } else {
    //         const rg = new RegExp('^' + c + '*');
    //         const str = val.replace(rg, '');
    //         return str;
    //     }
    // }

    // /**
    //  * 错误处理
    //  *
    //  * @private
    //  * @param {*} response
    //  * @returns
    //  * @memberof HttpHelper
    //  */
    // private buildError(response: any): ResponseBase {
    //     return {
    //         er: -999, // 自定义错误
    //         erMessage: response.statusText
    //     };
    // }
}
