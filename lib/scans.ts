import { getDb } from './mongodb';
import { Repository, Finding } from '../store/useSecurityStore';

export interface ScanRecord {
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
  scannedAt: Date;
  findings: Finding[];
}

export async function saveScanRecordToDb(scanData: Omit<ScanRecord, 'scannedAt'> & { scannedAt?: Date }): Promise<ScanRecord> {
  try {
    const db = await getDb();
    const scansCollection = db.collection<ScanRecord>('scans');
    const reposCollection = db.collection('repositories');

    const record: ScanRecord = {
      ...scanData,
      scannedAt: scanData.scannedAt || new Date()
    };

    // Upsert into scans collection
    await scansCollection.updateOne(
      { repoId: record.repoId },
      { $set: record },
      { upsert: true }
    );

    // Upsert repository summary into repositories collection
    await reposCollection.updateOne(
      { url: record.repoUrl },
      { 
        $set: {
          name: record.repoName,
          url: record.repoUrl,
          userEmail: record.userEmail,
          language: record.language,
          status: record.status,
          score: record.score,
          criticalCount: record.criticalCount,
          highCount: record.highCount,
          mediumCount: record.mediumCount,
          lowCount: record.lowCount,
          lastScanned: record.scannedAt,
          filesCount: record.filesCount,
          linesCount: record.linesCount
        }
      },
      { upsert: true }
    );

    return record;
  } catch (err) {
    console.error('MongoDB saveScanRecordToDb error:', err);
    return {
      ...scanData,
      scannedAt: scanData.scannedAt || new Date()
    };
  }
}

export async function getScansFromDb(userEmail?: string): Promise<ScanRecord[]> {
  try {
    const db = await getDb();
    const scansCollection = db.collection<ScanRecord>('scans');
    const query = userEmail ? { userEmail: userEmail.toLowerCase() } : {};
    return await scansCollection.find(query).sort({ scannedAt: -1 }).toArray();
  } catch (err) {
    console.error('MongoDB getScansFromDb error:', err);
    return [];
  }
}
