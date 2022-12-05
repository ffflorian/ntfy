import type {BroadcastAction, AttachmentConfig, MessageConfig, HTTPAction, ViewAction} from './interfaces';

export function buildBroadcastActionString(action: BroadcastAction & {type: 'broadcast'}): string {
  let str = `${action.type}, ${action.label}`;

  if (action.clear) {
    str += ', clear=true';
  }

  if (action.extras) {
    for (const extra in action.extras) {
      str += `, extras.header=${action.extras[extra]}`;
    }
  }

  if (action.intent) {
    str += `, intent=${action.intent}`;
  }

  return str;
}

export function configHasAttachment(config: any): config is AttachmentConfig {
  return !!config.fileAttachment;
}

export function configHasMessage(config: any): config is MessageConfig {
  return !!config.message;
}

export function buildHTTPActionString(action: HTTPAction & {type: 'http'}): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.method) {
    str += `, method=${action.method.toUpperCase()}`;
  }

  if (action.clear) {
    str += ', clear=true';
  }

  if (action.headers) {
    for (const header in action.headers) {
      str += `, headers.header=${action.headers[header]}`;
    }
  }

  if (action.body) {
    str += `, ${action.body}`;
  }

  return str;
}

export function buildViewActionString(action: ViewAction & {type: 'view'}): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.clear) {
    str += ', clear=true';
  }

  return str;
}
