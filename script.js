const board=document.querySelector('.board');
const startButton=document.querySelector('.btn-start');
const modal=document.querySelector('.modal');
const startGameModal=document.querySelector('.start-game');
const gameOverModal=document.querySelector('.game-over');
const restartButton=document.querySelector('.btn-restart');
const highScoreElement=document.querySelector('#high-score');
const scoreElement=document.querySelector('#score');
const timer=document.querySelector('#time');
const finalScoreElement = document.querySelector("#final-score");
const newHighScoreElement = document.querySelector("#new-high-score");
const blockHeight=50;
const blockWidth=50;
let highScore=localStorage.getItem("highScore")||0;
highScoreElement.innerText=highScore;
let score=0;
let time='00.00';
let points=10;
const rows=20;
const cols=20;
const blocks= [];
let intervalId= null;
let timerIntervalId=null;
let justReset = false;

let snake=[{
    x:Math.floor(rows/2), y:Math.floor(cols/2)+1
},{
    x:Math.floor(rows/2), y:Math.floor(cols/2)
},{
    x:Math.floor(rows/2), y:Math.floor(cols/2)-1
}];
/* snake store the coordinates of the blocks that come under it*/

let food=getSafeFood();

let direction="right";
let gameSpeed = 200; // default = Medium
const difficultyButtons = document.querySelectorAll('.btn-difficulty');
difficultyButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        difficultyButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        gameSpeed = Number(btn.dataset.speed);
        points=Number(btn.dataset.point);
    });
});

startButton.addEventListener("click",()=>{
    modal.style.display="none";
    intervalId= setInterval(()=>{
        render();
    }, gameSpeed);
    timerIntervalId=setInterval(()=>{
        let [min, sec]=time.split(".").map(Number);
        if(sec==59){
            min=min+1;
            sec=0;
        }
        else{
            sec=sec+1;
        }
        time=`${String(min).padStart(2, "0")}.${String(sec).padStart(2, "0")}`;
        timer.innerText=time;
    },1000);

});
restartButton.addEventListener("click", restartGame);

function restartGame(){
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    if(score>highScore) {
        highScore=score;
        localStorage.setItem("highScore", highScore.toString()); 
    }
    score=0;
    scoreElement.innerText=score;
    time=`00.00`;
    timer.innerText=time;
    highScoreElement.innerText=highScore;

    direction="right";
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    removeFill();
    modal.style.display="none";
    snake=[{
    x:Math.floor(rows/2), y:Math.floor(cols/2)-1
    },{
    x:Math.floor(rows/2), y:Math.floor(cols/2)
    },{
    x:Math.floor(rows/2), y:Math.floor(cols/2)+1
    }];
    food=getSafeFood();
    justReset = true;
    intervalId= setInterval(()=>{
        render();
    }, gameSpeed);
    timerIntervalId=setInterval(()=>{
        let [min, sec]=time.split(".").map(Number);
        if(sec==59){
            min=min+1;
            sec=0;
        }
        else{
            sec=sec+1;
        }
        time=`${String(min).padStart(2, "0")}.${String(sec).padStart(2, "0")}`;
        timer.innerText=time;
    },1000);

}

addEventListener("keydown", (event)=>{
    if(event.key=="ArrowUp" && direction !="down"){
        direction="up";
    }
    else if(event.key=="ArrowDown" && direction !="up"){
        direction="down";
    }
    else if(event.key=="ArrowRight" && direction !="left"){
        direction="right";
    }
    else if(event.key=="ArrowLeft" && direction !="right"){
        direction="left";
    }
});
addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
         // If modal is visible
        if (modal.style.display !== "none") {
            // Start screen visible
            if (startGameModal.style.display !== "none") {
                startButton.click();
            }
        // Game over screen visible
            else if (gameOverModal.style.display !== "none") {
            restartButton.click();
            }
        }
    }
});

for(let row=0; row<rows; row++){
    for(let col=0; col<cols; col++){
        const block=document.createElement('div');
        blocks[ `${row}-${col}` ]= block;
        block.classList.add("block");
        board.appendChild(block);
        
    }
}

/* render is used to fill those blocks with colour*/
function render(){
    if (!direction) return; 
    let head=null;

    blocks[`${food.x}-${food.y}`].classList.add("food");

    if(direction==="left"){
        head={x:snake[0].x, y:snake[0].y-1};
    }
    else if(direction==="right"){
        head={x:snake[0].x, y:snake[0].y+1};
    }
    else if(direction==="down"){
        head={x:snake[0].x+1, y:snake[0].y};
    }
    else if(direction==="up"){
        head={x:snake[0].x-1, y:snake[0].y};
    }
    else{
        head={x:snake[0].x, y:snake[0].y};
    }

    if(head.x<0||head.x>=rows||head.y<0||head.y>=cols){
        gameOver();
        return;
    }
    if (!justReset) {
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
    }
    //food consume logic
    if(head.x==food.x&&head.y==food.y){
        score=score+points;
        scoreElement.innerText=score;
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        snake.unshift(food);
        food=getSafeFood();
        blocks[`${food.x}-${food.y}`].classList.add("food");
        
    }

    removeFill();
    snake.unshift(head);        /* add at the top, remove from the last */
    snake.pop();
    justReset = false;

    snake.forEach((segment, index)=>{
        const block = blocks[`${segment.x}-${segment.y}`];
        block.classList.add('fill');
        if(index === 0){
            block.classList.add('snake-head', direction);
        }
    });
}


function removeFill(){
    snake.forEach(segment=>{
        const block = blocks[`${segment.x}-${segment.y}`];
        block.classList.remove('fill','snake-head','up','down','left','right');
    });
}

function gameOver(){
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    finalScoreElement.innerText = score;
    if(score > highScore){
        newHighScoreElement.style.display = "block";
    } else {
        newHighScoreElement.style.display = "none";
    }
    modal.style.display="flex";
    startGameModal.style.display="none";
    gameOverModal.style.display="flex";
}


function getSafeFood() {
    let newFood;
    do {
        newFood = {x: Math.floor(Math.random() * rows),y: Math.floor(Math.random() * cols)};
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
}

