// DOM元素加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 游戏状态变量
    let Sudoku = {
        board: [],          // 当前数独棋盘
        solution: [],       // 解决方案
        original: [],       // 初始棋盘（用于重置）
        selectedCell: null, // 当前选中的单元格
        difficulty: 'easy', // 默认难度
        gameStarted: false, // 游戏是否已开始
        startTime: null,    // 游戏开始时间
        timerInterval: null,// 计时器
        elapsedTime: 0      // 已用时间（秒）
    };

    // DOM元素
    const boardElement = document.getElementById('sudoku-board');
    const statusMessage = document.getElementById('status-message');
    const newGameButton = document.getElementById('new-game');
    const checkSolutionButton = document.getElementById('check-solution');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const rulesModal = document.getElementById('rules-modal');
    const showRulesButton = document.getElementById('show-rules');
    const closeRulesButton = document.getElementById('close-rules');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const celebrationModal = document.getElementById('celebration-modal');
    const closeCelebrationButton = document.getElementById('close-celebration');
    const newGameAfterWinButton = document.getElementById('new-game-after-win');
    const timeValueElement = document.getElementById('time-value');
    const numButtons = document.querySelectorAll('.num-btn');
    const clearButton = document.getElementById('clear-btn');

    // 初始化数独棋盘
    function initializeBoard() {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'cell-hover', 'flex', 'items-center', 'justify-center', 'font-numbers', 'text-xl', 'md:text-2xl', 'cursor-pointer', 'border', 'border-gray-300', 'transition-all');
                
                // 设置3x3区块的粗边框
                if (row % 3 === 0 && row !== 0) {
                    cell.classList.add('border-t', 'border-t-gold', 'border-thick');
                }
                if (col % 3 === 0 && col !== 0) {
                    cell.classList.add('border-l', 'border-l-gold', 'border-thick');
                }
                
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => selectCell(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    // 选择单元格
    function selectCell(row, col) {
        // 如果是初始数字，不能选中
        if (Sudoku.original[row][col] !== 0) return;
        
        // 清除之前的选中状态
        if (Sudoku.selectedCell) {
            const prevCell = getCellElement(Sudoku.selectedCell.row, Sudoku.selectedCell.col);
            prevCell.classList.remove('bg-gold/20', 'ring-2', 'ring-gold');
        }
        
        // 设置新的选中状态
        Sudoku.selectedCell = { row, col };
        const cell = getCellElement(row, col);
        cell.classList.add('bg-gold/20', 'ring-2', 'ring-gold');
        
        // 如果游戏尚未开始，开始计时
        if (!Sudoku.gameStarted) {
            startGame();
        }
    }

    // 获取单元格元素
    function getCellElement(row, col) {
        return boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    // 生成数独谜题
    function generateSudoku(difficulty) {
        // 创建一个完整的数独解决方案
        Sudoku.solution = createSolution();
        
        // 复制解决方案作为初始棋盘
        Sudoku.original = JSON.parse(JSON.stringify(Sudoku.solution));
        Sudoku.board = JSON.parse(JSON.stringify(Sudoku.solution));
        
        // 根据难度移除数字
        let cellsToRemove = 30; // 简单
        if (difficulty === 'medium') cellsToRemove = 40;
        if (difficulty === 'hard') cellsToRemove = 50;
        
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (Sudoku.original[row][col] !== 0) {
                Sudoku.original[row][col] = 0;
                Sudoku.board[row][col] = 0;
                removed++;
            }
        }
        
        // 更新UI
        updateBoardUI();
    }

    // 创建数独解决方案
    function createSolution() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        
        // 递归填充数独
        function fillBoard(row, col) {
            // 如果已经填到最后一行，返回成功
            if (row === 9) return true;
            
            // 计算下一个单元格的位置
            const nextRow = col === 8 ? row + 1 : row;
            const nextCol = col === 8 ? 0 : col + 1;
            
            // 生成1-9的随机排列
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            
            for (const num of numbers) {
                if (isValidMove(board, row, col, num)) {
                    board[row][col] = num;
                    if (fillBoard(nextRow, nextCol)) {
                        return true;
                    }
                    board[row][col] = 0; // 回溯
                }
            }
            
            return false; // 没有有效的数字可以填入
        }
        
        // 从(0,0)开始填充
        fillBoard(0, 0);
        return board;
    }

    // 检查移动是否有效
    function isValidMove(board, row, col, num) {
        // 检查行
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        // 检查3x3区块
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[blockRow + i][blockCol + j] === num) return false;
            }
        }
        
        return true;
    }

    // 更新棋盘UI
    function updateBoardUI() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = getCellElement(row, col);
                const value = Sudoku.board[row][col];
                
                cell.textContent = value !== 0 ? value : '';
                cell.classList.remove('text-darkMagic', 'text-shadow-gold', 'bg-error', 'bg-success');
                
                // 设置初始数字和玩家输入数字的样式区别
                if (Sudoku.original[row][col] !== 0) {
                    cell.classList.add('text-darkMagic', 'font-bold');
                } else if (value !== 0) {
                    cell.classList.add('text-shadow-gold', 'font-bold');
                }
            }
        }
    }

    // 输入数字
    function inputNumber(num) {
        if (!Sudoku.selectedCell) return;
        
        const { row, col } = Sudoku.selectedCell;
        
        // 不能修改初始数字
        if (Sudoku.original[row][col] !== 0) return;
        
        // 更新棋盘
        Sudoku.board[row][col] = num;
        const cell = getCellElement(row, col);
        
        // 更新UI
        cell.textContent = num;
        cell.classList.remove('bg-error', 'bg-success');
        cell.classList.add('text-shadow-gold', 'font-bold');
        
        // 移动到下一个单元格
        moveToNextCell();
    }

    // 清除数字
    function clearCell() {
        if (!Sudoku.selectedCell) return;
        
        const { row, col } = Sudoku.selectedCell;
        
        // 不能清除初始数字
        if (Sudoku.original[row][col] !== 0) return;
        
        // 清除单元格
        Sudoku.board[row][col] = 0;
        const cell = getCellElement(row, col);
        cell.textContent = '';
        cell.classList.remove('bg-error', 'bg-success');
    }

    // 移动到下一个单元格
    function moveToNextCell() {
        if (!Sudoku.selectedCell) return;
        
        let { row, col } = Sudoku.selectedCell;
        
        // 计算下一个单元格
        col++;
        if (col >= 9) {
            col = 0;
            row++;
            if (row >= 9) {
                row = 0;
            }
        }
        
        // 如果下一个单元格是初始数字，继续寻找下一个
        while (row < 9 && Sudoku.original[row][col] !== 0) {
            col++;
            if (col >= 9) {
                col = 0;
                row++;
            }
        }
        
        // 如果找到了可编辑的单元格，选中它
        if (row < 9) {
            selectCell(row, col);
        }
    }

    // 检查解决方案
    function checkSolution() {
        if (!Sudoku.gameStarted) return;
        
        let isComplete = true;
        let hasErrors = false;
        
        // 检查每个单元格
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = getCellElement(row, col);
                const value = Sudoku.board[row][col];
                
                // 清除之前的状态
                cell.classList.remove('bg-error', 'bg-success');
                
                // 检查是否为空
                if (value === 0) {
                    isComplete = false;
                    continue;
                }
                
                // 检查是否正确
                if (value !== Sudoku.solution[row][col]) {
                    cell.classList.add('bg-error');
                    hasErrors = true;
                } else {
                    cell.classList.add('bg-success');
                }
            }
        }
        
        // 更新状态消息
        if (!isComplete) {
            statusMessage.textContent = '谜题尚未完成，请继续填充';
        } else if (hasErrors) {
            statusMessage.textContent = '发现错误，请检查标红的单元格';
        } else {
            // 完成游戏
            completeGame();
        }
    }

    // 完成游戏
    function completeGame() {
        // 停止计时器
        stopTimer();
        
        // 显示庆祝动画
        animateCompletion();
        
        // 延迟显示庆祝模态框
        setTimeout(() => {
            showCelebrationModal();
        }, 1500);
    }

    // 完成动画
    function animateCompletion() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#D7BDE2', '#58D68D', '#85C1E9'];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = getCellElement(row, col);
                const delay = (row * 9 + col) * 50;
                
                setTimeout(() => {
                    cell.classList.add('celebrate', 'color-transition');
                    cell.style.color = colors[Math.floor(Math.random() * colors.length)];
                }, delay);
            }
        }
    }

    // 开始游戏
    function startGame() {
        Sudoku.gameStarted = true;
        Sudoku.startTime = new Date();
        
        // 启动计时器
        startTimer();
        
        statusMessage.textContent = '游戏进行中...';
    }

    // 开始计时器
    function startTimer() {
        if (Sudoku.timerInterval) clearInterval(Sudoku.timerInterval);
        
        Sudoku.timerInterval = setInterval(() => {
            Sudoku.elapsedTime = Math.floor((new Date() - Sudoku.startTime) / 1000);
            updateTimerDisplay();
        }, 1000);
    }

    // 停止计时器
    function stopTimer() {
        if (Sudoku.timerInterval) {
            clearInterval(Sudoku.timerInterval);
            Sudoku.timerInterval = null;
        }
    }

    // 更新计时器显示
    function updateTimerDisplay() {
        const minutes = Math.floor(Sudoku.elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (Sudoku.elapsedTime % 60).toString().padStart(2, '0');
        timeValueElement.textContent = `${minutes}:${seconds}`;
    }

    // 显示规则模态框
    function showRulesModal() {
        rulesModal.classList.remove('opacity-0', 'pointer-events-none');
        rulesModal.querySelector('div').classList.remove('scale-95');
        rulesModal.querySelector('div').classList.add('scale-100');
    }

    // 隐藏规则模态框
    function hideRulesModal() {
        rulesModal.classList.add('opacity-0', 'pointer-events-none');
        rulesModal.querySelector('div').classList.remove('scale-100');
        rulesModal.querySelector('div').classList.add('scale-95');
    }

    // 显示庆祝模态框
    function showCelebrationModal() {
        celebrationModal.classList.remove('opacity-0', 'pointer-events-none');
        celebrationModal.querySelector('div').classList.remove('scale-95');
        celebrationModal.querySelector('div').classList.add('scale-100');
    }

    // 隐藏庆祝模态框
    function hideCelebrationModal() {
        celebrationModal.classList.add('opacity-0', 'pointer-events-none');
        celebrationModal.querySelector('div').classList.remove('scale-100');
        celebrationModal.querySelector('div').classList.add('scale-95');
    }

    // 开始新游戏
    function startNewGame() {
        // 重置游戏状态
        stopTimer();
        Sudoku.gameStarted = false;
        Sudoku.selectedCell = null;
        Sudoku.elapsedTime = 0;
        updateTimerDisplay();
        
        // 生成新的数独谜题
        generateSudoku(Sudoku.difficulty);
        
        // 更新状态
        statusMessage.textContent = '请开始填充数字';
    }

    // 事件监听器
    newGameButton.addEventListener('click', startNewGame);
    checkSolutionButton.addEventListener('click', checkSolution);
    
    // 难度选择
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 更新按钮样式
            difficultyButtons.forEach(btn => btn.classList.remove('active', 'bg-gold/40'));
            button.classList.add('active', 'bg-gold/40');
            
            // 设置难度
            Sudoku.difficulty = button.id;
            
            // 开始新游戏
            startNewGame();
        });
    });
    
    // 规则模态框
    showRulesButton.addEventListener('click', showRulesModal);
    closeRulesButton.addEventListener('click', hideRulesModal);
    closeRulesBtn.addEventListener('click', hideRulesModal);
    
    // 庆祝模态框
    closeCelebrationButton.addEventListener('click', hideCelebrationModal);
    newGameAfterWinButton.addEventListener('click', () => {
        hideCelebrationModal();
        startNewGame();
    });
    
    // 数字键盘
    numButtons.forEach(button => {
        button.addEventListener('click', () => {
            inputNumber(parseInt(button.textContent));
        });
    });
    
    // 清除按钮
    clearButton.addEventListener('click', clearCell);
    
    // 键盘支持
    document.addEventListener('keydown', (e) => {
        // 数字键
        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
        }
        
        // 删除键和退格键
        if (e.key === 'Delete' || e.key === 'Backspace') {
            clearCell();
        }
        
        // 方向键
        if (Sudoku.selectedCell) {
            let { row, col } = Sudoku.selectedCell;
            
            switch (e.key) {
                case 'ArrowUp':
                    row = Math.max(0, row - 1);
                    break;
                case 'ArrowDown':
                    row = Math.min(8, row + 1);
                    break;
                case 'ArrowLeft':
                    col = Math.max(0, col - 1);
                    break;
                case 'ArrowRight':
                    col = Math.min(8, col + 1);
                    break;
                default:
                    return;
            }
            
            // 如果选中的是初始数字，继续向同一方向移动
            while (Sudoku.original[row][col] !== 0) {
                switch (e.key) {
                    case 'ArrowUp':
                        row = Math.max(0, row - 1);
                        break;
                    case 'ArrowDown':
                        row = Math.min(8, row + 1);
                        break;
                    case 'ArrowLeft':
                        col = Math.max(0, col - 1);
                        break;
                    case 'ArrowRight':
                        col = Math.min(8, col + 1);
                        break;
                }
                
                // 如果到达边界，停止
                if ((e.key === 'ArrowUp' && row === 0) || 
                    (e.key === 'ArrowDown' && row === 8) || 
                    (e.key === 'ArrowLeft' && col === 0) || 
                    (e.key === 'ArrowRight' && col === 8)) {
                    break;
                }
            }
            
            selectCell(row, col);
        }
    });

    // 初始化游戏
    initializeBoard();
    generateSudoku(Sudoku.difficulty);
});