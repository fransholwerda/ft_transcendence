import React from 'react';

interface MessagesProps {
	messages: string[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
	//console.log('Rendering messages:', messages);
	return (
		<div>
		{messages.map((message, index) => (
			<div key={index}>{message}</div>
		))}
		</div>
	);
};

export default Messages;
