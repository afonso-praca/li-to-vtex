var _ = require('underscore');

var Product = function(data){
  var getCategoryId = function(categories){
    if (categories && categories.length){
      var category = categories[0].split("/");
      return category[category.length-1];
    }
    return null;
  };
  var getBrandId = function(brand){
    if (brand){
      brand = brand.split("/");
      return brand[brand.length-1];
    }
  };
  var getParentId = function(parent){
    if (parent){
      parent = parent.split("/");
      return parent[parent.length-1];
    }
    return null;
  };
  var mapImages = function(images, name){
    return _.map(images, function(image){
      return {
        url: 'http://cdn.awsli.com.br/' + image.caminho,
        name: name
      }
    });
  };
  var product;
  data = data || {};
  product = {
    id: data.id,
    active: data.ativo || false,
    isFeatured: data.destaque || false,
    skuId: data.sku || "",
    name: data.nome || "",
    slug: data.apelido || "",
    type: data.tipo || "",
    parentId: getParentId(data.pai),
    description: data.descricao_completa || "",
    resource_uri: data.resource_uri,
    brand: getBrandId(data.marca),
    categoryId: getCategoryId(data.categorias),
    images: mapImages(data.imagens, data.nome),
    weight: data.peso ? (Number(data.peso) * 1000) : 0,
    height: data.altura || 0,
    width: data.largura || 0,
    depth: data.profundidade || 0,
    listPrice: 9999, // will be populated later
    price: 9999, // will be populated later
    costPrice: 9999, // will be populated later
    quantity: 0 // will be populated later
  };
  return product
};

module.exports = Product;
