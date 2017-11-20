 let ws;

 function connect(doOnReceived) {
   if (ws) {
     ws.onerror = ws.onopen = ws.onclose = null;
     ws.close();
   }

   ws = new WebSocket(`ws://${location.host}`);

   ws.onerror = (err) => {
     console.log(`WebSocket error: ${err}`);
   };
   ws.onopen = () => console.log('WebSocket connection established');
   ws.onclose = () => console.log('WebSocket connection closed');
   ws.onmessage = (e) => {
     console.log(`WebSocket received: ${e.data}`);
     doOnReceived(e.data);
   };
 }

 function disconnect() {
   if (ws) {
     ws.onerror = ws.onopen = ws.onclose = null;
     ws.close();
   }
 }

 function send(data) {
   if (ws) {
     ws.send(data);
   }
 }

 const MyWebSocket = { connect, disconnect, send };
 export default MyWebSocket;
