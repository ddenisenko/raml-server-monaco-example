/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare let RAML : any

/**
 * Interface describing JSON, file system can be exported as
 */
export interface FileJSON {

    /**
     * File or folder name.
     */
    text: string,

    /**
     * Children, in case of a folder.
     */
    nodes?:FileJSON[],

    /**
     * Node full path.
     */
    fullPath: string,

    //TODO move out to the pure UI part
    icon: string
}

export interface FileSystem {
    /**
     * Creates new file at the path.
     * @param parentFolderPath - parent folder path, null for root
     * @param fileName - new file name
     * @param contents - optional file contents
     */
    newFile(parentFolderPath: string, fileName: string, contents?:string) : void;

    /**
     * Creates new folder at the path.
     * @param parentFolderPath - parent folder path, null for root
     * @param folderName - new folder name
     */
    newFolder(parentFolderPath: string, folderName: string) : void;

    /**
     * File contents by full path, asynchronously.
     * @param fullPath
     */
    contentAsync(fullPath:string):Promise<string>;

    /**
     * File contents by full path, synchronously.
     * @param fullPath
     */
    content(fullPath:string):string;

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectoryAsync(path: string): Promise<boolean>;

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectory(path: string): boolean;

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

    /**
     * Exports the whole file system as JSON. Root element has empty text.
     */
    toJSON() : FileJSON;

    /**
     * Sets file contents.
     * @param path
     * @param contents
     * @returns {Promise<any>}
     */
    setFileContents(path: string, contents: string) : void;
}

class FileEntry {

    /**
     * Folder or File name, including extension
     */
    name: string

    /**
     * File contents, null for folders
     */
    contents: string

    /**
     * Whether this entry is folder
     */
    isFolder: boolean

    /**
     * Folder children, empty for files.
     */
    children: FileEntry[] = []

    parent: FileEntry

    constructor(name: string, parent: FileEntry, isFolder: boolean) {
        this.name = name;

        this.parent = parent;
        if (this.parent) {
            this.parent.children.push(this)
        }

        this.isFolder = isFolder
    }

    /**
     * Whether this entry is FS root.
     */
    isRoot() : boolean {
        return this.parent == null;
    }

    getFullPath() {
        let segmentEntries : FileEntry[] = []
        let current : FileEntry = this;
        while (current) {
            segmentEntries.unshift(current);
            current = current.parent;
        }

        return segmentEntries.map(segment=>segment.name).join("/");
    }

    childByName(name : string) : FileEntry {
        if (!this.isFolder) return null;

        for (let child of this.children) {
            if (child.name == name) return child;
        }

        return null;
    }

    toJSON() : FileJSON {
        let result : FileJSON = {
            text: this.name,
            fullPath: this.getFullPath(),
            icon: this.isFolder?"glyphicon glyphicon-folder-open":"glyphicon glyphicon-file"
        }

        if (this.children && this.children.length > 0) {
            result.nodes = this.children.map(child=>child.toJSON())
        }

        return result;
    }
}

class VirtualFileSystem implements FileSystem {

    private root : FileEntry;

    constructor() {
        this.root = new FileEntry(null, null, true);
    }

    /**
     * File contents by full path, asynchronously.
     * @param fullPath
     */
    contentAsync(fullPath:string):Promise<string> {
        let entry = this.entryByFullPath(fullPath);

        if (!entry) return Promise.reject(new Error(fullPath + " does not exist"))

        if (entry.isFolder) return Promise.reject(new Error(fullPath + " is not a file"))

        if (entry.contents === null) return Promise.reject(new Error(fullPath + " file has no contents"))

        return Promise.resolve(entry.contents)
    }

    /**
     * File contents by full path, asynchronously.
     * @param fullPath
     */
    content(fullPath:string):string {
        let entry = this.entryByFullPath(fullPath);

        if (!entry) throw new Error(fullPath + " does not exist")

        if (entry.isFolder) throw new Error(fullPath + " is not a file")

        if (entry.contents === null) throw new Error(fullPath + " file has no contents")

        return entry.contents
    }

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectoryAsync(path: string): Promise<boolean> {
        let entry = this.entryByFullPath(path);

        if (!entry) return Promise.reject(new Error(path + " does not exist"))

        return Promise.resolve(entry.isFolder)
    }

