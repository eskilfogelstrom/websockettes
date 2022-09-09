import { io } from 'socket.io-client';
import kickUrl from 'url:./samples/kick.wav';
import snareUrl from 'url:./samples/snare.wav';
import hatUrl from 'url:./samples/hat.wav';
import percUrl from 'url:./samples/perc.wav';


const buttonConnect = document.getElementById('buttonConnect');
buttonConnect.onclick = () => {
    const socket = connect();

    const buttonTrigger = document.createElement('button');
    buttonTrigger.innerText = 'Trigger';
    // buttonTrigger.onclick = e => {
    //     socket.emit('trigger');
    // };

    // buttonTrigger.ontouchstart = () => {
    //     socket.emit('trigger');
    // }


    let time = performance.now();
    const loop = () => {
        if (performance.now() - time >= 1000) {
            socket.emit('trigger');
            console.log('Emit:', performance.now());
            time = performance.now();
        }
        window.requestAnimationFrame(loop);
    };

    loop();



    // DeviceMotionEvent.requestPermission().then(() => {
    //     let block = false;
    //     let lastX, lastY, lastZ;
    //     let lastTriggerTime = performance.now();
    //     window.addEventListener('devicemotion', e => {

    //         const acc = e.acceleration;

    //         const deltaX = Math.abs(acc.x - lastX);
    //         const deltaY = Math.abs(acc.y - lastY);
    //         const deltaZ = Math.abs(acc.z - lastZ);

    //         if (deltaX + deltaY + deltaZ > 20) {
    //             if (performance.now() - lastTriggerTime > 30) {
    //                 if (!block) {
    //                     socket.emit('trigger');
    //                     lastTriggerTime = performance.now();
    //                     block = true;
    //                 }
    //             }
    //         }

    //         if (deltaX + deltaY + deltaZ < 5) {
    //             block = false;
    //         }

    //         lastX = acc.x;
    //         lastY = acc.y;
    //         lastZ = acc.z;



    //         // if (!block && e.rotationRate.alpha > 300) {
    //         //     socket.emit('trigger');

    //         //     block = true;

    //         //     setTimeout(() => {
    //         //         block = false;
    //         //     }, 20);
    //         // }
    //     });
    //     window.addEventListener('deviceorientation', e => {
            
    //         document.getElementById('debug').innerHTML = `
    //             Alpha: ${e.alpha}<br>
    //             Beta: ${e.beta}<br>
    //             Gamma: ${e.gamma}
    //         `;
            
    //         // if (!block && (e.beta < 50 && e.beta > 40)) {
    //         //     socket.emit('trigger');

    //         //     block = true;
    //         //     setTimeout(() => {
    //         //         block = false;
    //         //     }, 50);
    //         // }
    //     });
    // });

    buttonConnect.remove();
    document.body.appendChild(buttonTrigger);
}


const connect = () => {
    const socket = io('ws://localhost:3000');

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