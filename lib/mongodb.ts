import dns from 'dns';
import { MongoClient } from 'mongodb';

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const DEFAULT_URI = 'mongodb://rajdeepkarmakarpc_db_user:B4t9lYJW2rh6zp6a@ac-hc6cuaj-shard-00-00.yi8ezbd.mongodb.net:27017,ac-hc6cuaj-shard-00-01.yi8ezbd.mongodb.net:27017,ac-hc6cuaj-shard-00-02.yi8ezbd.mongodb.net:27017/ultron?replicaSet=atlas-12gxnv-shard-0&ssl=true&authSource=admin&retryWrites=true';

const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_WITH_APP_NAME || DEFAULT_URI;

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(dbName = 'ultron') {
  const client = await clientPromise;
  return client.db(dbName);
}
