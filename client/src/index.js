import { io } from 'socket.io-client';
import kickUrl from 'url:./samples/kick.wav';
import snareUrl from 'url:./samples/snare.wav';
import hatUrl from 'url:./samples/hat.wav';
import percUrl from 'url:./samples/perc.wav';

const buttonConnect = document.getElementById('buttonConnect');
buttonConnect.onclick = () => {
    const socket = connect();

    if (DeviceMotionEvent) {
        DeviceMotionEvent.requestPermission().then(() => {
            let block = false;
            let lastX, lastY, lastZ;
            let lastTriggerTime = performance.now();
            window.addEventListener('devicemotion', e => {

                const acc = e.acceleration;

                const deltaX = Math.abs(acc.x - lastX);
                const deltaY = Math.abs(acc.y - lastY);
                const deltaZ = Math.abs(acc.z - lastZ);

                if (deltaX + deltaY + deltaZ > 20) {
                    if (performance.now() - lastTriggerTime > 30) {
                        if (!block) {
                            socket.emit('trigger');
                            lastTriggerTime = performance.now();
                            block = true;
                        }
                    }
                }

                if (deltaX + deltaY + deltaZ < 5) {
                    block = false;
                }

                lastX = acc.x;
                lastY = acc.y;
                lastZ = acc.z;

            });
        });
    }

    buttonConnect.remove();
}


const connect = () => {
    const socket = io('ws://164.92.187.171');

    socket.on('setInstrument', msg => {
        console.log(msg);
    })

    const context = new AudioContext();

    const instrumentUrls = {
        kick: kickUrl,
        snare: snareUrl,
        hat: hatUrl,
        perc: percUrl
    };
    const instruments = Object.keys(instrumentUrls);


    const instrumentNodes = instruments.reduce((nodes, instrument) => {
        const url = instrumentUrls[instrument];
        const el = new Audio(url);
        el.volume = 1;
        const sourceNode = context.createMediaElementSource(el);
        sourceNode.connect(context.destination);

        return {
            ...nodes,
            [instrument]: el
        };
    }, {});


    socket.on('trigger', msg => {
        console.log('Trigger:', performance.now());
        const node = instrumentNodes[msg.instrument];
        node.currentTime = 0;
        node.play();
    });

    return socket;
}