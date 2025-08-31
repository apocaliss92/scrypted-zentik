import sdk, { DeviceCreator, DeviceCreatorSettings, ScryptedDeviceBase, ScryptedDeviceType, ScryptedInterface, Setting, Settings, SettingValue } from "@scrypted/sdk";
import { ZentikNotifier } from "./notifier";
import { randomBytes } from "crypto";
import { StorageSettings } from "@scrypted/sdk/storage-settings";
const { deviceManager } = sdk;

class ZentikProvider extends ScryptedDeviceBase implements DeviceCreator, Settings {
    storageSettings = new StorageSettings(this, {
        locale: {
            type: 'string',
            title: 'Locale for default actions',
            defaultValue: 'en-EN',
            choices: ['en-EN', 'it-IT']
        },
    });
    devices = new Map<string, any>();

    async getSettings(): Promise<Setting[]> {
        return this.storageSettings.getSettings();
    }

    async putSetting(key: string, value: SettingValue): Promise<void> {
        return this.storageSettings.putSetting(key, value);
    }

    getScryptedDeviceCreator(): string {
        return 'Zentik notifier';
    }

    getDevice(nativeId: string) {
        let ret = this.devices.get(nativeId);
        if (!ret) {
            ret = this.createNotifier(nativeId);
            if (ret)
                this.devices.set(nativeId, ret);
        }
        return ret;
    }

    updateDevice(nativeId: string, name: string, interfaces: string[], type?: ScryptedDeviceType) {
        return deviceManager.onDeviceDiscovered({
            nativeId,
            name,
            interfaces,
            type: type || ScryptedDeviceType.Notifier,
            info: deviceManager.getNativeIds().includes(nativeId) ? deviceManager.getDeviceState(nativeId)?.info : undefined,
        });
    }

    async createDevice(settings: DeviceCreatorSettings, nativeId?: string): Promise<string> {
        nativeId ||= randomBytes(4).toString('hex');
        const target = settings.target;
        const name = `Zentik ${target}`;
        await this.updateDevice(nativeId, name, [ScryptedInterface.Settings, ScryptedInterface.Notifier]);
        const device = await this.getDevice(nativeId) as ZentikNotifier;
        nativeId = device.nativeId;

        Object.entries(settings).forEach(([key, value]) => {
            device.storageSettings.values[key] = value;
        });

        return nativeId;
    }

    async getCreateDeviceSettings(): Promise<Setting[]> {
        try {
            const storageSettings = new StorageSettings(this, {
                target: {
                    type: 'string',
                    title: 'Target',
                    description: 'Identifier of the notifier'
                },
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
                    title: 'Bucket ID',
                },
            });
            return await storageSettings.getSettings();
        } catch (e) {
            this.console.log(e);
        }
    }

    createNotifier(nativeId: string) {
        return new ZentikNotifier(nativeId, this);
    }
}

export default ZentikProvider;
