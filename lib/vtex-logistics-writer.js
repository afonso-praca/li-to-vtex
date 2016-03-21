var Q = require('q');
var _ = require('underscore');

vtexLogisticsWriter = {
  setWarehouseItemsBalance: function(products){
    var warehouseBody = _.map(products, function(product){
      return {
        "wareHouseId": "1_1",
        "itemId": product.id,
        "quantity": 12
      }
    });
    var defer = Q.defer();
    var options = {
      url: "https://pilateslovers.vtexcommercestable.com.br/api/logistics/pvt/inventory/warehouseitems/setbalance",
      method: "POST",
      headers: {
        'User-Agent': 'request'
      },
      body: warehouseBody
    };
    request(options, function(err, response, body){
      data = JSON.parse(body);
      list = list.concat(data.objects);
      return (data.meta.next) ? getDataFromLi(data.meta.next, list, callback) : callback(list);
    });
    return defer.promise;
  }
};

module.exports = vtexLogisticsWriter;
