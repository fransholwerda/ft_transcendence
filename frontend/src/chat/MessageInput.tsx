import { useState } from "react"

export default function MessageInput({ send }: { send: (val: string) => void }) {
	const [value, setValue] = useState("")
	return (
		<>
			<input onChange={(e)=>setValue(e.target.value)}
				placeholder="Type your message..."
				value={value}
				onKeyDown={event => {
					if (event.key === 'Enter' && value.length > 0) {
						send(value)
						setValue('')
					}
				}} />
		</>
	)
}