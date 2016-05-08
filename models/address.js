var getCountry = function(country){
  return country == "Brasil" ? "BRA" : country;
};

var Address = function(data){
  var address;
  data = data || {};
  address = {
    addressName: "Endereço Principal",
    addressType: "residential",
    city: data.cidade,
    complement: data.complemento,
    country: getCountry(data.pais),
    neighborhood: data.bairro,
    number: data.numero,
    postalCode: data.cep,
    receiverName: data.nome,
    reference: data.referencia,
    state: data.estado,
    street: data.endereco
  };
  return address;
};

module.exports = Address;