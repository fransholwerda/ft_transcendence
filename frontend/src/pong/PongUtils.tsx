// ------------------------------
//CUSTOM PRINTING
const pongPrintColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
let pongPrintIndex = 0;
const allowPongPrint = true;
export const pongPrint = (message: string) => {
	if (!allowPongPrint) return ;
	const color = pongPrintColors[pongPrintIndex];
	console.log(`%c${message}`, `color: ${color};`);
	pongPrintIndex = (pongPrintIndex + 1) % pongPrintColors.length;
};
// ------------------------------
