# iphone-availability-checker
Checks Apple Store inventory for new iPhone models
This work is modified open the original poster 'worthbak':
https://github.com/worthbak/apple-store-inventory-checker

I added the script for automatically checking inventory every minute
This setup is easier to run than the original method, but it will not run in the background.

### Installation 
1.install node.js:
https://nodejs.org/en
2.Download all files into a folder, open terminal on that folder, run `npm install` to load the project's dependencies. 

### Running the script
First, find the store number of your local Apple Store using [the included table](./apple-store-numbers.md) ([see here for Canadian stores](./apple-store-numbers-canada.md)). Then run the script, passing the number as an argument:

```sh
$ node index.js R301
```

This will query Apple's retail inventory for all 2023 iPhone 15 Pro Max 256gb variants that are known to be stocked in-store. `R301` is a store in Calgary, AB, so that store plus others in the surrouding area will be queried. The results are logged to `stdout`, and if any models are found, a notification will be sent. 

### For other countries

Running the script without a 2nd argument will default to CA stores. Adding a second argument specifies the country.
```sh
$ node index.js R123 US
```

#### Currently Supported Countries
| Countries         | Argument     |
| ----------------- | ------------ |
| United States     | US           |
| Canada            | CA (default) |
| Australia         | AU           |
| Germany           | DE           |
| United Kingdom    | UK           |
| South Korea*      | KR           |
| Hong Kong         | HK           |



### Automatically running script every minute

```sh
$ node scheduler.js
```

### Customization 
This script checks for most known iPhone 15 Pro Max 256gb variants that are currently stocked by Apple Stores near Calgary.
You may want to tweak the code if you're not interested in the other models.

### Apple Store Query URL Pattern
For reference, here's how Apple's fulfillment API works.

```
GET https://www.apple.com/shop/fulfillment-messages
  ?parts.0=MMQX3LL%2FA  // URL encoded part number MMQX3LL/A
  &parts.1=MKH53LL%2FA  // URL encoded part number MKH53LL/A
  &parts.2=MYD92LL%2FA  // URL encoded part number MYD92LL/A
  ...
  &searchNearby=true    // Instruct the API to search the designated store and the surrounding area
  &store=R172           // Store number (R172 is in Boulder, CO)
```
