[![Build Status](https://travis-ci.org/Asimov4/makehub.png?branch=master)](https://travis-ci.org/Asimov4/makehub)

```
  __  __       _        _           _
 |  \/  |     | |      | |         | |
 | \  / | __ _| | _____| |__  _   _| |__
 | |\/| |/ _` | |/ / _ \ '_ \| | | | '_ \
 | |  | | (_| |   <  __/ | | | |_| | |_) |
 |_|  |_|\__,_|_|\_\___|_| |_|\__,_|_.__/
```

Welcome to Makehub

## Setup development environment

We recommend you to develop on Cloud9 IDE http://c9.io
Just fork the project on github and then open it using Cloud9 IDE.

To start the server, you'll need to pass in the following cmd line args to the `node server.js` command:
```
--host=https://your-host-name.c9.io
--github-client-id=aaabbbccc111222333
--github-client-secret=aaabbbccc111222333aaabbbccc111222333.
```

after you have done `npm install`

To get a github-client-id and a github-client-secret, go to https://github.com/settings/applications and register a new application.

## About i18n

To change the language to Chinese, visit `/cn`.

To change back to English, visit `/en`.

Translation JSON for server side: located at `/locales`; for client side: located at `/client/js/locales`.

## Production server

http://makehub.eu

It is hosted on an http://openshift.com gear.
The domain name is at https://www.namecheap.com.

## HacKIDemia

This is an HacKIDemia project. Visit http://www.hackidemia.com/ to know more.
