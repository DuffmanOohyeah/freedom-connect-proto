import { GetNoteTypesRes } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface CreateNoteProps {
	opid: string;
	policySpecfic: boolean;
	created: () => void;
}

const CreateNote = ({
	opid,
	policySpecfic,
	created,
}: CreateNoteProps): JSX.Element => {
	const [noteTypes, setNoteTypes] = useState<GetNoteTypesRes[]>([]);
	const [selectedNoteType, setSelectedNoteType] =
		useState<GetNoteTypesRes | null>(null);
	const [noteContents, setNoteContents] = useState<string>('');
	const [deviceId, setDeviceId] = useState<number | null>(null);
	const [submitEnabled, setSubmitEnabled] = useState<boolean>(false);
	const [createNoteError, setCreateNoteError] = useState<string>('');

	useEffect(() => {
		if (selectedNoteType && noteContents.length > 0) setSubmitEnabled(true);
		else setSubmitEnabled(false);
	}, [selectedNoteType, noteContents]);

	const { isLoading } = useQuery(
		['getNoteTypes'],
		async () => {
			const response = await fetch(`${BaseUrl}/portal/note/type`, {
				method: 'GET',
				headers: await getApiHeaders(),
			});
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const resPolicies = (await response.json()) as GetNoteTypesRes[];
			setNoteTypes(resPolicies);
			return true;
		},
		{
			retry: false,
		}
	);

	const createNote = useMutation(['createNote'], {
		mutationFn: async (): Promise<boolean> => {
			setCreateNoteError('');
			const response = await fetch(`${BaseUrl}/portal/note`, {
				method: 'POST',
				body: JSON.stringify({
					noteTypeId: selectedNoteType?.noteTypeId,
					note: noteContents,
					opid: parseInt(opid),
					policySpecific: policySpecfic,
					deviceId: deviceId,
				}),
				headers: await getApiHeaders(),
			});

			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				else setCreateNoteError(res.errorMessage);
				throw new Error('Network response was not ok');
			}

			if (response.status === 200) {
				setNoteContents('');
				setSelectedNoteType(null);
				created();
			}

			return true;
		},
	});

	return (
		<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full text-shark'>
			{isLoading && (
				<div className='bg-gray-200 w-32 h-8 animate-pulse' />
			)}

			{!isLoading && (
				<>
					<h1 className='text-lg font-semibold'>New Note</h1>
					<Listbox
						value={selectedNoteType}
						onChange={setSelectedNoteType}
					>
						<div className='relative'>
							<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-placeholder-bg shadow-none text-left'>
								<span
									className={`${
										!selectedNoteType &&
										'text-placeholder-text font-medium'
									}`}
								>
									{selectedNoteType?.type ||
										'Select Note Type'}
								</span>
								<span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
									<ChevronUpDownIcon
										className='h-5 w-5 text-placeholder-text'
										aria-hidden='true'
									/>
								</span>
							</Listbox.Button>
							<Transition
								as='div'
								leave='transition ease-in duration-100'
								leaveFrom='opacity-100'
								leaveTo='opacity-0'
							>
								<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-placeholder-bg py-1 text-xs shadow-lg'>
									{noteTypes.map((noteType, idx) => (
										<Listbox.Option
											key={idx}
											className={({ active }) =>
												`relative cursor-default select-none py-2 pl-10 pr-4 ${
													active && 'bg-shark-100/10'
												}`
											}
											value={noteType}
										>
											{({ selected }) => (
												<>
													<span
														className={`block truncate ${
															selected
																? 'font-medium text-shark'
																: 'font-normal'
														}`}
													>
														{noteType.type}
													</span>
													{selected && (
														<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-shark'>
															<CheckIcon
																className='h-5 w-5'
																aria-hidden='true'
															/>
														</span>
													)}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					</Listbox>
					<textarea
						name='newnote'
						className='mt-6 h-32 px-4 py-3 rounded-xl border-0 bg-placeholder-bg placeholder:text-placeholder-text placeholder:font-medium focus:ring-0 shadow-none'
						placeholder='Type your note here...'
						value={noteContents}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setNoteContents(e.target.value)
						}
					/>
					{/*
						<div className='mt-2 flex justify-between'>
						<label>
							<input
							type='checkbox'
							className='text-jagged-ice-550 border-aqua-haze-600 focus:ring-0 checked:checkbox-checked mr-4'
							defaultChecked
							/>
							<span className='font-semibold'>Pin this note</span>
						</label>
						<span className='text-xs'>0/500 characters</span>
						</div>
					*/}

					<button
						onClick={() => createNote.mutate()}
						disabled={!submitEnabled || createNote.isLoading}
						className='mt-8 text-xs text-white font-medium bg-shark hover:bg-shark-450 shadow-tile-shadow px-4 py-2 rounded-full flex items-center justify-center cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed'
					>
						Submit Note
					</button>

					{createNoteError && (
						<h4 className='text-xs font-medium mt-4 text-red-500'>
							{createNoteError}
						</h4>
					)}
				</>
			)}
		</div>
	);
};

export default CreateNote;
