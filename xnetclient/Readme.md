# 客户端代理工具

# ReleaseNotes

> 支持浏览器环境下的基于SessionStorage的缓存,默认过期时间30分钟.    
> 支持node端和浏览器双环境. 

# 项目结构说明:

## __tests__/

测试模块

## dist/

编译好的模块

## src/

源代码

### src/.generated

代码生成器生成的代码存放的目录,一般情况下没事不要动这个里面的东西

### src/config

配置

### src/generator

代码生成器的逻辑

### src/interface

接口

### src/utils

库函数

# 首先强调一下,用yarn不要用npm,以防止出现版本问题导致生成失败


# 安装: 

    yarn add @jtl/xnetclient

# 使用

初始化:

    import { XNetContainer } from '@jtl/xnetclient';

    XNetContainer.Init({
        tag:'res'
        baseUrl: 'http://dev-res.jtl3d.com'
    });

调用:

有2种方式导入类:

第一种:

    import { WebPortalService } from '@jtl/xnetclient';

    const res = await WebPortalService.HouseTypeServiceClient.Instance.GetHouseTypeSuggests_GET({ dtoKeywords: payload.keywords });

或者:(这个或者导出的其实就是每个服务的Instance属性,至于需要加(),是因为需要保证在返回实例的时候,初始化过程已经完毕)

    import { HouseTypeServiceClient } from '@jtl/xnetclient/dist/WebPortalService';

    const res = await HouseTypeServiceClient().GetHouseTypeSuggests_GET({ dtoKeywords: payload.keywords });

为什么要这么写,为什么非要Instance实例化而不使用静态方法:

因为这个设计本身是基于容器化的,所有类的实例化,都应该通过容器接管,上述实例化的方式其实是在没有容器化的场景下,使用容器实例化对象的一个方式.

特别的:

考虑到不同环境和自定义Header的需要,目前,默认会添加'application/json'的Accept和Content-Type,并且在浏览器环境下会填入jtl_token和Authorization字段.具体如下:

    {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        jtl_token: this.jtlToken(),
        Authorization: 'Bearer ' + this.jtlToken()
    }

但是,在node环境中,默认不会有jtl_token和Authorization,因此这个时候需要自定义header.

方法有2个:

### 第一个是在XContainer初始化的时候

    Init函数的第二个参数有一个getheader的函数指针,用于返回自定义的header

### 第二个是在方法调用的时候,参数里有一个header的参数,传入一个Header的对象,也会覆盖默认的header设置

    {...this.header(),...customHeader,...paramHeader}

上述示例即为header的合并过程示意,默认设置->全局配置->传参

当然,因为dev-res本身的swagger没有说明文档,所以这里我也没有办法生成说明文档

一共有多少service,直接翻swagger吧,当然基本的智能感知都是有的

比如有多少service,多少method,method需要什么参数

只是没有返回值,因为swagger没有给出来

然后最后,还有一种更高级的使用方法:

用依赖注入的方式来引用:

    @injectable()
    class TestClass {

        @inject(BOMHDServiceClient) client: BOMHDServiceClient;

        public async SomeAction() {
            const result = await client.GetBOMData_GET({ designId: 'f43e8ba-27de-4728-96c8-f25d67e45455' });
            console.log(result);
        }
    }

如果全局可以容器接管,基本就是中心化配置的结果了.

这个东西的标准操作应该是按照接口来注入,以做到完全的解耦,但是
### 1,ts的限制,在runtime里其实是没有接口的,所以这里注入需要需用Symbols
### 2,省事,不想再生成一遍接口代码了..虽然都是代码生成器,什么时候想加都是可以的
### 3,完全没有用户在意或者说实用这套东西..写的太完善太完美也没有意义...


# New:支持客户端缓存:

由于不是所有api需要接管缓存,所以缓存的开关没有设置在全局,而是每个函数调用的时候单独设置是否需要缓存:

    const res = await HouseTypeServiceClient().GetHouseTypeSuggests_GET({ dtoKeywords: payload.keywords }, { useCache: true });


# 生成代理类

## 第一步,修改配置文件

* src/config/generatorconfig.ts文件里配置swagger的地址,注意tag不要重复
* 然后在src/config/xnetconfig里修改tag的类型,和上面那个配置文件里的保持一致,为了客户使用的时候有智能感知...
* 可以对每个不同的service配置不同的baseurl
* ~~现在有个小小的问题,在外部统一导出的时候,没有区分namespace,所以如果service重名的话,maybe gg...~~
*  已经加入了namespace区分不同的服务,当然导致的一个后果就是调用方法的时候会点很多次...

## 第二步,生成代理类

    yarn build
这个虽然是测试的,但是他可以生成,主要是如果要用正式的方式去生成,还需要注册全局的命令,太麻烦...

然后在./src/.generated目录里面就会生成所有的代理类

## 第三步,打包

    npm publish

在prepublish命令里写入了yarn build和npm-auto-version

用处是在publish的时候,都会生成一遍新的代理类和自动更新版本号

方便在服务器端做持续更新.