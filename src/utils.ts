export enum NotificationActionType {
    BackgroundCall = 'BACKGROUND_CALL',
    Delete = 'DELETE',
    MarkAsRead = 'MARK_AS_READ',
    Navigate = 'NAVIGATE',
    OpenNotification = 'OPEN_NOTIFICATION',
    Snooze = 'SNOOZE',
    Webhook = 'WEBHOOK'
}

export enum MediaType {
    Audio = 'AUDIO',
    Gif = 'GIF',
    Icon = 'ICON',
    Image = 'IMAGE',
    Video = 'VIDEO'
}

export type NotificationAction = {
    destructive: boolean;
    icon: string;
    title: string;
    type: NotificationActionType;
    value: string;
};

export type MessageAttachment = {
    mediaType: MediaType,
    url?: string | null,
    name?: string | null,
    attachmentUuid?: string | null,
    saveOnServer?: boolean | null
};

export enum NotificationDeliveryType {
  Critical = 'CRITICAL',
  Normal = 'NORMAL',
  Silent = 'SILENT'
}

export type Message = {
  actions?: NotificationAction[];
  addDeleteAction?: boolean;
  addMarkAsReadAction?: boolean;
  addOpenNotificationAction?: boolean;
  attachments?: MessageAttachment[];
  body?: string
  bucketId: string;
  deliveryType: NotificationDeliveryType;
  locale?: string;
  snoozes?: number[];
  sound?: string
  subtitle?: string
  tapAction?: NotificationAction;
  title: string;
};