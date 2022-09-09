import { io } from 'socket.io-client';
import kickUrl from 'url:./samples/kick.wav';
import snareUrl from 'url:./samples/snare.wav';



const buttonConnect = document.getElementById('buttonConnect');
buttonConnect.onclick = () => {
    const socket = connect();

    const buttonTrigger = document.createElement('button');
    buttonTrigger.innerText = 'Trigger';
    buttonTrigger.onclick = e => {
        socket.emit('trigger');
    };
    buttonConnect.remove();
    document.body.appendChild(buttonTrigger);
}


const connect = () => {
    const socket = io('ws://longing-island-leech.glitch.me/');

    socket.on('setInstrument', msg => {
        console.log(msg);
    })

    const context = new AudioContext();

    const instrumentUrls = {
        kick: kickUrl,
        snare: snareUrl
    };
    const instruments = Object.keys(instrumentUrls);


    const instrumentNodes = instruments.reduce((nodes, instrument) => {
        const url = instrumentUrls[instrument];
        const el = new Audio(url);
        const sourceNode = context.createMediaElementSource(el);
        sourceNode.connect(context.destination);

        return {
            ...nodes,
            [instrument]: el
        };
    }, {});


    socket.on('trigger', msg => {
        console.log('trigger', msg);
        const node = instrumentNodes[msg.instrument];
        node.currentTime = 0;
        node.play();
    });

    return socket;
}