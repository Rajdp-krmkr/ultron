import { getDb } from './mongodb';
import { UltronConfig } from '../store/useSecurityStore';

export interface UserDocument {
  _id?: string;
  email: string;
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  lastLoginAt: Date;
  settings?: Partial<UltronConfig>;
}

export async function upsertUserOnLogin(email: string, name?: string): Promise<UserDocument> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');
    
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    const now = new Date();
    const displayName = name || email.split('@')[0].toUpperCase();

    if (!existingUser) {
      const newUser: UserDocument = {
        email: email.toLowerCase(),
        name: displayName,
        role: 'SEC_OFFICER',
        status: 'Active',
        createdAt: now,
        lastLoginAt: now,
      };
      
      await usersCollection.insertOne(newUser);
      return newUser;
    } else {
      await usersCollection.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            lastLoginAt: now,
            name: existingUser.name || displayName
          } 
        }
      );
      
      return {
        ...existingUser,
        lastLoginAt: now
      };
    }
  } catch (err) {
    console.error('MongoDB upsertUserOnLogin error:', err);
    // Fallback if MongoDB is unreachable
    return {
      email: email.toLowerCase(),
      name: name || email.split('@')[0].toUpperCase(),
      role: 'SEC_OFFICER',
      status: 'Active',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
  }
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');
    return await usersCollection.findOne({ email: email.toLowerCase() });
  } catch (err) {
    console.error('MongoDB getUserByEmail error:', err);
    return null;
  }
}

export async function saveUserSettingsInDb(email: string, settings: Partial<UltronConfig>): Promise<boolean> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>('users');
    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      { $set: { settings, updatedAt: new Date() } },
      { upsert: true }
    );
    return result.acknowledged;
  } catch (err) {
    console.error('MongoDB saveUserSettingsInDb error:', err);
    return false;
  }
}
