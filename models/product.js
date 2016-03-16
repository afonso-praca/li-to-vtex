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
  var product;
  data = data || {};
  product = {
    id: data.id,
    active: data.ativo || false,
    isFeatured: data.destaque || false,
    skuId: data.sku || "",
    name: data.nome || "",
    slug: data.apelido || "",
    description: data.descricao_completa || "",
    resource_uri: data.resource_uri,
    brand: getBrandId(data.marca),
    categoryId: getCategoryId(data.categorias),
    images: [],
    weight: data.peso || 0,
    height: data.altura || 0,
    width: data.largura || 0,
    depth: data.profundidade || 0,
    listPrice: 9999,
    price: 9999,
    costPrice: 9999
  };
  return product
};

module.exports = Product;
