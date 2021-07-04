import axios from 'axios';
import * as _ from 'lodash';

const urlBase = 'http://service2.dev.jtl3d.cn';
export const getServiceTags = async () => {
    const swaggerUrl = 'http://swagger.dev.jtl3d.cn/v1/docs';
    const res = await axios.get<string>(swaggerUrl);
    const resFormat = _.dropRight(res.data.trim().split(','));
    const tags = resFormat.map((f: string) => f.split(':'));

    return tags.map(([tag, url]) => ({ tag: `${_.camelCase(tag)}`, url: `${urlBase}/${url}` }));
};
