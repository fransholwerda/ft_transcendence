// ------------------------------
//CUSTOM PRINTING
const pongPrintColors = [
    'green', 'yellow', 'blue', 'magenta', 'cyan',
    'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy', 'fuchsia',
    'purple', 'orange', 'brown', 'pink', 'gold', 'violet', 'indigo',
    'coral', 'salmon', 'khaki', 'plum', 'orchid', 'turquoise', 'tan'
];
let pongPrintIndex = 0;
const allowPongPrint = true;
export const pongPrint = (message: string) => {
    if (!allowPongPrint) return ;
    const color = pongPrintColors[pongPrintIndex];
    console.log(`%c${message}`, `color: ${color};`);
    pongPrintIndex = (pongPrintIndex + 1) % pongPrintColors.length;
};
// ------------------------------
