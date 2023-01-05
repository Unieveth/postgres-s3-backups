import { exec } from 'child_process'
const Minio = require('minio')

import { env } from './env'

const uploadToS3 = async ({ name, path }: { name: string; path: string }) => {
  console.log('Uploading backup to S3...')

  const bucket = env.BUCKET

  const client = new Minio.Client({
    endPoint: env.ENDPOINT,
    port: 9000,
    useSSL: false,
    accessKey: env.ACCESS_KEY,
    secretKey: env.SECRET_KEY,
  })

  await client.fPutObject(bucket, name, path)

  // await client.send(
  //   new PutObjectCommand({
  //     Bucket: bucket,
  //     Key: name,
  //     Body: createReadStream(path),
  //   })
  // )

  console.log('Backup uploaded to S3...')
}

const dumpToFile = async (path: string) => {
  console.log('Dumping DB to file...')

  await new Promise((resolve, reject) => {
    exec(
      `pg_dump ${env.BACKUP_DATABASE_URL} -F t | gzip > ${path}`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ error: JSON.stringify(error), stderr })
          return
        }

        resolve(undefined)
      }
    )
  })

  console.log('DB dumped to file...')
}

export const backup = async () => {
  console.log('Initiating DB backup...')

  const date = new Date()
  const fileName = env.NAME_PREFIX + '-' + date.toUTCString().replace(/[\s:,]/g, '-') + '.tar.gz'
  const filepath = `/tmp/${fileName}`

  await dumpToFile(filepath)
  await uploadToS3({ name: fileName, path: filepath })

  console.log('DB backup complete...')
}
