'use server';
import { getStorage, ref, getBytes, deleteObject } from 'firebase-admin/storage';
import { getFirebaseAdminApp } from './admin-config';

getFirebaseAdminApp();
const bucket = getStorage().bucket();

// This function is designed to run on the server.
export async function getFileContents(filePath: string): Promise<string> {
    try {
        const file = bucket.file(filePath);
        const contents = await file.download();
        const buffer = contents[0];
        const mimeType = (await file.getMetadata())[0].contentType || 'application/octet-stream';
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error(`Failed to get file contents for ${filePath}:`, error);
        throw new Error(`Could not retrieve file from storage: ${filePath}.`);
    }
}

// This function is designed to run on the server.
export async function deleteFile(filePath: string): Promise<void> {
    try {
        const file = bucket.file(filePath);
        await file.delete();
        console.log(`Successfully deleted ${filePath}`);
    } catch (error: any) {
        if (error.code === 404) {
            console.warn(`File not found during deletion, skipping: ${filePath}`);
            return;
        }
        console.error(`Failed to delete file ${filePath}:`, error);
        throw new Error(`Could not delete file from storage: ${filePath}.`);
    }
}
