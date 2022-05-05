scale = 30;// 화면에 표시되는 요소들 기준 크기(오목판 한 칸 크기)
sus = new Array();// 놓은 수들 차례로 저장하는 배열 (stage.a와 같은 요소를 다른 배열에 저장하는 것)
//// 각 플레이어 색
playerColor = new Array(2);
playerColor[0] = 'black';
playerColor[1] = 'white';

//// 좌표 클래스(x,y가 한 묶음이 아니라서 개짱난다)
class XY {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function mousePos(e) {// 마우스위치를 바둑판좌표로 변환. 이 함수는 이벤트리스너에서 그 이벤트를 이 함수의 인자로 넣으면서 호출해야만 한다. 즉 eventHandlerEx(e){… var a = mousePos(e); …}
    return new XY(
        parseInt((e.clientX - stage.pan.getBoundingClientRect().x) / scale)
        , parseInt((e.clientY - stage.pan.getBoundingClientRect().y) / scale));
}

//// 이번 턴 돌을 놓을 플레이어 = 턴수가 짝수이면 흑, 홀수는 백.
function currentP() {
    return (sus.length) % 2;
}

//// 오목판 클래스
class Stage {
    //// 오목판에는 2차원 배열이 있고 배열 요소는 바둑돌 클래스의 객체이다.
    constructor(box, width, height) {// box: 오목판으로서 만들 div 태그의 부모
        this.test = "asdf";
        this.playon = true;// true여야만 돌이 놓아진다. 게임이 끝나면 false가 된다.
        //// 가로세로
        this.w = width;
        this.h = height;
        //// 2차원 배열 만들기
        this.a = new Array(height);
        for (var i = 0; i < height; i++) {
            this.a[i] = new Array(width);
        }
        //// 오목판 태그
        this.pan = document.getElementById('omokpan');
        //css로 넣어보자
        this.pan.style.position = 'relative';
        //// 격자 표시용 테이블을 만들어 자손으로 넣기
        this.grid = document.createElement('table');
        this.grid.style.position = 'absolute';
        this.pan.appendChild(this.grid);
        for (var i = 0; i < this.h - 1; i++) {// 가로줄을 세로크기만큼 개 만들기
            var tr = document.createElement('tr');
            this.grid.appendChild(tr);
            for (var k = 0; k < this.w - 1; k++) {
                var td = document.createElement('td');
                tr.appendChild(td);
            }
        }
        //// 가운데 표시 점
        this.centerPoint = document.createElement('div');
        this.pan.appendChild(this.centerPoint);
        this.centerPoint.style.position = 'absolute';
        this.centerPoint.style.backgroundColor = 'grey';
        this.centerPoint.style.borderRadius = '50%';

        this.restyle();// 초기 스타일

        //// 이벤트 함수 연결
        this.pan.onclick = this.stageClick;
        this.pan.onmouseenter = this.cursorOn;
        this.pan.onmousemove = this.cursorMove;
        this.pan.onmouseleave = this.cursorOff;
    }
    //// 스타일 새로고침 함수
    restyle() {
        //// 가운데점
        this.centerPoint.style.width = scale / 5 + 'px';
        this.centerPoint.style.height = scale / 5 + 'px';
        this.centerPoint.style.top = this.h * scale / 2 - scale / 10 + 'px';
        this.centerPoint.style.left = this.w * scale / 2 - scale / 10 + 'px';
        //// 판
        this.pan.style.width = (scale * this.w) + 'px';
        this.pan.style.height = (scale * this.h) + 'px';
        //// 격자
        this.grid.style.left = (scale / 2) + 'px';
        this.grid.style.top = (scale / 2) + 'px';
        var tds = document.querySelectorAll('#omokpan td');
        for (var i = 0; i < tds.length; i++) {
            tds[i].style.width = scale + 'px';
            tds[i].style.height = scale + 'px';
        }
    }

    //// 판 위에 커서 표시
    cursorOn(e) {// 판 위에 마우스 올리면 커서 나타남
        stage.cursor = document.createElement('div');
        stage.pan.appendChild(stage.cursor);
        stage.cursor.className = 'dol cursor';
        stage.cursor.style.position = 'absolute';
        stage.cursor.style.backgroundColor = playerColor[currentP()];
        stage.cursor.style.width = scale + 'px';
        stage.cursor.style.height = scale + 'px';
    }
    cursorMove(e) {// 마우스 따라 커서 이동
        stage.cursor.style.top = mousePos(e).y * scale + 'px';
        stage.cursor.style.left = mousePos(e).x * scale + 'px';
    }
    cursorOff(e) {// 마우스가 판 밖에 나면 커서 삭제
        stage.cursor.remove();
    }

