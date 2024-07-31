import { GetPolicyRes } from '@/types/api';
import React, { useState, useEffect } from 'react';
import ActionPanel, { ActionProps } from './ActionPanel';
import ResendActivationEmail from './ResendActivationEmail';
import UnplugCancellation from './UnplugCancellation';
import NoDataCancellation from './NoDataCancellation';
import ResetSMSAttempts from './ResetSMSAttempts';
import ResendNoDataComms from './ResendNoDataComms';
import ResendUnplugComms from './ResendUnplugComms';

const PolicyActions = ({
	policy,
}: {
	policy: GetPolicyRes | null;
}): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [action, setAction] = useState<ActionProps | null>(null);
	const [pUserId, setPUserId] = useState<number>(0);

	useEffect(() => {
		/*
			WB notes:
				- not sure if this is accurate as just referencing the first userId in an array
				- can there be many legit users at this stage?
		*/
		if (policy && policy.users && policy.users[0].userId)
			setPUserId(policy.users[0].userId);
	}, [policy]);

	const resendActivationEmail: ActionProps = {
		title: 'Resend Activation Email',
		component: <ResendActivationEmail users={policy?.users} />,
	};

	/*const emailBroker: ActionProps = {
		title: 'Email Broker',
		component: <EmailBroker policyRef='Test' />,
	};*/

	const resetSMSAttempts: ActionProps = {
		title: 'Reset SMS Attempts',
		component: <ResetSMSAttempts pUserId={pUserId} />,
	};

	const deviceUnplugCancellation: ActionProps = {
		title: 'Device Unplugged Cancellation',
		component: (
			<UnplugCancellation
				opid={policy?.policy.opid}
				devices={policy?.devices}
			/>
		),
	};

	const deviceNoDataCancellation: ActionProps = {
		title: 'Device No Data Cancellation',
		component: (
			<NoDataCancellation
				opid={policy?.policy.opid}
				devices={policy?.devices}
			/>
		),
	};

	const setActionFn = (action: ActionProps) => {
		setAction(action);
		setOpen(true);
	};

	const resendNoDataComms: ActionProps = {
		title: 'Resend No Data Comms',
		component: <ResendNoDataComms policy={policy} />,
	};

	const resendUnplugComms: ActionProps = {
		title: 'Resend Unplug Comms',
		component: <ResendUnplugComms policy={policy} />,
	};

	return (
		<>
			<ActionPanel
				open={open}
				setOpen={(x) => setOpen(x)}
				action={action}
			/>

			<h1 className='text-lg font-semibold'>Actions</h1>

			<div className='flex flex-wrap w-full gap-4'>
				<button
					className='action2-btn'
					onClick={() => setActionFn(resendActivationEmail)}
					disabled={
						policy?.users && policy?.users?.length > 0
							? false
							: true
					}
				>
					Resend Activation Email
				</button>

				{/* <button
					className='action2-btn'
					onClick={() => setActionFn(emailBroker)}
				>
					Email Broker
				</button> */}

				<button
					className='action2-btn'
					onClick={() => setActionFn(resetSMSAttempts)}
					disabled={pUserId ? false : true}
				>
					Reset SMS Counter
				</button>

				<button
					className='action2-btn'
					onClick={() => setActionFn(deviceUnplugCancellation)}
					disabled={
						policy?.devices && policy?.devices?.length > 0
							? false
							: true
					}
				>
					Device Unplugged Cancellation
				</button>

				<button
					className='action2-btn'
					onClick={() => setActionFn(deviceNoDataCancellation)}
					disabled={
						policy?.devices && policy?.devices?.length > 0
							? false
							: true
					}
				>
					Device No Data Cancellation
				</button>

				<button
					className='action2-btn'
					onClick={() => setActionFn(resendNoDataComms)}
					disabled={
						policy?.users && policy?.users?.length > 0
							? false
							: true
					}
				>
					Resend No Data Comms
				</button>

				<button
					className='action2-btn'
					onClick={() => setActionFn(resendUnplugComms)}
					disabled={
						policy?.users && policy?.users?.length > 0
							? false
							: true
					}
				>
					Resend Unplug Comms
				</button>
			</div>
		</>
	);
};

export default PolicyActions;
