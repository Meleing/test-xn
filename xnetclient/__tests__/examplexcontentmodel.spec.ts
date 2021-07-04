import 'reflect-metadata';
import { XNetContainer } from '../src/utils/container';
import { ExampleXContentModel, ExampleXContentModelInterface } from '../src/xschema/examples/examplexcontentmodel';
import { OrginSourceInterface } from '../src/interface/xschema/orginsourceinterface';
// import { BOMHDServiceClient } from '../src/.generated';

XNetContainer.InitXSchemaModels();
const model = ExampleXContentModel.GetInstance({
    publicproperties: {
        typepath: 'example.typepath',
        position: {
            x: 0,
            y: 0,
            z: 0,
        }
    },
    url: '123456',
});
model.publicproperties.position.y = 160;
console.log(model.extra.wserwedsf);
const dump = model as OrginSourceInterface<ExampleXContentModelInterface>;
console.dir(dump.dump());
console.dir(dump.toString());
console.dir(model);
// @injectable()
// class TestClass {

//     @inject(BOMHDServiceClient) client: BOMHDServiceClient;

//     public async SomeAction() {
//         const result = await client.GetBOMData_GET({ designId: 'f43e8ba-27de-4728-96c8-f25d67e45455' });
//         console.log(result);
//     }
// }