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
    var i,j,temparray,chunk = 10;
    for (i=0,j=warehouseBody.length; i<j; i+=chunk) {
      temparray = warehouseBody.slice(i,i+chunk);
      var options = {
        url: "http://" + process.env.VTEX_ACCOUNT_NAME + ".vtexcommercestable.com.br/api/logistics/pvt/inventory/warehouseitems/setbalance",
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY,
          'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN
        },
        json: temparray
      };
      request(options, function(err, response){
        if (err){
          console.log(err)
        }
        console.log("gravou estoque");
      });
    }

    defer.resolve(true);
    return defer.promise;
  }
};

module.exports = vtexLogisticsWriter;
