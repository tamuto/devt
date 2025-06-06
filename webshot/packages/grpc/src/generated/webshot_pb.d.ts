// package: webshot
// file: webshot.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class CaptureRequest extends jspb.Message { 
    getUrl(): string;
    setUrl(value: string): CaptureRequest;
    getOutputDir(): string;
    setOutputDir(value: string): CaptureRequest;
    getPrefix(): string;
    setPrefix(value: string): CaptureRequest;

    hasAuth(): boolean;
    clearAuth(): void;
    getAuth(): AuthenticationOptions | undefined;
    setAuth(value?: AuthenticationOptions): CaptureRequest;

    hasOptions(): boolean;
    clearOptions(): void;
    getOptions(): CaptureOptions | undefined;
    setOptions(value?: CaptureOptions): CaptureRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CaptureRequest.AsObject;
    static toObject(includeInstance: boolean, msg: CaptureRequest): CaptureRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CaptureRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CaptureRequest;
    static deserializeBinaryFromReader(message: CaptureRequest, reader: jspb.BinaryReader): CaptureRequest;
}

export namespace CaptureRequest {
    export type AsObject = {
        url: string,
        outputDir: string,
        prefix: string,
        auth?: AuthenticationOptions.AsObject,
        options?: CaptureOptions.AsObject,
    }
}

export class CaptureResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): CaptureResponse;
    getMessage(): string;
    setMessage(value: string): CaptureResponse;
    getScreenshotPath(): string;
    setScreenshotPath(value: string): CaptureResponse;
    getEvidencePath(): string;
    setEvidencePath(value: string): CaptureResponse;

    hasDiffResult(): boolean;
    clearDiffResult(): void;
    getDiffResult(): DiffResult | undefined;
    setDiffResult(value?: DiffResult): CaptureResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CaptureResponse.AsObject;
    static toObject(includeInstance: boolean, msg: CaptureResponse): CaptureResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CaptureResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CaptureResponse;
    static deserializeBinaryFromReader(message: CaptureResponse, reader: jspb.BinaryReader): CaptureResponse;
}

export namespace CaptureResponse {
    export type AsObject = {
        success: boolean,
        message: string,
        screenshotPath: string,
        evidencePath: string,
        diffResult?: DiffResult.AsObject,
    }
}

export class AuthenticationOptions extends jspb.Message { 
    getType(): AuthType;
    setType(value: AuthType): AuthenticationOptions;

    getCredentialsMap(): jspb.Map<string, string>;
    clearCredentialsMap(): void;
    clearCookiesList(): void;
    getCookiesList(): Array<Cookie>;
    setCookiesList(value: Array<Cookie>): AuthenticationOptions;
    addCookies(value?: Cookie, index?: number): Cookie;

    getHeadersMap(): jspb.Map<string, string>;
    clearHeadersMap(): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AuthenticationOptions.AsObject;
    static toObject(includeInstance: boolean, msg: AuthenticationOptions): AuthenticationOptions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AuthenticationOptions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AuthenticationOptions;
    static deserializeBinaryFromReader(message: AuthenticationOptions, reader: jspb.BinaryReader): AuthenticationOptions;
}

export namespace AuthenticationOptions {
    export type AsObject = {
        type: AuthType,

        credentialsMap: Array<[string, string]>,
        cookiesList: Array<Cookie.AsObject>,

        headersMap: Array<[string, string]>,
    }
}

export class Cookie extends jspb.Message { 
    getName(): string;
    setName(value: string): Cookie;
    getValue(): string;
    setValue(value: string): Cookie;
    getDomain(): string;
    setDomain(value: string): Cookie;
    getPath(): string;
    setPath(value: string): Cookie;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Cookie.AsObject;
    static toObject(includeInstance: boolean, msg: Cookie): Cookie.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Cookie, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Cookie;
    static deserializeBinaryFromReader(message: Cookie, reader: jspb.BinaryReader): Cookie;
}

export namespace Cookie {
    export type AsObject = {
        name: string,
        value: string,
        domain: string,
        path: string,
    }
}

