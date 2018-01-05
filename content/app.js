const serverhub = require('serverhub-mvc');
const fs = require('fs');
const path = require('path');

serverhub.Run({
    BaseDir: __dirname,
    WebDir: 'www/',
    Controllers: ['home.js']
}, (route) => {
    route.MapRoute('default', '{controller}/{action}/{id}', {
        Controller: 'home',
        Action: 'index',
        id: ''
    });
});