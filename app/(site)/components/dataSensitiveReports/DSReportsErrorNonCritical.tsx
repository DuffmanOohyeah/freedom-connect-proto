import {
	GetErrorNonCriticalResponseProps,
	ErrorNonCriticalObjectProps,
} from '@/types/api/errorNonCritical';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import ReportTable from '../table/ReportingTable';

const DSReportsErrorNonCritical = (): JSX.Element => {
	const [report, setReport] = useState<ErrorNonCriticalObjectProps[]>([]);
	const [errMessage, setErrMessage] = useState<string>('');

	const { isLoading, isError } = useQuery(
		[],
		async () => {
			const response = await fetch(
				`${BaseUrl}/portal/report/errorNonCritical`,
				{
					method: 'GET',
					headers: await getApiHeaders(),
				}
			);
			if (!response.ok) {
				const res = await response.json();
				if (res.errorMessage == 'Unauthorised') fullSignOut();
				else setErrMessage(res.errorMessage);
				throw new Error('Network response was not ok');
			}
			const resPolicies =
				(await response.json()) as GetErrorNonCriticalResponseProps;
			setReport(resPolicies.report || []);
			return true;
		},
		{
			retry: false,
			enabled: true,
		}
	);

	const dtFormat: string = 'dd/MM/yyyy HH:mm';
	const columnHelper = createColumnHelper<ErrorNonCriticalObjectProps>();

	const columns = [
		columnHelper.accessor('messageCount', {
			header: () => <div className='whitespace-pre'>Message Count</div>,
			cell: (props) => (
				<div className='text-center'>{props.getValue()}</div>
			),
			footer: () => (
				<div className='text-center'>Total: {getCountSum(report)}</div>
			),
		}),

		columnHelper.accessor('message', {
			header: () => <div className='whitespace-pre'>Message</div>,
			cell: (props) => <div className=''>{props.getValue()}</div>,
		}),

		columnHelper.accessor('mySqlText', {
			header: () => <div className='whitespace-pre'>MySql Text</div>,
			cell: (props) => <div className=''>{props.getValue()}</div>,
		}),

		columnHelper.accessor('createdDtm', {
			header: () => <div className='whitespace-pre'>Created DTM</div>,
			cell: (props) => {
				if (props.getValue())
					<div className='text-center'>
						{format(new Date(props.getValue()), dtFormat)}
					</div>;
			},
		}),

		columnHelper.accessor('userName', {
			header: () => <div className='whitespace-pre'>User Name</div>,
			cell: (props) => (
				<div className='text-center'>{props.getValue()}</div>
			),
		}),
	];

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{isError && <p className='text-sm'>{errMessage}</p>}
			{!isLoading && !isError && (
				<>
					<div>
						{/*N.B. This report is broker/business unit agnostic
						<br /><br />*/}
						{report.length > 0 ? (
							<ReportTable
								reportName='error-non-critical'
								columns={columns}
								data={report}
								sortObj={{ id: 'messageCount', desc: true }}
							/>
						) : (
							<p className='text-sm'>No records found</p>
						)}
					</div>
				</>
			)}
		</>
	);
};

const getCountSum = (report: ErrorNonCriticalObjectProps[]): number => {
	let rtnCount: number = 0;
	report.map((row: ErrorNonCriticalObjectProps) => {
		rtnCount += row.messageCount;
	});
	return rtnCount;
};

export default DSReportsErrorNonCritical;
