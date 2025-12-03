const jp = require('jsonpath');

const data = {
  products: [
    { name: 'Product 1', images: ['img1.jpg', 'img2.jpg', 'img3.jpg'] },
    { name: 'Product 2', images: ['img4.jpg', 'img5.jpg'] }
  ]
};

console.log('Query $.products[*].images:');
const result = jp.query(data, '$.products[*].images');
console.log('Result:', JSON.stringify(result, null, 2));
console.log('Result length:', result.length);
console.log('Result[0]:', result[0]);
console.log('Result[1]:', result[1]);
