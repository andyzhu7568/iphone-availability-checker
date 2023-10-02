const request = require("request");
const notifier = require("node-notifier");
const flatMap = require('array.prototype.flatmap');
const replaceAll = require("string.prototype.replaceall");

flatMap.shim();
replaceAll.shim();

const { COUNTRIES } = require("./constants");
const args = process.argv.slice(2);

let skusForCountry = (countrySkuCode) => {
  return {
    [`MU6R3VC/A`]: `iPhone Pro Max 256gb Natuaral Grey`,
    [`MU6T3VC/A`]: 'iPhone Pro Max 256gb Blue',
    [`MU6Q3VC/A`]: 'iPhone Pro Max 256gb White',
    [`MU6P3VC/A`]: 'iPhone Pro Max 256gb Black',
    [`MU6W3VC/A`]: 'iPhone Pro Max 512gb Natuaral Grey',
    [`MU6V3VC/A`]: 'iPhone Pro Max 512gb White',
    //[`MTMN3VC/A`]: 'Testingggg',
  }
}

let favouritesForCountry = (countrySkuCode) => {
  return [
    `MU6R3VC/A`,
    `MU6T3VC/A`,
    `MU6Q3VC/A`,
    `MU6P3VC/A`,
  ]
}

const control = "MU6R3VC/A";
let storeNumber = "R301";
let state = "AB";
let country = "CA"

if (args.length > 0) {
  const passedStore = args[0];
  country = (args[1] ? args[1] : "CA").toUpperCase();
  if (passedStore.charAt(0) === "R") {
    // All retail store numbers start with R
    storeNumber = passedStore;
    state = null;
  }
}

const countryConfig = COUNTRIES[country];

let storePath = countryConfig["storePath"];
let skuList = skusForCountry(countryConfig["skuCode"]);
let favorites = favouritesForCountry(countryConfig["skuCode"]);

const query =
  Object.keys(skuList)
    .map((k, i) => `parts.${i}=${encodeURIComponent(k)}`)
    .join("&") + `&searchNearby=true&store=${storeNumber}`;

let options = {
  method: "GET",
  url: `https://www.apple.com${storePath}/shop/fulfillment-messages?` + query,
};

request(options, function (error, response) {
  if (error) throw new Error(error);

  const body = JSON.parse(response.body);
  const storesArray = body.body.content.pickupMessage.stores;
  let skuCounter = {};
  let hasStoreSearchError = false;

  console.log('Inventory');
  console.log('---------');
  const statusArray = storesArray
    .flatMap((store) => {
      if (state && state !== store.state) return null;

      const name = store.storeName;
      let productStatus = [];

      for (const [key, value] of Object.entries(skuList)) {
        const product = store.partsAvailability[key];

        hasStoreSearchError = product.storeSearchEnabled !== true;

        if (key === control && hasStoreSearchError !== true) {
          hasStoreSearchError = product.pickupDisplay !== "available";
        } else {
          productStatus.push(`${value}: ${product.pickupDisplay}`);

          if (product.pickupDisplay === "available") {
            console.log(`${value} in stock at ${store.storeName}`);
            let count = skuCounter[key] ? skuCounter[key] : 0;
            count += 1;
            skuCounter[key] = count;
          }
        }
      }

      return {
        name: name,
        products: productStatus,
      };
    })
    .filter((n) => n);

  let hasError = hasStoreSearchError;

  const inventory = Object.entries(skuCounter)
    .map(([key, value]) => `${skuList[key]}: ${value}`)
    .join(" | ");

  console.log('\nInventory counts');
  console.log('----------------');
  console.log(inventory.replaceAll(" | ", "\n"));
  let hasUltimate = Object.keys(skuCounter).some(
    (r) => favorites.indexOf(r) >= 0
  );
  let notificationMessage;

  if (inventory) {
    notificationMessage = `${hasUltimate ? "FOUND iPhone 15! " : ""
      }Some models found: ${inventory}`;
  } else {
    notificationMessage = "No models found.";
    console.log(statusArray);
    console.log(notificationMessage);
  }

  const message = notificationMessage;

  if (message != "No models found.") {
  notifier.notify({
    title: "iPhone 15 Pro Max Availability",
    message: message,
    sound:  inventory,
    timeout: false,
  })};

  // Log time at end
  console.log(`\nGenerated: ${new Date().toLocaleString()}`);
});
