var getFirstName = function(name){
  return name.split(" ")[0];
};

var getLastName = function(name){
  var lastName = name.split(" ");
  lastName.splice(0,1);
  return lastName.join(" ");
};

var getPrimaryPhone = function(data){
  if (data.telefone_celular && data.telefone_celular.length)
    return data.telefone_celular;
  if (data.telefone_principal && data.telefone_principal.length)
    return data.telefone_principal;
  if (data.telefone_comercial && data.telefone_comercial.length)
    return data.telefone_comercial;
  return "";
};

var Client = function(data){
  var client;
  data = data || {};
  client = {
    firstName: getFirstName(data.nome),
    lastName: getLastName(data.nome),
    gender: data.sexo,
    birthDate: data.data_nascimento,
    businessPhone: "",
    corporateDocument: data.cnpj,
    corporateName: data.razao_social,
    document: data.cpf,
    documentType: "cpf",
    email: data.email,
    homePhone: getPrimaryPhone(data),
    isCorporate: data.tipo != "PF",
    isNewsletterOptIn: data.aceita_newsletter,
    phone: "",
    stateRegistration: data.ie,
    tradeName: data.razao_social
  };
  return client;
};

module.exports = Client;