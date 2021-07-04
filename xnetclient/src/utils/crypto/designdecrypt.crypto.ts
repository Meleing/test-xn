// import * as cryptoJS from 'crypto-js';
// import { injectable } from 'inversify';

// @injectable()
// export class DesignDecrypt {

//     // 后台获取，暂时这么写. 先把路跑通
//     public v1: string = '3553355336733553#3553355336733553';
//     public v2: string = '3553355335533553#3553355335533553';
//     /**
//      *
//      * 解密
//      * @memberof text 需要解密的字符串
//      */
//     public decrypt = (text: string) => {
//         let result: any;
//         let segstxt: string = '';
//         let segs = [];
//         segstxt = this.v1 || this.v2;
//         segs = segstxt.split('#');
//         if (segs.length === 2) {
//             result = this.decryptex(text, segs[0], segs[1]);
//             if (result) { return result; }
//         } else {
//             const falseTip = { isSuccess: false, e: 'err:  encryption password error' };
//             return falseTip;
//         }
//     }

//     /**
//      *
//      *
//      * @memberof text 解密内容
//      * @memberof k 密钥
//      * @memberof v 密钥
//      */
//     public decryptex = (text: string, k: string, v: string) => {
//         try {
//             const key = cryptoJS.enc.Utf8.parse(k);
//             const iv = cryptoJS.enc.Utf8.parse(v);
//             const decrypted = cryptoJS.AES.decrypt(text, key, {
//                 keySize: 128 / 8,
//                 iv: iv,
//                 mode: cryptoJS.mode.CBC,
//                 padding: cryptoJS.pad.Pkcs7
//             });
//             return decrypted.toString(cryptoJS.enc.Utf8);
//         } catch (e) {
//             const falseTip = { isSuccess: false, e: 'decryptex error:' + e };
//             return falseTip;
//         }
//     }

// }
