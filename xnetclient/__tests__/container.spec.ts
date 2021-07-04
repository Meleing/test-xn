import 'reflect-metadata';
import { XNetContainer, bomPortal } from '../src';
// import { BOMHDServiceClient } from '../src/.generated';

XNetContainer.Init('xnetclient-test',[
    {
        tag: 'WebPortalService',
        // baseUrl: 'http://localhost:50662'
        baseUrl: 'http://service.dev.jtl3d.cn',
    },
    {
        tag: 'default',
        // baseUrl: 'http://localhost:50662'
        baseUrl: 'http://service2.dev.jtl3d.cn',
    },
    {
        tag: 'zipkin',
        // baseUrl: 'http://localhost:50662'
        baseUrl: 'http://zipkin.dev.jtl3d.cn',
    },
]);

(async () => {
    const d = await bomPortal.BomConfigInfoServiceClient.Instance.GetCalculationReduce_GET({
        constructionTypeId:"111"
    });   
    const e = await bomPortal.BomConfigInfoServiceClient.Instance.GetCalculationReduce_GET({
        constructionTypeId:"111"
    });   
    console.dir(d);
    console.dir(e);
})();

// houseTypeServiceClient().GetHouseTypeSuggests_GET({ dtoKeywords: 'f43e8ba-27de-4728-96c8-f25d67e45455' }, { useCache: true }).then(result => console.log(result));
// @injectable()
// class TestClass {

//     @inject(BOMHDServiceClient) client: BOMHDServiceClient;

//     public async SomeAction() {
//         const result = await client.GetBOMData_GET({ designId: 'f43e8ba-27de-4728-96c8-f25d67e45455' });
//         console.log(result);
//     }
// }
