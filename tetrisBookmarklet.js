/* 
 * Tetris Bookmarklet
 * auther      : Atushi Yamazaki
 * website     : http://atushiyamazaki.blogspot.com/
 * Bookmarklet : javascript:(function(){var s=document.createElement('script');s.charset='UTF-8';s.src='http://tetrisbookmarklet.googlecode.com/svn/trunk/tetrisBookmarklet.js';document.body.appendChild(s)})(); 
/*--------------------------------------------------------------------------*/

/* 
 * keyCode
/*--------------------*/
KCODE = {
    H:72, // left
    J:74, // The left revolution
    K:75, // Down
    L:76, // right
    S:83, // start or stop
    SPACE:32, // Hard Drop
    INFO:73 // Show info
};

/* 
 * Color
/*--------------------*/
COLOR = {
    WHITE:'#FFFFFF',
    BLACK:'#000000',
    RED:'#FF0000',
    YELLOW:'#FFFF00',
    GAINSBORO:'#DCDCDC',
    DIMGRAY:'#696969'
};

/* 
 * Tetromino
/*--------------------*/
T = {
    d:[], // display 21 * 12
    w:[], // work Tetromino 4 * 4
    WDX:-4, // defalt work Tetromino x
    WDY:4, // defalt work Tetromino y
    WML:3, // x || y max length
    cx:-4, // current Tetromino x
    cy:4, // current Tetromino y
    C: { // color
        B:0, // blank
        D:1, // dynamic
        S:9  // static
    },
    XMAXL:21, // x (row) max length
    YMAXL:12 // y (col) max length
};

/* 
 * prototype
/*--------------------*/
Array.prototype.clone = function() {
    return Array.apply(null, this);
}

/* 
 * Format
/*--------------------*/
function iToS2Format(i) {
    if (i < 10) {
        return '0' + i.toString();
    } else {
        return i.toString(); 
    }
}

/* 
 * Time
/*--------------------*/
TIME = {
    time:new Time(),
    start:null,
    stop:null,
    hardness:1
}
function Time() {
    var year;
    var mon;
    var date;
    var hours;
    var minutes;
    var seconds;

    this.init = function() {
        var dd = new Date();
        this.year = dd.getYear();
        if (this.year < 2000) this.year += 1900;
        this.mon = dd.getMonth() + 1;
        this.date = dd.getDate();
        this.hours = dd.getHours();
        this.minutes = dd.getMinutes();
        this.seconds = dd.getSeconds();
    }

    this.yyyyMmDdhhmmdd = function() {
        this.init();
        return this.year.toString() + '/' + iToS2Format(this.mon) + '/' + iToS2Format(this.date) + ' ' + iToS2Format(this.hours) + ':' + iToS2Format(this.minutes) + ':' + iToS2Format(this.seconds);
    }

    this.stopWatch = function() {
        var now = (new Date()).getTime();
        if (RUN.STATUS.INIT != RUN.status) {
            if (TIME.stop != null) {
                TIME.start = TIME.start + (now - TIME.stop);
                TIME.stop = null;
            }
        }
        var t = now - TIME.start;
        var h = Math.floor(t / (60 * 60 * 1000));
        t = t - (h * 60 * 60 * 1000);
        var m = Math.floor(t / (60 * 1000));
        t = t - (m * 60 * 1000);
        var s = Math.floor(t / 1000); 
        return iToS2Format(h) +':'+ iToS2Format(m) +':'+ iToS2Format(s);
    }
}

/* 
 * Debug
/*--------------------*/
debug = {
    setLog: function() {
        var body = document.getElementsByTagName('body')[0];
        var div = document.createElement('div');
        div.id = 'log';
        div.align = 'center';
        div.appendChild(document.createTextNode(''));
        body.appendChild(div);
    },

    log: function(log) {
        var div = document.getElementById('log');
        div.textContent = log;
    }
};

