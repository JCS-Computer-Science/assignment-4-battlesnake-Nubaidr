export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };
    

    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height
    
    if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
        moveSafety.left = false;
        
    } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
        moveSafety.right = false;
        
    } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
        moveSafety.down = false;
        
    } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
        moveSafety.up = false;
    }
    
    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
    
    if (myHead.x === 0) moveSafety.left = false;
    if (myHead.x === boardWidth - 1) moveSafety.right = false;
    if (myHead.y === 0) moveSafety.down = false;
    if (myHead.y === boardHeight - 1) moveSafety.up = false;
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    const myBody = gameState.you.body;
    const bodyToCheck = myBody.slice(1, myBody.length - 1);
    for (const segment of myBody){
        if (segment.x === myHead.x - 1 && segment.y === myHead.y) moveSafety.left = false;
        if (segment.x === myHead.x + 1 && segment.y === myHead.y) moveSafety.right = false;
        if (segment.x === myHead.y - 1 && segment.x === myHead.x) moveSafety.down = false;
        if (segment.x === myHead.y + 1 && segment.x === myHead.x) moveSafety.up = false;

    }


    
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    // Are there any safe moves left?

    const opponents = gameState.board.snakes;
    for (const snake of gameState.board.snakes) {
        for (const segment of snake.body.slice(0, -1)) {
            if (segment.x === myHead.x - 1 && segment.y === myHead.y) moveSafety.left = false;
            if (segment.x === myHead.x + 1 && segment.y === myHead.y) moveSafety.right = false;
            if (segment.y === myHead.y - 1 && segment.x === myHead.x) moveSafety.down = false;
            if (segment.y === myHead.y + 1 && segment.x === myHead.x) moveSafety.up = false;
        }
    }

    const enemyHeads = gameState.board.snakes.map(s => s.body[0]);
    for (const head of enemyHeads) {
        if (head.x === myHead.x - 1 && head.y === myHead.y) moveSafety.left = false;
        if (head.x === myHead.x + 1 && head.y === myHead.y) moveSafety.right = false;
        if (head.y === myHead.y - 1 && head.x === myHead.x) moveSafety.down = false;
        if (head.y === myHead.y + 1 && head.x === myHead.x) moveSafety.up = false;
    }
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves`);
        return { move: "up" };
    }
    
    // Choose a random move from the safe moves
    const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];   
    const food = gameState.board.food;
    let bestMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

    if (food.length > 0) {
       
        let nearestFood = food.reduce((closest, f) => {
            const distance = Math.abs(f.x - myHead.x) + Math.abs(f.y - myHead.y);
            if (distance < closest.distance) {
                return { food: f, distance: distance };
            }
            return closest;
        
        


    
        let minDistance = Infinity;

        for (const f of food) {
            const distance = Math.abs(f.x - myHead.x) + Math.abs(f.y - myHead.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestFood = f;
            }
        }

        for (const f of food) {
            const distance = Math.abs(f.x - myHead.x) + Math.abs(f.y - myHead.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestFood = f;
            }
        }


    let bestDistance = Infinity;
        const moveOffsets = {
            up:    { x: 0,  y: 1  },
            down:  { x: 0,  y: -1 },
            left:  { x: -1, y: 0  },
            right: { x: 1,  y: 0  }
        };

        for (const move of safeMoves) {
            const nextX = myHead.x + moveOffsets[move].x;
            const nextY = myHead.y + moveOffsets[move].y;
            const distToFood = Math.abs(nearestFood.x - nextX) + Math.abs(nearestFood.y - nextY);

            if (distToFood < bestDistance) {
                bestDistance = distToFood;
                bestMove = move;
            }
        }
    }
}

    console.log(`MOVE ${gameState.turn}: ${bestMove}`);
    return { move: bestMove };
}


