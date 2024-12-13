import { existsSync } from 'fs';
import { resolve } from 'path';
import { path as rootPath } from 'app-root-path';

// export function getEnvPath(dest: string): string {
export function getEnvPath(): string {
    const env: string | undefined = process.env.NODE_ENV;
    const filename: string = env ? `.env.${env}` : '.env.development';

    // Construct the path to the .env files using the project root path
    const srcFolderPath = resolve(rootPath, 'src');
    const envFolderPath = resolve(srcFolderPath, 'common', 'envs');
    const filePath: string = resolve(envFolderPath, filename);

    if (!existsSync(filePath)) {
        throw new Error(`Environment file not found: ${filePath}`);
    }

    console.log(`Using env file: ${filePath}`);

    return filePath;
}
