export interface User { id: string; email: string; emailVerified: boolean; createdAt: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; user: User; }
export interface Server { id: string; name: string; token: string; online: boolean; lastSeenAt: string | null; createdAt: string; }
export interface ServerListItem { id: string; name: string; online: boolean; lastSeenAt: string | null; }
export interface FileInfo { path: string; name: string; isDirectory: boolean; size: number; }
export interface FileListResponse { files: FileInfo[]; total: number; offset: number; hasMore: boolean; }
export interface FileContent { path: string; content: string; lastModified: string; }
export interface Version { id: string; message: string | null; createdBy: string | null; createdAt: string; }
export interface VersionDetail extends Version { content: string; }
export interface SearchMatch { line: number; content: string; }
export interface SearchResult { filePath: string; matches: SearchMatch[]; }
