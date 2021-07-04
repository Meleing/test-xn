/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
import { Container } from 'inversify';
import { XNetConfig } from '../config/xnetconfig';
import { CustomHeader } from '../interface/httphelper/customheader';
import { ClientBase } from './clientBase';
import { XnetModule } from './xnetmodule';
import { TraceModule } from './tracemodule';
/**
 * 容器实例
 * 理论上,这个应该挂在的核心服务上,
 * 作为中心的容器配置
 * 但是因为现在没有
 * 顺便我想写个示例
 * 所以这个容器就挂在局部了
 * 并且为了向前兼容,挂载一个局部的容器对象也可以作为api开放给老旧的模块使用
 *
 * @export
 * @class Container
 */
class XNetContainerClass {
    /**
     * 持有的inversify实例,由于这个东西本身需要实例化并且不能拿容器接管生命周期
     * 所以在这里持有一个static的引用
     *
     * @private
     * @static
     * @memberof XNetContainer
     */
    private static readonly _myContainer = new Container();

    /**
     * 用来防止重复初始化
     *
     * @private
     * @static
     * @memberof XNetContainer
     */
    private static _inited = false;

    /**
     * 初始化函数
     * 给一个{tag,url}的配置
     * 用于配置对应的服务的对应的baseurl
     *
     * @static
     * @memberof XNetContainer
     */
    public static Init = (serviceName: string | undefined, config: XNetConfig[], customHeader?: () => CustomHeader) => {
        if (XNetContainer._inited) {
            console.warn('重复初始化~~');
            return;
        }
        XNetContainer._myContainer.load(XnetModule.GetModule(config, customHeader));
        XNetContainer._myContainer.load(TraceModule.GetModule(serviceName, config));
        XNetContainer._inited = true;
        // XNetContainer.myContainer.bind(BomHDExample).toSelf().inSingletonScope();
    };

    public static RegisteService = (service: any) => {
        if (!XNetContainer._inited) {
            throw new Error('XNetClient尚未初始化,请调用XNetContainer.Init函数进行初始化!');
        }
        if (!XNetContainer._myContainer.isBound(service.CLASS_NAME)) {
            XNetContainer._myContainer.bind(service.CLASS_NAME).to(service).inSingletonScope();
        }
    }

    /**
     * 获取容器里配置过的类
     * 通常来说,可以用这个方法来实例化一个对象
     * 也可以在服务的对象里,我都实现了个Instance的属性,用于获取他自己的实例
     * 调用的也是这个方法
     *
     * @static
     * @memberof XNetContainer
     */
    public static Resolve = <T extends ClientBase>(service: any) => {
        if (!XNetContainer._inited) {
            throw new Error('XNetClient尚未初始化,请调用XNetContainer.Init函数进行初始化!');
        }
        return XNetContainer._myContainer.get<T>(service.CLASS_NAME);
    };

    public static Get<T>(modelName: symbol) {
        return XNetContainer._myContainer.get<T>(modelName);
    }
}

const global =
    typeof window === 'object' && window && (window as any).Math === Math
        ? window
        : typeof self === 'object' && self && (self as any).Math === Math
        ? self
        : // eslint-disable-next-line no-new-func
          Function('return this')();

if (global._xnetclient && typeof console !== 'undefined' && console.warn) {
    console.warn('@jtl/xnetclient is loaded more than once on this page. This is probably not desirable/intended ');
} else {
    global._xnetclient = XNetContainerClass;
}

export const XNetContainer: typeof XNetContainerClass = global._xnetclient;
