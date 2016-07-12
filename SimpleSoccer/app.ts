/// <reference path="./src/SoccerPitch.ts" />

let soccerPitch = new SimpleSoccer.SoccerPitch(SimpleSoccer.WindowWidth, SimpleSoccer.WindowHeight);
/* canvas要素のノードオブジェクト */
let canvas: HTMLCanvasElement;

function animationLoop() {
    //render();
    soccerPitch.Update();
    /* 2Dコンテキスト */
    let ctx = canvas.getContext('2d');
    // Canvas全体をクリア
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    soccerPitch.Render(ctx);

    requestAnimationFrame(animationLoop);
}

window.onload = () => {
    var el = document.getElementById('content');

    canvas = <HTMLCanvasElement>document.getElementById('canvas');
    animationLoop();
}

