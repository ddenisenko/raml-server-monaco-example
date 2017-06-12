/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

export interface FileSystem {
    /**
     * Creates new file at the path.
     * @param path
     * @param contents
     */
    newFile(path: string, contents?:string) : void;

    /**
     * File contents by full path, asynchronously.
     * @param fullPath
     */
    contentAsync(fullPath:string):Promise<string>;

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectoryAsync(path: string): Promise<boolean>;

    /**
     * Checks item existance.
     * @param fullPath
     */
    existsAsync(path: string): Promise<boolean>;

    /**
     * Lists directory contents.
     * @param fullPath
     */
    listAsync(path: string): Promise<string[]>;
}

class VirtualFileSystem implements FileSystem {

    /**
     * File contents by full path, asynchronously.
     * @param fullPath
     */
    contentAsync(fullPath:string):Promise<string> {
        return Promise.resolve("")
    }

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectoryAsync(path: string): Promise<boolean> {
        return Promise.resolve(false)
    }

    /**
     * Checks item existance.
     * @param fullPath
     */
    existsAsync(path: string): Promise<boolean> {
        return Promise.resolve(false)
    }

    /**
     * Lists directory contents.
     * @param fullPath
     */
    listAsync(path: string): Promise<string[]> {
        return Promise.resolve([])
    }

    /**
     * Creates new file at the path.
     * @param path
     * @param contents
     */
    newFile(path: string, contents?:string) : void {

    }
}

export function getFileSystem() : FileSystem {
    return null;
}

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

}