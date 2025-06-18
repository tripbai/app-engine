import AWS = require('aws-sdk')
import { GenericAWS3Exception } from './exceptions'
import { AppLogger } from '../../../helpers/logger'
import { AppENV } from '../../../helpers/env'
import { inject, injectable } from 'inversify'
import { AbstractAWSCredentials } from '../aws-credentials.interface'

/**
 * `AmazonS3Service` provides functionality for interacting with Amazon Simple Storage Service (Amazon S3),
 * a scalable object storage service designed to store and retrieve any amount of data from anywhere on the web.
 * It allows for uploading, retrieving, and deleting objects in S3 buckets.
 **/
@injectable()
export class AmazonS3Service {

  private static Client: AWS.S3 | null = null

  constructor(
    @inject(AbstractAWSCredentials) public readonly abstractAWSCredentials: AbstractAWSCredentials
  ){}

  /**
   * Returns an instance of AWS S3 Client. 
   * @NOTE We only return 1 instance of S3, regardless of 
   * the `accessKeyId` passed
   * @param accessKeyId 
   * @param secretAccessKey 
   * @returns 
   */
  getClient(): AWS.S3 {
    if (AmazonS3Service.Client !== null) 
      return AmazonS3Service.Client
    AmazonS3Service.Client = new AWS.S3({
      region: this.abstractAWSCredentials.getRegion(),
      accessKeyId: this.abstractAWSCredentials.getAccessKeyId(),
      secretAccessKey: this.abstractAWSCredentials.getSecretAccessKey()
    })
    return AmazonS3Service.Client
  }

  /**
   * Uploads a file to AmazonS3
   * @param key - the path of the object
   * @param data - the string to upload
   * @returns 
   */
  uploadObjectAsText(key: string, data: string): Promise<void>{
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.abstractAWSCredentials.getS3BucketName(),
        Key: key,
        Body: data
      }
      this.getClient().putObject(params, (error, output) => {
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to upload object to s3',
            data: {key: key}
          }))
          return
        }
        resolve()
      })
    })
  }

  /**
   * Removes an object from s3
   * @param key - the path of the object
   * @returns 
   */
  deleteObject(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.abstractAWSCredentials.getS3BucketName(),
        Key: key
      }
      this.getClient().deleteObject(params, (error, output) => {
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to delete object from s3',
            data: {key: key}
          }))
          return
        }
        resolve()
      })
    })
  }

  /**
   * Retrieves a text object from Amazon S3.
   * @param key - the path to the object
   * @returns 
   */
  getObject(key: string){
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.abstractAWSCredentials.getS3BucketName(),
        Key: key
      }
      this.getClient().getObject(params, (error, output) => {
        if (error) {
          /** @TODO Find a way to distinguish between actual error and object does not exist */
          resolve(null)
          return
        }
        if (output.Body === undefined) {
          return resolve(null)
        }
        resolve(output.Body)
      })
    })
  }

  /**
   * Uploads a file to AmazonS3
   * @param data - A buffer object data
   * @returns 
   */
  uploadObjectAsBuffer(key: string, data: Buffer): Promise<void>{
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.abstractAWSCredentials.getS3BucketName(),
        Key: key,
        Body: data
      }
      this.getClient().putObject(params, (error, output) => {
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to upload object to s3',
            data: {key: key}
          }))
          return
        }
        resolve()
      })
    })
  }
}