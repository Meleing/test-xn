import { injectable } from 'inversify';
import * as _ from 'lodash';
import * as moment from 'moment';
import { GlobalConfig } from '../config/global';
import { CachableInterface } from '../interface/httphelper/cachableinterface';

@injectable()
export class JtlCacheStorage {
    public Save(key: string, value: CachableInterface) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        value.expired_time = moment()
            .add(GlobalConfig.EXPIRED_TIME, 'millisecond')
            .toDate();
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    public Get(key: string): object | undefined {
        const itemstring = sessionStorage.getItem(key);
        if (_.isNull(itemstring)) {
            return undefined;
        }
        const item = JSON.parse(itemstring) as CachableInterface;
        if (new Date() > moment(item.expired_time).toDate()) {
            return undefined;
        }
        return item;
    }
}
