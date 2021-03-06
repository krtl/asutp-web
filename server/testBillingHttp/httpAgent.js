/**
 * Real keep-alive HTTP agent
 *
 *                  ------------=================----------------
 * UPDATE: There are more proper implementations for this problem, distributed as
 *         npm modules like this one: https://github.com/TBEDP/agentkeepalive
 *                  ------------=================----------------
 *
 * The http module's agent implementation only keeps the underlying TCP
 * connection alive, if there are pending requests towards that endpoint in the agent
 * queue. (Not bug, but "feature": https://github.com/joyent/node/issues/1958)
 *
 * You might be in a situation, where you send requests one-by-one, so closing
 * the connection every time simply does not make sense, since you know you will
 * send the next one in a matter of milliseconds.
 *
 * This module provides a modified Agent implementation that does exactly that.
 *
 * TODO: The implementation lacks connection closing: there is no timeout for terminating
 * the connections.
 *
 * http://atimb.me
 */

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const net = require('net');

const Agent = (options) => {
  const self = this;
  self.options = options || {};
  self.requests = {};
  self.sockets = {};
  self.unusedSockets = {};
  self.maxSockets = self.options.maxSockets || Agent.defaultMaxSockets;
  self.on('free', (socket, host, port) => {
    const name = `${host}:${port}`;
    if (self.requests[name] && self.requests[name].length) {
      self.requests[name].shift().onSocket(socket);
    } else {
      // If there are no pending requests just destroy the
      // socket and it will get removed from the pool. This
      // gets us out of timeout issues and allows us to
      // default to Connection:keep-alive.
      // socket.destroy();
      if (!self.unusedSockets[name]) {
        self.unusedSockets[name] = [];
      }
      self.unusedSockets[name].push(socket);
    }
  });
  self.createConnection = net.createConnection;
};
util.inherits(Agent, EventEmitter);

Agent.defaultMaxSockets = 5;

Agent.prototype.defaultPort = 80;
Agent.prototype.addRequest = (req, host) => {
  const locHost = host.host;
  const locPort = host.port;
//  const name = `${host}:${port}`;
  const name = `${locHost}:${locPort}`;
  if (this.unusedSockets[name] && this.unusedSockets[name].length) {
    req.onSocket(this.unusedSockets[name].shift());
    // if (!this.unusedSockets[name].length) {
    //    delete this.unusedSockets[name];
    // }
    return;
  }
  if (!this.sockets[name]) {
    this.sockets[name] = [];
  }
  if (this.sockets[name].length < this.maxSockets) {
    // If we are under maxSockets create a new one.
    // req.onSocket(this.createSocket(name, host, port));
    req.onSocket(this.createSocket(name, locHost, locPort));
  } else {
    // We are over limit so we'll add it to the queue.
    if (!this.requests[name]) {
      this.requests[name] = [];
    }
    this.requests[name].push(req);
  }
};
Agent.prototype.createSocket = (name, host, port) => {
  const self = this;
  const s = self.createConnection(port, host, self.options);
  if (!self.sockets[name]) {
    self.sockets[name] = [];
  }
  this.sockets[name].push(s);
  const onFree = () => {
    self.emit('free', s, host, port);
  };
  s.on('free', onFree);
  const onClose = () => {
    // This is the only place where sockets get removed from the Agent.
    // If you want to remove a socket from the pool, just close it.
    // All socket errors end in a close event anyway.
    self.removeSocket(s, name, host, port);
  };
  s.on('close', onClose);
  const onRemove = () => {
    // We need this function for cases like HTTP "upgrade"
    // (defined by WebSockets) where we need to remove a socket from the pool
    //  because it'll be locked up indefinitely
    self.removeSocket(s, name, host, port);
    s.removeListener('close', onClose);
    s.removeListener('free', onFree);
    s.removeListener('agentRemove', onRemove);
  };
  s.on('agentRemove', onRemove);
  return s;
};
Agent.prototype.removeSocket = (s, name, host, port) => {
  if (this.sockets[name]) {
    const index = this.sockets[name].indexOf(s);
    if (index !== -1) {
      this.sockets[name].splice(index, 1);
    }
  } else if (this.sockets[name] && this.sockets[name].length === 0) {
    // don't leak
    delete this.sockets[name];
    delete this.requests[name];
  }
  if (this.requests[name] && this.requests[name].length) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(name, host, port).emit('free');
  }
};

module.exports = Agent;
