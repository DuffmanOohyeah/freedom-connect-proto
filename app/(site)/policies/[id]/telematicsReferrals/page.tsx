'use client';
import DSReportsTelematicsReferrals from '@/app/(site)/components/dataSensitiveReports/DSReportsTelematicsReferrals';

const TelematicsReferrals = ({ params }: any): JSX.Element => {
	const { id: opid } = params;

	return (
		<div className='p-7'>
			<DSReportsTelematicsReferrals opid={opid} />
		</div>
	);
};

export default TelematicsReferrals;
