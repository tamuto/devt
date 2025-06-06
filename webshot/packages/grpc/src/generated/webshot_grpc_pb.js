// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var webshot_pb = require('./webshot_pb.js');

function serialize_webshot_CaptureRequest(arg) {
  if (!(arg instanceof webshot_pb.CaptureRequest)) {
    throw new Error('Expected argument of type webshot.CaptureRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_webshot_CaptureRequest(buffer_arg) {
  return webshot_pb.CaptureRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_webshot_CaptureResponse(arg) {
  if (!(arg instanceof webshot_pb.CaptureResponse)) {
    throw new Error('Expected argument of type webshot.CaptureResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_webshot_CaptureResponse(buffer_arg) {
  return webshot_pb.CaptureResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_webshot_InfoRequest(arg) {
  if (!(arg instanceof webshot_pb.InfoRequest)) {
    throw new Error('Expected argument of type webshot.InfoRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_webshot_InfoRequest(buffer_arg) {
  return webshot_pb.InfoRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_webshot_InfoResponse(arg) {
  if (!(arg instanceof webshot_pb.InfoResponse)) {
    throw new Error('Expected argument of type webshot.InfoResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_webshot_InfoResponse(buffer_arg) {
  return webshot_pb.InfoResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var WebshotServiceService = exports.WebshotServiceService = {
  captureScreenshot: {
    path: '/webshot.WebshotService/CaptureScreenshot',
    requestStream: false,
    responseStream: false,
    requestType: webshot_pb.CaptureRequest,
    responseType: webshot_pb.CaptureResponse,
    requestSerialize: serialize_webshot_CaptureRequest,
    requestDeserialize: deserialize_webshot_CaptureRequest,
    responseSerialize: serialize_webshot_CaptureResponse,
    responseDeserialize: deserialize_webshot_CaptureResponse,
  },
  captureScreenshotStream: {
    path: '/webshot.WebshotService/CaptureScreenshotStream',
    requestStream: true,
    responseStream: true,
    requestType: webshot_pb.CaptureRequest,
    responseType: webshot_pb.CaptureResponse,
    requestSerialize: serialize_webshot_CaptureRequest,
    requestDeserialize: deserialize_webshot_CaptureRequest,
    responseSerialize: serialize_webshot_CaptureResponse,
    responseDeserialize: deserialize_webshot_CaptureResponse,
  },
  getCaptureInfo: {
    path: '/webshot.WebshotService/GetCaptureInfo',
    requestStream: false,
    responseStream: false,
    requestType: webshot_pb.InfoRequest,
    responseType: webshot_pb.InfoResponse,
    requestSerialize: serialize_webshot_InfoRequest,
    requestDeserialize: deserialize_webshot_InfoRequest,
    responseSerialize: serialize_webshot_InfoResponse,
    responseDeserialize: deserialize_webshot_InfoResponse,
  },
};

exports.WebshotServiceClient = grpc.makeGenericClientConstructor(WebshotServiceService, 'WebshotService');
