import axios from 'axios';
import { inject, injectable } from 'inversify';
import { FileServiceClient } from '../.generated/WebPortalService/file';
import { ClientBase } from '../utils/clientBase';
import { XNetContainer } from '../utils/container';

@injectable()
export class OSSServiceClient extends ClientBase {
    public static readonly CLASS_NAME = 'XNetClient.Service.OSSServiceClient';

    public static get Instance() {
        return XNetContainer.Resolve<OSSServiceClient>(OSSServiceClient);
    }

    @inject(FileServiceClient.CLASS_NAME)
    private _fileServiceClient: FileServiceClient;

    public async uploadFile(options: any) {
        const fileName = options.file.name;
        const { items: config } = await this._fileServiceClient.GeneratePresignedPolicyData_GET({
            prefixKey: `model/${fileName}`,
            type: 'Model',
        });

        const url = `${config!.host}/${config!.startsWith}`;

        const formData = new FormData();
        formData.append('OSSAccessKeyId', config!.accessKey!);
        formData.append('Policy', config!.policy!);
        formData.append('Signature', config!.signature!);
        formData.append('key', config!.startsWith!);
        formData.append('success_action_status', '200');
        formData.append('file', options.file);
        const result = await axios.post(config!.host!, formData);

        if (result.status === 200) {
            return {
                er: -1,
                url,
            };
        }
        return {
            er: 255,
            erMessage: JSON.stringify(result),
        };
    }
}
