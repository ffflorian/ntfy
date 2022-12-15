import axios, {AxiosRequestConfig, RawAxiosRequestHeaders} from 'axios';
import {URL} from 'url';
import {promises as fs} from 'fs';
import * as util from './util';
import type {Config, FileURL, ResponseData} from './interfaces';

const defaultServerURL = 'https://ntfy.sh';

export class NtfyClient {
  private readonly serverURL: string;

  /**
   * @param serverURL Specify your own ntfy Server. See [Self-hosting](https://docs.ntfy.sh/install/).
   */
  constructor(serverURL?: string) {
    this.serverURL = serverURL || defaultServerURL;
  }

  publish<T extends Config>(config: T): Promise<ResponseData<T>> {
    return publish({
      server: this.serverURL,
      ...config,
    });
  }
}

export async function publish<T extends Config>(config: T): Promise<ResponseData<T>> {
  const axiosConfig: AxiosRequestConfig & {headers: RawAxiosRequestHeaders} = {
    headers: {},
  };

  let postData: any;

  if (config.actions && config.actions.length) {
    axiosConfig.headers['X-Actions'] = config.actions
      .map(action => {
        switch (action.type) {
          case 'broadcast': {
            return util.buildBroadcastActionString(action);
          }
          case 'http': {
            return util.buildHTTPActionString(action);
          }
          case 'view': {
            return util.buildViewActionString(action);
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

  if (util.configHasMessage(config) && config.fileURL) {
    if (typeof config.fileURL === 'string') {
      axiosConfig.headers['X-Attach'] = config.fileURL as string;
    }
    axiosConfig.headers['X-Attach'] = (config.fileURL as FileURL).url;
    axiosConfig.headers['X-Filename'] = (config.fileURL as FileURL).filename;
  }

  if (util.configHasAttachment(config)) {
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
