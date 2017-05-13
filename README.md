# bnb

## To start DB
### DEV
```
mongod --dbpath data/db
```
### PROD
```
cd ~/www/bnb && ~/mongodb/bin/mongod  --fork --logpath /var/log/mongod.log --storageEngine=mmapv1 --dbpath data/db
```

## To start DB Admin GUI
### DEV
```
cd node_modules/mongo-express/ && node app.js
```
### PROD
```
npm install -g forever
cd ~/www/bnb/node_modules/mongo-express/ && forever start app.js
```

## To use Chinese airbnb API
line 4 in node_modules/airapi/configs.js and use
https://zh.airbnb.com

## To start Rest API Server
```
cd api
nodemon app.js
```

## Add OS Startup Script
```
echo "/etc/init.d/bnbstartup" >> /etc/rc.local
```

## Build UI
```
NODE_ENV=production npm run build
```

## Crontab
```
@reboot su - root -c '/usr/local/bin/forever start --spinSleepTime=5000 --minUptime=5000 /var/tmp/www/bnb/node_modules/mongo-express/app.js'
@reboot su - root -c '/usr/local/bin/forever start --spinSleepTime=5000 --minUptime=5000 /var/tmp/www/bnb/api/app.js'
@reboot /sbin/service httpd restart
```