export class CaptureOptions extends jspb.Message { 
    getViewportWidth(): number;
    setViewportWidth(value: number): CaptureOptions;
    getViewportHeight(): number;
    setViewportHeight(value: number): CaptureOptions;
    getFullPage(): boolean;
    setFullPage(value: boolean): CaptureOptions;
    getTimeout(): number;
    setTimeout(value: number): CaptureOptions;
    getDiffThreshold(): number;
    setDiffThreshold(value: number): CaptureOptions;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CaptureOptions.AsObject;
    static toObject(includeInstance: boolean, msg: CaptureOptions): CaptureOptions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CaptureOptions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CaptureOptions;
    static deserializeBinaryFromReader(message: CaptureOptions, reader: jspb.BinaryReader): CaptureOptions;
}

export namespace CaptureOptions {
    export type AsObject = {
        viewportWidth: number,
        viewportHeight: number,
        fullPage: boolean,
        timeout: number,
        diffThreshold: number,
    }
}

export class DiffResult extends jspb.Message { 
    getHasDiff(): boolean;
    setHasDiff(value: boolean): DiffResult;
    getDiffPixels(): number;
    setDiffPixels(value: number): DiffResult;
    getDiffPercentage(): number;
    setDiffPercentage(value: number): DiffResult;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): DiffResult.AsObject;
    static toObject(includeInstance: boolean, msg: DiffResult): DiffResult.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: DiffResult, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): DiffResult;
    static deserializeBinaryFromReader(message: DiffResult, reader: jspb.BinaryReader): DiffResult;
}

export namespace DiffResult {
    export type AsObject = {
        hasDiff: boolean,
        diffPixels: number,
        diffPercentage: number,
    }
}

export class InfoRequest extends jspb.Message { 
    getHashPrefix(): string;
    setHashPrefix(value: string): InfoRequest;
    getDirectory(): string;
    setDirectory(value: string): InfoRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InfoRequest.AsObject;
    static toObject(includeInstance: boolean, msg: InfoRequest): InfoRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InfoRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InfoRequest;
    static deserializeBinaryFromReader(message: InfoRequest, reader: jspb.BinaryReader): InfoRequest;
}

export namespace InfoRequest {
    export type AsObject = {
        hashPrefix: string,
        directory: string,
    }
}

export class InfoResponse extends jspb.Message { 
    clearScreenshotsList(): void;
    getScreenshotsList(): Array<ScreenshotInfo>;
    setScreenshotsList(value: Array<ScreenshotInfo>): InfoResponse;
    addScreenshots(value?: ScreenshotInfo, index?: number): ScreenshotInfo;
    getTotalCount(): number;
    setTotalCount(value: number): InfoResponse;
    getEvidenceCount(): number;
    setEvidenceCount(value: number): InfoResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InfoResponse.AsObject;
    static toObject(includeInstance: boolean, msg: InfoResponse): InfoResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InfoResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InfoResponse;
    static deserializeBinaryFromReader(message: InfoResponse, reader: jspb.BinaryReader): InfoResponse;
}

export namespace InfoResponse {
    export type AsObject = {
        screenshotsList: Array<ScreenshotInfo.AsObject>,
        totalCount: number,
        evidenceCount: number,
    }
}

export class ScreenshotInfo extends jspb.Message { 
    getFilename(): string;
    setFilename(value: string): ScreenshotInfo;
    getTimestamp(): string;
    setTimestamp(value: string): ScreenshotInfo;
    getUrl(): string;
    setUrl(value: string): ScreenshotInfo;
    getHasEvidence(): boolean;
    setHasEvidence(value: boolean): ScreenshotInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ScreenshotInfo.AsObject;
    static toObject(includeInstance: boolean, msg: ScreenshotInfo): ScreenshotInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ScreenshotInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ScreenshotInfo;
    static deserializeBinaryFromReader(message: ScreenshotInfo, reader: jspb.BinaryReader): ScreenshotInfo;
}

export namespace ScreenshotInfo {
    export type AsObject = {
        filename: string,
        timestamp: string,
        url: string,
        hasEvidence: boolean,
    }
}

export enum AuthType {
    NONE = 0,
    BASIC = 1,
    FORM = 2,
    COOKIE = 3,
    HEADER = 4,
}
