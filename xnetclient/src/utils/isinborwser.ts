export const IsInBrowser = () => {
    const root =
        // eslint-disable-next-line no-restricted-globals
        (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global);
    return typeof window !== 'undefined' && root === window;
};
