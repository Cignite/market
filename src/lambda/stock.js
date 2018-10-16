const UN = process.env.GITHUB_USERNAME
const UP = process.env.GITHUB_PASSWORD

var request = require('request');

function calculateNewStock(stock,changes){
  var newStock = [...stock]
  for(let change of changes){
    newStock=newStock.map(stock=>{
      if(stock.title==change.title){
        return {
          title:stock.title,
          value:stock.value-change.quantity
          }
      }else{
        return stock
      }
    })
  }
  return newStock
}

exports.handler = function(event, context, callback) {
  var cart = JSON.parse(event.body)
  getStock(cart)
}

function getStock(changes){
  console.log('running')
  var getOptions = {
    //this address is wrong now
      url: `https://api.github.com/repos/${UN}/freemarket/contents/content/inventory/inventory.json`,
      auth: {
          "user": UN,
          "pass": UP,
      },
      headers: {
        'User-Agent': 'request'
      }
  };

  function getCallback(error, response, body) {
    const data = JSON.parse(body)
    var sha = data.sha
    var buf = new Buffer(data.content, 'base64').toString();
    var stock = JSON.parse(buf)
    // inventory.inventory ????
    var newStock = calculateNewStock(stock.inventory,changes)
    setStock(sha,newStock)
  }
  request(getOptions, getCallback);
}

function setStock(sha,newStock){

  var newFileContent = new Buffer(JSON.stringify({inventory:newStock})).toString("base64");

  var options = {
    url: `https://api.github.com/repos/${UN}/freemarket/contents/content/inventory/inventory.json`,
    auth: {
        "user": UN,
        "pass": UP
    },
    headers: {
      'User-Agent': 'request'
    },
    method:"PUT",
    body:JSON.stringify({
      "message":"update_inventory",
      "content":newFileContent,
      "sha":sha,
      "committer": {
        "name":UN,
        "email":'freemarket@internet.org'
      }
    })
  };

  function callback(error, response, body) {
    // console.log("response=> " + JSON.stringify(response))
    // console.log("body=> ") + body
    // console.log("error=> " + error)
  }
  request(options, callback);
}
