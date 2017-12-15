'use strict'

var phoneDetails, // Dict of phone details
  itemListEl; // ul element holding phones

// send an AJAX request to given url, call done() when complete
function ajax(url, done){
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.send();

  req.onreadystatechange = function(){
    if (req.readyState != XMLHttpRequest.DONE || req.status == 500) return;

    done(JSON.parse(req.responseText), req);
  }

  return req;
}

// template of item element (excluding surrounding li)
var itemTemplate = '<a href="#" class="product-photo">'
  +'<img src="{{small}}" height="130" alt="{{name}}">'
  +'</a>'
  +'<h2><a href="#">{{name}}</a></h2>'
  +'<ul class="product-description">'
  +'<li><span>Manufacturer: </span>{{manufacturer}}</li>'
  +'<li><span>Storage: </span>{{storage}} GB</li>'
  +'<li><span>OS: </span>{{os}}</li>'
  +'<li><span>Camera: </span>{{camera}} Mpx</li>'
  +'<li><span>Description: </span>{{description}}</li>'
  +'</ul>'
  +'<p class="product-price">£{{price}}</p>';

// recursively substitute dict values into string by replacing {{keys}}
function subKeyValues(str, details) {
  for (var key in details) {
    var val = details[key];
    if (typeof val === 'object') {
      // recurse if this is a sub-dict
      str = subKeyValues(str, val);
      continue;
    }

    // replace pattern {{key}} with respective value
    str = str.replace(new RegExp('{{'+ key +'}}', 'g'),
      val);
  }

  return str;
}

// create a new item element, fill info, and return it
function newItemElement(details) {
  var li = document.createElement('li');

  // form HTML from template
  var html = subKeyValues(itemTemplate, details);
  // set HTML
  li.innerHTML = html;

  return li;
}

document.addEventListener('DOMContentLoaded', function() {
  ajax('products.json', function(json) {
    phoneDetails = json;

    for (var key in phoneDetails) {
      var itemEl = newItemElement(phoneDetails[key]);
      itemListEl.appendChild(itemEl);
    }
  });

  itemListEl = document.querySelector('.products-list');
});