    //// 판 클릭 이벤트
    stageClick(e) {
        if (!stage.playon) return;// 게임 이미 끝나있으면 아무것도 안함
        var x = mousePos(e).x;
        var y = mousePos(e).y;
        if (stage.a[y][x] == null) {// 누른 자리가 빈자리일 때만
            stage.suup(x, y);// 돌 놓기
        }
        else
            document.getElementById('msg').innerText = '이미 돌이 있는 자리입니다.';//``
    }
    //// 돌 놓기
    suup(x, y) {// 돌 놓는 위치(오목판좌표)
        var cp = currentP();// 돌을 놓으면 cP() 저 값이 바뀌어서 뒤처리 시발 개같음
        var newDol = new Dol(cp, x, y);
        stage.a[y][x] = newDol;
        sus[sus.length] = newDol;
        stage.signUpdate();// 표시 갱신
        ////` 승패 판정
        stage.judge(cp, x, y);
        ////` 오목판이 가득 찼으면 비김
        if (sus.length >= stage.w * stage.h) {
            ////` 비김
            stage.playon = false;
            alert('비겼습니다.');
        }
    }
    //// 한 수 무르기
    sudown() {
        if (sus.length < 1) return;// 무를 수가 없으면 아무것도 안함
        var dol = sus.pop();// 어느 좌표의 돌을 무르나
        dol.div.remove();// 돌 html요소 삭제
        stage.a[dol.pos.y][dol.pos.x] = null;
        stage.signUpdate();// 표시 갱신
    }
    //// 표시 갱신
    signUpdate() {
        //// 상황판 갱신
        document.getElementById('colorSign').style.backgroundColor = playerColor[currentP()];// 이번에 돌 놓을 플레이어 색
        document.getElementById('su').innerText = sus.length + 1;// 몇번째 수인지 표시
        //// 커서 색 갱신
        stage.cursor.style.backgroundColor = playerColor[currentP()];
    }

    //// 승패판정하고 처리
    judge(p, x, y) {// p 플레이어가 x,y 위치에 새 돌 놓았을 때
        //// 
        if (stage.acount(p, x, y, 0, -1) + stage.acount(p, x, y, 0, 1) >= 6// 세로방향 검사
            || stage.acount(p, x, y, -1, 0) + stage.acount(p, x, y, 1, 0) >= 6// 가로
            || stage.acount(p, x, y, 1, 1) + stage.acount(p, x, y, -1, -1) >= 6// 대각 \
            || stage.acount(p, x, y, 1, -1) + stage.acount(p, x, y, -1, 1) >= 6// 대각 /
        ) {
            alert(p + 1 + 'p 승리');
            stage.playon = false;
        }
    }
    //// 기준위치에서부터 특정 방향으로 연속된 같은 색 돌의 개수 (기준색과 입력색이 다르면 0)
    acount(p, x, y, xstep, ystep) {// x,y: 기준위치. xystep: 검사할 방향(0,1,-1)
        var n;// 구할 값
        for (n = 0; ;) {
            var xx = x + xstep * n;
            var yy = y + ystep * n;
            if (xx < 0 || xx >= stage.w || yy < 0 || yy >= stage.h) { break; }// 검사할 위치가 오목판에서 벗어난 곳인 경우
            if (stage.a[yy][xx] == null) { break; }// 검사할 위치에 돌이 없는 경우
            if (stage.a[yy][xx].p != p) { break; }// 검사할 위치의 돌색이 다른 경우
            n++;// 위 검사를 모두 통과한 경우; 기준 위치로부터 n칸 떨어진 곳에 같은색 돌이 있다는 뜻이다. 반복문을 돌아 다음 위치도 검사하자.
        }
        return n;
    }
}
//// 바둑돌 클래스
class Dol {
    constructor(p, x, y) {// p: 어느 플레이어의 돌인가(0,1)
        this.pos = new XY(x, y);
        this.p = p;
        //// 바둑돌을 표시하는 div를 가진다
        this.div = document.createElement('div');
        stage.pan.appendChild(this.div);
        this.div.className = 'dol p' + p;// 바둑돌 태그 클래스
        this.restyle();// 초기 스타일
    }
    //// 표시div에 스타일 새로고침
    restyle(c) {
        var gap = parseInt(scale / 10);// 돌간 간격(의 반)
        this.div.style.width = scale - (gap * 2) + 'px';
        this.div.style.height = scale - (gap * 2) + 'px';
        this.div.style.left = (this.pos.x * scale) + gap + 'px';
        this.div.style.top = (this.pos.y * scale) + gap + 'px';
    }
}
//// 바둑판 크기 조절
function rescale(val) {// val: z
    scale = Math.max(val, 10);// scale값 덮어쓰기 단 최소값 10
    // 오목판
    stage.restyle();
    //// 돌들
    for (var i = 0; i < sus.length; i++) {
        sus[i].restyle();
    }
}
//// 판 만들기
function start() {
    //// 판 크기 결정
    for (; ;) {
        var garo = parseInt(prompt('오목판 가로칸수? (5~50)', 19));
        if (garo >= 5 && garo <= 50) break;
    }
    for (; ;) {
        var sero = parseInt(prompt('오목판 세로칸수? (5~50)', 19));
        if (sero >= 5 && sero <= 50) break;
    }
    //// 오목판 객체
    return new Stage(document.getElementById('omokbox'), garo, sero);
}

//// 시작
stage = start();

document.getElementById('colorSign').style.backgroundColor = playerColor[0];// 현재플레이어 표시 초기 색