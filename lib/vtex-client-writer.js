var request = require('request');
var _ = require('underscore');
var async = require('async');

var createClients = function(clients){
  async.mapLimit(clients, 1, function(obj, callback) {
    var clientOptions = {
      url: "https://api.vtexcrm.com.br/" + process.env.VTEX_ACCOUNT_NAME + "/dataentities/CL/documents",
      method: "POST",
      headers: {
        'Accept': 'application/vnd.vtex.masterdata.v10+json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
        'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
      },
      json: obj
    };
    var addressOptions = {
      url: "https://api.vtexcrm.com.br/" + process.env.VTEX_ACCOUNT_NAME + "/dataentities/AD/documents",
      method: "POST",
      headers: {
        'Accept': 'application/vnd.vtex.masterdata.v10+json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
        'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
      }
    };
    request(clientOptions, function(err, response, body){
      if (!err && response.statusCode == 201) {
        if (obj.addresses.length){
          var currentAddress = _.extend(obj.addresses[0], {
            userId: body.Id.substr(3, body.Id.length)
          });
          var options = _.extend(addressOptions, {
            json: currentAddress
          });
          request(options, function(err, response){
            if (!err && response.statusCode == 201) {
              callback(null, obj);
            } else {
              callback(err || response.statusCode);
            }
          });
        } else {
          callback(null, obj);
        }
      } else {
        callback(err || response.statusCode);
      }
    });
  }, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("clientes e endereços criados");
    }
  });
};

vtexClientWriter = {
  createClients: function(clients){
    createClients(clients);
  }
};

module.exports = vtexClientWriter;
