import { getItem, getTripDate } from '@/app/(site)/hooks/useLocalStorage';

export interface GetTripDatesProps {
	dtFrom: number;
	dtTo: number;
	daysInPast: number;
}

const getTripDates = (opid: string): GetTripDatesProps => {
	const dtNew: number = new Date().getTime();
	const lastOpid: number = Number(getItem('lastOpid')) || 0;
	let dtFrom: number = dtNew;
	let dtTo: number = dtNew;
	let daysInPast: number = 7;

	if (lastOpid === Number(opid)) {
		const lsFromDate: string = getTripDate('from');
		if (lsFromDate) dtFrom = Date.parse(lsFromDate);

		const lsToDate: string = getTripDate('to');
		if (lsToDate) dtTo = Date.parse(lsToDate);

		if (lsFromDate || lsToDate) daysInPast = 0;
	}

	return { dtFrom, dtTo, daysInPast };
};

export { getTripDates };
