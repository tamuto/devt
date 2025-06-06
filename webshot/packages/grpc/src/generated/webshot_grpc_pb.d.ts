// package: webshot
// file: webshot.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as webshot_pb from "./webshot_pb";

interface IWebshotServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    captureScreenshot: IWebshotServiceService_ICaptureScreenshot;
    captureScreenshotStream: IWebshotServiceService_ICaptureScreenshotStream;
    getCaptureInfo: IWebshotServiceService_IGetCaptureInfo;
}

interface IWebshotServiceService_ICaptureScreenshot extends grpc.MethodDefinition<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse> {
    path: "/webshot.WebshotService/CaptureScreenshot";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<webshot_pb.CaptureRequest>;
    requestDeserialize: grpc.deserialize<webshot_pb.CaptureRequest>;
    responseSerialize: grpc.serialize<webshot_pb.CaptureResponse>;
    responseDeserialize: grpc.deserialize<webshot_pb.CaptureResponse>;
}
interface IWebshotServiceService_ICaptureScreenshotStream extends grpc.MethodDefinition<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse> {
    path: "/webshot.WebshotService/CaptureScreenshotStream";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<webshot_pb.CaptureRequest>;
    requestDeserialize: grpc.deserialize<webshot_pb.CaptureRequest>;
    responseSerialize: grpc.serialize<webshot_pb.CaptureResponse>;
    responseDeserialize: grpc.deserialize<webshot_pb.CaptureResponse>;
}
interface IWebshotServiceService_IGetCaptureInfo extends grpc.MethodDefinition<webshot_pb.InfoRequest, webshot_pb.InfoResponse> {
    path: "/webshot.WebshotService/GetCaptureInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<webshot_pb.InfoRequest>;
    requestDeserialize: grpc.deserialize<webshot_pb.InfoRequest>;
    responseSerialize: grpc.serialize<webshot_pb.InfoResponse>;
    responseDeserialize: grpc.deserialize<webshot_pb.InfoResponse>;
}

export const WebshotServiceService: IWebshotServiceService;

export interface IWebshotServiceServer extends grpc.UntypedServiceImplementation {
    captureScreenshot: grpc.handleUnaryCall<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    captureScreenshotStream: grpc.handleBidiStreamingCall<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    getCaptureInfo: grpc.handleUnaryCall<webshot_pb.InfoRequest, webshot_pb.InfoResponse>;
}

export interface IWebshotServiceClient {
    captureScreenshot(request: webshot_pb.CaptureRequest, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    captureScreenshot(request: webshot_pb.CaptureRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    captureScreenshot(request: webshot_pb.CaptureRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    captureScreenshotStream(): grpc.ClientDuplexStream<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    captureScreenshotStream(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    captureScreenshotStream(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    getCaptureInfo(request: webshot_pb.InfoRequest, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
    getCaptureInfo(request: webshot_pb.InfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
    getCaptureInfo(request: webshot_pb.InfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
}

export class WebshotServiceClient extends grpc.Client implements IWebshotServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public captureScreenshot(request: webshot_pb.CaptureRequest, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    public captureScreenshot(request: webshot_pb.CaptureRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    public captureScreenshot(request: webshot_pb.CaptureRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: webshot_pb.CaptureResponse) => void): grpc.ClientUnaryCall;
    public captureScreenshotStream(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    public captureScreenshotStream(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<webshot_pb.CaptureRequest, webshot_pb.CaptureResponse>;
    public getCaptureInfo(request: webshot_pb.InfoRequest, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
    public getCaptureInfo(request: webshot_pb.InfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
    public getCaptureInfo(request: webshot_pb.InfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: webshot_pb.InfoResponse) => void): grpc.ClientUnaryCall;
}
