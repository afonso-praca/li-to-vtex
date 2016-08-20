var soap = require('soap');
var url = 'https://webservice-' + process.env.VTEX_ACCOUNT_NAME + '.vtexcommerce.com.br/Service.svc?wsdl';
var soapClient = null;
var baseProducts = null;
var _ = require('underscore');
var Q = require('q');
var async = require('async');

var vtexLogisticsWriter = require('./vtex-logistics-writer');
var vtexPricingWriter = require('./vtex-pricing-writer');

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer(process.env.VTEX_USER + ':' + process.env.VTEX_PWD).toString('base64')
  }
};

var writeProducts = function(products){
  console.log('vtex writer started');
  soap.createClient(url, options, function(err, client) {
    baseProducts = JSON.parse(JSON.stringify(products));
    // REJECTS ANOMALLY SKU
    baseProducts = _.reject(baseProducts, function(product){
      return product.id == 8070349;
    });

    soapClient = client;
    soapClient.setSecurity(new soap.BasicAuthSecurity(process.env.VTEX_USER, process.env.VTEX_PWD));
    createProducts(baseProducts);
    //createProducts(baseProducts);
    //createSkusVariations();
  });
};

var createProducts = function(products){
  var productsToVTEX = _.filter(products, function(product){
    return ((product.type == 'normal' || product.type == 'atributo') && product.categoryId);
  });
  //var skusVariations
  async.mapLimit(productsToVTEX, 1, function(obj, callback) {
    createProduct(obj).then(function(response){
      callback(null, response);
    }, function(error){
      callback(error);
    });
  }, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("products successful created");
      createSkus(products);
    }
  });
};

var getParent = function(parentId){
  var parent = _.find(baseProducts, function(product){
    return product.id == parentId;
  });
  return parent;
};

var createSkusVariations = function(){
  var skusVariation = _.filter(baseProducts, function(product){
    return ((product.type == 'atributo_opcao') && product.active);
  });
  _.each(skusVariation, function(sku){
    sku.name = getParent(sku.parentId) ? getParent(sku.parentId).name : "";
    sku.images = getParent(sku.parentId) ? getParent(sku.parentId).images : [];
  });
  runAsync(skusVariation, createSku, [setPrices])
};

var setPrices = function(){
  vtexPricingWriter.setPrices(baseProducts).then(function(){
    console.log('all prices saved');
    activateProducts();
  });
};

var createProduct = function(product){
  var defer = Q.defer();
  var prodToVTEX = {
    'tem:productVO': {
      'vtex:BrandId': product.brand,
      'vtex:CategoryId': Number(product.categoryId),
      'vtex:DepartmentId': Number(product.categoryId),
      'vtex:Description': product.description,
      'vtex:Id': product.id,
      'vtex:IsActive': product.active,
      'vtex:IsVisible': true,
      'vtex:KeyWords': '',
      'vtex:ListStoreId': [1],
      'vtex:LinkId': product.slug,
      'vtex:MetaTagDescription': '',
      'vtex:Name': product.name,
      'vtex:ShowWithoutStock': true,
      'vtex:Title': product.name
    }
  };
  soapClient.ProductInsertUpdate(prodToVTEX, function(err, result) {
    if (err){
      console.log("error");
      console.log(err);
      // defer.reject(err);
      // throw new Error(err);
      defer.resolve(true);
    } else {
      console.log("Product created -> " + result.ProductInsertUpdateResult.Id);
      //createSku(product, result.ProductInsertUpdateResult.Id);
      defer.resolve(result.ProductInsertUpdateResult);
    }
  });
  return defer.promise;
};

var runAsync = function(list, method, next){
  async.mapLimit(list, 1, function(item, callback) {
    method(item).then(function(response){
      callback(null, response);
    }, function(error){
      callback(error);
    });
  }, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      if (next && next.length){
        _.each(next, function(fn){
          fn();
        });
      }
      return true;
    }
  });
};

var createSkus = function(products){
  var skusToVTEX = _.filter(products, function(product){
    return product.type == 'normal' && product.name && product.name.length;
  });
  async.mapLimit(skusToVTEX, 1, function(sku, callback) {
    createSku(sku).then(function(response){
      callback(null, response);
    }, function(error){
      callback(error);
    });
  }, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("skus successful created");
      createSkusVariations();
      //activateProducts(products);
    }
  });
};

var createSku = function(data){
  var defer = Q.defer();
  var skuToVTEX = {
    'tem:stockKeepingUnitVO': {
      'vtex:CubicWeight': data.weight,
      'vtex:Height': data.height,
      'vtex:Id': data.id,
      'vtex:IsActive': data.active,
      'vtex:IsVisible': true,
      'vtex:IsKit': false,
      'vtex:Length': data.depth,
      'vtex:ModalId': 1,
      'vtex:Name': data.name || "teste",
      'vtex:ProductId': data.parentId ? data.parentId : data.id,
      'vtex:RefId': data.skuId,
      'vtex:UnitMultiplier': 1,
      'vtex:WeightKg': data.weight,
      'vtex:Width': data.width
    }
  };
  soapClient.StockKeepingUnitInsertUpdate(skuToVTEX, function(err, result){
    if (err){
      console.log(err);
      defer.resolve(true);
      // throw new Error("error on create sku " + err);
    } else {
      console.log("sku created -> " + result.StockKeepingUnitInsertUpdateResult.Id);
      defer.resolve(result.StockKeepingUnitInsertUpdateResult);
      createSkuImage(data.images, result.StockKeepingUnitInsertUpdateResult.Id);
    }
  });
  return defer.promise;
};

var createSkuImage = function(images, skuId){
  if (images.length) {
    var image = images.splice(0, 1)[0];
    var imageToVTEX = {
      'tem:urlImage': image.url,
      'tem:stockKeepingUnitId': skuId
    };
    soapClient.ImageServiceInsertUpdate(imageToVTEX, function (err) {
      if (err){
        console.log("error on create sku image " + err);
        return true;
      } else {
        if (images.length){
          createSkuImage(images, skuId);
        } else {
          return true;
        }
      }
    }, { timeout: 7000 });
  } else {
    return true;
  }
};

var activateProducts = function(){
  console.log("activateProducts");
  var skusToVTEX = _.filter(baseProducts, function(product){
    return (product.type == 'normal' || product.type == 'atributo_opcao')
      && product.name && product.name.length;
  });
  async.mapLimit(skusToVTEX, 1, function(sku, callback) {
    activateProduct(sku).then(function(response){
      callback(null, response);
    }, function(error){
      callback(error);
    });
  }, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      console.log("skus successful activated");
    }
  });
};

var activateProduct = function(product){
  var defer = Q.defer();
  var skuToVTEX = {
    'tem:idStockKeepingUnit': product.id
  };
  soapClient.StockKeepingUnitActive(skuToVTEX, function (err) {
    if (err){
      console.log("error on activate sku " + err);
      defer.resolve(err);
    } else {
      console.log("sku activated");
      defer.resolve(true);
    }
  });
  return defer.promise;
};

vtexwriter = {
  startVtexWrite: function(products){
    writeProducts(products);
    vtexLogisticsWriter.setWarehouseItemsBalance(products).then(function(){
      console.log('items balance saved');
    });
  }
};

module.exports = vtexwriter;
