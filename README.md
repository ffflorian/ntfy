# ntfy [![Build Status](https://github.com/ffflorian/ntfy/workflows/Build/badge.svg)](https://github.com/ffflorian/ntfy/actions/)

Send notifications over [ntfy.sh](https://ntfy.sh).

## Installation

```
npm install ntfy
```

```
yarn add ntft
```

## Usage

```ts
import {NtfyClient} from 'ntfy';

const ntfyClient = new NtfyClient();

await ntfyClient.publish({
  clickURL: 'https://github.com/ffflorian/ntfy',
  iconURL: 'https://avatars.githubusercontent.com/ffflorian',
  message: 'Remote access to device detected. Act right away.',
  priority: 'urgent',
  tags: ['warning', 'skull'],
  title: 'Unauthorized access detected',
  topic: 'mytopic',
});
```
