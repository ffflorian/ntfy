import axios, {AxiosRequestConfig, AxiosRequestHeaders} from 'axios';
import {URL} from 'url';
import {Config, MessagePriority} from './interfaces';

const defaultServerURL = 'https://ntfy.sh';

export class NtfyClient {
  private readonly serverURL: string;

  /**
   * @param serverURL Specify your own ntfy Server. See [Self-hosting](https://docs.ntfy.sh/install/).
   */
  constructor(serverURL?: string) {
    this.serverURL = serverURL || defaultServerURL;
  }

  async publish(config: Omit<Config, 'server'>): Promise<any> {
    publish({
      ...config,
      server: this.serverURL,
    });
  }
}

export async function publish(config: Config): Promise<any> {
  const axiosConfig: AxiosRequestConfig & {headers: AxiosRequestHeaders} = {
    headers: {},
  };

  if (config.actions) {
    // TODO
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

  if (config.fileAttachment) {
    // TODO
  }

  if (config.iconURL) {
    axiosConfig.headers['X-Icon'] = config.iconURL;
  }

  if (config.priority) {
    axiosConfig.headers['X-Priority'] = config.priority;
  }

  if (config.tags) {
    axiosConfig.headers['X-Tags'] = typeof config.tags === 'string' ? config.tags : config.tags.join(',');
  }

  if (config.title) {
    axiosConfig.headers['X-Title'] = config.title;
  }

  const url = new URL(config.topic, config.server || defaultServerURL);

  const {data} = await axios.post(url.href, config.message, axiosConfig);
  return data;
}
