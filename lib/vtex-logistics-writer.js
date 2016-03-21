var Q = require('q');
var _ = require('underscore');
var request = require('request');

vtexLogisticsWriter = {
  setWarehouseItemsBalance: function(products){
    var defer = Q.defer();
    var warehouseBody = _.map(products, function(product){
      return {
        "wareHouseId": "1_1",
        "itemId": product.id,
        "quantity": product.quantity
      }
    });
    var options = {
      url: "http://pilateslovers.vtexcommercestable.com.br/api/logistics/pvt/inventory/warehouseitems/setbalance",
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
        'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
      },
      json: warehouseBody
    };
    request(options, function(err, response){
      defer.resolve(response);
    });
    return defer.promise;
  }
};

module.exports = vtexLogisticsWriter;
