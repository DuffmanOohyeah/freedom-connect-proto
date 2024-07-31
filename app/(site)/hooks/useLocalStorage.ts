import { PolicyProps } from '@/types/api/policyProps';

const setItem = (key: string, value: string): void => {
	if (typeof window !== 'undefined') localStorage.setItem(key, value);
};

const getItem = (key: string): string | null => {
	let rtnStr: string | null = '';
	if (typeof window !== 'undefined') {
		if (localStorage.getItem(key)) rtnStr = localStorage.getItem(key);
	}
	return rtnStr;
};

const removeItem = (key: string): void => {
	if (typeof window !== 'undefined') localStorage.removeItem(key);
};

const clear = (): void => {
	if (typeof window !== 'undefined') localStorage.clear();
};

const setRecentPolicies = (policy: PolicyProps): void => {
	const { opid, policyNo, policyRef }: PolicyProps = policy;
	let targetArr: PolicyProps[] = [];

	targetArr.unshift({
		opid: opid,
		policyNo: policyNo,
		policyRef: policyRef,
	}); // add newest policy obj to beginning

	const policies: PolicyProps[] = getRecentPolicies();

	if (policies.length) {
		policyLoop: for (let idx = 0; idx < 10; idx++) {
			const row: PolicyProps = policies[idx];
			if (!row) break policyLoop;
			if (row.opid !== opid) targetArr.push(row);
		}
	}

	if (targetArr.length > 10) {
		for (let idx = 10; idx < targetArr.length; idx++) {
			targetArr.splice(idx, 1);
		}
	}

	setItem('recentPolicies', JSON.stringify(targetArr));
};

const getRecentPolicies = (): any[] => {
	let policies: string | null = getItem('recentPolicies');
	let rtnArr: any[] = [];
	if (policies) rtnArr = JSON.parse(policies);
	return rtnArr;
};

const getTripDate = (key: string): string => {
	const tripDates: string | null = getItem('tripDates');
	let rtnStr: string = '';
	if (tripDates) rtnStr = JSON.parse(tripDates)[key];
	return rtnStr;
};

const setTripDate = (key: string, value: string): void => {
	const tripDates: string | null = getItem('tripDates');
	let fromDt: string = '';
	let toDt: string = '';
	if (tripDates) {
		const { from, to } = JSON.parse(tripDates);
		if (from) fromDt = from;
		if (to) toDt = to;
	}
	if (key === 'from') fromDt = value;
	else if (key === 'to') toDt = value;
	setItem('tripDates', JSON.stringify({ from: fromDt, to: toDt }));
};

export {
	setItem,
	getItem,
	removeItem,
	clear,
	setRecentPolicies,
	getRecentPolicies,
	getTripDate,
	setTripDate,
};
