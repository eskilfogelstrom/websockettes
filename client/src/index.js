import { io } from 'socket.io-client';
import kickUrl from 'url:./samples/kick.wav';
import snareUrl from 'url:./samples/snare.wav';

const socket = io('ws://longing-island-leech.glitch.me/');

socket.on('setInstrument', msg => {
    console.log(msg);
})

const buttonTrigger = document.getElementById('buttonTrigger');

buttonTrigger.onclick = e => {
    socket.emit('trigger');
}


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
    const node = instrumentNodes[msg.instrument];
    node.play();
});