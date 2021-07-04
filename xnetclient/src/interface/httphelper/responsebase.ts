/**
 * 响应的基类
 *
 * @export
 * @interface ResponseBase
 */
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ResponseBase {
    /**
     * 错误代码
     *
     * @type {number}
     * @memberof ResponseBase
     */
    er: number; // 自定义错误
    /**
     * 错误MSG
     *
     * @type {string}
     * @memberof ResponseBase
     */
    erMessage: string;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    [key: string]: any;
}
