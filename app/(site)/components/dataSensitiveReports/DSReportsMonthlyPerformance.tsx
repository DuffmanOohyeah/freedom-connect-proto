import React, { useState, useEffect, useContext } from 'react';
import { BaseUrl, getApiHeaders } from '@/app/utils';
import LoadingSpinner from '../LoadingSpinner';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import {
	GetMonthlyPerformanceResponseProps,
	MonthlyPerformanceObjectProps,
} from '@/types/api/monthlyPerformance';
import BusinessUnitSelector from '../../reporting/BusinessUnitSelector';
import { CSVLink } from 'react-csv';
import { BiExport } from 'react-icons/bi';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { BusinessUnitContextType } from '@/types/api/businessUnitProvider';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { useSession } from 'next-auth/react';

const getArray4Csv = (
	report: MonthlyPerformanceObjectProps
): (string | number)[][] => {
	const {
		unitName,
		reportMonth,
		reportYear,
		devicesVolume: {
			activeDevices,
			newDevices,
			cancelledDevices,
			closingBalanceActiveDevices,
		},
		policyVolume: { activePolicies, newPolicies, cancelledPolicies },
		drivingRiskReporting: {
			extremeSpeeding100MphCancelled,
			suspectedBusinessUse,
			exceedMilage,
			riskAddress,
			extremeSpeedingLevel1,
			extremeSpeedingLevel2Cancellation,
			scoreCancel,
		},
		deviceServiceManagement: {
			unpluggedDevices,
			dispatchDuration,
			daysFromPurchaseToInstall,
			installedWithin7Days,
			installedWithin14Days,
			installedAfter14Days,
		},
		deviceReturnSpilt: { returnRatePct, twelveVoltPct, obdPct },
		complianceCancellations: {
			deviceNotInstalledWarning,
			deviceNotInstalledCancelled,
			noDataWarning,
			noDataCancelled,
			covWarning,
			covCancelled,
			totalTelematicsCancelled,
		},
		fnol: { alertsReceived, falsePositives, successPct },
	} = report;

	const rtnArr: (string | number)[][] = [
		[
			`${unitName}`,
			'KPI Report Date:',
			`${getMonthName(reportMonth - 1)} / ${reportYear}`,
		],

		/* start: devicesVolume */
		['Devices Volume'],
		['', 'Opening Balance Active Devices:', activeDevices],
		['', 'New Devices:', newDevices],
		['', 'Cancelled Devices:', cancelledDevices],
		['', 'Closing Balance Active Devices:', closingBalanceActiveDevices],
		/* end: devicesVolume */

		/* start: policyVolume */
		['Policy Volume'],
		['', 'New Policies:', newPolicies],
		['', 'Cancelled Policies:', cancelledPolicies],
		['', 'Active Policies: (date ignored)', activePolicies],
		/* end: policyVolume */

		/* start: drivingRiskReporting */
		['Driving Risk Reporting'],
		['', 'Extreme Speeding Level 1:', extremeSpeedingLevel1],
		[
			'',
			'Extreme Speeding Level 2 Cancellation:',
			extremeSpeedingLevel2Cancellation,
		],
		[
			'',
			'Extreme Speeding Cancel > 100mph:',
			extremeSpeeding100MphCancelled,
		],
		['', 'Score Cancel:', scoreCancel],
		['', 'Suspected Business Use:', suspectedBusinessUse],
		['', 'Exceed Milage:', exceedMilage],
		['', 'Risk Address:', riskAddress],
		['', 'Suspected Jammer Usage:', 'TODO'],
		/* end: drivingRiskReporting */

		/* start: deviceServiceManagement */
		['Device Service Management'],
		['', 'Unplugged Devices:', unpluggedDevices],
		['', 'Dispatch Duration:', dispatchDuration],
		['', 'Days From Purchase To Install:', daysFromPurchaseToInstall],
		['', 'Installed Within 7 Days:', installedWithin7Days],
		['', 'Installed within 8 - 14 days:', installedWithin14Days],
		['', 'Installed After Day 14:', installedAfter14Days],
		/* end: deviceServiceManagement */

		/* start: deviceReturnSpilt */
		['Device Return/Spilt'],
		['', 'Return Rate:', returnRatePct],
		['', '12v %:', `${twelveVoltPct} %`],
		['', 'OBD %:', `${obdPct} %`],
		/* end: deviceReturnSpilt */

		/* start: complianceCancellations */
		['Compliance Cancellations'],
		['', 'Device Not Installed Warning:', deviceNotInstalledWarning],
		['', 'Device Not Installed Cancellation:', deviceNotInstalledCancelled],
		['', 'No Data Warning:', noDataWarning],
		['', 'No Data Cancellation:', noDataCancelled],
		['', 'COV Warning:', covWarning],
		['', 'COV Cancellation:', covCancelled],
		['', 'Total Telematics Cancellations:', totalTelematicsCancelled],
		/* end: complianceCancellations */

		/* start: fnol */
		['FNOL'],
		['', 'Alerts Received:', alertsReceived],
		['', 'False Positives:', falsePositives > 0 ? falsePositives : 'TODO'],
		['', 'Success %:', successPct > 0 ? `${successPct} %` : 'TODO'],
		/* end: fnol */
	];

	// console.log('rtnArr:', rtnArr);

	return rtnArr;
};

