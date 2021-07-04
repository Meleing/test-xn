import { injectable } from 'inversify';

/**
 * 客户端的基类,主要用于复写ClassName,注册容器用
 *
 * @export
 * @class ClientBase
 */
@injectable()
export class ClientBase {
    /**
     * Clas的标识
     *
     * @static
     * @type {Symbol}
     * @memberof ClientBase
     */
    public static readonly CLASS_NAME: string;
}
