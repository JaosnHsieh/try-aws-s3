/**
 * 2022.08.03 example to upload files from client side to s3 ( backblaze b2 ) via pre-signed url
 *  "aws-sdk": "^2.1187.0",
    "axios": "^0.27.2"
    requirements:
    1. create bucket first and set it to public ( set up backblaze b2 via https://gist.github.com/JaosnHsieh/a3dd22506729e2f140a6981099118662#file-upload-to-backblaze-b2-aws-sdk-s3-md )
    2. prepare a png file '1659498406019.png' for upload
    3. nodejs v16.14.0
    
 */

const AWS = require('aws-sdk');
const axios = require('axios');
const fs = require('fs');

(async function main() {
  var credentials = new AWS.SharedIniFileCredentials({ profile: 'b2' });
  AWS.config.credentials = credentials;
  var ep = new AWS.Endpoint('s3.us-west-002.backblazeb2.com');
  var s3 = new AWS.S3({ endpoint: ep, signatureVersion: 'v4' });

  const { Buckets } = await s3.listBuckets().promise();
  const myImagesBucket = Buckets[1];
  const myFileName = '1659498406019.png';

  const url = s3.getSignedUrl('putObject', {
    Bucket: myImagesBucket.Name,
    Key: myFileName,
    ContentType: 'application/octet-stream',
    //set to public,  https://secure.backblaze.com/b2_buckets.htm -> Bucket Settings -> Files in Bucket are: "Public"
    ACL: 'public-read',
    Expires: 600, // 10 minutes
  });

  axios({
    method: 'put',
    url,
    data: fs.readFileSync(myFileName),
    headers: {
      'Content-Type': 'application/octet-stream',
      //set to public,  https://secure.backblaze.com/b2_buckets.htm -> Bucket Settings -> Files in Bucket are: "Public"
      'x-amz-acl': 'public-read',
    },
  })
    .then((result) => {
      console.log('result', result.data);
    })
    .catch((err) => {
      console.log('err', err);
    });
  console.log(`url`, url);
})();

/**
 * references:
 * https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application/
 * https://stackoverflow.com/a/66469650/6414615
 * https://github.com/odysseyscience/react-s3-uploader/issues/106#issue-201680825
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingAWSSDK.html
 */
