var minesweeper;
document.oncontextmenu = (e) => {mouseClicked(); e.preventDefault()};
function setup() {
    var cnvWidth = 500;
    var cnvHeight = 600;
    var cnv = createCanvas(cnvWidth, cnvHeight);
    var offX = (windowWidth - cnvWidth)/2;
    var offY = (windowHeight - cnvHeight)/2;
    cnv.position(offX, offY);
    minesweeper = new Minesweeper(cnvWidth, cnvHeight);
}
function draw(){
    background(10);
    minesweeper.draw();
}
function mouseClicked(){
    minesweeper.click();
}
function preload(){
    digitalFont = loadFont('assets/digital-7.ttf');
}
class Minesweeper {
    
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.setup();
    }
    setup(){
        this.offX = 0;
        this.offY = this.height / 6;
        this.boardWidth = 10;
        this.boardHeight = 10;
        this.totalMines = 10;
        this.minesFlagged = 0;
        this.lost = false;
        this.won = false;
        this.gameStarted = false;
        this.board = new Array(this.boardHeight).fill(0).map(() => new Array(this.boardWidth).fill(0).map(cell => cell = {value: "", visible: false, flag: false}));
        this.cellWidth = Math.min(Math.floor(this.width/this.boardWidth), Math.floor(this.height/this.boardHeight));
        this.cellHeight = this.cellWidth;
    }
    click(){
        if(mouseX>225 && mouseX<275 && mouseY > 25 && mouseY<75){
            setup();
        }
        if(!this.lost && !this.won){
            let cellX = Math.floor((mouseX-this.offX)/this.cellWidth);
            let cellY = Math.floor((mouseY-this.offY)/this.cellHeight);
            if(cellX < this.boardWidth && cellX >= 0 && cellY < this.boardHeight && cellY >= 0){
                if(mouseButton == LEFT){
                    if(!this.gameStarted){
                        this.initBoard(cellX, cellY);
                        this.gameStarted = true;
                        this.startTime = new Date();
                    }
                    this.reveal(cellX,cellY);
                }
                else{
                    this.setFlag(cellX, cellY);
                }
            }
        }
    }
    setFlag(cellX, cellY){
        if(!this.board[cellX][cellY].visible){
            this.board[cellX][cellY].flag = !this.board[cellX][cellY].flag; 
            if(this.board[cellX][cellY].flag){
                this.minesFlagged++;
            }
            else{
                this.minesFlagged--;
            }
        }
    }
    reveal(cellX,cellY){
        console.log('checking cell['+cellX+']['+cellY+'] with value '+this.board[cellX][cellY].value+' and visibility: '+ this.board[cellX][cellY].visible);
        this.board[cellX][cellY].visible = true;
        if(this.board[cellX][cellY].value == 0){
            for(let offX = -1 ; offX <= 1; offX++){
                for(let offY = -1; offY <= 1; offY++){
                    if((offX+cellX>=0) && (offX+cellX<this.boardWidth)
                        && (offY+cellY>=0) && (offY+cellY < this.boardHeight)
                        && (offX!=0 || offY!=0)){
                            if(!this.board[offX + cellX][offY + cellY].visible){
                                this.reveal(offX + cellX, offY + cellY);
                            }
                        }
                }
            }
        }
        else if(this.board[cellX][cellY].value == '💩'){
            this.lost= true;
        }
        else{
            this.won = this.checkWon();
        }
    }
    checkWon(){
        for(let i = 0; i < this.boardWidth; i++){
            for(let j = 0; j < this.boardHeight; j++){
                if(this.board[i][j].value != '💩' && !this.board[i][j].visible){
                    return false;
                }
            }
        }
        return true;
    }
    initBoard(cellX, cellY) {
        this.setMines(cellX, cellY);
        this.setNearbyMinesCount();
    }
    setMines(cellX, cellY){
        for(let i = 0; i < this.totalMines; i++){
            let set = false;
            do{
                let mineX = Math.floor(Math.random() * this.boardWidth);
                let mineY = Math.floor(Math.random() * this.boardHeight);
                if(this.board[mineX][mineY].value!='💩' && (mineX!=cellX || mineY != cellY)){
                    this.board[mineX][mineY].value = '💩';
                    set = true;
                }
            } while (!set)
        }
    }
    setNearbyMinesCount(){
        let mines = 0;
        for(let i = 0; i<this.boardWidth; i++){
            for(let j = 0; j < this.boardHeight; j++){
                // if cell does not contain a mine
                let count = 0;
                if(this.board[i][j].value != '💩'){
                    // check surrounding cells for mines
                    for(let offX = -1 ; offX <= 1; offX++){
                        for(let offY = -1; offY <= 1; offY++){
                            if((offX+i>=0) && (offX+i<this.boardWidth)
                                && (offY+j>=0) && (offY+j < this.boardHeight)
                                && (offX!=0 || offY!=0)){
                                    if(this.board[offX + i][offY + j].value=='💩'){
                                        count++;
                                    }
                                }
                        }
                    }
                    this.board[i][j].value = count;
                }
                else{mines++}
            }
        }
        console.log(mines);
    }
    drawMenu(){
        // smile button draw
        fill(50);
        rect(225,25,50,50);
        fill(200);
        ellipse(250, 50, 30);
        fill(0);
        ellipse(245, 45, 5);
        ellipse(255, 45, 5);
        noFill();
        stroke(50)
        arc(250, 48, 20, 20, QUARTER_PI, HALF_PI + QUARTER_PI)
        stroke(0);
        //bomb count draw
        fill(50);
        rect(25, 25, 75, 50);
        fill(200);
        textFont(digitalFont);
        textSize(50);
        text(("00"+(this.totalMines - this.minesFlagged)).slice(-3), 25, 25, 100, 50);
        // timer draw
        fill(50);
        rect(this.width-100, 25, 75, 50);
        fill(200);
        textSize(50);
        let elapsedTime = 999;
        if(this.startTime){
            elapsedTime = Math.floor((new Date() - this.startTime)/1000);
        }
        text(("00" + elapsedTime).slice(-3), this.width-100, 25, 100, 50);
    }
    draw(){
        this.drawMenu();
        this.drawBoard();
    }
    drawBoard(){
        textSize(18);
        textAlign(CENTER, CENTER);
        for(let i = 0; i < this.boardWidth; i++){
            for(let j = 0; j < this.boardHeight; j++){
                if(this.board[i][j].visible){
                    fill(100);
                    rect(i*this.cellWidth + this.offX, j*this.cellHeight + this.offY, (i+1)*this.cellWidth + this.offX, (j+1)*this.cellHeight + this.offY)
                
                    if(this.board[i][j].value != 0){
                        fill(200)
                        text(this.board[i][j].value, i*this.cellWidth+this.cellWidth/2 + this.offX, j*this.cellHeight+this.cellHeight/2 + this.offY)
                    }
                }
                else if(this.board[i][j].flag){
                    fill(100);
                    rect(i*this.cellWidth + this.offX, j*this.cellHeight + this.offY, (i+1)*this.cellWidth + this.offX, (j+1)*this.cellHeight + this.offY)
                
                    fill(50,200,50);
                    triangle(i*this.cellWidth+this.cellWidth/2 + this.offX, j*this.cellHeight + this.cellHeight/5 + this.offY,
                             i*this.cellWidth+this.cellWidth/5 + this.offX, j*this.cellHeight + this.cellHeight/5*4 + this.offY,
                             i*this.cellWidth+this.cellWidth/5*4 + this.offX,j*this.cellHeight + this.cellHeight/5*4 + this.offY);
                }
                else{
                    fill(50);
                    rect(i*this.cellWidth + this.offX, j*this.cellHeight + this.offY, (i+1)*this.cellWidth + this.offX, (j+1)*this.cellHeight + this.offY)
                }
            }
        }
        if(this.lost)
            this.showLostMessage();
        else if(this.won){
            this.showWonMessage();
        }
    }
    showLostMessage(){
        fill(0);
        rect(50 + this.offX,180 + this.offY,400,140)
        fill(255,0,0);
        textSize(100);
        text("you lose", 250 + this.offX,250 + this.offY);
    }
    showWonMessage(){
        fill(255);
        rect(50 + this.offX,180 + this.offY,400,140)
        fill(50,200,50);
        textSize(100);
        text("you won", 250 + this.offX,250 + this.offY);
    }
}