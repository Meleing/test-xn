/* eslint-disable @typescript-eslint/prefer-regexp-exec */
/* eslint-disable @typescript-eslint/no-var-requires */
import { AxiosRequestConfig, AxiosStatic } from 'axios';
import { inject, injectable, optional } from 'inversify';
import * as _ from 'lodash';
// import fetch from 'node-fetch';
// const fetch = require('iso-whatwg-fetch');
import { XNetConfig } from '../config/xnetconfig';
import { CustomHeader } from '../interface/httphelper/customheader';
// eslint-disable-next-line import/namespace
import { HttpHelperInterface } from '../interface/httphelper/httphelperinterface';
import { HttpMethodOptionsInterface } from '../interface/httphelper/httpmethodoptions';
import { ResponseBase } from '../interface/httphelper/responsebase';
import { TypeSymbols } from '../interface/TypeSymbols';
import { JtlCacheStorage } from './cachestorage';
import { IsInBrowser } from './isinborwser';

const memoizedCamelCase = require('lodash/memoize')(require('lodash/camelCase'));
// const camelcaseObjectDeep = require('camelcase-object-deep');
/**
 * HTTP请求的实现类,这个东西应该是个单例模式,不要自己实例化
 * 注意,请求都是基于Promise异步的
 *
 * @  export
 * @class HttpHelper
 */
@injectable()
export class HttpHelper implements HttpHelperInterface {
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

    @inject(TypeSymbols.CacheStorage)
    protected cache: JtlCacheStorage;

    @inject(TypeSymbols.ZipkinAxios)
    protected axios: AxiosStatic;

    /**
     * 自定义header
     * 选择的优先方式是
     * {...this.header(),...customHeader,...paramHeader}
     *
     * @  protected
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
     * @  param {string} url
     * @param {object} [params]
     */
    public post = async <Arg, T extends ResponseBase>(url: string, params?: Arg, options?: HttpMethodOptionsInterface): Promise<T> =>
        this.httpMethod<Arg, T>(url, 'POST', params, undefined, options);

    /**
     * 封装patch请求
     *
     * @  memberof HttpHelper
     */
    public patch = async <Arg, T extends ResponseBase>(url: string, params: Arg, options?: HttpMethodOptionsInterface): Promise<T> =>
        this.httpMethod<Arg, T>(url, 'PATCH', params, undefined, options);

    /**
     * 封装get请求
     *
     * @  param {string} url
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
        if (options && options.onEventSourceMessage) {
            // 使用sse
            return this.sse(url, queryObj, options) as any;
        }
        const fetchParam: AxiosRequestConfig = {
            method,
            headers: { ...this._headers(), ...this.customHeader(), ...(options ? options.header : {}) },
            url: this._getUrl(url, options),
            responseType: 'json',
            withCredentials: !!IsInBrowser(),
        };
        if (options && options.formData) {
            fetchParam.data = options.formData;
            fetchParam.headers = {
                ...fetchParam.headers,
                'Content-Type': 'multipart/form-data',
            };
        } else if (params) {
            fetchParam.data = params;
        }
        if (queryObj) {
            fetchParam.url = this._createUrl(fetchParam.url!, queryObj);
            // fetchParam.url +=
            //     '?' + _.entries(queryObj).filter(([, value]) => !_.isUndefined(value)).map(([key, value]) => {
            //         return `${key}=${value}`;
            //     }).join('&');
        }
        if (_.toLower(method) === 'get' && options && options.useCache) {
            // const cacheres = await caches.match(url);
            const cacheres = this.cache.Get(fetchParam.url!);
            if (!_.isUndefined(cacheres)) {
                console.debug('缓存~');
                return cacheres as T;
            }
        }

        const response = await this.axios.request(fetchParam);
        if (!response) {
            return {
                er: 504, // 自定义错误
                erMessage: 'gateway timeout',
            } as T;
        }

        /* 如果未登录 跳转到登录页面 */
        if (response.status === 401) {
            return this._buildError(response) as T;
        }

        const data = await response.data;

        const camelcaseObjectDeep = (value: any): any => {
            if (Array.isArray(value)) {
                return value.map(camelcaseObjectDeep);
            }

            if (value && typeof value === 'object' && value.constructor === Object) {
                const obj = {};
                const keys = Object.keys(value);
                const len = keys.length;

                for (let i = 0; i < len; i += 1) {
                    obj[memoizedCamelCase(keys[i])] = camelcaseObjectDeep(value[keys[i]]);
                    obj[keys[i]] = camelcaseObjectDeep(value[keys[i]]);
                }

                return obj;
            }

            return value;
        };

        const j = camelcaseObjectDeep(data);
        // console.log('xnetclient', j);
        // j = _.defaultsDeep(j, data);
        // // console.log(this.cache.load(url));
        // if (j && j.items) {
        //     if (Array.isArray(j.items)) {
        //         for (let i = 0; i < j.items.length; i++) {
        //             const current = j.items[i];
        //             j.items[i] = _.defaultsDeep(current, data.items[i]);
        //         }
        //     } else {
        //         j.items = { ...j.items, ...data.items };
        //     }
        // }
        if (_.toLower(method) === 'get' && options && options.useCache) {
            this.cache.Save(fetchParam.url!, j);
            // await caches.open(HttpHelper.XNETCLIENT_CACHE_STORAGE_NAME).then(c => c.put(url, response));
        }
        // console.log(this.cache.load(url));
        return j as T;
    }

    public async sse(url: string, queryObj?: object, options?: HttpMethodOptionsInterface): Promise<EventSource> {
        // eslint-disable-next-line no-param-reassign
        url = this._createUrl(this._getUrl(url), queryObj!);
        const es = new EventSource(url);
        es.onmessage = options!.onEventSourceMessage!;
        return es;
    }

    public get getToken() {
        return this._jtlToken() || this._accToken();
    }

    /**
     * 验证
     *
     * @private
     * @returns
     * @memberof HttpHelper
     */
    private _accToken() {
        return decodeURIComponent((document.cookie.match(/access_token=(.*?)(;|$)/) || [])[1] || '');
    }
    private _jtlToken() {
        return decodeURIComponent((document.cookie.match(/_____jtl_token_____=(.*?)(;|$)/) || [])[1] || '');
    }

    private _createUrl(url: string, queryObj: object) {
        return `${url}?${_.entries(queryObj)
            .filter(([, value]) => !_.isUndefined(value))
            .map(([key, value]) => {
                return `${key}=${value}`;
            })
            .join('&')}`;
    }

    /**
     * 构造HTTP HEADER
     *
     * @private
     * @returns
     * @memberof HttpHelper
     */
    private _headers() {
        const headers: any = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        const token = this._accToken();
        if (token) {
            // eslint-disable-next-line @typescript-eslint/camelcase
            headers.jtl_token = this._jtlToken();
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
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

    /**
     * 错误处理
     *
     * @  private
     * @param {*} response
     * @returns
     * @memberof HttpHelper
     */
    private _buildError(response: any): ResponseBase {
        return {
            er: -999, // 自定义错误
            erMessage: response.statusText,
        };
    }

    // private _trimStart = (val: string, c: string) => {
    //     if (c === null || c === '') {
    //         const str = val.replace(/^s*/, '');
    //         return str;
    //     } else {
    //         /* eslint-disable */-next-line:prefer-template
    //         const rg = new RegExp('^' + c + '*');
    //         const str = val.replace(rg, '');
    //         return str;
    //     }
    // }
}
