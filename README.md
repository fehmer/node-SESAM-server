## About

node-SESAM-server is a [c't SESAM](https://github.com/ola-ct/Qt-SESAM) sync server written in node.js

## Configuration

The configuration file is in config/default.json. It contains the config for the webservice port, your redis connections and all users which are allowed to access the service.

Example:

```json
{
  "port": 3000,
  "redis": {
    "host": "127.0.0.1",
    "port": 6379
  },
  "users" : {
    "test": "test"
  }
}
```

### port

Configure the port the server is running on.


### redis

Configure the host and port of the redis database

### users

Defines a set of allowed users. The key is the user name and the value the given password. The password is only for the access of the service, not the actual master password.


## Installation

- install redis-server, nodejs and npm on your machine (ask google how to do this)
- create a local user for the node process
- clone the repository e.g. into /home/sesam/
- update the configuration, see above
- _as root_ install [pm2](https://www.npmjs.com/package/pm2) by executing ```sudo npm -g install pm2```.
- _as user_ install needed node modules by executing ```npm install``` in the project directory
- _as user_ add the server to pm2 by executing ```pm2 start index.js --name "sesam"
- configure your webserver
- test the server by accessing http://127.0.0.1:3000/api (via curl or wget)
- test the server by accessing https://your.server.tld/api in your browser.

### Apache

```
<VirtualHost server.tld:443>
  ServerName your.server.tld
  SSLEngine on
  SSLCertificateFile /etc/apache2/ssl/sesam.crt
  SSLCertificateKeyFile /etc/apache2/ssl/sesam.key

  ProxyRequests off

    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>

    <Location /api>
        ProxyPass http://127.0.0.1:3000/
        ProxyPassReverse http://127.0.0.1:3000/
    </Location>

</VirtualHost>
```

You have to create the needed certificates by yourself. Ask google if you have any problems with the certificate creation or the apache configuration in general.


### nginx

```
server {
  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;
  server_name your.server.tld;
  ssl_certificate /etc/nginx/ssl/sesam.crt;
  ssl_certificate_key /etc/nginx/ssl/sesam.key;

  location ~ /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        expires off;
    }

}

```

You have to create the needed certificates by yourself. Ask google if you have any problems with the certificate creation or the nginx configuration in general.




## using with ct sesam

The root url, user name and password depend on your server and configuration. The root url for the examples above will be https://your.server.tld/api/. 

Use this urls:

- read: ```read```
- write: ```write```
- delete: ```delete```