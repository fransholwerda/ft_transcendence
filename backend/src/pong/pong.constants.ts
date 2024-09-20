// max score
export const MAX_SCORE = 10;

// ------------------------------
// CUSTOM PRINTING
const pongPrintColors = [
    '\x1b[92m', // Bright Green
    '\x1b[93m', // Bright Yellow
    '\x1b[94m', // Bright Blue
    '\x1b[95m', // Bright Magenta
    '\x1b[96m'  // Bright Cyan
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
