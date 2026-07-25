import { getDb } from './mongodb';
import { Finding } from '../store/useSecurityStore';

export interface RepositoryRecord {
  _id?: string;
  repoId: string;
  repoName: string;
  repoUrl: string;
  userEmail: string;
  mode: string;
  language: string;
  status: 'Clean' | 'Alert' | 'Scanning' | 'Queued' | 'Failed';
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  filesCount: number;
  linesCount: number;
  findings: Finding[];
  firstScannedAt: Date;
  lastScannedAt: Date;
  scanCount: number;
}

export type ScanRecordInput = Omit<RepositoryRecord, 'firstScannedAt' | 'lastScannedAt' | 'scanCount'>;

export async function saveScanRecordToDb(scanData: ScanRecordInput): Promise<RepositoryRecord> {
  try {
    const db = await getDb();
    const collection = db.collection<RepositoryRecord>('repositories');

    const cleanUrl = scanData.repoUrl.trim().toLowerCase();
    const userEmail = (scanData.userEmail || 'operator@ultron.io').trim().toLowerCase();

    // Check if repository already exists in the 'repositories' collection
    const existingRepo = await collection.findOne({ 
      $or: [
        { repoUrl: cleanUrl },
        { repoId: scanData.repoId }
      ]
    });

    const now = new Date();

    if (existingRepo) {
      // Update existing repository document with latest scan details and lastScannedAt timestamp
      const updatedRecord: Partial<RepositoryRecord> = {
        repoName: scanData.repoName || existingRepo.repoName,
        repoUrl: scanData.repoUrl || existingRepo.repoUrl,
        userEmail: userEmail,
        mode: scanData.mode || existingRepo.mode,
        language: scanData.language || existingRepo.language,
        status: scanData.status,
        score: scanData.score,
        criticalCount: scanData.criticalCount,
        highCount: scanData.highCount,
        mediumCount: scanData.mediumCount,
        lowCount: scanData.lowCount,
        filesCount: scanData.filesCount,
        linesCount: scanData.linesCount,
        findings: scanData.findings || [],
        lastScannedAt: now,
        scanCount: (existingRepo.scanCount || 1) + 1
      };

      await collection.updateOne(
        { _id: existingRepo._id },
        { $set: updatedRecord }
      );

      return {
        ...existingRepo,
        ...updatedRecord
      } as RepositoryRecord;
    } else {
      // Create new repository document with initial scan details
      const newRecord: RepositoryRecord = {
        repoId: scanData.repoId,
        repoName: scanData.repoName,
        repoUrl: scanData.repoUrl,
        userEmail: userEmail,
        mode: scanData.mode,
        language: scanData.language,
        status: scanData.status,
        score: scanData.score,
        criticalCount: scanData.criticalCount,
        highCount: scanData.highCount,
        mediumCount: scanData.mediumCount,
        lowCount: scanData.lowCount,
        filesCount: scanData.filesCount,
        linesCount: scanData.linesCount,
        findings: scanData.findings || [],
        firstScannedAt: now,
        lastScannedAt: now,
        scanCount: 1
      };

      const result = await collection.insertOne(newRecord as any);
      return { ...newRecord, _id: result.insertedId.toString() };
    }
  } catch (err) {
    console.error('MongoDB saveScanRecordToDb error:', err);
    const now = new Date();
    return {
      ...scanData,
      userEmail: scanData.userEmail || 'operator@ultron.io',
      firstScannedAt: now,
      lastScannedAt: now,
      scanCount: 1
    };
  }
}

export async function getScansFromDb(userEmail?: string): Promise<RepositoryRecord[]> {
  try {
    const db = await getDb();
    const collection = db.collection<RepositoryRecord>('repositories');
    const query = userEmail ? { userEmail: userEmail.toLowerCase() } : {};
    
    // Return all repositories sorted by lastScannedAt descending
    return await collection.find(query).sort({ lastScannedAt: -1 }).toArray();
  } catch (err) {
    console.error('MongoDB getScansFromDb error:', err);
    return [];
  }
}
