import React, { useState } from 'react';

interface MessageInputProps {
	send: (val: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ send }) => {
	const [value, setValue] = useState('');

	return (
		<div>
			<input
				type="text"
				placeholder="Type your message..."
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && value.length > 0) {
						send(value);
						setValue('');
					}
				}}
			/>
		</div>
	);
};

export default MessageInput;