    /**
     * Check whether the path points to a directory.
     * @param fullPath
     */
    isDirectory(path: string): boolean {
        if (path == null || path=="/") return true;

        let entry = this.entryByFullPath(path);

        if (!entry) throw new Error(path + " does not exist")

        return entry.isFolder
    }

    /**
     * Checks item existance.
     * @param fullPath
     */
    existsAsync(path: string): Promise<boolean> {
        let entry = this.entryByFullPath(path);

        return Promise.resolve(entry?true:false)
    }

    /**
     * Lists directory contents.
     * @param fullPath
     */
    listAsync(path: string): Promise<string[]> {
        let entry = this.entryByFullPath(path);

        if (!entry) return Promise.reject(new Error(path + " does not exist"))

        if (!entry.isFolder) return Promise.reject(new Error(path + " is a file"))

        return Promise.resolve(entry.children.map(child=>child.name))
    }

    /**
     * Creates new file at the path.
     * @param parentFolderPath - parent folder path, null for root
     * @param fileName - new file name
     * @param contents - optional file contents
     */
    newFile(parentFolderPath: string, fileName: string, contents?:string) : void {

        let parent = (!parentFolderPath || parentFolderPath=="/")?
            this.root:this.entryByFullPath(parentFolderPath);

        if (!parent) throw new Error(parentFolderPath + " does not exist");
        if (!parent.isFolder) throw new Error(parentFolderPath + " is file");

        if (parent.childByName(fileName)) throw new Error("File" + fileName
            + " already exists in " + parentFolderPath);

        let result: FileEntry = new FileEntry(fileName, parent, false);
        result.contents = contents;
    }

    /**
     * Creates new folder at the path.
     * @param parentFolderPath - parent folder path, null for root
     * @param folderName - new folder name
     */
    newFolder(parentFolderPath: string, folderName: string) : void {

        let parent = (!parentFolderPath || parentFolderPath=="/")?
            this.root:this.entryByFullPath(parentFolderPath);

        if (!parent) throw new Error(parentFolderPath + " does not exist");
        if (!parent.isFolder) throw new Error(parentFolderPath + " is file");

        if (parent.childByName(folderName)) throw new Error("File" + folderName
            + " already exists in " + parentFolderPath);

        let result: FileEntry = new FileEntry(folderName, parent, true);
    }

    /**
     * Sets file contents.
     * @param path
     * @param contents
     * @returns {Promise<any>}
     */
    setFileContents(path: string, contents: string) : void {
        let entry = this.entryByFullPath(path);

        if (!entry) throw new Error(path + " does not exist")

        if (entry.isFolder) throw new Error(path + " is not a file")

        entry.contents = contents;
    }

    /**
     * Exports the whole file system as JSON. Root element has empty text.
     */
    toJSON() : FileJSON {
        return this.root.toJSON();
    }

    private entryByFullPath(path : string) : FileEntry {
        if (!path) return null;

        let segments: string[] = path.split("/");

        let currentEntry = this.root;

        for (let segment of segments) {
            if (!segment) continue;

            let child = currentEntry.childByName(segment);
            if (!child) return null;

            currentEntry = child;
        }

        return currentEntry;
    }
}

let fileSystem = new VirtualFileSystem();

export function getFileSystem() : FileSystem {
    return fileSystem;
}

export function init(monacoEngine : typeof monaco, languageIdentifier: string) {

    let fs = getFileSystem();

    RAML.Server.getConnection().onExists((path: string)=>{return fs.existsAsync(path)});

    RAML.Server.getConnection().onReadDir((path: string)=>{return fs.listAsync(path)});

    RAML.Server.getConnection().onIsDirectory((path: string)=>{return fs.isDirectoryAsync(path)});

    RAML.Server.getConnection().onContent((path: string)=>{return fs.contentAsync(path)});

    fs.newFile(null, "test.raml", [
        '#%RAML 1.0',
        'title: Test API'
    ].join('\n'));

    fs.newFile(null, "library2.raml", [
        '#%RAML 1.0 Library',
        '',
        '  types:',
        '    DaType:',
        '      type: object',
        '      properties:',
        '        testProp: string',
        ].join('\n'));
}