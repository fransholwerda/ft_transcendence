// max score
export const MAX_SCORE = 5;

// ------------------------------
// CUSTOM PRINTING
const pongPrintColors = [
    '\x1b[31m', // Red
    '\x1b[32m', // Green
    '\x1b[34m', // Blue
    '\x1b[33m', // Yellow
    '\x1b[35m', // Magenta
    '\x1b[36m'  // Cyan
];
const pongPrintReset = '\x1b[0m'; // Reset to default color
let pongPrintIndex = 0;
const allowPongPrint = true;

export const pongPrint = (message: any) => {
    if (!allowPongPrint) return;
    const color = pongPrintColors[pongPrintIndex];
    console.log(`${color}${message}${pongPrintReset}`);
    pongPrintIndex = (pongPrintIndex + 1) % pongPrintColors.length;
};
// ------------------------------