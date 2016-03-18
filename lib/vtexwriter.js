var soap = require('soap');
var url = 'https://webservice-pilateslovers.vtexcommerce.com.br/Service.svc?wsdl';
var soapClient = null;
var baseProducts = null;
var _ = require('underscore');

var slugify = function(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

var options = {
  'wsdl_headers': {
    'Authorization': 'Basic ' + new Buffer(process.env.VTEX_USER + ':' + process.env.VTEX_PWD).toString('base64')
  }
};

var writeProducts = function(products){
  soap.createClient(url, options, function(err, client) {
    baseProducts = JSON.parse(JSON.stringify(products));
    soapClient = client;
    soapClient.setSecurity(new soap.BasicAuthSecurity(process.env.VTEX_USER, process.env.VTEX_PWD));
    var regularProducts = _.filter(baseProducts, function(prod){
      return prod.type == 'normal';
    });
    createProducts(regularProducts);
  });
};

var createProducts = function(products){
  var product = products[14];
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
      'vtex:LinkId': slugify(product.name),
      'vtex:MetaTagDescription': '',
      'vtex:Name': product.name,
      'vtex:ShowWithoutStock': true,
      'vtex:Title': product.name
    }
  };
  soapClient.ProductInsertUpdate(prodToVTEX, function(err, result) {
    console.log(err);
    console.log(result);
    if (err){
      throw new Error(err);
    } else {
      createSku(product);
    }
  });
};

var createSku = function(product){
  var skuToVTEX = {
    'tem:stockKeepingUnitVO': {
      'vtex:CubicWeight': product.weight,
      'vtex:Height': product.height,
      'vtex:Id': product.id,
      'vtex:IsActive': product.active,
      'vtex:IsVisible': true,
      'vtex:IsKit': false,
      'vtex:Length': product.depth,
      'vtex:ModalId': 1,
      'vtex:Name': product.name,
      'vtex:ProductId': product.id,
      'vtex:RefId': product.skuId,
      'vtex:UnitMultiplier': 1,
      'vtex:WeightKg': product.weight,
      'vtex:Width': product.width
    }
  };
  soapClient.StockKeepingUnitInsertUpdate(skuToVTEX, function(err, result){
    if (err){
      throw new Error(err);
    } else {
      var skuResponse = result.StockKeepingUnitInsertUpdateResult
      createSkuImages(product.images, skuResponse.Id);
    }
  });
};

var createSkuImages = function(images, skuId){
  _.each(images, function(image){
    var imageToVTEX = {
        'tem:urlImage': image.url,
        'tem:imageName': image.name,
        'tem:stockKeepingUnitId': skuId
    };
    soapClient.ImageServiceInsertUpdate(imageToVTEX, function(err, result){
      console.log(err);
      console.log(result);
    });
  });
};

vtexwriter = {
  startVtexWrite: function(products){
    writeProducts(products);
  }
};

module.exports = vtexwriter;
