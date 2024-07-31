'use client';
import React, { useContext } from 'react';
import { BusinessUnitCtx } from '../components/providers/BusinessUnitProvider';
import { setItem, removeItem } from '@/app/(site)/hooks/useLocalStorage';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { useSession } from 'next-auth/react';

interface BusinessUnitSelectorProps {
	showGoBtn?: boolean;
}

const BusinessUnitSelector = ({
	showGoBtn = true,
}: BusinessUnitSelectorProps): JSX.Element => {
	const { data: session } = useSession();
	const { state, dispatch }: BusinessUnitContextType =
		useContext(BusinessUnitCtx)!;
	const { isLoading, businessUnits } = state;
	const buObj = getCurrentBusinessUnit(session, state);
	const buId: number = buObj.id || 0;
	//const buName: string = buObj.name || '';

	const onSelectChange = (
		evt: React.ChangeEvent<HTMLSelectElement>
	): void => {
		//console.log('evt', evt);
		const option = evt.target.options[evt.target.selectedIndex];
		const name: string = option.label;
		const unitId: number = Number(option.value);
		setBuState(unitId, name);

		/* start: just for a short time - until removed from all users */
		removeItem('businessUnitId');
		removeItem('businessUnitName');
		/* end: just for a short time - until removed from all users */
	};

	const onButtonClick = (): void => {
		const elem: any = document.getElementById('buSelect');
		let idx: number = -1;
		let buId: number = 0;
		let buName: string = '';

		if (elem) {
			idx = elem.options.selectedIndex;
			if (idx > -1) {
				buId = Number(elem.options[idx].value);
				buName = elem.options[idx].text;
				setBuState(buId, buName);
			}
		}
	};

	const setBuState = (unitId: number, name: string): void => {
		if (unitId > 0) {
			setItem(
				'businessUnit',
				JSON.stringify({
					id: unitId,
					name: name,
				})
			);
			dispatch({
				type: 'UPDATE_BU',
				payload: { name: name, unitId: unitId },
			});
		}
	};

	return (
		<div className='flex flex-row justify-end items-center whitespace-pre h-8 space-x-3'>
			<select
				disabled={isLoading}
				defaultValue={buId}
				className='bg-slate-200 text-black w-44'
				onChange={(evt) => {
					evt.preventDefault();
					onSelectChange(evt);
				}}
				id='buSelect'
			>
				<optgroup label='Choose a business unit'>
					{businessUnits.map((unit, idx) => {
						const { name, unitId } = unit;
						let isSelected: boolean = false;
						let selectedClass: string = '';
						if (buId === unitId) {
							isSelected = true;
							selectedClass =
								'bg-slate-500 font-bold text-yellow-300';
						}
						return (
							<option
								value={unitId}
								className={selectedClass}
								key={idx}
								selected={isSelected}
							>
								{name}
							</option>
						);
					})}
				</optgroup>
			</select>
			{showGoBtn && (
				<button
					type='button'
					className='action-btn w-14'
					onClick={(evt) => {
						evt.preventDefault();
						onButtonClick();
					}}
				>
					Go
				</button>
			)}
		</div>
	);
};

export default BusinessUnitSelector;
