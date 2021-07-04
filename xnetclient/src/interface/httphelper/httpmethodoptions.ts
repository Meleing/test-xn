import { CustomHeader } from './customheader';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface HttpMethodOptionsInterface {
    useCache?: boolean;
    header?: CustomHeader;
    onEventSourceMessage?: (evt: MessageEvent) => any;
    baseUrl?: string;
    formData?: FormData;
}
