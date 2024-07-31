import { RiskAddressReport, GetRiskAddressReportRes } from '@/types/api';
import { BaseUrl, getApiHeaders, fullSignOut } from '@/app/utils';
import React, { useContext, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Link from 'next/link';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import ReportTable from '../table/ReportingTable';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';

const ReportingRiskPostcode = (): JSX.Element => {
	const [reports, setReports] = useState<RiskAddressReport[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<RiskAddressReport>();
	const columns = [
		columnHelper.accessor('policyNo', {
			header: 'Policy Number',
			cell: (info) => {
				const policyNumber = info.getValue();
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='hover:underline'
					>
						{policyNumber}
					</Link>
				);
			},
		}),
		columnHelper.accessor('riskPostCode', {
			header: 'Risk Postcode',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('mostFrequentPostcode', {
			header: 'Most Frequent Postcode',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('distanceBetweenRiskAndMostFreq', {
			header: 'Distance Between Risk And Most Freq',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('daysSinceInception', {
			header: 'Days Since inception',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('awayFromHomePercent', {
			header: 'Away From Home Percent',
			cell: (info) => `${info.getValue()}%`,
		}),
		columnHelper.accessor('snsSentDTM', {
			header: 'SNS Sent to Broker Date',
			cell: (info) => {
				const value = info.getValue();
				return value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '';
			},
		}),
		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => (
				<button
					className=''
					onClick={() => {
						setCurrentPolicy({
							policyNumber: props.row.original.policyNo,
							opid: props.row.original.opid,
							customActions: [],
						});
					}}
				>
					<ArrowsPointingOutIcon className='h-4' />
				</button>
			),
		}),
	];

	const fetchRiskPostCode = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/report/risk/address?uid=${uid}`,
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
			const resPolicies =
				(await response.json()) as GetRiskAddressReportRes;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchRiskPostCode(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			{!isLoading && reports.length > 0 && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					<ReportTable
						reportName='risk-address'
						columns={columns}
						data={reports}
					/>
				</>
			)}
			{!isLoading && !isError && reports.length === 0 && (
				<p className='text-sm'>No reports found</p>
			)}
			{isError && <p className='text-sm'>An error occurred</p>}
		</>
	);
};

export default ReportingRiskPostcode;
