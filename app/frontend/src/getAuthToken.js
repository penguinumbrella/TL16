import { defaultStorage } from 'aws-amplify/utils';

export const getAuthToken = () => {
    const storageLength = defaultStorage.storage.length
    let keyName = ''
    for (let i = 0; i<storageLength; i++) {
        if (defaultStorage.storage.key(i).endsWith('accessToken')) {
            keyName = defaultStorage.storage.key(i);
            break;
        }
    }
    return defaultStorage.storage.getItem(keyName);
}