const getDateNow = (unit: string = 'long') => {
	const dt = new Date();
	let rtnDt: any = dt; // unit = long

	switch (unit) {
		case 'month':
			rtnDt = dt.getMonth(); // returns the month (0 to 11) of a date
			break;
		case 'year':
			rtnDt = dt.getFullYear(); // i.e. 2024, 2023
			break;
	}

	return rtnDt;
};

const getMonthName = (month: number): string => {
	const dt = getDateNow('long');
	dt.setMonth(month);
	const monthName = dt.toLocaleString('default', { month: 'long' });
	return monthName;
};

const getMonthSelect = (
	month: number,
	setMonth: ((value: number) => void) | undefined
): JSX.Element => {
	const monthArr: number[] = [];
	for (let idx: number = 0; idx < 12; idx++) {
		monthArr.push(idx);
	}

	return (
		<Listbox value={month} onChange={setMonth}>
			<div className='relative'>
				<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-slate-200 shadow-none text-left'>
					<>
						<span className='pr-5'>
							{month > -1 ? getMonthName(month) : 'Choose month'}
						</span>
						<span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
							<ChevronUpDownIcon
								className='h-5 w-5'
								aria-hidden='true'
							/>
						</span>
					</>
				</Listbox.Button>
				<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-xs shadow-lg bg-white'>
					{monthArr.map((mm, idx) => (
						<Listbox.Option
							key={idx}
							value={mm}
							className={({ active }) =>
								`relative cursor-default select-none py-2 pl-3 pr-10 ${
									active && 'bg-slate-200'
								}`
							}
						>
							{({ selected }) => (
								<>
									<span
										className={`${
											selected
												? 'font-medium'
												: 'font-normal'
										}`}
									>
										{getMonthName(mm)}
									</span>
									{selected && (
										<span className='absolute inset-y-0 right-0 flex items-center'>
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
			</div>
		</Listbox>
	);
};

const getYearSelect = (
	year: number,
	setYear: ((value: number) => void) | undefined
): JSX.Element => {
	const yearArr: number[] = [];
	for (let idx = 0; idx < 5; idx++) {
		yearArr.push(getDateNow('year') - idx);
	}

	return (
		<Listbox value={year} onChange={setYear}>
			<div className='relative'>
				<Listbox.Button className='relative listbox mt-4 px-4 border-0 bg-slate-200 shadow-none text-left'>
					<>
						<span className='pr-5'>
							{year > 0 ? year : 'Choose year'}
						</span>
						<span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
							<ChevronUpDownIcon
								className='h-5 w-5'
								aria-hidden='true'
							/>
						</span>
					</>
				</Listbox.Button>
				<Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-xs shadow-lg bg-white'>
					{yearArr.map((yr, idx) => (
						<Listbox.Option
							key={idx}
							value={yr}
							className={({ active }) =>
								`relative cursor-default select-none py-2 pl-3 pr-10 ${
									active && 'bg-slate-200'
								}`
							}
						>
							{({ selected }) => (
								<>
									<span
										className={`${
											selected
												? 'font-medium'
												: 'font-normal'
										}`}
									>
										{yr}
									</span>
									{selected && (
										<span className='absolute inset-y-0 right-0 flex items-center'>
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
			</div>
		</Listbox>
	);
};

const DSReportsMonthlyPerformance = (): JSX.Element => {
	const [month, setMonth] = useState<number>(-1);
	const [year, setYear] = useState<number>(-1);
	const [errorMsg, setErrorMsg] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [report, setReport] = useState<MonthlyPerformanceObjectProps | null>(
		null
	);
	const [unitId, setUnitId] = useState<number>(0);
	const { data: session } = useSession();
	const { state }: BusinessUnitContextType = useContext(BusinessUnitCtx)!;

	const reloadBusinessUnit = (): void => {
		const currentBU = getCurrentBusinessUnit(session, state);
		setUnitId(currentBU.id || 0);
	};

	const getReport = async (
		mm: number,
		yy: number,
		uid: number
	): Promise<void> => {
		setLoading(true);
		setErrorMsg('');
		setReport(null);

		if (mm > -1 && yy > -1 && uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/monthlyPerformance?m=${
					mm + 1 // up the month by 1 for the SP/MySQL
				}&y=${yy}&uid=${uid}`,
				{
					headers: await getApiHeaders(),
					method: 'GET',
				}
			);
			if (response.ok) {
				const body =
					(await response.json()) as GetMonthlyPerformanceResponseProps;
				setReport(body.report); // should return {'xxx', yyy, etc...}
			} else setErrorMsg('An error occurred when calling the report.');
		} else setErrorMsg('Please choose a selection from each option.');

		setLoading(false);
	};

	useEffect(() => {
		reloadBusinessUnit();
		getReport(month, year, unitId);
	}, [month, year, unitId /*, session, state*/]);

	return (
		<div>
			<div className='flex space-x-3 items-center'>
				<BusinessUnitSelector showGoBtn={false} />
				<div className='w-40 pb-3'>
					{getMonthSelect(month, setMonth)}
				</div>
				<div className='w-40 pb-3'>{getYearSelect(year, setYear)}</div>
				<div className='w-40'>
					<button
						className='w-14 text-xs px-4 py-3 rounded-full bg-jagged-ice hover:bg-jagged-ice-550 text-shark'
						onClick={(evt) => {
							evt.preventDefault();
							reloadBusinessUnit();
						}}
					>
						Go
					</button>
				</div>
				{!errorMsg && !loading && report && (
					<div className='pl-10'>
						<CSVLink
							className='action-btn w-24 flex flex-row justify-between items-center'
							data={getArray4Csv(report)}
							filename={`monthly-performance-${report.unitName.replace(/ /g, '_')}-${getMonthName(
								month
							)}-${year}.csv`}
						>
							<BiExport />
							Export
						</CSVLink>
					</div>
				)}
			</div>
			<br />
			{errorMsg && <p className='text-sm'>{errorMsg}</p>}
			{loading && <LoadingSpinner />}
			{!errorMsg && !loading && (
				<div>
					{report ? (
						<table className='w-full table-auto border-separate border-spacing-y-3 text-sm'>
							<thead>
								<tr className='text-left'>
									<th>KPI Report Date:</th>
									<th>
										{getMonthName(report.reportMonth - 1)} /{' '}
										{report.reportYear}
									</th>
								</tr>
							</thead>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>Devices Volume</th>
								</tr>
								<tr>
									<td>Opening Balance Active Devices:</td>
									<td>
										{report.devicesVolume.activeDevices}
									</td>
								</tr>
								<tr>
									<td>New Devices:</td>
									<td>{report.devicesVolume.newDevices}</td>
								</tr>
								<tr>
									<td>Cancelled Devices:</td>
									<td>
										{report.devicesVolume.cancelledDevices}
									</td>
								</tr>
								<tr>
									<td>Closing Balance Active Devices:</td>
									<td>
										{
											report.devicesVolume
												.closingBalanceActiveDevices
										}
									</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>Policy Volume</th>
								</tr>
								<tr>
									<td>New Policies:</td>
									<td>{report.policyVolume.newPolicies}</td>
								</tr>
								<tr>
									<td>Cancelled Policies:</td>
									<td>
										{report.policyVolume.cancelledPolicies}
									</td>
								</tr>
								<tr>
									<td>Active Policies: (date ignored)</td>
									<td>
										{report.policyVolume.activePolicies}
									</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>Driving Risk Reporting</th>
								</tr>
								<tr>
									<td>Extreme Speeding Level 1:</td>
									<td>
										{
											report.drivingRiskReporting
												.extremeSpeedingLevel1
										}
									</td>
								</tr>
								<tr>
									<td>
										Extreme Speeding Level 2 Cancellation:
									</td>
									<td>
										{
											report.drivingRiskReporting
												.extremeSpeedingLevel2Cancellation
										}
									</td>
								</tr>
								<tr>
									<td>
										Extreme Speeding Cancel &gt; 100mph:
									</td>
									<td>
										{
											report.drivingRiskReporting
												.extremeSpeeding100MphCancelled
										}
									</td>
								</tr>
								<tr>
									<td>Score Cancel:</td>
									<td>
										{
											report.drivingRiskReporting
												.scoreCancel
										}
									</td>
								</tr>
								<tr>
									<td>Suspected Business Use:</td>
									<td>
										{
											report.drivingRiskReporting
												.suspectedBusinessUse
										}
									</td>
								</tr>
								<tr>
									<td>Exceeding Mileage:</td>
									<td>
										{
											report.drivingRiskReporting
												.exceedMilage
										}
									</td>
								</tr>
								<tr>
									<td>Risk Address:</td>
									<td>
										{
											report.drivingRiskReporting
												.riskAddress
										}
									</td>
								</tr>
								<tr>
									<td>Suspected Jammer Usage:</td>
									<td>TODO</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>
										Device / Service Management
									</th>
								</tr>
								<tr>
									<td>Unplugged Devices:</td>
									<td>
										{
											report.deviceServiceManagement
												.unpluggedDevices
										}
									</td>
								</tr>
								<tr>
									<td>Dispatch Duration:</td>
									<td>
										{
											report.deviceServiceManagement
												.dispatchDuration
										}
									</td>
								</tr>
								<tr>
									<td>Days from Purchase to Install:</td>
									<td>
										{
											report.deviceServiceManagement
												.daysFromPurchaseToInstall
										}
									</td>
								</tr>
								<tr>
									<td>Installed within 7 days:</td>
									<td>
										{
											report.deviceServiceManagement
												.installedWithin7Days
										}
									</td>
								</tr>
								<tr>
									<td>Installed within 8 - 14 days:</td>
									<td>
										{
											report.deviceServiceManagement
												.installedWithin14Days
										}
									</td>
								</tr>
								<tr>
									<td>Installed after day 14:</td>
									<td>
										{
											report.deviceServiceManagement
												.installedAfter14Days
										}
									</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>Device Return / Split</th>
								</tr>
								<tr>
									<td>Return Rate:</td>
									<td>
										{report.deviceReturnSpilt.returnRatePct}
									</td>
								</tr>
								<tr>
									<td>12v %:</td>
									<td>
										{report.deviceReturnSpilt.twelveVoltPct}{' '}
										%
									</td>
								</tr>
								<tr>
									<td>OBD %:</td>
									<td>{report.deviceReturnSpilt.obdPct} %</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>
										Compliance Cancellations
									</th>
								</tr>
								<tr>
									<td>Device Not installed Warning:</td>
									<td>
										{
											report.complianceCancellations
												.deviceNotInstalledWarning
										}
									</td>
								</tr>
								<tr>
									<td>Device Not Installed Cancellation:</td>
									<td>
										{
											report.complianceCancellations
												.deviceNotInstalledCancelled
										}
									</td>
								</tr>
								<tr>
									<td>No Data Warning:</td>
									<td>
										{
											report.complianceCancellations
												.noDataWarning
										}
									</td>
								</tr>
								<tr>
									<td>No Data Cancellation:</td>
									<td>
										{
											report.complianceCancellations
												.noDataCancelled
										}
									</td>
								</tr>
								<tr>
									<td>COV Warning:</td>
									<td>
										{
											report.complianceCancellations
												.covWarning
										}
									</td>
								</tr>
								<tr>
									<td>COV Cancellation:</td>
									<td>
										{
											report.complianceCancellations
												.covCancelled
										}
									</td>
								</tr>
								<tr>
									<td>Total Telematics Cancellations:</td>
									<td>
										{
											report.complianceCancellations
												.totalTelematicsCancelled
										}
									</td>
								</tr>
							</tbody>

							<tbody>
								<tr className='text-left bg-slate-300'>
									<th colSpan={2}>FNOL</th>
								</tr>
								<tr>
									<td>FNOL Alerts Received:</td>
									<td>{report.fnol.alertsReceived}</td>
								</tr>
								<tr>
									<td>False Positives:</td>
									<td>
										{report.fnol.falsePositives > 0
											? report.fnol.falsePositives
											: 'TODO'}
									</td>
								</tr>
								<tr>
									<td>Succesful FNOL %:</td>
									<td>
										{report.fnol.successPct > 0
											? `${report.fnol.successPct} %`
											: 'TODO'}
									</td>
								</tr>
							</tbody>
						</table>
					) : (
						<p className='text-sm'>No records found.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default DSReportsMonthlyPerformance;
