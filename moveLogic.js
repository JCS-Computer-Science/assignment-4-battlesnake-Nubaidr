export default function move(gameState) {
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const boardWidth = gameState.board.width;

    const boardHeight = gameState.board.height;
    const myLength = gameState.you.length;
    const myHealth = gameState.you.health;
    const myId = gameState.you.id;

    const moveOffsets = {
        up:    { x: 0,  y: 1  },
        down:  { x: 0,  y: -1 },
        left:  { x: -1, y: 0  },
        right: { x: 1,  y: 0  }
    };

    const centerX = (boardWidth - 1) / 2;
    const centerY = (boardHeight - 1) / 2;
    const spreadRadius = Math.floor(Math.min(boardWidth, boardHeight) * 0.25);

    function inBounds(x, y) {
        return x >= 0 && y >= 0 && x < boardWidth && y < boardHeight;
    }



    function floodFill(startX, startY, blocked) {
        const visited = new Set();
        const stack = [[startX, startY]];
        let count = 0;

        while (stack.length) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;
            if (visited.has(key) || !inBounds(x, y) || blocked.has(key)) continue;
            visited.add(key);
            count++;
            stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
        }

        return count;
    }

    function bfsDistance(startX, startY, targetX, targetY, blocked) { //AI USED FOR THIS FUNCTION
        if (startX === targetX && startY === targetY) return 0;
        const visited = new Set([`${startX},${startY}`]);
        const queue = [[startX, startY, 0]];

        

    }

    const moveSafety = { up: true, down: true, left: true, right: true };

    if (myHead.x === 0)               moveSafety.left  = false;
    if (myHead.x === boardWidth - 1)  moveSafety.right = false;
    if (myHead.y === 0)               moveSafety.down  = false;
    if (myHead.y === boardHeight - 1) moveSafety.up    = false;

    if (myNeck.x < myHead.x) moveSafety.left  = false;
    if (myNeck.x > myHead.x) moveSafety.right = false;
    if (myNeck.y < myHead.y) moveSafety.down  = false;
    if (myNeck.y > myHead.y) moveSafety.up    = false;

    const blocked = buildBlockedSet();

    for (const dir of ["up","down","left","right"]) {
        if (!moveSafety[dir]) continue;
        const nx = myHead.x + moveOffsets[dir].x;
        const ny = myHead.y + moveOffsets[dir].y;
        if (blocked.has(`${nx},${ny}`)) moveSafety[dir] = false;
    }

    for (const snake of gameState.board.snakes) {
        if (snake.id === myId || snake.length < myLength) continue;
        const enemyHead = snake.body[0];
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const ex = enemyHead.x + dx, ey = enemyHead.y + dy;
            for (const dir of ["up","down","left","right"]) {
                if (!moveSafety[dir]) continue;
                const nx = myHead.x + moveOffsets[dir].x;
                const ny = myHead.y + moveOffsets[dir].y;
                if (nx === ex && ny === ey) moveSafety[dir] = false;
            }
        }
    }

    let safeMoves = Object.keys(moveSafety).filter(d => moveSafety[d]);

    if (safeMoves.length === 0) {
        const fallback = { up: true, down: true, left: true, right: true };

        if (myHead.x === 0)               fallback.left  = false;
        if (myHead.x === boardWidth - 1)  fallback.right = false;
        if (myHead.y === 0)               fallback.down  = false;
        if (myHead.y === boardHeight - 1) fallback.up    = false;

        if (myNeck.x < myHead.x) fallback.left  = false;
        if (myNeck.x > myHead.x) fallback.right = false;
        if (myNeck.y < myHead.y) fallback.down  = false;
        if (myNeck.y > myHead.y) fallback.up    = false;

        for (const dir of ["up","down","left","right"]) {
            if (!fallback[dir]) continue;
            const nx = myHead.x + moveOffsets[dir].x;
            const ny = myHead.y + moveOffsets[dir].y;
            if (blocked.has(`${nx},${ny}`)) fallback[dir] = false;
        }

        safeMoves = Object.keys(fallback).filter(d => fallback[d]);
    }

    if (safeMoves.length === 0) return { move: "up" };

    const isCritical = myHealth < 25;
    const distToCenter = Math.abs(myHead.x - centerX) + Math.abs(myHead.y - centerY);
    const atCenter = distToCenter <= spreadRadius;

    let targetFood = null;
    if (isCritical && gameState.board.food.length > 0) {
        let best = Infinity;
        for (const f of gameState.board.food) {
            const d = bfsDistance(myHead.x, myHead.y, f.x, f.y, blocked);
            if (d < best) { best = d; targetFood = f; }
        }
    }

    function scoreMove(dir) {
        let score = 0;
        const nx = myHead.x + moveOffsets[dir].x;
        const ny = myHead.y + moveOffsets[dir].y;

        const space = floodFill(nx, ny, blocked);
        if (space < myLength)            score -= 300;
        else if (space < myLength * 1.5) score -= 100;

        const nextDist = Math.abs(nx - centerX) + Math.abs(ny - centerY);

        if (atCenter) {
            if (nextDist <= spreadRadius)      score += 150;
            else if (nextDist <= spreadRadius + 1) score += 50;

            else                               score -= 100;
        } else {
            score += (distToCenter - nextDist) * 60;
            score += (1 - nextDist / (centerX + centerY)) * 80;
        }

        if (targetFood) {
            const distNow  = bfsDistance(myHead.x, myHead.y, targetFood.x, targetFood.y, blocked);
            const distNext = bfsDistance(nx, ny, targetFood.x, targetFood.y, blocked);
            score += (distNow - distNext) * 80;
        }

        for (const snake of gameState.board.snakes) {
            if (snake.id === myId) continue;
            const enemyHead = snake.body[0];
            const dist = Math.abs(enemyHead.x - nx) + Math.abs(enemyHead.y - ny);

            if (snake.length >= myLength) {
                if (dist <= 2) score -= 80;
                else if (dist <= 4) score -= 20;
            } else {
                if (dist === 1) score += 60;
            }
        }

        return score;
    }

    let bestMove = safeMoves[0];

    for (const dir of safeMoves) {
        const s = scoreMove(dir);
        if (s > bestScore) { bestScore = s; bestMove = dir; }
    }

    return { move: bestMove };
}