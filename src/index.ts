import axios, {AxiosRequestConfig, AxiosRequestHeaders} from 'axios';
import {URL} from 'url';
import {promises as fs} from 'fs';
import type {
  AttachmentConfig,
  BroadcastAction,
  Config,
  FileURL,
  HTTPAction,
  MessageConfig,
  ViewAction,
} from './interfaces';

const defaultServerURL = 'https://ntfy.sh';

export class NtfyClient {
  private readonly serverURL: string;

  /**
   * @param serverURL Specify your own ntfy Server. See [Self-hosting](https://docs.ntfy.sh/install/).
   */
  constructor(serverURL?: string) {
    this.serverURL = serverURL || defaultServerURL;
  }

  publish(config: Config): Promise<any> {
    return publish({
      server: this.serverURL,
      ...config,
    });
  }
}

function buildBroadcastActionString(action: BroadcastAction & {type: 'broadcast'}): string {
  let str = `${action.type}, ${action.label}`;

  if (action.clear) {
    str += ', clear=true';
  }

  // TODO: Make sure there is no ', ' at the end
  if (action.extras && Object.keys(action.extras).length) {
    str += `, ${Object.entries(action.extras)
      .map(([key, value]) => `extras.${key}=${value}`)
      .join(', ')}`;
  }

  if (action.intent) {
    str += `, intent=${action.intent}`;
  }

  return str;
}

function ConfigHasAttachment(config: any): config is AttachmentConfig {
  return !!config.fileAttachment;
}

function ConfigHasMessage(config: any): config is MessageConfig {
  return !!config.message;
}

function buildHTTPActionString(action: HTTPAction & {type: 'http'}): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.method) {
    str += `, method=${action.method.toUpperCase()}`;
  }

  if (action.clear) {
    str += ', clear=true';
  }

  if (action.headers && Object.keys(action.headers).length) {
    // TODO: Make sure there is no ', ' at the end
    str += `, ${Object.entries(action.headers)
      .map(([key, value]) => `headers.${key}=${value}`)
      .join(', ')}`;
  }

  if (action.body) {
    str += `, ${action.body}`;
  }

  return str;
}

function buildViewActionString(action: ViewAction & {type: 'view'}): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.clear) {
    str += ', clear=true';
  }

  return str;
}

export async function publish(config: Config): Promise<any> {
  const axiosConfig: AxiosRequestConfig & {headers: AxiosRequestHeaders} = {
    headers: {},
  };

  let postData: any;

  if (config.actions && config.actions.length) {
    axiosConfig.headers['X-Actions'] = config.actions
      .map(action => {
        switch (action.type) {
          case 'broadcast': {
            return buildBroadcastActionString(action);
          }
          case 'http': {
            return buildHTTPActionString(action);
          }
          case 'view': {
            return buildViewActionString(action);
          }
          default: {
            return '';
          }
        }
      })
      .join('; ');
  }

  if (config.authorization) {
    axiosConfig.withCredentials = true;
    axiosConfig.auth = config.authorization;
  }

  if (config.delay) {
    axiosConfig.headers['X-Delay'] = config.delay;
  }

  if (config.disableCache) {
    axiosConfig.headers['X-Cache'] = 'no';
  }

  if (config.disableFirebase) {
    axiosConfig.headers['X-Firebase'] = 'no';
  }

  if (config.emailAddress) {
    axiosConfig.headers['X-Email'] = config.emailAddress;
  }

  if (ConfigHasMessage(config) && config.fileURL) {
    if (typeof config.fileURL === 'string') {
      axiosConfig.headers['X-Attach'] = config.fileURL as string;
    }
    axiosConfig.headers['X-Attach'] = (config.fileURL as FileURL).url;
    axiosConfig.headers['X-Filename'] = (config.fileURL as FileURL).filename;
  }

  if (ConfigHasAttachment(config)) {
    try {
      postData = await fs.readFile(config.fileAttachment);
    } catch (error: unknown) {
      console.error('Error while reading file:', (error as Error).message);
    }
  } else if (config.message) {
    postData = config.message;
  } else {
    throw new Error('No message or file attachment specified');
  }

  if (config.iconURL) {
    axiosConfig.headers['X-Icon'] = config.iconURL;
  }

  if (config.priority) {
    axiosConfig.headers['X-Priority'] = config.priority;
  }

  if (config.tags && config.tags.length) {
    axiosConfig.headers['X-Tags'] = typeof config.tags === 'string' ? config.tags : config.tags.join(',');
  }

  if (config.title) {
    axiosConfig.headers['X-Title'] = config.title;
  }

  const url = new URL(config.topic, config.server || defaultServerURL);

  const {data} = await axios.post(url.href, postData, axiosConfig);
  return data;
}
