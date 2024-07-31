import { Note } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { BsPinAngle, BsPinFill } from 'react-icons/bs';

const PolicyNotePin = ({ note }: { note: Note }): JSX.Element => {
	const [pinned, setPinned] = useState<boolean>(
		note.pinnedDTM ? true : false
	);
	const pinNote = useMutation(['createNote'], {
		mutationFn: async (newPinnedState: boolean): Promise<boolean> => {
			setPinned(newPinnedState);
			const response = await fetch(`${BaseUrl}/portal/note/pin`, {
				method: 'PUT',
				body: JSON.stringify({
					noteId: note.noteId,
					pin: newPinnedState,
				}),
				headers: await getApiHeaders(),
			});

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			} else return true;
		},
	});

	return (
		<button onClick={() => pinNote.mutate(!pinned)}>
			{pinned ? <BsPinFill /> : <BsPinAngle />}
		</button>
	);
};

export default PolicyNotePin;
