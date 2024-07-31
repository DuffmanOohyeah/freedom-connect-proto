import React, { useState } from 'react';
import { GetPolicyNotesRes, Note } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import PolicyNotePin from './PolicyNotePin';
import { Popover, Transition } from '@headlessui/react';
import _ from 'lodash';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface PolicyNotesTableProps {
	opid: string | null;
	indexNumber: number;
}

const PolicyNotesTable = ({
	opid,
	indexNumber,
}: PolicyNotesTableProps): JSX.Element => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [noteTypes, setNoteTypes] = useState<string[]>([]);
	const [checked, setChecked] = useState<string[]>([]);

	const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
		var updatedList = [...checked];
		if (event.target.checked)
			updatedList = [...checked, event.target.value];
		else updatedList.splice(checked.indexOf(event.target.value), 1);
		setChecked(updatedList);
	};

	useQuery(
		['getPolicyNotes', indexNumber],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/note?opid=${opid}`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				throw new Error('Network response was not ok');
			}
			const resPolicies = (await response.json()) as GetPolicyNotesRes;
			if (resPolicies.notes) {
				setNotes(resPolicies.notes);
				const typeAry: string[] = [];
				_.filter(resPolicies.notes, (n) => {
					if (n.type && !typeAry.includes(n.type)) {
						typeAry.push(n.type);
						return n.type;
					}
				});
				const sortedTypeAry = _.sortBy(typeAry, (o) => o);
				setNoteTypes(sortedTypeAry);
				setChecked(sortedTypeAry);
			}
			return true;
		},
		{ enabled: opid ? true : false }
	);

	return (
		<div className='bg-white rounded-2xl shadow-tile-shadow px-8 py-6 w-full text-shark'>
			<div className='flex flex-row justify-between'>
				<h1 className='basis-1/8 text-lg font-semibold flex items-center whitespace-pre mr-4'>
					Notes
				</h1>
				<div className='relative flex justify-end gap-8 whitespace-pre'>
					<Popover className='relative'>
						{({ open }) => (
							<>
								<Popover.Button
									className={`${
										open ? '' : ''
									} group inline-flex items-end gap-1 text-xs`}
								>
									<FunnelIcon
										className={`w-6 stroke-transparent ${
											checked.length < noteTypes.length
												? 'fill-jagged-ice stroke-shark/50'
												: 'fill-shark'
										}`}
									/>
									<span className='text-[10px] text-shark/50'>{`${
										_.filter(notes, (n) =>
											checked.includes(n.type || '')
										).length
									}/${notes.length}`}</span>
									{/* <FiFilter className='text-base' /> */}
								</Popover.Button>
								<Transition
									as='div'
									enter='transition ease-out duration-200'
									enterFrom='opacity-0 translate-y-1'
									enterTo='opacity-100 translate-y-0'
									leave='transition ease-in duration-150'
									leaveFrom='opacity-100 translate-y-0'
									leaveTo='opacity-0 translate-y-1'
								>
									<Popover.Panel className='absolute -left-28 -top-4 z-10 mt-3 max-w-sm -translate-x-1/2 transform'>
										<div className='overflow-hidden p-4 rounded-lg shadow-lg bg-shark'>
											<div className='flex flex-col gap-4'>
												{noteTypes.map((type) => (
													<label key={type}>
														<input
															type='checkbox'
															value={type}
															name={type}
															className='text-jagged-ice-550 border-0 ring-0 outline-none focus:outline-none focus:ring-0 checked:checkbox-checked mr-4'
															onChange={
																handleCheck
															}
															checked={checked.includes(
																type
															)}
														/>
														<span className='text-xs text-white'>
															{type}
														</span>
													</label>
												))}
												<div className='flex flex-row gap-4 text-xs'>
													<button
														type='button'
														className='bg-jagged-ice text-shark rounded-full w-full px-4 py-2 font-medium hover:bg-jagged-ice-550'
														onClick={() =>
															setChecked(
																noteTypes
															)
														}
													>
														All
													</button>
													<button
														type='button'
														className='bg-jagged-ice text-shark rounded-full w-full px-4 py-2 font-medium hover:bg-jagged-ice-550'
														onClick={() =>
															setChecked([])
														}
													>
														None
													</button>
												</div>
											</div>
										</div>
									</Popover.Panel>
								</Transition>
							</>
						)}
					</Popover>
					{/* <span className='text-xs flex items-center gap-2'>
						<FiCalendar className='text-base' />
						01/02/2023 to 05/02/2023
					</span> */}
				</div>
			</div>
			<div className='mt-8 grid grid-cols-1 divide-y-[0.5px] divide-divider max-h-screen overflow-y-auto'>
				{_.filter(notes, (n) => {
					if (checked.length === 0) return false;
					if (n.type) return checked.includes(n.type);
					else return false;
				})
					.sort((a: Note, b: Note) => {
						if (a.createdDTM > b.createdDTM) return -1;
						else if (a.createdDTM > b.createdDTM) return 1;
						else return 0;
					})
					.sort((a: Note, b: Note) => {
						if (a.pinnedDTM && b.pinnedDTM === null) return -1;
						else if (a.pinnedDTM === null && b.pinnedDTM) return 1;
						else return 0;
					})
					.map((note: Note) => {
						return (
							<div
								className='flex flex-col py-1 text-shark'
								key={note.noteId}
							>
								<div className='flex flex-row justify-between w-full mb-2'>
									<div className='flex flex-col'>
										<span className='text-[10px] text-shark/50'>
											<span className='font-medium inline-block mr-1'>
												Type:
											</span>
											{note.type}
										</span>
										<span className='text-[10px] text-shark/50'>
											<span className='font-medium inline-block mr-1'>
												Created By:
											</span>
											{note.createdBy}
										</span>
									</div>
									<PolicyNotePin note={note} />
								</div>
								<div className='flex items-center justify-between'>
									<p className='text-xs'>{note.note}</p>
								</div>
								<div className='flex items-center justify-between mt-1'>
									<span></span>
									<p className='text-xs'>
										{format(
											new Date(note.createdDTM),
											'yyyy-MM-dd HH:mm'
										)}
									</p>
								</div>
							</div>
						);
					})}
				{notes.length === 0 && (
					<p className='text-xs'>Currently no notes</p>
				)}
			</div>
		</div>
	);
};

export default PolicyNotesTable;
