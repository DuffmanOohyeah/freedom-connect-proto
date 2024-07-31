import { getItem } from '@/app/(site)/hooks/useLocalStorage';
import {
	BusinessUnitState,
	GetCurrentBusinessUnitProps,
} from '@/types/api/businessUnitProvider';
import { BusinessUnit, SessionType } from '@/types/api';
import { Session } from 'next-auth';

const getCurrentBusinessUnit = (
	session: Session | null | undefined,
	state: BusinessUnitState
): GetCurrentBusinessUnitProps => {
	const rtnObj: GetCurrentBusinessUnitProps = { id: 0, name: '' }; // set default return
	const { businessUnit, businessUnits, isLoading }: BusinessUnitState = state;

	/* start: get BU attribues from local storage
		- if the local storage exists, get it - best for accuracy */
	const buObj: string | null = getItem('businessUnit');
	if (buObj) {
		const { id, name }: GetCurrentBusinessUnitProps = JSON.parse(buObj);
		if (id) rtnObj.id = Number(id);
		if (name) rtnObj.name = name.trim();
	}
	/* end: get BU attribues from local storage */

	if (!isLoading) {
		/* start: get BU attributes from state
			- used for better accuracy; still not ideal - to precede logic below */
		if (businessUnit && !rtnObj.id) {
			const { unitId: id, name }: BusinessUnit = businessUnit;
			if (id) rtnObj.id = Number(id);
			if (name) rtnObj.name = name.trim();
		}
		/* end: get BU attributes from state */

		/* start: get BU attributes from session
			- used for 1st time visitors or above not set */
		const userSession: Session | null | undefined = session;
		if (businessUnits && userSession && !rtnObj.id) {
			const { user }: SessionType = userSession;
			if (user) {
				const { unit: unitName } = user;
				if (unitName) {
					rtnObj.name = unitName.trim();
					for (
						let idx: number = 0;
						idx < businessUnits.length;
						idx++
					) {
						const { unitId: id, name }: BusinessUnit =
							businessUnits[idx]; // aka row
						if (rtnObj.name == name.trim()) {
							rtnObj.id = Number(id);
							break;
						}
					}
				}
			}
		}
		/* end: get BU attributes from session */
	}

	// console.log('rtnObj:', rtnObj);
	return rtnObj;
};

export { getCurrentBusinessUnit };
