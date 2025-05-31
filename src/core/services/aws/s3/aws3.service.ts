import AWS = require('aws-sdk')
import { GenericAWS3Exception } from './exceptions'
import { AppLogger } from '../../../helpers/logger'
import { AppENV } from '../../../helpers/env'
import { injectable } from 'inversify'

/**
 * `AmazonS3Service` provides functionality for interacting with Amazon Simple Storage Service (Amazon S3),
 * a scalable object storage service designed to store and retrieve any amount of data from anywhere on the web.
 **/
@injectable()
export class AmazonS3Service {
  private client: AWS.S3
  constructor(){
    if (S3Client === null) {
      S3Client = AmazonS3Service.getClient()
    }
    this.client = S3Client
  }

  private static getClient(){
    return new AWS.S3({
      accessKeyId: AppENV.get('AWS_ACCESS_KEY'),
      secretAccessKey: AppENV.get('AWS_SECRET_KEY')
    })
  }

  /**
   * Generates an S3 object key based on the provided S3TextObjectData.
   * 
   * @param {S3TextObjectData} data - The data used to generate the object key.
   * @returns {string} The generated S3 object key.
   */
  static createS3ObjectKey(data: { collection?: string, id: string }): string {
    let dir = ''
    if ('collection' in data) {
      dir = `${data.collection}/`
    }
    return dir + data.id
  }

  /**
   * Uploads a text object to Amazon S3.
   * 
   * @param {S3TextObjectData} data - The data of the text object to upload.
   * @returns {Promise<boolean>} A Promise that resolves to true if the upload is successful, false otherwise.
   */
  putTextObject(data: S3TextObjectData):Promise<boolean>{
    return new Promise(async (resolve,reject)=>{
      const key = AmazonS3Service.createS3ObjectKey(data)
      let body: string = ''
      switch (data.type) {
        case 'application/json': 
          body = JSON.stringify(data.data)
          break;
        default: 
          body = data.data
        break;
      }
      this.client.putObject({
        Bucket: data.bucket,
        Key: key,
        Body: body,
        ContentType: data.type
      },(error, output)=>{
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to put object to s3',
            data: {
              type: data.type,
              bucket: data.bucket,
              id: data.id,
              collection: data.collection,
              error: error
            }
          }))
          return
        }
        resolve(true)
      })
    })
  }

  /**
   * Deletes a text object from Amazon S3.
   * 
   * @param {S3TextObjectData} data - The data of the text object to delete.
   * @returns {Promise<boolean>} A Promise that resolves to true if the deletion is successful, false otherwise.
   */
  deleteTextObject(data:S3TextObjectData):Promise<boolean> {
    return new Promise(async (resolve,reject)=>{
      const key = AmazonS3Service.createS3ObjectKey(data)
      this.client.deleteObject({
        Bucket: data.bucket,
        Key: key
      },(error)=>{
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to delete object from s3',
            data: {
              type: data.type,
              bucket: data.bucket,
              id: data.id,
              collection: data.collection,
              error: error
            }
          }))
          return
        }
        resolve(true)
      })
    },)
  }

  /**
   * Retrieves a text object from Amazon S3.
   * 
   * @param {S3TextObjectData} data - The data of the text object to retrieve.
   * @returns {Promise<string|null>} A Promise that resolves to the text content of the object if found, or null if the object is not found.
   */
  getTextObject(data:Omit<S3TextObjectData,'data'>):Promise<string|null> {
    return new Promise(async (resolve,reject)=>{
      const key = AmazonS3Service.createS3ObjectKey(data)
      this.client.getObject({
        Bucket: data.bucket,
        Key: key
      },(error,data)=>{
        if (error) {
          // console.log('AmazonS3Service Error '+error.message)
          // reject(new Error(`An error has been encountered when getting object from S3`))
          /** @TODO Find a way to distinguish between actual error and object does not exist */
          resolve(null)
          return
        }
        if (data.Body === undefined) {
          return resolve(null)
        }
        resolve(data.Body.toString())
      })
    },)
  }

  /**
   * Uploads a file to AmazonS3
   * @param {S3BufferObjectData} - A buffer object data
   * @returns 
   */
  uploadFileAsBuffer(data: S3BufferObjectData){
    return new Promise (async (resolve,reject)=>{
      const key = data.path 
      this.client.putObject({
        Bucket: data.bucket,
        Key: key,
        Body: data.data
      },(error, output)=>{
        if (error) {
          reject(new GenericAWS3Exception({
            message: 'failed to upload object to s3',
            data: {
              bucket: data.bucket,
              path: data.path,
              error: error
            }
          }))
          return
        }
        resolve(true)
      })
    })
  }
}

let S3Client: AWS.S3 | null = null

export type S3TextObjectData = {
  type: 'application/json',
  bucket: string,
  id: string,
  collection?:string,
  data: {[key:string]:any}
} | {
  type: 'text/plain',
  bucket: string,
  id: string,
  collection?: string,
  data: string
}

export type S3BufferObjectData = {
  bucket: string,
  path:string,
  data: Buffer 
}