/* 
 * Display
/*--------------------*/
DISPLAY = {
    obj:new Display(),
    delLine:0,
    bonus:0,
    score:0,
    level:0,
    INFO_ON:1,
    INFO_OFF:0,
    showHelp:0
}
function Display() {
    var PBOX = 0; // Parent Box
    var CBOX = 1; // Child Box

    // set Color Framework
    this.setCFramework = function(parentObj, childObj, color, height, width, padding, x, y, opacity) {
        var style = childObj.style;
        style.height = height + 'px';
        style.width = width + 'px';
        style.position = 'relative';
        style.left =  x + 'px';
        style.top = y + 'px';
        style.opacity = opacity / 100;
        style.MozOpacity = opacity / 100;
        style.KhtmlOpacity = opacity / 100;
        style.filter = 'alpha(opacity=' + opacity + ')';
        style.color = '#000';
        style.backgroundColor = color;
        style.padding = padding + 'px';
        parentObj.appendChild(childObj);
    }

    // set Color Box
    this.setCBox = function(id, colorType, td) {
        var div = document.createElement('div');
        div.id = id;
        var divC = document.createElement('div');
        divC.id = id + 'C';
        var divCC = document.createElement('div');
        divCC.id = id + 'CC';
        if (T.C.S == colorType) {
            this.setCBoxDetail(PBOX, td, div, COLOR.BLACK, 5, 5, 5, 0, 0, 70);
            this.setCBoxDetail(CBOX, div, divC, COLOR.GAINSBORO, 4.5, 4.5, 4.5, 1, 1, 100);
            this.setCBoxDetail(CBOX, divC, divCC, COLOR.DIMGRAY, 3.5, 3.5, 3.5, 1, 1, 80);
        } else if (T.C.D == colorType) {
            this.setCBoxDetail(PBOX, td, div, COLOR.BLACK, 5, 5, 5, 0, 0, 80);
            this.setCBoxDetail(CBOX, div, divC, COLOR.DIMGRAY, 4.5, 4.5, 4.5, 1, 1, 100);
            this.setCBoxDetail(CBOX, divC, divCC, COLOR.BLACK, 3.5, 3.5, 3.5, 1, 1, 90);
        } else {
            this.setCBoxDetail(PBOX, td, div, COLOR.WHITE, 5, 5, 5, 0, 0, 70);
            this.setCBoxDetail(CBOX, div, divC, COLOR.WHITE, 4.5, 4.5, 4.5, 1, 1, 100);
            this.setCBoxDetail(CBOX, divC, divCC, COLOR.WHITE, 3.5, 3.5, 3.5, 1, 1, 90);
        }
    }

    // change Color Box
    this.changeCBox = function(x, y,  colorType) {
        var div = document.getElementById(x + '-' + y);
        var divC = document.getElementById(x + '-' + y + 'C');
        var divCC = document.getElementById(x + '-' + y + 'CC');
        if (T.C.S == colorType) {
            div.style.backgroundColor = COLOR.BLACK;
            divC.style.backgroundColor = COLOR.GAINSBORO;
            divCC.style.backgroundColor = COLOR.DIMGRAY;
        } else if (T.C.D == colorType) {
            div.style.backgroundColor = COLOR.BLACK;
            divC.style.backgroundColor = COLOR.DIMGRAY;
            divCC.style.backgroundColor = COLOR.BLACK;
        } else {
            div.style.backgroundColor = COLOR.WHITE;
            divC.style.backgroundColor = COLOR.WHITE;
            divCC.style.backgroundColor = COLOR.WHITE;
        }
    }

    // set Color Box Detail
    this.setCBoxDetail = function(flg, parentObj, childObj, color, height, width, padding, x, y, opacity) {
        var style = childObj.style;
        style.height = height + 'px';
        style.width = width + 'px';
        if (flg == PBOX) {
            style.position = 'relative';
        } else {
            style.position = 'absolute';
        }
        style.left = x + 'px';
        style.top = y + 'px';
        style.opacity = opacity / 100;
        style.MozOpacity = opacity / 100;
        style.KhtmlOpacity = opacity / 100;
        style.filter = 'alpha(opacity=' + opacity + ')';
        style.color = '#000';
        style.backgroundColor = color;
        style.padding = padding + 'px';
        parentObj.appendChild(childObj);
    }

    // set Text Box
    this.setTBox = function(id, parentObj, color, text) {
        var divT = document.createElement('div');
        divT.id = id;
        divT.appendChild(document.createTextNode(text));
        divT.style.color = '#000';
        divT.style.padding = 'Spx';
        parentObj.appendChild(divT);
        parentObj.style.textAlign = 'left';
    }

    // set Message Box
    this.setMBox = function(id, text) {
        var parentObj = document.getElementById('parentTable');
        var div = document.createElement('div');
        div.id = id;
        //if ('stop' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.RED, 0, 200, 20, 80, -150, 0);
        if ('stop' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.RED, 0, 200, 20, 80, 10, 0);
        //if ('gameover' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.RED, 0, 200, 20, 100, -300, 0);
        if ('gameover' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.RED, 0, 200, 20, 100, 50, 0);
        //if ('website' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.YELLOW, 0, 300, 2, 60, -500, 0);
        if ('website' == id) this.setCBoxDetail(CBOX, parentObj, div, COLOR.YELLOW, 0, 300, 2, 60, 100, 0);
        this.setTBox(id, div, COLOR.WHITE, text);
    }

    // set Message Box : Opacity
    this.setMBoxOpacity = function(id, opacity) {
        var obj = document.getElementById(id);
        obj.style.opacity = opacity / 100;
        obj.style.MozOpacity = opacity / 100;
        obj.style.KhtmlOpacity = opacity / 100;
        obj.style.filter = 'alpha(opacity=' + opacity + ')';
    }

    // show Message Box
    this.showMBox = function(id) {
        this.setMBoxOpacity(id, 50);
    }

    // hide Message Box
    this.hideMBox = function(id) {
        this.setMBoxOpacity(id, 0);
    }

    // init
    this.init = function() {
        var body = document.getElementsByTagName('body')[0];
        var tableP = document.createElement('table');
        tableP.id= 'parentTable';
        tableP.align = 'center';
        tableP.rules = 'non';
        var trP = document.createElement('tr');
        var tdP = document.createElement('td');
        var divP = document.createElement('div');
        var divPC = document.createElement('div');
        var table = document.createElement('table');
        table.align = 'center';
        table.rules = 'non';
        body.appendChild(tableP);

        // main
        tableP.appendChild(trP);
        trP.appendChild(tdP);
        this.setCFramework(tdP, divP, COLOR.DIMGRAY, 450, 300, 5, 0, 0, 30);
        this.setCBoxDetail(CBOX, divP, divPC, COLOR.WHITE, 370, 220, 40, 5, 5, 100);
        divPC.appendChild(table);
        for (var x = 0; x <= T.XMAXL; x++) {
            var tr = document.createElement('tr');
            table.appendChild(tr);
            T.d[x] = new Array();
            for (y = 0; y <= T.YMAXL; y++) {
                var td = document.createElement('td');
                tr.appendChild(td);
                if ((x != T.XMAXL && y == 0 || y == T.YMAXL) || (x == T.XMAXL)) {
                    this.setCBox(x + '-' + y, T.C.S, td);
                    T.d[x][y] = T.C.S;
                } else {
                    this.setCBox(x + '-' + y, T.C.B, td);
                    T.d[x][y] = T.C.B;
                }
            }
        }

        // side table
        var tdPS = document.createElement('td');
        var divPS = document.createElement('div');
        trP.appendChild(tdPS);
        this.setCFramework(tdPS, divPS, COLOR.DIMGRAY, 450, 200, 5, 0, 0, 30);
        var divPCS = document.createElement('div');
        this.setCBoxDetail(CBOX, divPS, divPCS, COLOR.WHITE, 370, 120, 40, 5, 5, 100);
        this.setTBox('time', divPCS, COLOR.BLACK, 'Time');
        this.setTBox('timeStr', divPCS, COLOR.BLACK, '00:00:00');
        var br = document.createElement('br');
        divPCS.appendChild(br);
        this.setTBox('level', divPCS, COLOR.BLACK, 'Level');
        this.setTBox('levelNum', divPCS, COLOR.BLACK, '0');
        var br = document.createElement('br');
        divPCS.appendChild(br);
        this.setTBox('score', divPCS, COLOR.BLACK, 'Score');
        this.setTBox('scoreNum', divPCS, COLOR.BLACK, '0');
        var br = document.createElement('br');
        divPCS.appendChild(br);
        this.setTBox('help', divPCS, COLOR.BLACK, '-- Key press --');
        this.setTBox('S', divPCS, COLOR.BLACK, 's : start or stop');
        this.setTBox('H', divPCS, COLOR.BLACK, 'h : left');
        this.setTBox('L', divPCS, COLOR.BLACK, 'l : right');
        this.setTBox('K', divPCS, COLOR.BLACK, 'k : down');
        this.setTBox('J', divPCS, COLOR.BLACK, 'j : revolution');
        this.setTBox('SPACE', divPCS, COLOR.BLACK, 'Space:HardDrop');
        this.setTBox('info', divPCS, COLOR.BLACK, 'i : info');

        // message
        this.setMBox('stop','Stop');
        this.setMBox('gameover','Game Over ...');
        this.setMBox('website', 'website: http://atushiyamazaki.blogspot.com/');

        // debug
        debug.setLog();
    }

    // load
    this.load = function() {
        for (var x = 0; x <= T.XMAXL; x++) {
            for (var y = 0; y <= T.YMAXL; y++) {
                for (var i in T.C) if (T.d[x][y] == T.C[i]) this.changeCBox(x, y, T.C[i]);
            }
        }
    }

    // set work tetromino
    this.setWT = function() {
        // init
        for (var x = 0; x <= T.WML; x++) {
            T.w[x] = new Array();
            for (var y = 0; y <= T.WML; y++) T.w[x][y] = T.C.B;
        }
        // set Tetromino
        switch (Math.floor(Math.random() * 7)) {
            /*
             * Reference : http://en.wikipedia.org/wiki/Tetromino
            /*/
            case 0:
                /* I (also called 'stick', 'straight', 'long'): four blocks in a straight line
                 *
                 * o*oo
                 * o*oo
                 * o*oo
                 * o*oo
                 *
                /*/
                T.w[0][1] = T.C.D;
                T.w[1][1] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[3][1] = T.C.D;
                break;
            case 1:
                /* J (also called 'inverted L' or 'Gamma'): a row of three blocks with one added below the right side. 
                 *
                 * oooo
                 * *ooo
                 * ***o
                 * oooo
                 *
                /*/
                T.w[1][0] = T.C.D;
                T.w[2][0] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                break;
            case 2:
                /* L (also called 'gun'): a row of three blocks with one added below the left side. 
                 *   This piece is a reflection of J but cannot be rotated into J in two dimensions; this is an example of chirality. However, in three dimensions, this piece is identical to J.
                 *
                 * oooo
                 * ooo*
                 * o***
                 * oooo
                 *
                /*/
                T.w[1][3] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                T.w[2][3] = T.C.D;
                break;
            case 3:
                /* O (also called 'square', 'package', 'block'): four blocks in a 2×2 square
                 *
                 * oooo
                 * o**o
                 * o**o
                 * oooo
                 *
                /*/
                T.w[1][1] = T.C.D;
                T.w[1][2] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                break;
            case 4:
                /* S (also called "N", "skew", "snake"): two stacked horizontal dominoes with the top one offset to the right
                 *
                 * oooo
                 * o*oo
                 * o**o
                 * oo*o
                 *
                /*/
                T.w[1][1] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                T.w[3][2] = T.C.D;
                break;
            case 5:
                /* Z (also called "inverted N"): two stacked horizontal dominoes with the top one offset to the left. The same symmetry properties as with L and J apply with S and Z.
                 *
                 * oooo
                 * oo*o
                 * o**o
                 * o*oo
                 *
                /*/
                T.w[1][2] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                T.w[3][1] = T.C.D;
                break;
            case 6:
                /* T: a row of three blocks with one added below the center. A common Tetris move with the T piece is to spin it in place to fill a line.
                 *
                 * oooo
                 * o*oo
                 * o**o
                 * o*oo
                 *
                /*/
                T.w[1][1] = T.C.D;
                T.w[2][1] = T.C.D;
                T.w[2][2] = T.C.D;
                T.w[3][1] = T.C.D;
                break;
            default:
        }
    }

    // get Left Location
    this.getLeftLocation = function() {
        var rtn = 3;
        for (var x = 0; x <= T.WML; x++) {
            for (var y = 0; y<= T.WML; y++) {
                if (T.w[x][y] == T.C.D) {
                    if (rtn > y) rtn = y;
                }
            }
        }
        return rtn;
    }

    // get Right Location
    this.getRightLocation = function() {
        var rtn = 0;
        for (var x = 0; x <= T.WML; x++) {
            for (var y = 0; y<= T.WML; y++) {
                if (T.w[x][y] == T.C.D) {
                    if (rtn < y) rtn = y;
                }
            }
        }
        return rtn;
    }

    // get Bottom Location
    this.getBottomLocation = function() {
        var rtn = 0;
        for (var x = 0; x <= T.WML; x++) {
            for (var y = 0; y<= T.WML; y++) {
                if (T.w[x][y] == T.C.D) {
                    if (rtn < x) rtn = x;
                }
            }
        }
        return rtn;
    }

    // Left
    this.left = function() {
        if (T.cx >= 0) {
            T.cy--;
            var wx = T.cx + T.WML;
            var wy = T.cy;
            // check
            for (var x = T.WML; x >= 0; x--) {
                if (wx >= 0) {
                    wy = T.cy;
                    for (var y = 0; y <= T.WML; y++) {
                        if (((y < this.getLeftLocation() && T.w[x][y +1] == T.C.B) || (y == this.getLeftLocation()))
                         && T.d[wx][wy] != T.C.B && T.w[x][y] == T.C.D) {
                            T.cy++;
                            return;
                        }
                        wy++;
                    }
                }
                wx--;
            }
            // set
            wx = T.cx + T.WML;
            for (x = T.WML; x >= 0; x--) {
                if (wx >= 0) {
                    wy = T.cy;
                    for (y = 0; y <= T.WML; y++) {
                        // clear
                        if (wy > 0 && ((y < T.WML && T.w[x][y +1] == T.C.B) || (y == T.WML)) && T.w[x][y] == T.C.D) T.d[wx][wy +1] = T.C.B;
                        // set
                        if (y >= this.getLeftLocation() && T.d[wx][wy] == T.C.B && T.w[x][y] == T.C.D) T.d[wx][wy] = T.w[x][y];
                        wy++;
                    }
                }
                wx--;
            }
            this.load();
        }
    }

    // The left revolution
    this.leftRev = function() {
        if (T.cx >= 0) {
            var wx = 3;
            var w = [];
            // check
            for (var x = 0; x <= T.WML; x++) {
                w[x] = new Array();
                for (var y = 0; y <= T.WML; y++) {
                    w[x][y] = T.C.B; // init work array
                    if (T.w[x][y] == T.C.D && T.w[y][wx] != T.C.D && T.d[T.cx + y][T.cy + wx] != T.C.B) return;
                }
                wx--;
            }
            // set
            wx = 3;
            for (var x = 0; x <= T.WML; x++) {
                for (var y = 0; y <= T.WML; y++) {
                    if (T.w[x][y] == T.C.D) {
                        if (w[x][y] == T.C.B) {
                            // clear
                            T.d[T.cx + x][T.cy + y] = T.C.B;
                            w[x][y] = T.C.B;
                        }
                        // set
                        T.d[T.cx + y][T.cy + wx] = T.C.D;
                        w[y][wx] = T.C.D;
// debug.log('x = ' + x + ' , y = ' + y + ' , T.w[x][y] =' + T.w[x][y] + ' , w[x][y] = ' + w[x][y] + ' , w[y][wx] = ' + w[y][wx] + ' , T.d[T.cx +y][T.cy +wx] = ' + T.d[T.cx+y][T.cy+wx]);
                    }
                }
                wx--;
            }

            for (var x = 0; x <= T.WML; x++) T.w[x] = w[x].clone();
            this.load();
        }
    }

    // Down
    this.down = function() {
        T.cx++;
        if (T.cx == T.XMAXL) T.cx = T.WDX;
        var wx = T.cx + T.WML;
        var wy = T.cy;
        // check
        for (var x = T.WML; x >= 0; x--) {
            if (wx >= 0) {
                wy = T.cy;
                for (var y = 0; y <= T.WML; y++) {

//debug.log('T.cx = ' + T.cx + ' , T.cy = ' + T.cy + ' , T.WML = ' + T.WML + ' ,  bottom location = '
//        + this.getBottomLocation() + ' ,  left location = ' + this.getLeftLocation() + ' ,  right location = ' + this.getRightLocation()
//        + ' , x = ' + x + ' , y = ' + y + ' , T.d[' + wx + '][' + wy + '] = ' + T.d[wx][wy] + ' B=0,D=1,S=9');

                    if (((x < this.getBottomLocation() && T.w[x +1][y] == T.C.B) || (x == this.getBottomLocation()))
                     && T.d[wx][wy] != T.C.B && T.w[x][y] == T.C.D) {
                        // Game Over
                        if (T.cx <= 0) this.setGameOver();

                        T.cx = T.WDX;
                        T.cy = T.WDY;
                        this.setWT();
                        // Line check & delete
                        this.checkLine();
                        return;
                    }
                    wy++;
                }
            }
            wx--;
        }
        // set
        wx = T.cx + T.WML;
        for (x = T.WML; x >= 0; x--) {
            if (wx >= 0) {
                wy = T.cy;
                for (y = 0; y <= T.WML; y++) {
                    // clear
                    if (wx > 0 && ((x > 0 && T.w[x -1][y] == T.C.B) || (x == 0)) && T.w[x][y] == T.C.D) T.d[wx -1][wy] = T.C.B;
                    // set
                    if (x <= this.getBottomLocation() && T.d[wx][wy] == T.C.B && T.w[x][y] == T.C.D) { 
                        T.d[wx][wy] = T.w[x][y];
                    }
                    wy++;
                }
            }
            wx--;
        }
        this.load();
    }

    // Right
    this.right = function() {
        if (T.cx >= 0) {
            T.cy++;
            var wx = T.cx + T.WML;
            var wy = T.cy + T.WML;
            // check
            for (var x = T.WML; x>= 0; x--) {
                if (wx >= 0) {
                    var wy = T.cy + T.WML;
                    for (var y = T.WML; y >= 0; y--) {
                        if (((y > this.getRightLocation() && T.w[x][y -1] == T.C.B) || (y == this.getRightLocation()))
                         && T.d[wx][wy] != T.C.B && T.w[x][y] == T.C.D) {
                            T.cy--;
                            return;
                        }
                        wy --;
                    }
                }
                wx--;
            }
            // set
            wx = T.cx + T.WML;
            for (x = T.WML; x>= 0; x--) {
                if (wx >= 0) {
                    wy = T.cy + T.WML;
                    for (y = T.WML; y >= 0; y--) {
                        // clear
                        if (wy > 0 && ((y > 0 && T.w[x][y -1] == T.C.B) || (y == 0)) && T.w[x][y] == T.C.D) T.d[wx][wy -1] = T.C.B;
                        // set
                        if (y <= this.getRightLocation() && T.d[wx][wy] == T.C.B && T.w[x][y] == T.C.D) T.d[wx][wy] = T.w[x][y];
                        wy --;
                    }
                }
                wx--;
            }
            this.load();
        }
    }

    // check Line
    this.checkLine = function() {
        var flg = 0;
        DISPLAY.delLine = 0;
        for (var x = 1; x < T.XMAXL; x++) {
            flg = 0;            
            // check
            for (var y = 1; y < T.YMAXL; y++) {
                if (T.d[x][y] == T.C.B) flg = 1;
            }

            // set
            if (flg == 0) {
                DISPLAY.delLine++;
                DISPLAY.score++;
                for (var wx = x; wx > 0; wx--) T.d[wx] = T.d[wx -1].clone();
                for (var y = 1; y < T.YMAXL; y++) T.d[0][y] = T.C.B;

                // 10 Line : level up
                if (DISPLAY.score % 10 == 0) this.setLevel();
            }
        }
        // set score
        this.setScore();
    }

    // Game Over
    this.setGameOver = function() {
        this.showMBox('gameover');
        clearInterval(interval); 
        RUN.status = RUN.STATUS.GAMEOVER;
    }

    // set Score
    this.setScore = function() {
        var div = document.getElementById('scoreNum');
        /*
         * set bonus
         * 2 line : 200 + (2 * 200) = 600
         * 3 line : 300 + (3 * 300) = 1200
         * 4 line : 400 + (4 * 400) = 2000
        /*/
        if (DISPLAY.delLine >= 2) DISPLAY.bonus = DISPLAY.bonus + (DISPLAY.delLine * (DISPLAY.delLine * 100));
        div.textContent = DISPLAY.score * 100 + DISPLAY.bonus;
    }

    // set Level
    this.setLevel = function() {
        if (RUN.status != RUN.STATUS.GAMEOVER) {
            DISPLAY.level++;
            var div = document.getElementById('levelNum');
            div.textContent = DISPLAY.level;
            TIME.hardness++;
            clearInterval(interval); 
            interval = setInterval('play(RUN.STATUS.RUN)', 1000 - (50 * TIME.hardness));
        }
    }
}

