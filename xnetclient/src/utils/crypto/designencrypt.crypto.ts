// import * as cryptoJS from 'crypto-js';
// import { injectable } from 'inversify';

// @injectable()
// export class DesignEncrypt {

//     // 后台获取，暂时这么写.先把路跑通
//     public k: string = '3553355336733553';
//     public v: string = '3553355336733553';
//     /**
//      *
//      * 加密
//      * @memberof text : 需要加密的字符串
//      */
//     public encrypt = (text: string) => {
//         const key: string = cryptoJS.enc.Utf8.parse(this.k);
//         const iv: string = cryptoJS.enc.Utf8.parse(this.v);
//         const encrypted: any = cryptoJS.AES.encrypt(text, key, {
//             keySize: 128 / 8,
//             iv: iv,
//             mode: cryptoJS.mode.CBC,
//             padding: cryptoJS.pad.Pkcs7
//         });
//         return encrypted.toString();
//     }

// }
