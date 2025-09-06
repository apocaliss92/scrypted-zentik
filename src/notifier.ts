import sdk, { MediaObject, Notifier, NotifierOptions, ScryptedDeviceBase, Setting, Settings, SettingValue } from '@scrypted/sdk';
import { StorageSettings } from '@scrypted/sdk/storage-settings';
import { MediaType, Message, MessageAttachment } from './utils';
import axios from 'axios';
import ZentikProvider from './main';
const { mediaManager } = sdk;

export interface NotificationAction {
    title: string;
    action: string;
    url: string;
    icon?: string;
}

export class ZentikNotifier extends ScryptedDeviceBase implements Notifier, Settings {
    storageSettings = new StorageSettings(this, {
        serverUrl: {
            type: 'string',
            title: 'Server URL',
            defaultValue: 'https://notifier-api.zentik.app/api/v1'
        },
        accessToken: {
            type: 'string',
            title: 'Access token',
        },
        bucketId: {
            type: 'string',
            title: 'Bucket ID (or name)',
        },
        userIds: {
            type: 'string',
            multiple: true,
            title: 'User IDs (or usernames)',
            description: 'If the bucket is shared, specify which users to target. Leave blank for all the users'
        },
    });

    constructor(nativeId: string, public plugin: ZentikProvider) {
        super(nativeId);
    }

    async sendNotification(title: string, options?: NotifierOptions, media?: MediaObject | string, icon?: MediaObject | string): Promise<void> {
        const { accessToken, bucketId, serverUrl, userIds } = this.storageSettings.values;

        if (!accessToken || !bucketId || !serverUrl) {
            this.console.log('Some of the parameters are not set');
            return;
        }

        const props = options?.data?.zentik ?? {};

        let imageUrl: string | undefined;
        try {
            if (media) {
                if (typeof media !== 'string') {
                    media = await mediaManager.convertMediaObjectToUrl(media, 'image/jpeg');
                }
                imageUrl = media;
            }
        } catch (e) {
            this.console.log('Error trying to parse media image', e);
        }

        const userIdsToUse = userIds && userIds.length ? userIds : undefined;

        try {
            const { locale } = this.plugin.storageSettings.values;
            const payload: Message = {
                title,
                bucketId,
                body: options.body ?? options.bodyWithSubtitle,
                imageUrl,
                locale,
                userIds: userIdsToUse,
                ...props,
            };
            this.console.log(`Sending notification to ${bucketId} with payload ${JSON.stringify(payload)}`);

            const res = await axios.post(`${serverUrl}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            this.console.log('Notification sent', res.data);
        } catch (e) {
            this.console.error('Error in sending notification', e);
        }
    }

    async getSettings(): Promise<Setting[]> {
        return this.storageSettings.getSettings();
    }

    async putSetting(key: string, value: SettingValue): Promise<void> {
        return this.storageSettings.putSetting(key, value);
    }
}
