'use strict';

var phoneDetails, // Dict of phone details
  itemListEl, // ul element holding phones
  filters = {}; // 2d dict of keys, and the values that should be allowed

// flatten a multi-dimensional dict into 1D
function flatten(dict, root, key) {
  for (var k in dict) {
    var val = dict[k]
    if (typeof val !== 'object') {
      if (root) {
        root[k] = val;
      }
      continue;
    }

    flatten(val, dict, k);
  }

  // remove sub-dict
  if (root) {
    delete root[key];
  }
}

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

// substitute dict values into string by replacing {{keys}}
function subKeyValues(str, details) {
  for (var key in details) {
    // replace pattern {{key}} with respective value
    str = str.replace(new RegExp('{{'+ key +'}}', 'g'),
      details[key]);
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
  li.setAttribute('itemid', details.id);

  return li;
}

function applyFilters() {
  for (var i = 0; i < itemListEl.children.length; i++) {
    var item = itemListEl.children[i];
    if (typeof item !== 'object') continue;

    var details = phoneDetails[item.getAttribute('itemid') -1];
    var show = true;
    for (var k in filters) {
      var values = filters[k];
      // check for any filters for this feature, and if this item passes
      show = show && (Object.keys(values).length <1 || (details[k] in values))
    }

    if (show) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  }
}

// modify filters when an input is changed
function filterListener(par) {
  var key = this.getAttribute('value') || this.nextSibling.textContent,
    feature = par.getAttribute('feature');

  if (this.checked) {
    filters[feature][key] = true;

  } else {
    delete filters[feature][key];
  }

  applyFilters();
}

function clearFilters() {
  var inputs = document.getElementsByTagName('input');
  for (var k in inputs) {
    var input = inputs[k];
    if (typeof input !== 'object') continue;

    input.checked = false;
    input.onchange();
  }

  applyFilters();
}

document.addEventListener('DOMContentLoaded', function() {
  ajax('products.json', function(dict) {
    phoneDetails = dict;

    // flatten the individual phone dicts
    for (var key in phoneDetails) {
      flatten(phoneDetails[key]);
    }

    // create all phone items initially
    for (var key in phoneDetails) {
      var itemEl = newItemElement(phoneDetails[key]);
      itemListEl.appendChild(itemEl);
    }

    // apply filters on load
    applyFilters();
  });

  itemListEl = document.querySelector('.products-list');

  // set onChange for all filter checkboxes
  var form = document.querySelector('form');
  for (var k in form.children) {
    var child = form.children[k];
    // only get filter-criteria
    if (typeof child !== 'object' || child.className != 'filter-criteria') continue;

    filters[child.getAttribute('feature')] = {};

    var inputs = child.getElementsByTagName('input');
    for (var k in inputs) {
      var input = inputs[k];
      // only get actual elements
      if (typeof input !== 'object') continue;

      // set listener, called with input as 'this', and its filter-criteria parent
      input.onchange = filterListener.bind(input, child);

      // apply listener to set filters
      filterListener.call(input, child);
    }
  }
});
