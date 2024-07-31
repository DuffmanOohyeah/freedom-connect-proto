'use client';
import { useSession } from 'next-auth/react';
import { SessionType } from '@/types/api';
import ErrorNonCritical from '../components/dataSensitiveReports/DSReportsErrorNonCritical';
import LoadingSpinner from '../components/LoadingSpinner';

const DSReports = (): JSX.Element => {
	// status: enum mapping to three possible session states: "loading" | "authenticated" | "unauthenticated"
	const { data: session, status } = useSession();
	let rtnElem: JSX.Element = <LoadingSpinner />;

	if (status === 'authenticated') {
		const userSession: SessionType | null = session;
		const isMasterUser = userSession?.user?.masterUser || false;
		// if not a master user, boot them from the page
		if (!isMasterUser) window.location.href = '/';
		else rtnElem = <ErrorNonCritical />;
	}

	return rtnElem;
};

export default DSReports;
