/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import SocketIO, {Socket} from 'socket.io';
import socketioJwt from 'socketio-jwt';
import config from '../config';
import {SocketUpdate} from '../core/operations';
import {Queue} from '../core/types';
import {SocketController, SocketPusher, SocketWithToken} from '../core/socket';
import {Container, ObjectType} from "typedi";

export class SocketRouter implements SocketPusher {
  private readonly socketsMobilePool: Record<string, Socket> = {};
  private readonly socketsWebPool: Record<string, Socket> = {};
  private readonly _controllers: SocketController[];
  private readonly _updateQueue = new Queue<SocketUpdate>();
  private readonly _pendingQueue = new Queue<SocketUpdate>();

  constructor(controllerClasses: ObjectType<SocketController>[]) {
    const controllers = controllerClasses.map(cClass => Container.get(cClass));
    this._controllers = [...controllers];
    controllers.forEach((cnt) => cnt.setPusher(this));
    setTimeout(() => this.updateQueue(), 5000);
  }

  connect(io: SocketIO.Server) {
    const mobileNsp = io.of('/mobile');
    mobileNsp
      .on(
        'connection',
        socketioJwt.authorize({
          secret: config.jwt_secret,
          timeout: 15000, // 15 seconds to send the authentication message
          decodedPropertyName: 'tData',
        }),
      )
      .on('authenticated', (socket: SocketWithToken) =>
        this._onNewAuthSocket.bind(this)(socket, 'mobile'),
      );
    const webNsp = io.of('/web');
    webNsp
      .on(
        'connection',
        socketioJwt.authorize({
          secret: config.jwt_secret,
          timeout: 15000, // 15 seconds to send the authentication message
          decodedPropertyName: 'tData',
        }),
      )
      .on('authenticated', (socket: SocketWithToken) =>
        this._onNewAuthSocket.bind(this)(socket, 'web'),
      );
  }

  // Connect new socket to pool
  private _onNewAuthSocket(socket: SocketWithToken, type: string) {
    const userId = socket.tData.user_id;
    const socketsPool =
      type === 'mobile' ? this.socketsMobilePool : this.socketsWebPool;

    // Add new socket in socketsPool connection array
    socketsPool[userId] = socket;
    console.log(`[SOCKET.IO / ${type}] : user ${userId} connected`);

    // Middleware to show all incoming requests
    socket.use((packet, next) => {
      console.log(`[SOCKET.IO / ${type}] : INCOMING REQUEST ${packet[0]}`);
      next();
    });

    // Add delete listener
    socket.on('disconnect', () => {
      //this socket is authenticated, we are good to handle more events from it.
      console.log(`bye ${userId}`);
      delete socketsPool[userId];
    });

    socket.ok = (opHash: string) => {
      socket.emit('operations:update', {
        id: opHash,
        status: 'STATUS.SUCCESS',
      });
    };

    socket.failure = (opHash, error) => {
      socket.emit('operations:update', {
        id: opHash,
        status: 'STATUS.FAILURE',
        error,
      });
    };

    // Add listeners from all controllers
    for (const controller of this._controllers) {
      const listeners = controller.getListeners(socket, userId);

      const {namespace} = controller;
      Object.entries(listeners).map((l) => {
        const event = l[0];
        const handler = l[1];
        socket.on(
          namespace + ':' + event,
          this.loggerMiddleware(namespace, event, handler),
        );
      });
      console.log(`[SOCKET.IO] : ${namespace} | listeners connected`);
    }
  }

  private loggerMiddleware(
    namespace: string,
    event: string,
    fn: (...args: any[]) => Promise<void>,
  ): any {
    return async function (...args: any[]) {
      const start = Date.now();
      await fn(...args);
      const finish = Date.now();
      console.log(
        `[SOCKET.IO] : ${namespace} | ${event} | ${finish - start} ms`,
      );
    };
  }

  // private async update(): Promise<void> {
  //   for (const controller of this._controllers) {
  //     const updates = controller.update();
  //
  //     // Update mobile devices connected to socket
  //     const mobileUpdates = updates.filter(
  //       (elm) => this.socketsMobilePool[elm.userId] !== undefined,
  //     );
  //
  //     for (let elm of mobileUpdates) {
  //       console.log('[UPDATE:MOBILE]', elm.event);
  //       const socket = this.socketsMobilePool[elm.userId];
  //       const payload = await elm.handler();
  //       socket.emit(elm.event, payload);
  //     }
  //
  //     // Update web devices connecte to socket
  //     const webUpdates = updates.filter(
  //       (elm) => this.socketsWebPool[elm.userId] !== undefined,
  //     );
  //     for (let elm of webUpdates) {
  //       console.log('[UPDATE:WEB]', elm.event);
  //       const socket = this.socketsWebPool[elm.userId];
  //       const payload = await elm.handler();
  //       socket.emit(elm.event, payload);
  //     }
  //   }
  //
  //   setTimeout(() => this.update(), 500);
  // }

  public pushUpdateQueue(event: SocketUpdate) {
    // ToDo: Add hash skipping
    this._updateQueue.push(event);
  }

  public pushPendingQueue(event: SocketUpdate) {
    // ToDo: Add hash skipping
    this._pendingQueue.push(event);
  }

  private async updateQueue() {
    while (await this.updateQueueElm()) {}
    setTimeout(() => this.updateQueue(), 100);
  }

  private async updateQueueElm(): Promise<boolean> {
    let msg: SocketUpdate | undefined;
    msg = this._pendingQueue.pop();
    if (msg === undefined) msg = this._updateQueue.pop();
    if (msg === undefined) return false;
    const userId = msg.userId;
    const mobileClientSocket = this.socketsMobilePool[userId];
    const webClientSocket = this.socketsWebPool[userId];

    if (mobileClientSocket === undefined && webClientSocket === undefined) {
      return false;
    }

    const payload = await msg.handler();
    if (mobileClientSocket !== undefined) {
      console.log('[UPDATE:MOBILE]', msg.event);
      mobileClientSocket.emit(msg.event, payload);
    }

    if (webClientSocket !== undefined) {
      console.log('[UPDATE:WEB]');
      webClientSocket.emit(msg.event, payload);
    }

    return true;
  }
}
