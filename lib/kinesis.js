const AWS = require('aws-sdk')
const crypto = require('crypto')
const kinesis = new AWS.Kinesis({region: process.env.AWS_REGION || 'us-east-1'})

/**
 * Write a pixel tracker record to kinesis
 */
exports.put = async function(json) {
  const Data = JSON.stringify(json)
  const PartitionKey = crypto.createHash('md5').update(Data).digest('hex')

  // convert full arns to stream name
  let StreamName = process.env.KINESIS_STREAM || ''
  if (StreamName.indexOf('/') > -1) {
    StreamName = StreamName.split('/').pop()
  }

  await kinesis.putRecord({Data, PartitionKey, StreamName}).promise()
}
