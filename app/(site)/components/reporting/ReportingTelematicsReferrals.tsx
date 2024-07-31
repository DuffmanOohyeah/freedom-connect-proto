import { BaseUrl, fullSignOut, getApiHeaders } from '@/app/utils';
import {
	TelematicsReferralProps,
	TelematicsReferralPropsResponseProps,
} from '@/types/api/telematicsReferrals';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import ReportActionPanel, {
	ActionPolicy,
} from '../actionButtons/ReportActionPanel';
import LoadingSpinner from '../LoadingSpinner';
import { BusinessUnitCtx } from '../providers/BusinessUnitProvider';
import ReportTable from '../table/ReportingTable';
import { format } from 'date-fns';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { getCurrentBusinessUnit } from '@/app/utils/getCurrentBusinessUnit';
import { useSession } from 'next-auth/react';

const ReportingTelematicsReferrals = (): JSX.Element => {
	const [reports, setReports] = useState<TelematicsReferralProps[]>([]);
	const [currentPolicy, setCurrentPolicy] = useState<ActionPolicy | null>(
		null
	);
	const { state } = useContext(BusinessUnitCtx)!;
	const { data: session } = useSession();
	const dtFormat: string = 'dd/MM/yyyy';
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isError, setIsError] = useState<boolean>(false);

	const columnHelper = createColumnHelper<TelematicsReferralProps>();
	const columns = [
		columnHelper.accessor('policyRef', {
			header: 'Policy Ref',
			cell: (info) => {
				const opid = info.row.original.opid;
				return (
					<Link
						href={`/policies/${opid}/policyholderdetails`}
						className='hover:underline'
					>
						{info.getValue()}
					</Link>
				);
			},
		}),

		columnHelper.accessor('referredDate', {
			header: 'Referred Date',
			cell: (info) => maskDate(info.getValue(), dtFormat),
		}),

		columnHelper.accessor('processLinkedTo', {
			header: () => <span className='w-16'>Process Linked To</span>,
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('queryDetail', {
			header: () => <span className='w-32'>Query Detail</span>,
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('proofReceived', {
			header: () => <span className='w-16'>Proof Received</span>,
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('responseText', {
			header: () => <span className='w-32'>Response Text</span>,
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('responseDate', {
			header: 'Response Date',
			cell: (info) => maskDate(info.getValue(), dtFormat),
		}),

		columnHelper.accessor('unitName', {
			header: () => <span className='w-16'>Unit Name</span>,
			cell: (info) => info.getValue(),
		}),

		columnHelper.accessor('userName', {
			header: 'User Name',
			cell: (info) => info.getValue(),
		}),

		columnHelper.display({
			id: 'action',
			header: 'Action',
			cell: (props) => (
				<button
					className='mx-3'
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

	const fetchReferrals = async (uid: number): Promise<void> => {
		setIsLoading(true);
		setIsError(false);

		if (uid > 0) {
			const response = await fetch(
				`${BaseUrl}/portal/policy/telematics/referrals?uid=${uid}`,
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
				(await response.json()) as TelematicsReferralPropsResponseProps;
			setReports(resPolicies.report || []);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		const currentBU = getCurrentBusinessUnit(session, state);
		fetchReferrals(currentBU.id || 0);
	}, [session, state]);

	return (
		<>
			{isError && <p className='text-sm'>An error occurred</p>}
			{isLoading && <LoadingSpinner />}
			{!isLoading && (
				<>
					<ReportActionPanel policy={currentPolicy} />
					{reports.length > 0 ? (
						<ReportTable
							reportName='telematics-referrals'
							columns={columns}
							data={reports}
							sortObj={{ id: 'referredDate', desc: false }}
						/>
					) : (
						<>No reports found</>
					)}
				</>
			)}
		</>
	);
};

const maskDate = (dt: Date, mask: string): string => {
	let rtnDt: string = '';
	try {
		rtnDt = format(new Date(dt), mask);
	} catch (err) {}
	return rtnDt;
};

export default ReportingTelematicsReferrals;