/* 
 * Event
/*--------------------*/
function $Event(event, type, handler) {
    if (event.addEventListener) {
        event.addEventListener(type, handler, false);
    } else {
        event.attachEvent('on' + type, handler);
    }
}
$Event(window, 'keydown', function(e) { event((e.keyCode)? e.keyCode: e.charCode); });
function event(keyCode) {
    if (RUN.status != RUN.STATUS.GAMEOVER) {
        if (KCODE.S == keyCode) {
            if (RUN.STATUS.INIT == RUN.status) {
                // Start
                TIME.start = (new Date()).getTime();
                var div = document.getElementById('timeStr');
                div.textContent = TIME.time.stopWatch();
                div = document.getElementById('levelNum');
                div.textContent = DISPLAY.level;
                div = document.getElementById('scoreNum');
                div.textContent = DISPLAY.score;
                // set second
                interval = setInterval('play(RUN.STATUS.RUN)', 1000 - (50 * TIME.hardness));
                RUN.status = RUN.STATUS.RUN;
            } else {
                if (RUN.STATUS.RUN == RUN.status)  {
                    // Stop
                    clearInterval(interval); 
                    TIME.stop = (new Date()).getTime();
                    RUN.status = RUN.STATUS.STOP;
                    DISPLAY.obj.showMBox('stop');
                } else if (RUN.STATUS.STOP == RUN.status) {
                    // reStart
                    interval = setInterval('play(RUN.STATUS.RUN)', 1000 - (50 * TIME.hardness));
                    RUN.status = RUN.STATUS.RUN;
                    DISPLAY.obj.hideMBox('stop');
                }
            }
        } else if (KCODE.H == keyCode) {
            // Left
            if (RUN.STATUS.RUN == RUN.status) DISPLAY.obj.left();
        } else if (KCODE.J == keyCode) {
            // The left revolution
            if (RUN.STATUS.RUN == RUN.status) DISPLAY.obj.leftRev();
        } else if (KCODE.K == keyCode) {
            // Down
            if (RUN.STATUS.RUN == RUN.status) DISPLAY.obj.down();
        } else if (KCODE.L == keyCode) {
            // Right
            if (RUN.STATUS.RUN == RUN.status) DISPLAY.obj.right();
        } else if (KCODE.SPACE == keyCode) {
            // Head Drop
            if (RUN.STATUS.RUN == RUN.status) {
                while (T.cx != T.WDX) DISPLAY.obj.down();
            }
        } else if (KCODE.INFO == keyCode) {
            // Info
            if (DISPLAY.showHelp == DISPLAY.INFO_OFF) {
                DISPLAY.obj.showMBox('website');
                DISPLAY.showHelp = DISPLAY.INFO_ON;
            } else if (DISPLAY.showHelp == DISPLAY.INFO_ON) {
                DISPLAY.obj.hideMBox('website');
                DISPLAY.showHelp = DISPLAY.INFO_OFF;
            }
        }
    }
}

/* 
 * Play
/*--------------------*/
RUN = {
    STATUS: { 
        INIT:0,
        RUN:1,
        STOP:2, 
        GAMEOVER:3 
    },
    status:0
};
function play(runStatus) {
  if (RUN.STATUS.INIT == runStatus) {
    DISPLAY.obj.init();
    DISPLAY.obj.setWT();
  } else if (RUN.STATUS.RUN == runStatus) {
    var div = document.getElementById('timeStr');
    div.textContent = TIME.time.stopWatch();
    DISPLAY.obj.down();
  }
}


play(RUN.STATUS.INIT);

