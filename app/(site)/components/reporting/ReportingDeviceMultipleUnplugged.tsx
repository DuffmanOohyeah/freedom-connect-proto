import {
	GetDeviceMultipleUnpluggedReport,
	DeviceMultipleUnpluggedReport,
} from '@/types/api/deviceMultipleUnplugged';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { format } from 'date-fns';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import ReportTable from '../table/ReportingTable';
import { createColumnHelper } from '@tanstack/react-table';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';

interface UnplugProps {
	date: string;
}

const getSortedDates = (
	unplugs: string,
	getLatest: boolean = false
): string | UnplugProps[] => {
	let sortedDates: UnplugProps[] = [];

	if (unplugs) {
		const unplugDates: UnplugProps[] = JSON.parse(unplugs);
		sortedDates = unplugDates.sort((a: UnplugProps, b: UnplugProps) => {
			return new Date(b.date).valueOf() - new Date(a.date).valueOf();
		});
	}

	if (getLatest) return sortedDates[0].date.toString();
	else return sortedDates;
};

const ReportingDeviceMultipleUnplugged = (): JSX.Element => {
	const [reportData, setReportData] = useState<
		DeviceMultipleUnpluggedReport[]
	>([]);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const [showDiv, setShowDiv] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const dtMask: string = 'dd/MM/yyyy HH:mm';

	const columnHelper = createColumnHelper<DeviceMultipleUnpluggedReport>();

	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy No.',
			cell: (info) => {
				const policyNo = info.getValue();
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='underline font-semibold'
					>
						{policyNo}
					</Link>
				);
			},
		}),
		columnHelper.accessor('forename', {
			header: 'Forename',
			cell: (info) => {
				return <div className=''>{info.getValue()}</div>;
			},
		}),
		columnHelper.accessor('surname', {
			header: 'Surname',
			cell: (info) => {
				return <div className=''>{info.getValue()}</div>;
			},
		}),
		columnHelper.accessor('lastUnPlugDTM', {
			header: 'Last Unplug Date',
			cell: (info) => {
				let value: any = info.getValue(); // get default from SP data
				value = getSortedDates(info.row.original.unplugs, true);
				{
					return (
						<div className=''>
							{value ? format(new Date(value), dtMask) : ''}
						</div>
					);
				}
			},
		}),
		columnHelper.accessor('unplugCount', {
			header: 'Unplug Count',
			cell: (info) => {
				const unplugDates: UnplugProps[] | string = getSortedDates(
					info.row.original.unplugs,
					false
				);
				const divName: string = `div${info.row.original.policyNo}`;

				return (
					<>
						<button
							onClick={(evt) => {
								evt.preventDefault();
								setShowDiv(showDiv ? '' : divName);
							}}
							className='pl-8'
						>
							<span className='underline font-semibold'>
								{info.getValue()}
							</span>
						</button>
						<br />
						<div
							id={`${divName}`}
							className={`text-black p-1 rounded-md action-btn w-auto shadow-md ${
								showDiv == divName ? 'inline-block' : 'hidden'
							}`}
						>
							{typeof unplugDates !== 'string' &&
								unplugDates.map((row: UnplugProps) => {
									const dtUnplug: string =
										format(new Date(row.date), dtMask) ||
										'';
									return (
										<div className='pl-2 pr-2'>
											{dtUnplug}
										</div>
									);
								})}
						</div>
					</>
				);
			},
		}),
		columnHelper.display({
			id: 'action',
			header: 'Actions',
			cell: (props) => (
				<button
					onClick={() => {
						setCurrentPolicy({
							policyNumber: props.row.original.policyNo,
							opid: props.row.original.opid,
							customActions: [],
						});
					}}
					className='pl-4'
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	const fetchMultipleUnplugged = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/device/multiple/unplugged?uid=${uid}`,
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

			const resMultiple =
				(await response.json()) as GetDeviceMultipleUnpluggedReport;
			setReportData(resMultiple?.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchMultipleUnplugged(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reportData.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='device-multiple-unplugged'
						columns={columns}
						data={reportData}
						sortObj={{ id: 'policyNo', desc: false }}
					/>
				</>
			)}
			{!isLoading && !isError && reportData.length === 0 && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

const cleanseReportForCsv = (data: DeviceMultipleUnpluggedReport[]): any[] => {
	let rtnArr: any[] = [];
	data.map((row: DeviceMultipleUnpluggedReport) => {
		const { unplugs, ...otherKeys } = row; // lose the 'unplugs' key as it messes up the csv formatting
		const rowClone = { ...otherKeys };
		rtnArr.push(rowClone);
	});
	return rtnArr;
};

export default ReportingDeviceMultipleUnplugged;
export { cleanseReportForCsv };
